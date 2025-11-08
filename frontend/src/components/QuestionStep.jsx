import { useState } from 'react';
import ProgressBar from './ProgressBar';

export default function QuestionStep({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  onNext,
  onPrevious,
  loading
}) {
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');

  const handleSubmit = () => {
    if (!answer) {
      alert('Please provide an answer');
      return;
    }

    onAnswer({
      question_id: question.id,
      answer_rating: question.question_type === 'rating' ? parseInt(answer) : null,
      answer_text: question.question_type !== 'rating' ? answer : null,
      explanation
    });

    setAnswer('');
    setExplanation('');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <ProgressBar
        current={currentIndex + 1}
        total={totalQuestions}
        label="Question Progress"
      />

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">{question.question_text}</h2>

        {/* Rating Questions */}
        {question.question_type === 'rating' && (
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => setAnswer(rating.toString())}
                className={`px-4 py-2 border-2 rounded ${
                  answer === rating.toString()
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        )}

        {/* Multiple Choice Questions */}
        {question.question_type === 'multiple_choice' && question.choices && (
          <div className="space-y-2 mb-6">
            {JSON.parse(question.choices).map((choice, idx) => (
              <label key={idx} className="flex items-center">
                <input
                  type="radio"
                  name="choice"
                  value={choice}
                  checked={answer === choice}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="mr-3"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        )}

        {/* Open-ended Questions */}
        {question.question_type === 'open_ended' && (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Provide your detailed answer"
            className="w-full h-24 mb-6"
          ></textarea>
        )}

        {/* Optional Explanation */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Additional Explanation (Optional)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Add any context or explanation"
            className="w-full h-16"
          ></textarea>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0 || loading}
          className="btn-secondary flex-1"
        >
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary flex-1"
        >
          {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
