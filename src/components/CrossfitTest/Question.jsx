import React from "react";
import PropTypes from "prop-types";

const Question = ({ question, currentIndex, totalQuestions, onAnswer }) => {
  return (
    <div className="crossfit-question">
      <div className="question-progress">
        <div className="progress-text">
          질문 {currentIndex + 1} / {totalQuestions}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="question-content">
        <h3>{question.text}</h3>
        <div className="answer-options">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              className="answer-btn"
              onClick={() => onAnswer(question.id, value, question.dimension)}
            >
              {value === 1 && "전혀 아니다"}
              {value === 2 && "아니다"}
              {value === 3 && "보통이다"}
              {value === 4 && "그렇다"}
              {value === 5 && "매우 그렇다"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Question.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    dimension: PropTypes.string.isRequired,
  }).isRequired,
  currentIndex: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  onAnswer: PropTypes.func.isRequired,
};

export default Question;
