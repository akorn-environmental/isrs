const { query, transaction } = require('../config/database');
const { BOARD_MEMBERS } = require('../constants/boardMembers');
const { extractVoteWithClaude, parseVoteFallback } = require('./claudeService');

/**
 * Normalize vote values
 */
function normalizeVote(value) {
  const v = String(value || '').trim().toLowerCase();
  if (['yes', 'y', 'approve', 'aye', 'approved'].includes(v)) return 'Yes';
  if (['no', 'n', 'reject', 'nay', 'rejected'].includes(v)) return 'No';
  if (['abstain', 'abs', 'recuse', 'abstained'].includes(v)) return 'Abstain';
  return null;
}

/**
 * Process and save board vote data
 */
async function processBoardVote(params) {
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
    perMember[name] = normalized || '—';

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

  const quorumMet = totalVotes >= Math.ceil(BOARD_MEMBERS.length / 2);

  // Use transaction to insert both vote and details
  return await transaction(async (client) => {
    // Insert main vote record
    const voteId = 'VOTE_' + Date.now();
    const notes = `cast=${castVotes} board=${BOARD_MEMBERS.length}`;

    const voteResult = await client.query(`
      INSERT INTO board_votes (
        vote_id, motion_title, vote_date, vote_method, result,
        yes_count, no_count, abstain_count, total_votes, quorum_met,
        notes, email_content, processed_by, processed_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      voteId, motionTitle, voteDate, voteMethod, result,
      yesCount, noCount, abstainCount, totalVotes, quorumMet,
      notes, emailContent, processedBy, params.processedMethod || 'Manual'
    ]);

    const dbVoteId = voteResult.rows[0].id;

    // Insert individual vote details
    for (const memberName of BOARD_MEMBERS) {
      const vote = perMember[memberName] !== '—' ? perMember[memberName] : null;

      await client.query(`
        INSERT INTO board_vote_details (vote_id, board_member_name, vote)
        VALUES ($1, $2, $3)
      `, [dbVoteId, memberName, vote]);
    }

    return {
      success: true,
      message: 'Board vote processed and saved',
      vote: {
        voteId,
        motionTitle,
        voteDate,
        voteMethod,
        result,
        summary: {
          yes: yesCount,
          no: noCount,
          abstain: abstainCount,
          total: totalVotes,
          quorumMet: quorumMet ? 'Yes' : 'No'
        },
        perMember
      }
    };
  });
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
      processedMethod: 'AI-FALLBACK',
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
    processedMethod: 'AI-CLAUDE',
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
    const result = await query(`
      SELECT
        bv.id,
        bv.vote_id,
        bv.motion_title,
        bv.vote_date,
        bv.vote_method,
        bv.result,
        bv.yes_count,
        bv.no_count,
        bv.abstain_count,
        bv.total_votes,
        bv.quorum_met,
        bv.notes,
        bv.processed_by,
        bv.email_content,
        bv.created_at,
        json_agg(
          json_build_object(
            'member', bvd.board_member_name,
            'vote', bvd.vote
          )
        ) as individual_votes
      FROM board_votes bv
      LEFT JOIN board_vote_details bvd ON bv.id = bvd.vote_id
      GROUP BY bv.id
      ORDER BY bv.vote_date DESC, bv.created_at DESC
      LIMIT $1
    `, [limit]);

    if (result.rows.length === 0) {
      return {
        success: true,
        votes: [],
        total: 0,
        showing: 0,
        message: 'No vote history yet'
      };
    }

    const votes = result.rows.map(row => {
      const individualVotes = {};
      if (row.individual_votes) {
        row.individual_votes.forEach(v => {
          individualVotes[v.member] = v.vote || '—';
        });
      }

      return {
        timestamp: row.created_at,
        voteId: row.vote_id,
        motion: row.motion_title,
        date: row.vote_date,
        method: row.vote_method,
        result: row.result,
        summary: {
          yes: row.yes_count || 0,
          no: row.no_count || 0,
          abstain: row.abstain_count || 0,
          total: row.total_votes || 0,
          quorum: row.quorum_met ? 'Yes' : 'No'
        },
        notes: row.notes || '',
        individualVotes,
        processedBy: row.processed_by || '',
        emailContent: row.email_content || ''
      };
    });

    return {
      success: true,
      votes,
      total: votes.length,
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
