import React, { useState, useEffect } from "react";
import "./ModalResult.css";

const ModalResult = ({ show, handleClose, handleContinue }) => {
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setLoading(false);
        setShowResult(true);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {loading ? (
          <div className="loading">Just a moment...</div>
        ) : (
          <>
            <h2 className="result-text">Your results are in!</h2>
            <button className="continue" onClick={handleContinue}>
              View my match!
            </button>
          </>
        )}
        <button className="close" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ModalResult;
