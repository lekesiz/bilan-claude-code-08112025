/**
 * Generate CSV export from assessment responses
 * @param {object} assessment - Assessment data
 * @param {array} responses - Array of response objects
 * @returns {string} - CSV content
 */
export function generateCSV(assessment, responses) {
  // CSV headers
  const headers = ['Question ID', 'Question Text', 'Category', 'Answer', 'Explanation', 'Answered At'];

  // CSV rows
  const rows = responses.map(r => [
    r.question_id || '',
    `"${(r.question_text || '').replace(/"/g, '""')}"`, // Escape quotes
    r.category || '',
    r.answer_rating ? `${r.answer_rating}/5` : (r.answer_text || ''),
    `"${(r.explanation || '').replace(/"/g, '""')}"`,
    new Date(r.answered_at).toLocaleString()
  ]);

  // Build CSV content
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  // Add summary at the end
  csvContent += '\n\n';
  csvContent += 'ASSESSMENT SUMMARY\n';
  csvContent += `Employee Name,${assessment.first_name} ${assessment.last_name}\n`;
  csvContent += `Interest Category,${assessment.interest_category}\n`;
  csvContent += `Allocated Hours,${assessment.allocated_hours}\n`;
  csvContent += `Total Questions,${assessment.total_questions}\n`;
  csvContent += `Status,${assessment.status}\n`;
  csvContent += `Start Time,${new Date(assessment.start_time).toLocaleString()}\n`;
  if (assessment.end_time) {
    csvContent += `End Time,${new Date(assessment.end_time).toLocaleString()}\n`;
  }

  return csvContent;
}

export default { generateCSV };
