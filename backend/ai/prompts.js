// Prompt templates for Gemini AI integration

export const prompts = {
  // Prompt 1: Personalize assessment structure based on interest and hours
  PERSONALIZE_STRUCTURE: (interestCategory, allocatedHours) => `
You are an expert competency assessment designer. Design a personalized competency assessment
for a ${interestCategory} professional who has ${allocatedHours} hours to complete it.

Consider:
- More hours = more phases and deeper questions
- Industry expertise determines question complexity
- Assessment should be comprehensive yet achievable in given time

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "total_phases": <number between 2-5>,
  "questions_per_phase": <number between 3-8>,
  "phase_topics": [<list of phase topics>],
  "difficulty_progression": "low to high",
  "estimated_completion_time": <minutes>
}

Example:
{
  "total_phases": 3,
  "questions_per_phase": 5,
  "phase_topics": ["Core Technical Skills", "Architecture & Design", "Team & Leadership"],
  "difficulty_progression": "low to high",
  "estimated_completion_time": 240
}
  `,

  // Prompt 2: Generate phase-specific questions
  GENERATE_PHASE_QUESTIONS: (interestCategory, phaseNumber, phaseTopic, difficulty, questionsCount) => `
Generate ${questionsCount} personalized competency assessment questions for a ${interestCategory} professional
focusing on: "${phaseTopic}"

Difficulty level: ${difficulty} out of 5

Requirements:
- Mix question types: rating (1-5 scale), multiple_choice (3-4 options), open_ended
- Questions must be specific to ${interestCategory}, not generic
- Rating scale: 1=Beginner, 5=Expert
- Multiple choice should have clear distinct options
- Open-ended questions should ask for specific examples

Respond ONLY with valid JSON (no markdown):
{
  "questions": [
    {
      "question_text": "...",
      "question_type": "rating" | "multiple_choice" | "open_ended",
      "choices": [...] (only for multiple_choice),
      "category": "..."
    }
  ]
}
  `,

  // Prompt 3: Generate final synthesis and recommendations
  GENERATE_SYNTHESIS: (assessment, responses) => `
Analyze this competency assessment and generate a comprehensive synthesis report.

Assessment Details:
- Employee: ${assessment.first_name} ${assessment.last_name}
- Interest: ${assessment.interest_category}
- Hours allocated: ${assessment.allocated_hours}
- Total questions answered: ${responses.length}

Responses:
${responses.map((r, i) =>
  `Q${i + 1}: "${r.question_text}"
   Answer: ${r.answer_rating ? `Rating: ${r.answer_rating}/5` : r.answer_text}
   Explanation: ${r.explanation || 'N/A'}`
).join('\n')}

Generate a comprehensive synthesis report in JSON:

{
  "key_strengths": ["...", "..."],
  "development_areas": ["...", "..."],
  "career_recommendations": [
    {
      "job_title": "...",
      "rationale": "...",
      "rome_code": "M1805" (if applicable)
    }
  ],
  "specific_next_steps": ["...", "..."],
  "overall_profile": "...",
  "confidence_level": "high" | "medium" | "low"
}

Requirements:
- Be specific and actionable (not generic)
- Focus on actual responses, not template answers
- Include ROME codes where applicable
- Each recommendation should relate to given answers
- Next steps should be concrete and achievable

Respond ONLY with valid JSON (no markdown):
  `
};

export default prompts;
