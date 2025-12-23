import { useState, useEffect } from "react";

const Display = ({ timeInSeconds }: { timeInSeconds: number }) => {
  const [seconds, setSeconds] = useState(timeInSeconds);
  const [isRunning] = useState(true);

  const formatTime = (t: number) => {
    return `${Math.floor(t / 60)
      .toString()
      .padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}`;
  };

  useEffect(() => {
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

  // const handleStart = () => {
  //   setIsRunning(true);
  // };

  return (
    <div>
      <h2>Time Remaining: {formatTime(seconds)}</h2>
      {/* <button onClick={handleStart} className="bg-black text-white hover:bg-blue-900 w-12 rounded-xl">Start</button> */}
    </div>
  );
};

export default Display;
