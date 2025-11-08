import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import db from '../config/database.js';

/**
 * Generate PDF report for an assessment
 * @param {object} assessment - Assessment data
 * @returns {Promise<Buffer>} - PDF file buffer
 */
export async function generatePDF(assessment) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get responses for synthesis
      const responses = await new Promise((res, rej) => {
        db.all(
          `SELECT r.*, q.question_text, q.category
           FROM responses r
           LEFT JOIN questions q ON r.question_id = q.id
           WHERE r.assessment_id = ?`,
          [assessment.id],
          (err, rows) => err ? rej(err) : res(rows || [])
        );
      });

      // Create PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      // Collect PDF data
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Bilan de Compétence Report', 100);
      doc.moveDown();

      // Assessment Info
      doc.fontSize(12).font('Helvetica-Bold').text('Assessment Information');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${assessment.first_name} ${assessment.last_name}`);
      doc.text(`Category: ${assessment.interest_category}`);
      doc.text(`Allocated Hours: ${assessment.allocated_hours}`);
      doc.text(`Total Questions: ${assessment.total_questions}`);
      doc.text(`Start Date: ${new Date(assessment.start_time).toLocaleString()}`);
      doc.text(`Status: ${assessment.status.toUpperCase()}`);
      doc.moveDown();

      // Responses Summary
      doc.fontSize(12).font('Helvetica-Bold').text('Response Summary');
      doc.fontSize(10).font('Helvetica');
      responses.forEach((r, idx) => {
        doc.text(`Q${idx + 1}: ${r.question_text}`);
        if (r.answer_rating) {
          doc.text(`  Answer: ${r.answer_rating}/5`);
        } else if (r.answer_text) {
          doc.text(`  Answer: ${r.answer_text}`);
        }
        if (r.explanation) {
          doc.text(`  Explanation: ${r.explanation.substring(0, 100)}...`);
        }
        doc.moveDown(0.5);
      });

      // Synthesis if available
      if (assessment.ai_synthesis) {
        doc.addPage();
        const synthesis = JSON.parse(assessment.ai_synthesis);
        doc.fontSize(12).font('Helvetica-Bold').text('AI Analysis & Recommendations');
        doc.moveDown();

        if (synthesis.synthesis) {
          const syn = synthesis.synthesis;

          if (syn.key_strengths && syn.key_strengths.length > 0) {
            doc.fontSize(11).font('Helvetica-Bold').text('Key Strengths:');
            doc.fontSize(10).font('Helvetica');
            syn.key_strengths.forEach(s => doc.text(`• ${s}`));
            doc.moveDown();
          }

          if (syn.development_areas && syn.development_areas.length > 0) {
            doc.fontSize(11).font('Helvetica-Bold').text('Development Areas:');
            doc.fontSize(10).font('Helvetica');
            syn.development_areas.forEach(d => doc.text(`• ${d}`));
            doc.moveDown();
          }

          if (syn.specific_next_steps && syn.specific_next_steps.length > 0) {
            doc.fontSize(11).font('Helvetica-Bold').text('Next Steps:');
            doc.fontSize(10).font('Helvetica');
            syn.specific_next_steps.forEach(n => doc.text(`• ${n}`));
            doc.moveDown();
          }

          if (syn.career_recommendations && syn.career_recommendations.length > 0) {
            doc.fontSize(11).font('Helvetica-Bold').text('Career Recommendations:');
            doc.fontSize(10).font('Helvetica');
            syn.career_recommendations.forEach(rec => {
              doc.text(`• ${rec.job_title}`);
              if (rec.rome_code) {
                doc.text(`  ROME Code: ${rec.rome_code}`);
              }
              doc.text(`  Rationale: ${rec.rationale.substring(0, 150)}...`);
            });
          }
        }
      }

      // Footer
      doc.fontSize(9).font('Helvetica').text(
        `Generated on ${new Date().toLocaleString()}`,
        { align: 'center', textAlign: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export default { generatePDF };
