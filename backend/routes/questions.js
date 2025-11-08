import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /api/assessments/:id/questions/:phase - Get all questions for a phase
router.get('/assessments/:assessmentId/questions/:phase', (req, res, next) => {
  try {
    const { assessmentId, phase } = req.params;

    db.all(
      'SELECT * FROM questions WHERE assessment_id = ? AND phase_number = ? ORDER BY question_number',
      [assessmentId, phase],
      (err, rows) => {
        if (err) {
          return next(err);
        }

        if (rows.length === 0) {
          return res.status(404).json({ error: 'No questions found for this phase' });
        }

        // Parse JSON choices if present
        const questions = rows.map(q => ({
          ...q,
          choices: q.choices ? JSON.parse(q.choices) : null
        }));

        res.json({
          phase_number: parseInt(phase),
          questions
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

export default router;
