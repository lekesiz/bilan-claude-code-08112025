import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// POST /api/responses - Submit an answer
router.post('/', (req, res, next) => {
  try {
    const { assessment_id, question_id, answer_rating, answer_text, explanation } = req.body;

    if (!assessment_id || !question_id) {
      return res.status(400).json({ error: 'assessment_id and question_id are required' });
    }

    if (answer_rating === undefined && !answer_text) {
      return res.status(400).json({ error: 'Either answer_rating or answer_text is required' });
    }

    const query = `
      INSERT INTO responses (
        assessment_id, question_id, answer_rating, answer_text, explanation
      ) VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [assessment_id, question_id, answer_rating || null, answer_text || null, explanation || null],
      function(err) {
        if (err) {
          return next(err);
        }

        res.status(201).json({
          id: this.lastID,
          assessment_id,
          question_id,
          answer_rating,
          answer_text,
          answered_at: new Date().toISOString()
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/assessments/:id/responses - Get all responses for an assessment
router.get('/assessments/:assessmentId/responses', (req, res, next) => {
  try {
    const { assessmentId } = req.params;

    db.all(
      `SELECT r.*, q.question_text, q.category
       FROM responses r
       LEFT JOIN questions q ON r.question_id = q.id
       WHERE r.assessment_id = ?
       ORDER BY r.answered_at`,
      [assessmentId],
      (err, rows) => {
        if (err) {
          return next(err);
        }

        const responses = rows.map(r => ({
          question_id: r.question_id,
          question_text: r.question_text,
          answer_rating: r.answer_rating,
          answer_text: r.answer_text,
          explanation: r.explanation,
          category: r.category,
          answered_at: r.answered_at
        }));

        res.json({
          assessment_id: parseInt(assessmentId),
          responses
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

export default router;
