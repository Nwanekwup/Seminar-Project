const calculateDistance = (userMoodScores, songMoodScores) => {
    let distance = 0;
  
    Object.keys(userMoodScores).forEach((mood) => {
      const userScore = userMoodScores[mood] || 0;
      const songScore = songMoodScores[mood] || 0;
      distance += Math.pow(userScore - songScore, 2);
    });
  
    return Math.sqrt(distance);
  };
  
  module.exports = calculateDistance;