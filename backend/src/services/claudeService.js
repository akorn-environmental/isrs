const axios = require('axios');
const { BOARD_MEMBERS } = require('../constants/boardMembers');

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4.5-20250929';
const MAX_INPUT_CHARS = 20000;
const MAX_RETRIES = 5;

/**
 * Sanitize Claude output into JSON even if it includes prose or code fences
 */
function tryParseClaudeJson(raw) {
  let text = String(raw || '').trim();

  // Remove code fences
  text = text.replace(/```json|```/gi, '').trim();

  // Find JSON object boundaries
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  // Replace smart quotes
  text = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

  try {
    return JSON.parse(text);
  } catch (e) {
    // Try repairing common issues
    const repaired = text
      .replace(/([:{\[,]\s*)'([^'"]+?)'\s*(:)/g, '$1"$2"$3')
      .replace(/:\s*'([^']*?)'(\s*[},])/g, ':"$1"$2');

    return JSON.parse(repaired);
  }
}

/**
 * Extract vote data using Claude AI with retries
 */
async function extractVoteWithClaude(emailText) {
  if (!CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured');
  }

  const trimmed = String(emailText || '').slice(0, MAX_INPUT_CHARS);

  const systemPrompt =
    "You parse ISRS board-vote email threads. Return ONLY a JSON object; no extra text, no code fences. Keys: " +
    "motionTitle (string), voteDate (YYYY-MM-DD or null), voteMethod (email|meeting|survey|unanimous|unknown), " +
    "votes (object with EXACT member names: " +
    JSON.stringify(BOARD_MEMBERS).slice(1, -1) +
    " -> 'Yes'|'No'|'Abstain'|''), notes (string).";

  const payload = {
    model: CLAUDE_MODEL,
    max_tokens: 800,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content: trimmed }]
  };

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          validateStatus: null // Don't throw on any status
        }
      );

      const { status, data } = response;

      if (status >= 200 && status < 300) {
        const text = data.content?.[0]?.text || '{}';
        try {
          const parsed = tryParseClaudeJson(text);
          return { success: true, parsed, raw: text };
        } catch (e) {
          return {
            success: false,
            error: 'Claude JSON parse failed',
            raw: text
          };
        }
      }

      // Retry on rate limit or server errors
      if ([429, 500, 502, 503, 504, 522, 524, 529].includes(status)) {
        lastError = `Claude API ${status}`;
        const waitMs = attempt < 5
          ? Math.pow(2, attempt - 1) * 400
          : 5000;
        const jitter = Math.floor(Math.random() * 200);

        await new Promise(resolve => setTimeout(resolve, waitMs + jitter));
        continue;
      }

      return {
        success: false,
        error: `Claude API ${status}`,
        raw: JSON.stringify(data)
      };

    } catch (error) {
      lastError = error.message;
      const waitMs = 400 + Math.floor(Math.random() * 200);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  return {
    success: false,
    error: lastError || 'Claude API error after retries'
  };
}

/**
 * Fallback rule-based parser if AI fails
 */
function parseVoteFallback(emailText) {
  const text = String(emailText || '');
  const result = {
    motionTitle: '',
    voteDate: '',
    voteMethod: 'email',
    votes: {},
    notes: 'Fallback parser'
  };

  // Try to extract motion
  const motionMatch = text.match(/^\s*MOTION:\s*(.+)$/im);
  if (motionMatch) {
    result.motionTitle = motionMatch[1].trim();
  } else {
    // Use first non-empty line
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    result.motionTitle = lines[0]?.slice(0, 160) || 'Untitled Motion';
  }

  // Vote detection helper
  const detectVote = (segment) => {
    const s = segment.toLowerCase();
    if (/(^|\b)(yes|approve|aye|approved)(\b|$)/.test(s)) return 'Yes';
    if (/(^|\b)(no|nay|reject|rejected)(\b|$)/.test(s)) return 'No';
    if (/(abstain|recuse|abstained)/.test(s)) return 'Abstain';
    return '—';
  };

  // Try to find votes for each board member
  const lines = text.split(/\r?\n/);
  BOARD_MEMBERS.forEach(name => {
    const [firstName] = name.split(' ');
    const lastName = name.replace(firstName + ' ', '');
    const regex = new RegExp(
      `\\b(${firstName}|${lastName.replace(/[-]/g, '[-]')})\\b`,
      'i'
    );
    const matchingLine = lines.find(line => regex.test(line));
    result.votes[name] = matchingLine ? detectVote(matchingLine) : '—';
  });

  return result;
}

module.exports = {
  extractVoteWithClaude,
  parseVoteFallback,
  tryParseClaudeJson
};
