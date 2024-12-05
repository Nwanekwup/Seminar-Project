const questions = [
    {
      question: "I feel anxious most days",
      mood: "Anxious",
    },
    {
      question: "I feel happy most days",
      mood: "Happy",
    },
    {
      question: "I feel motivated most days",
      mood: "Motivated",
    },
    {
      question: "I feel calm most days",
      mood: "Calm",
    },
    {
      question: "I feel goofy most days",
      mood: "Playful",
    },
    {
      question: "I feel energetic most days",
      mood: "Energetic",
    },
    {
      question: "I feel confident most days",
      mood: "Confident",
    },
    {
      question: "I feel creative most days",
      mood: "Creative",
    },
    {
      question: "I feel sad most days",
      mood: "Sad",
    },
    {
      question: "I feel stressed most days",
      mood: "Stressed",
    },
    {
      question: "I feel romantic or in love most days",
      mood: "Romantic",
    },
  ];
  
  const calculateUserMoodScores = (answers) => {
    const userMoodScores = {};
  
    questions.forEach((question) => {
      userMoodScores[question.mood] = 0;
    });
  
    answers.forEach((answer, index) => {
      const question = questions[index];
      userMoodScores[question.mood] += answer;
    });
  
    // Normalize scores by dividing by 5
    Object.keys(userMoodScores).forEach((mood) => {
      userMoodScores[mood] /= 5;
    });
  
    return userMoodScores;
  };
  
  module.exports = { calculateUserMoodScores };