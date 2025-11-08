import express from 'express';
import db from '../config/database.js';
import { generatePersonalizedStructure } from '../ai/geminiIntegration.js';

const router = express.Router();

// POST /api/assessments - Create new assessment
router.post('/', async (req, res, next) => {
  try {
    const { first_name, last_name, interest_category, allocated_hours } = req.body;

    if (!first_name || !last_name || !interest_category || !allocated_hours) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get AI-personalized structure
    let aiStructure;
    try {
      aiStructure = await generatePersonalizedStructure(interest_category, allocated_hours);
    } catch (aiError) {
      console.error('Gemini API error, using fallback:', aiError.message);
      // Fallback structure
      aiStructure = {
        total_phases: 3,
        total_questions: 15,
        estimated_completion_time: 180,
        phases: [
          { phase: 1, questions_count: 5 },
          { phase: 2, questions_count: 5 },
          { phase: 3, questions_count: 5 }
        ]
      };
    }

    // Create assessment in database
    const query = `
      INSERT INTO assessments (
        first_name, last_name, interest_category, allocated_hours,
        total_phases, total_questions, estimated_completion_time, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress')
    `;

    db.run(query, [
      first_name, last_name, interest_category, allocated_hours,
      aiStructure.total_phases, aiStructure.total_questions,
      aiStructure.estimated_completion_time
    ], function(err) {
      if (err) {
        return next(err);
      }

      const assessmentId = this.lastID;

      // Create questions for all phases
      const questions = aiStructure.phases.flatMap(phase => {
        const phaseQuestions = [];
        for (let i = 1; i <= phase.questions_count; i++) {
          phaseQuestions.push({
            phase_number: phase.phase,
            question_number: i,
            question_text: `Question ${i} in Phase ${phase.phase}`,
            question_type: i % 3 === 0 ? 'multiple_choice' : 'rating',
            category: 'General',
            difficulty: Math.ceil(i / 2)
          });
        }
        return phaseQuestions;
      });

      // Insert questions
      const insertQuestionQuery = `
        INSERT INTO questions (
          assessment_id, phase_number, question_number, question_text,
          question_type, category, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const stmt = db.prepare(insertQuestionQuery);
      questions.forEach(q => {
        stmt.run([
          assessmentId, q.phase_number, q.question_number,
          q.question_text, q.question_type, q.category, q.difficulty
        ]);
      });
      stmt.finalize();

      // Get first phase questions
      db.all(
        'SELECT * FROM questions WHERE assessment_id = ? AND phase_number = 1 ORDER BY question_number',
        [assessmentId],
        (err, rows) => {
          if (err) {
            return next(err);
          }

          res.status(201).json({
            id: assessmentId,
            first_name,
            last_name,
            interest_category,
            allocated_hours,
            total_phases: aiStructure.total_phases,
            total_questions: aiStructure.total_questions,
            estimated_completion_time: aiStructure.estimated_completion_time,
            status: 'in_progress',
            start_time: new Date().toISOString(),
            questions: rows
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/assessments - List all assessments
router.get('/', (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    let query = 'SELECT * FROM assessments WHERE 1=1';
    const params = [];

    if (req.query.category) {
      query += ' AND interest_category = ?';
      params.push(req.query.category);
    }

    if (req.query.status) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }

    // Get total count
    db.get(`SELECT COUNT(*) as count FROM (${query})`, params, (err, countResult) => {
      if (err) {
        return next(err);
      }

      // Get paginated results
      db.all(
        query + ' ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [...params, limit, offset],
        (err, rows) => {
          if (err) {
            return next(err);
          }

          res.json({
            total: countResult.count,
            assessments: rows
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/assessments/:id - Get one assessment
router.get('/:id', (req, res, next) => {
  try {
    const assessmentId = req.params.id;

    db.get('SELECT * FROM assessments WHERE id = ?', [assessmentId], (err, assessment) => {
      if (err) {
        return next(err);
      }

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      // Get current progress - count responses
      db.get(
        'SELECT COUNT(*) as count FROM responses WHERE assessment_id = ?',
        [assessmentId],
        (err, result) => {
          if (err) {
            return next(err);
          }

          const answeredQuestions = result.count;
          const currentPhase = Math.ceil((answeredQuestions / assessment.total_questions) * assessment.total_phases) || 1;

          // Get current phase questions
          db.all(
            'SELECT * FROM questions WHERE assessment_id = ? AND phase_number = ? ORDER BY question_number',
            [assessmentId, Math.min(currentPhase, assessment.total_phases)],
            (err, currentPhaseQuestions) => {
              if (err) {
                return next(err);
              }

              res.json({
                ...assessment,
                progress: {
                  answered_questions: answeredQuestions,
                  current_phase: currentPhase,
                  total_questions: assessment.total_questions
                },
                current_phase_questions: currentPhaseQuestions || []
              });
            }
          );
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/assessments/:id - Update assessment status
router.patch('/:id', (req, res, next) => {
  try {
    const { status } = req.body;
    const assessmentId = req.params.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updateQuery = `
      UPDATE assessments
      SET status = ?, end_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(updateQuery, [status, assessmentId], function(err) {
      if (err) {
        return next(err);
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      db.get('SELECT * FROM assessments WHERE id = ?', [assessmentId], (err, row) => {
        if (err) {
          return next(err);
        }

        res.json({
          id: row.id,
          status: row.status,
          end_time: row.end_time
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

export default router;
