const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../config/database');

/**
 * AI Service for ISRS
 * Uses Claude to convert natural language queries to SQL
 */

let anthropic = null;

function getAnthropicClient() {
  if (!anthropic) {
    // Support both CLAUDE_API_KEY and ANTHROPIC_API_KEY
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY or ANTHROPIC_API_KEY environment variable is required for AI queries');
    }
    anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }
  return anthropic;
}

// Database schema for Claude to understand
const DATABASE_SCHEMA = `
You are a SQL query generator for the ISRS (International Shellfish Restoration Society) database.
The database schema is as follows:

TABLE: contacts
- id (UUID, primary key)
- email (VARCHAR, unique)
- full_name (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- organization_id (UUID, foreign key to organizations)
- role (VARCHAR) - e.g., "Board Chair", "Board Member", "Steering Committee"
- title (VARCHAR) - job title
- phone (VARCHAR)
- country (VARCHAR)
- state_province (VARCHAR)
- city (VARCHAR)
- expertise (TEXT[]) - array of expertise areas
- interests (TEXT[]) - array of interests
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

TABLE: organizations
- id (UUID, primary key)
- name (VARCHAR, unique)
- type (VARCHAR) - University, NGO, Government, Private, etc.
- website (VARCHAR)
- country (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

TABLE: board_votes
- id (UUID, primary key)
- vote_id (VARCHAR, unique)
- motion_title (VARCHAR)
- motion_description (TEXT)
- vote_date (DATE)
- vote_method (VARCHAR) - email, meeting, survey, unanimous
- result (VARCHAR) - Carried, Failed, No Decision
- yes_count (INTEGER)
- no_count (INTEGER)
- abstain_count (INTEGER)
- total_votes (INTEGER)
- quorum_met (BOOLEAN)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

TABLE: conferences
- id (UUID, primary key)
- name (VARCHAR)
- year (INTEGER)
- location (VARCHAR)
- start_date (DATE)
- end_date (DATE)
- total_attendees (INTEGER)
- countries_represented (INTEGER)
- website (VARCHAR)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

TABLE: funding_prospects
- id (UUID, primary key)
- organization_id (UUID, foreign key to organizations)
- contact_id (UUID, foreign key to contacts)
- prospect_type (VARCHAR) - Grant, Sponsorship, Donation, Partnership
- amount_target (DECIMAL)
- amount_committed (DECIMAL)
- amount_received (DECIMAL)
- status (VARCHAR) - pipeline, contacted, proposal_submitted, committed, received, rejected
- priority (VARCHAR) - high, medium, low
- deadline (DATE)
- proposal_submitted_date (DATE)
- decision_date (DATE)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

IMPORTANT RULES:
1. Always use JOIN when querying related tables (e.g., contacts with organizations)
2. For organization names in contacts table, JOIN with organizations table and use o.name
3. Return ONLY the SQL query, nothing else
4. Use proper PostgreSQL syntax
5. Always limit results to 100 unless specifically asked for more
6. Use ILIKE for case-insensitive string matching
7. When counting or aggregating, use appropriate GROUP BY clauses
8. For date ranges, use proper DATE comparisons
9. Never use DELETE or DROP commands - only SELECT queries are allowed
10. If the question is ambiguous, make reasonable assumptions and write the most useful query
`;

/**
 * Convert natural language question to SQL query using Claude
 * @param {string} question - Natural language question
 * @returns {Promise<string>} SQL query
 */
async function generateSQLQuery(question) {
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${DATABASE_SCHEMA}\n\nConvert this question to a SQL query:\n"${question}"\n\nReturn ONLY the SQL query, no explanations.`
      }
    ],
  });

  const sqlQuery = message.content[0].text.trim();

  // Security check: Ensure only SELECT queries
  const upperQuery = sqlQuery.toUpperCase();
  if (!upperQuery.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }

  // Check for dangerous keywords
  const dangerousKeywords = ['DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      throw new Error(`Query contains forbidden keyword: ${keyword}`);
    }
  }

  return sqlQuery;
}

/**
 * Execute AI-generated query and return results
 * @param {string} question - Natural language question
 * @returns {Promise<Object>} Query results with metadata
 */
async function executeAIQuery(question) {
  try {
    // Step 1: Generate SQL query using Claude
    const sqlQuery = await generateSQLQuery(question);
    console.log('📝 Generated SQL:', sqlQuery);

    // Step 2: Execute the query
    const startTime = Date.now();
    const result = await query(sqlQuery);
    const executionTime = Date.now() - startTime;

    // Step 3: Format results
    return {
      success: true,
      question: question,
      sql: sqlQuery,
      rows: result.rows,
      rowCount: result.rowCount,
      executionTime: executionTime,
      fields: result.fields?.map(f => f.name) || []
    };

  } catch (error) {
    console.error('AI Query Error:', error.message);

    return {
      success: false,
      question: question,
      error: error.message,
      suggestion: 'Try rephrasing your question or asking something more specific about contacts, organizations, conferences, board votes, or funding.'
    };
  }
}

/**
 * Get AI insights about the query results
 * @param {string} question - Original question
 * @param {Object} results - Query results
 * @returns {Promise<string>} Natural language summary
 */
async function generateInsights(question, results) {
  if (!results.success || results.rowCount === 0) {
    return null;
  }

  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Question: "${question}"\n\nSQL Query: ${results.sql}\n\nResults (${results.rowCount} rows):\n${JSON.stringify(results.rows.slice(0, 5), null, 2)}\n\nProvide a brief, natural language summary of these results (2-3 sentences).`
      }
    ],
  });

  return message.content[0].text.trim();
}

/**
 * Test AI configuration
 * @returns {Promise<boolean>} True if AI is properly configured
 */
async function testAIConfig() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log('⚠️  No CLAUDE_API_KEY or ANTHROPIC_API_KEY found. AI queries will not work.');
      console.log('   To enable AI queries, set the CLAUDE_API_KEY or ANTHROPIC_API_KEY environment variable.');
      return false;
    }

    const client = getAnthropicClient();

    // Simple test query
    await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }],
    });

    return true;
  } catch (error) {
    console.error('AI configuration test failed:', error.message);
    return false;
  }
}

module.exports = {
  executeAIQuery,
  generateInsights,
  testAIConfig
};
