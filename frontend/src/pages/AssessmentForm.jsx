import { useState, useEffect } from 'react';
import InitialInfo from '../components/InitialInfo';
import QuestionStep from '../components/QuestionStep';
import { assessmentAPI, questionAPI, responseAPI } from '../api/client';

export default function AssessmentForm({ onComplete, onBack }) {
  const [step, setStep] = useState('initial'); // initial, questions, review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const handleInitialSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await assessmentAPI.create(data);
      setAssessment(result);
      setQuestions(result.questions || []);
      setStep('questions');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerData) => {
    setLoading(true);
    setError(null);

    try {
      await responseAPI.submit({
        assessment_id: assessment.id,
        ...answerData
      });

      const newResponses = [...responses, answerData];
      setResponses(newResponses);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions answered
        await assessmentAPI.updateStatus(assessment.id, 'completed');
        onComplete(assessment.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setResponses(responses.slice(0, -1));
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {step === 'initial' && (
        <InitialInfo onSubmit={handleInitialSubmit} loading={loading} />
      )}

      {step === 'questions' && questions.length > 0 && (
        <QuestionStep
          question={questions[currentQuestionIndex]}
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onPrevious={handlePrevious}
          loading={loading}
        />
      )}
    </div>
  );
}
