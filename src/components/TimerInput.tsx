import React, { useState } from "react";

const TimerInput = ({ isRunning, onStart, onStop }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleStartClick = () => {
    const timeInSeconds = parseInt(inputValue, 10);
    if (!isNaN(timeInSeconds) && timeInSeconds > 0) {
      onStart(timeInSeconds);
    }
  };

  return (
    <div 
    className="flex flex-col items-start gap-4 p-2 border rounded-lg"
    >
      <h3 className="">Set Timer Duration</h3>
      <div className="">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          className="border-2 border-indigo-600 rounded-xl p-2 w-40"
          placeholder="Enter seconds"
        />
        <button
          onClick={handleStartClick}
          disabled={isRunning || !inputValue}
          className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
            (isRunning || !inputValue) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 '
          }`}
        >
          Start
        </button>
        <button
          onClick={onStop}
          disabled={!isRunning}
          className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
            !isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600'
          }`}
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default TimerInput;
