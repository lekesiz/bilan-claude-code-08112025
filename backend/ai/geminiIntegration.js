import { prompts } from './prompts.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-1.5-flash';

/**
 * Call Gemini API with a prompt
 * @param {string} prompt - The prompt to send
 * @param {boolean} jsonMode - Whether to expect JSON response
 * @returns {Promise<any>} - Parsed response
 */
async function callGemini(prompt, jsonMode = true) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set in environment variables');
  }

  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      responseMimeType: jsonMode ? 'application/json' : 'text/plain'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content in Gemini response');
    }

    if (jsonMode) {
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

/**
 * Generate personalized assessment structure
 * @param {string} interestCategory - Professional category
 * @param {number} allocatedHours - Hours available for assessment
 * @returns {Promise<object>} - Structure with phases and questions count
 */
export async function generatePersonalizedStructure(interestCategory, allocatedHours) {
  const prompt = prompts.PERSONALIZE_STRUCTURE(interestCategory, allocatedHours);

  const structure = await callGemini(prompt, true);

  // Calculate total questions
  const totalQuestions = (structure.questions_per_phase || 5) * (structure.total_phases || 3);

  // Parse phases structure
  const phases = Array.from({ length: structure.total_phases || 3 }, (_, i) => ({
    phase: i + 1,
    questions_count: structure.questions_per_phase || 5
  }));

  return {
    total_phases: structure.total_phases || 3,
    total_questions: totalQuestions,
    estimated_completion_time: structure.estimated_completion_time || (allocatedHours * 60),
    phase_topics: structure.phase_topics || [],
    difficulty_progression: structure.difficulty_progression || 'low to high',
    phases
  };
}

/**
 * Generate questions for a specific phase
 * @param {string} interestCategory - Professional category
 * @param {number} phaseNumber - Phase number
 * @param {string} phaseTopic - Topic for this phase
 * @param {number} difficulty - Difficulty level 1-5
 * @param {number} questionsCount - Number of questions to generate
 * @returns {Promise<array>} - Array of question objects
 */
export async function generatePhaseQuestions(
  interestCategory,
  phaseNumber,
  phaseTopic,
  difficulty,
  questionsCount = 5
) {
  const prompt = prompts.GENERATE_PHASE_QUESTIONS(
    interestCategory,
    phaseNumber,
    phaseTopic,
    difficulty,
    questionsCount
  );

  const result = await callGemini(prompt, true);

  // Validate and normalize questions
  const questions = (result.questions || []).map((q, idx) => ({
    phase_number: phaseNumber,
    question_number: idx + 1,
    question_text: q.question_text,
    question_type: q.question_type || 'rating',
    choices: q.choices ? JSON.stringify(q.choices) : null,
    category: q.category || 'General',
    difficulty: difficulty
  }));

  return questions;
}

/**
 * Generate AI synthesis report
 * @param {object} assessment - Assessment data
 * @param {array} responses - Array of response objects with question details
 * @returns {Promise<object>} - Synthesis report
 */
export async function generateSynthesis(assessment, responses) {
  const prompt = prompts.GENERATE_SYNTHESIS(assessment, responses);

  const synthesis = await callGemini(prompt, true);

  return {
    assessment_id: assessment.id,
    employee_name: `${assessment.first_name} ${assessment.last_name}`,
    interest_category: assessment.interest_category,
    allocated_hours: assessment.allocated_hours,
    synthesis: {
      key_strengths: synthesis.key_strengths || [],
      development_areas: synthesis.development_areas || [],
      career_recommendations: synthesis.career_recommendations || [],
      specific_next_steps: synthesis.specific_next_steps || [],
      overall_profile: synthesis.overall_profile || '',
      confidence_level: synthesis.confidence_level || 'medium',
      generated_at: new Date().toISOString()
    }
  };
}

export default {
  callGemini,
  generatePersonalizedStructure,
  generatePhaseQuestions,
  generateSynthesis
};
