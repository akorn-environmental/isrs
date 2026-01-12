const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all abstracts
exports.getAbstracts = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      a.*,
      COUNT(ar.id) as review_count,
      AVG((ar.relevance_score + ar.originality_score + ar.methodology_score + ar.clarity_score + ar.impact_score) / 5.0) as average_score
    FROM abstracts a
    LEFT JOIN abstract_reviews ar ON a.id = ar.abstract_id
    GROUP BY a.id
    ORDER BY a.submitted_at DESC
  `);

  res.json({
    success: true,
    abstracts: result.rows
  });
});

// Get abstract by ID
exports.getAbstractById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const abstractResult = await query(`
    SELECT * FROM abstracts WHERE id = $1
  `, [id]);

  if (abstractResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Abstract not found'
    });
  }

  // Get reviews
  const reviewsResult = await query(`
    SELECT ar.*, c.first_name, c.last_name, c.email as reviewer_email
    FROM abstract_reviews ar
    LEFT JOIN contacts c ON ar.reviewer_contact_id = c.id
    WHERE ar.abstract_id = $1
    ORDER BY ar.submitted_at DESC
  `, [id]);

  res.json({
    success: true,
    abstract: abstractResult.rows[0],
    reviews: reviewsResult.rows
  });
});

// Submit abstract review
exports.submitReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    relevance_score,
    originality_score,
    methodology_score,
    clarity_score,
    impact_score,
    strengths,
    weaknesses,
    comments_for_authors,
    confidential_comments,
    recommendation
  } = req.body;

  const reviewer_contact_id = req.user?.contact_id || req.user?.id;
  const reviewer_email = req.user?.email;

  // Calculate overall score
  const overall_score = (
    parseFloat(relevance_score) * 1.2 +
    parseFloat(originality_score) +
    parseFloat(methodology_score) +
    parseFloat(clarity_score) * 0.8 +
    parseFloat(impact_score)
  ) / 5.0;

  // Check if reviewer is already assigned
  let reviewerResult = await query(`
    SELECT id FROM abstract_reviewers
    WHERE abstract_id = $1 AND reviewer_contact_id = $2
  `, [id, reviewer_contact_id]);

  let reviewer_id;
  if (reviewerResult.rows.length === 0) {
    // Assign reviewer
    const assignResult = await query(`
      INSERT INTO abstract_reviewers (abstract_id, reviewer_contact_id, reviewer_email, status)
      VALUES ($1, $2, $3, 'in_progress')
      RETURNING id
    `, [id, reviewer_contact_id, reviewer_email]);
    reviewer_id = assignResult.rows[0].id;
  } else {
    reviewer_id = reviewerResult.rows[0].id;
  }

  // Submit review
  const result = await query(`
    INSERT INTO abstract_reviews (
      abstract_id, reviewer_id, reviewer_contact_id,
      relevance_score, originality_score, methodology_score, clarity_score, impact_score,
      overall_score, strengths, weaknesses, comments_for_authors, confidential_comments, recommendation
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    ON CONFLICT (abstract_id, reviewer_contact_id)
    DO UPDATE SET
      relevance_score = EXCLUDED.relevance_score,
      originality_score = EXCLUDED.originality_score,
      methodology_score = EXCLUDED.methodology_score,
      clarity_score = EXCLUDED.clarity_score,
      impact_score = EXCLUDED.impact_score,
      overall_score = EXCLUDED.overall_score,
      strengths = EXCLUDED.strengths,
      weaknesses = EXCLUDED.weaknesses,
      comments_for_authors = EXCLUDED.comments_for_authors,
      confidential_comments = EXCLUDED.confidential_comments,
      recommendation = EXCLUDED.recommendation,
      updated_at = NOW()
    RETURNING *
  `, [
    id, reviewer_id, reviewer_contact_id,
    relevance_score, originality_score, methodology_score, clarity_score, impact_score,
    overall_score, strengths, weaknesses, comments_for_authors, confidential_comments, recommendation
  ]);

  // Update reviewer status
  await query(`
    UPDATE abstract_reviewers
    SET status = 'completed'
    WHERE id = $1
  `, [reviewer_id]);

  // Update abstract status and scores
  await query(`
    UPDATE abstracts
    SET
      submission_status = 'under_review',
      review_count = (SELECT COUNT(*) FROM abstract_reviews WHERE abstract_id = $1),
      average_score = (
        SELECT AVG(overall_score)
        FROM abstract_reviews
        WHERE abstract_id = $1
      ),
      updated_at = NOW()
    WHERE id = $1
  `, [id]);

  res.json({
    success: true,
    review: result.rows[0]
  });
});

// Get review statistics
exports.getReviewStats = asyncHandler(async (req, res) => {
  const stats = await query(`
    SELECT
      COUNT(*) as total_abstracts,
      COUNT(*) FILTER (WHERE submission_status = 'submitted') as submitted,
      COUNT(*) FILTER (WHERE submission_status = 'under_review') as under_review,
      COUNT(*) FILTER (WHERE submission_status = 'accepted') as accepted,
      COUNT(*) FILTER (WHERE submission_status = 'rejected') as rejected,
      AVG(average_score) as overall_avg_score,
      COUNT(DISTINCT ar.reviewer_contact_id) as total_reviewers
    FROM abstracts a
    LEFT JOIN abstract_reviews ar ON a.id = ar.abstract_id
  `);

  res.json({
    success: true,
    stats: stats.rows[0]
  });
});
