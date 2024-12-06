import React, { useRef, useState } from "react";
import "./TakeQuiz.css";
import { useNavigate, useParams } from "react-router-dom";
import ModalResult from "./ModalResult";

const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
const questions = [
  {
    question: "I feel anxious most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Anxious",
  },
  {
    question: "I feel happy most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Happy",
  },
  {
    question: "I feel motivated most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Motivated",
  },
  {
    question: "I feel calm most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Calm",
  },
  {
    question: "I feel goofy most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Playful",
  },
  {
    question: "I feel energetic most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Energetic",
  },
  {
    question: "I feel confident most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Confident",
  },
  {
    question: "I feel creative most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Creative",
  },
  {
    question: "I sad Sad most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Sad",
  },
  {
    question: "I feel stressed most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Stressed",
  },
  {
    question: "I feel romantic or in love most days",
    answers: [5, 4, 3, 2, 1],
    mood: "Romantic",
  },
];

const determineMood = (answers) => {
  const moodScores = {};

  questions.forEach((question) => {
    moodScores[question.mood] = 0;
  });

  answers.forEach((answer, index) => {
    const question = questions[index];
    moodScores[question.mood] += answer;
  });

  const predominantMood = Object.keys(moodScores).reduce((a, b) =>
    moodScores[a] > moodScores[b] ? a : b
  );

  return { predominantMood, moodScores };
};

const TakeQuiz = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answeredQuestions, setQuestion] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showModalResult, setShowModalResult] = useState(false);

  const handleNextClick = () => {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(answers[currentQuestion + 1] || null);
  };

  const handlePreviousClick = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
    }
  };

  const handleAnswerClick = (answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    setAnswers(updatedAnswers);

    const updatedQuestions = [...answeredQuestions];
    updatedQuestions[currentQuestion] = questions[currentQuestion].question;
    setQuestion(updatedQuestions);
    setSelectedAnswer(answer);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (answers.length !== questions.length) {
      alert("Please answer all the questions before submitting.");
      return;
    }

    const { predominantMood, moodScores } = determineMood(answers);
    const answersData = {
      userId,
      answers,
      questions: answeredQuestions,
      mood: predominantMood,
      moodScores,
    };
    try {
      const response = await fetch(`${backendAddress}/submit-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answersData),
      });

      if (response.ok) {
        setShowModalResult(true);
      } else {
        const errorData = await response.json();
        console.error("Failed to submit answers:", errorData);
        alert("Failed to submit answers.");
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("Error submitting answers.");
    }
  };

  const handleModalResultClose = () => {
    setShowModalResult(false);
  };

  const handleContinue = () => {
    setShowModalResult(false);
    navigate(`/moodboard/${userId}`);
  };

  const handleBackToHome = () => {
    navigate(`/home/${userId}`);
  };

  return (
    <div className="quiz-container">
      <header className="header">
        <h1>Music Personality Quiz</h1>
      </header>
      {questions[currentQuestion] && (
        <div className="option-question">
          <h3>{questions[currentQuestion].question}</h3>
        </div>
      )}
      {questions[currentQuestion] && (
        <div className="answer-options">
          {questions[currentQuestion].answers.map((answer, index) => (
            <button
              key={answer}
              className={`answer-button ${
                selectedAnswer === answer ? "selected" : ""
              }`}
              onClick={() => handleAnswerClick(answer)}
            >
              {answer}
            </button>
          ))}
        </div>
      )}
      <div className="navigation-buttons">
        {currentQuestion > 0 && (
          <button className="previous-button" onClick={handlePreviousClick}>
            Previous
          </button>
        )}
        {currentQuestion < questions.length - 1 && (
          <button className="next-button" onClick={handleNextClick}>
            Next
          </button>
        )}
        {currentQuestion === questions.length - 1 && (
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        )}
      </div>
      <ModalResult
        show={showModalResult}
        handleClose={handleModalResultClose}
        handleContinue={handleContinue}
      />
      <button className="back-to-home" onClick={handleBackToHome}>
        Close
      </button>
    </div>
  );
};
export default TakeQuiz;