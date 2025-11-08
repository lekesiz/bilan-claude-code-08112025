import express from 'express';
import db from '../config/database.js';
import { generateSynthesis } from '../ai/geminiIntegration.js';
import { generatePDF } from '../utils/reportGenerator.js';
import { generateCSV } from '../utils/csvExporter.js';

const router = express.Router();

// GET /:id/synthesis - Get AI-generated synthesis
router.get('/:id/synthesis', async (req, res, next) => {
  try {
    const assessmentId = req.params.id;

    // Check if synthesis already exists
    db.get('SELECT * FROM assessments WHERE id = ?', [assessmentId], async (err, assessment) => {
      if (err) {
        return next(err);
      }

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      if (assessment.ai_synthesis) {
        return res.json(JSON.parse(assessment.ai_synthesis));
      }

      // Get all responses for this assessment
      db.all(
        `SELECT r.*, q.question_text, q.category
         FROM responses r
         LEFT JOIN questions q ON r.question_id = q.id
         WHERE r.assessment_id = ?`,
        [assessmentId],
        async (err, responses) => {
          if (err) {
            return next(err);
          }

          try {
            // Generate synthesis with Gemini
            const synthesis = await generateSynthesis(
              assessment,
              responses
            );

            // Save synthesis to database
            db.run(
              'UPDATE assessments SET ai_synthesis = ?, synthesis_generated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [JSON.stringify(synthesis), assessmentId],
              (err) => {
                if (err) {
                  console.error('Error saving synthesis:', err);
                }
              }
            );

            res.json(synthesis);
          } catch (aiError) {
            console.error('Error generating synthesis:', aiError);

            // Provide fallback synthesis
            const fallbackSynthesis = {
              assessment_id: assessmentId,
              employee_name: `${assessment.first_name} ${assessment.last_name}`,
              interest_category: assessment.interest_category,
              allocated_hours: assessment.allocated_hours,
              synthesis: {
                key_strengths: ['Strong engagement in assessment'],
                development_areas: ['Continuous learning recommended'],
                career_recommendations: [],
                next_steps: ['Review results with supervisor'],
                generated_at: new Date().toISOString()
              }
            };

            res.status(206).json(fallbackSynthesis);
          }
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

// GET /:id/report/pdf - Download report as PDF
router.get('/:id/report/pdf', (req, res, next) => {
  try {
    const assessmentId = req.params.id;

    db.get('SELECT * FROM assessments WHERE id = ?', [assessmentId], async (err, assessment) => {
      if (err) {
        return next(err);
      }

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      try {
        const pdfBuffer = await generatePDF(assessment);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="assessment-${assessmentId}.pdf"`);
        res.send(pdfBuffer);
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        res.status(500).json({ error: 'Failed to generate PDF' });
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /:id/report/csv - Export responses as CSV
router.get('/:id/report/csv', (req, res, next) => {
  try {
    const assessmentId = req.params.id;

    db.get('SELECT * FROM assessments WHERE id = ?', [assessmentId], (err, assessment) => {
      if (err) {
        return next(err);
      }

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      db.all(
        `SELECT r.*, q.question_text, q.category
         FROM responses r
         LEFT JOIN questions q ON r.question_id = q.id
         WHERE r.assessment_id = ?`,
        [assessmentId],
        (err, responses) => {
          if (err) {
            return next(err);
          }

          try {
            const csvContent = generateCSV(assessment, responses);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="assessment-${assessmentId}.csv"`);
            res.send(csvContent);
          } catch (csvError) {
            console.error('CSV generation error:', csvError);
            res.status(500).json({ error: 'Failed to generate CSV' });
          }
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

export default router;
