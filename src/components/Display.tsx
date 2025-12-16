import { useState, useEffect } from "react";

const Display = ({ timeInSeconds }) => {
  const [seconds, setSeconds] = useState(timeInSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const formatTime = (t) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    //props change
    setSeconds(timeInSeconds);
  }, [timeInSeconds]);

  useEffect(() => {
    let intervalId = null;

    if (isRunning && seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, seconds]);

  const handleStart = (timeInSeconds: number) => {
    // setSeconds(timeInSeconds);
    setIsRunning(true);
  };

  return (
    <div>

      <h2>Time Remaining: {formatTime(seconds)}</h2>
      {/* {!isRunning && seconds === 0 && <p>Time finished</p>} */}
      <button onClick={handleStart}>start</button>
      {/* {!isRunning && seconds > 0 || (
      )}  */}
    
    </div>
  );
};

export default Display;

// const Display = ({ seconds, isRunning, onStop }) => {
