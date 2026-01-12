const { BOARD_MEMBERS } = require('../constants/boardMembers');
const { ensureSheet, appendRow, getSheetValues } = require('../config/googleSheets');
const { extractVoteWithClaude, parseVoteFallback } = require('./claudeService');

const VOTE_SHEET_NAME = 'Board Votes';

/**
 * Normalize vote values
 */
function normalizeVote(value) {
  const v = String(value || '').trim().toLowerCase();
  if (['yes', 'y', 'approve', 'aye', 'approved'].includes(v)) return 'Yes';
  if (['no', 'n', 'reject', 'nay', 'rejected'].includes(v)) return 'No';
  if (['abstain', 'abs', 'recuse', 'abstained'].includes(v)) return 'Abstain';
  return '—';
}

/**
 * Get vote sheet headers
 */
function getVoteHeaders() {
  return [
    'Timestamp', 'Vote ID', 'Motion Title', 'Vote Date', 'Vote Method', 'Vote Result',
    'Yes Votes', 'No Votes', 'Abstain Votes', 'Total Votes', 'Quorum Met', 'Notes',
    ...BOARD_MEMBERS,
    'Processed By', 'Email Content', 'Raw JSON'
  ];
}

/**
 * Ensure Board Votes sheet exists
 */
async function ensureVoteSheet() {
  return await ensureSheet(VOTE_SHEET_NAME, getVoteHeaders());
}

/**
 * Process and save board vote data
 */
async function processBoardVote(params) {
  try {
    await ensureVoteSheet();

    const motionTitle = String(
      params.motionTitle || params.detectedMotion || 'Untitled Motion'
    ).trim();
    const voteDate = String(
      params.voteDate || new Date().toISOString().slice(0, 10)
    );
    const voteMethod = String(params.voteMethod || 'email');
    const processedBy = String(params.processedBy || 'System');
    const emailContent = String(params.emailContent || params.extractedText || '');

    // Parse votes
    let votes = {};
    if (params.votes) {
      if (typeof params.votes === 'string') {
        try {
          votes = JSON.parse(params.votes);
        } catch (e) {
          console.error('Error parsing votes JSON:', e);
        }
      } else {
        votes = params.votes;
      }
    }

    // Count votes and normalize
    let yesCount = 0, noCount = 0, abstainCount = 0;
    const perMember = {};

    BOARD_MEMBERS.forEach(name => {
      const normalized = normalizeVote(votes[name]);
      perMember[name] = normalized;

      if (normalized === 'Yes') yesCount++;
      else if (normalized === 'No') noCount++;
      else if (normalized === 'Abstain') abstainCount++;
    });

    const totalVotes = yesCount + noCount + abstainCount;
    const castVotes = yesCount + noCount;

    // Determine result
    const result = castVotes > 0 && yesCount > noCount
      ? 'Carried'
      : (castVotes === 0 ? 'No Decision' : 'Failed');

    const quorumMet = totalVotes >= Math.ceil(BOARD_MEMBERS.length / 2)
      ? 'Yes'
      : 'No';

    // Build row
    const row = [
      new Date().toISOString(),
      'VOTE_' + Date.now(),
      motionTitle,
      voteDate,
      voteMethod,
      result,
      yesCount,
      noCount,
      abstainCount,
      totalVotes,
      quorumMet,
      `cast=${castVotes} board=${BOARD_MEMBERS.length}`,
      ...BOARD_MEMBERS.map(name => perMember[name] || '—'),
      processedBy,
      emailContent,
      JSON.stringify(params)
    ];

    await appendRow(VOTE_SHEET_NAME, row);

    return {
      success: true,
      message: 'Board vote processed and saved',
      vote: {
        motionTitle,
        voteDate,
        voteMethod,
        result,
        summary: {
          yes: yesCount,
          no: noCount,
          abstain: abstainCount,
          total: totalVotes,
          quorumMet
        },
        perMember
      }
    };

  } catch (error) {
    console.error('Error processing board vote:', error);
    throw error;
  }
}

/**
 * AI-powered vote processing
 */
async function aiProcessBoardVote(params) {
  const emailContent = String(params.emailContent || '');

  if (!emailContent) {
    throw new Error('emailContent is required');
  }

  // Try AI extraction first
  const aiResult = await extractVoteWithClaude(emailContent);

  if (!aiResult.success) {
    // Fall back to rule-based parser
    console.log('AI extraction failed, using fallback parser');
    const fallbackData = parseVoteFallback(emailContent);

    const voteParams = {
      motionTitle: fallbackData.motionTitle || 'Untitled Motion',
      voteDate: fallbackData.voteDate || '',
      voteMethod: fallbackData.voteMethod || 'email',
      processedBy: params.processedBy || 'AI-FALLBACK',
      emailContent,
      votes: fallbackData.votes || {}
    };

    const result = await processBoardVote(voteParams);
    result.note = aiResult.error || 'AI unavailable';
    return result;
  }

  // Use AI-extracted data
  const voteParams = {
    motionTitle: aiResult.parsed.motionTitle || '',
    voteDate: aiResult.parsed.voteDate || '',
    voteMethod: aiResult.parsed.voteMethod || 'email',
    processedBy: params.processedBy || 'AI-CLAUDE',
    emailContent,
    votes: aiResult.parsed.votes || {}
  };

  return await processBoardVote(voteParams);
}

/**
 * Get vote history
 */
async function getVoteHistory(limit = 500) {
  try {
    const values = await getSheetValues(VOTE_SHEET_NAME);

    if (values.length <= 1) {
      return {
        success: true,
        votes: [],
        total: 0,
        showing: 0,
        message: 'No vote history yet'
      };
    }

    // Skip header row and reverse (newest first)
    const rows = values.slice(1).reverse();
    const votes = [];
    const MEMBER_START_COL = 12;

    for (let i = 0; i < rows.length && votes.length < limit; i++) {
      const row = rows[i];

      const vote = {
        timestamp: row[0],
        voteId: row[1],
        motion: row[2],
        date: row[3],
        method: row[4],
        result: row[5],
        summary: {
          yes: row[6] || 0,
          no: row[7] || 0,
          abstain: row[8] || 0,
          total: row[9] || 0,
          quorum: row[10] || 'No'
        },
        notes: row[11] || '',
        individualVotes: {}
      };

      BOARD_MEMBERS.forEach((name, idx) => {
        vote.individualVotes[name] = row[MEMBER_START_COL + idx] || '—';
      });

      vote.processedBy = row[MEMBER_START_COL + BOARD_MEMBERS.length] || '';
      vote.emailContent = row[MEMBER_START_COL + BOARD_MEMBERS.length + 1] || '';
      vote.raw = row[MEMBER_START_COL + BOARD_MEMBERS.length + 2] || '';

      votes.push(vote);
    }

    return {
      success: true,
      votes,
      total: rows.length,
      showing: votes.length
    };

  } catch (error) {
    console.error('Error getting vote history:', error);
    throw error;
  }
}

/**
 * Export vote history as CSV
 */
async function exportVoteHistory() {
  const history = await getVoteHistory(1000);

  if (!history.success || history.votes.length === 0) {
    throw new Error('No vote history to export');
  }

  let csv = 'Vote ID,Motion,Date,Result,Yes,No,Abstain,Total,Quorum,Method,Processed By';
  BOARD_MEMBERS.forEach(name => csv += ',' + name);
  csv += '\n';

  history.votes.forEach(vote => {
    const row = [
      vote.voteId,
      '"' + String(vote.motion).replace(/"/g, '""') + '"',
      vote.date,
      vote.result,
      vote.summary.yes,
      vote.summary.no,
      vote.summary.abstain,
      vote.summary.total,
      vote.summary.quorum,
      vote.method,
      '"' + String(vote.processedBy || '').replace(/"/g, '""') + '"'
    ];

    BOARD_MEMBERS.forEach(name => {
      row.push(vote.individualVotes[name] || '—');
    });

    csv += row.join(',') + '\n';
  });

  return {
    success: true,
    filename: 'ISRS_Board_Votes_' + new Date().toISOString().slice(0, 10) + '.csv',
    csvContent: csv,
    recordCount: history.votes.length
  };
}

module.exports = {
  processBoardVote,
  aiProcessBoardVote,
  getVoteHistory,
  exportVoteHistory,
  normalizeVote
};
