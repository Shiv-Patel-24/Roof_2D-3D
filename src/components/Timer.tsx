/// <reference types="node" />
import { useEffect, useState } from "react";
import moment from "moment";

const Timer = () => {
  const [timeDisplay, setTimeDisplay] = useState<string>("");
  const [isStopwatchActive, setIsStopwatchActive] = useState<boolean>(false);
  const [stopwatchStartTime, setStopwatchStartTime] = useState<number>(
    moment().valueOf()
  );
  const [elapsedTimeOnStop, setElapsedTimeOnStop] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [tickCount, setTickCount] = useState<number>(0);
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const updateTimer = () => {
      if (isStopwatchActive) {
        const currentTime = moment().valueOf();
        const newElapsedTime =
          elapsedTimeOnStop + (currentTime - stopwatchStartTime);
        const format =
          moment.duration(newElapsedTime).hours() > 0
            ? "MMMM Do YYYY, HH:mm:ss"
            : "HH:mm:ss:sS";
        setTimeDisplay(
          moment
            .utc(moment.duration(newElapsedTime).asMilliseconds())
            .format(format)
        );
      } else {
        setTimeDisplay(moment().format("MMMM Do YYYY, HH:mm:ss"));
      }
    };

    intervalId = setInterval(updateTimer, isStopwatchActive ? 10 : 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isStopwatchActive, stopwatchStartTime, elapsedTimeOnStop]);

  const toggleTimerMode = () => {
    setIsStopwatchActive((prev) => {
      const newState = prev;

      if (!newState) {
        setStopwatchStartTime(moment().valueOf());
      } else {
        const currentTime = moment().valueOf();
        const newElapsedTime =
          elapsedTimeOnStop + (currentTime - stopwatchStartTime);
        setElapsedTimeOnStop(newElapsedTime);
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (!isStopwatchActive) {
      // setTickCount(0);
      // setMessage("");
      return () => {
        setMessage("");
        setTickCount(0);
      };
    }

    const interval = setInterval(() => {
      setTickCount((prev) => {
        const next = prev + 1;
        setMessage(` ${next * 5} seconds completed`);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isStopwatchActive]);

  return (
    <div>
      <div className="flex items-center gap-3x  ">
        <button
          onClick={toggleTimerMode}
          className="px-4 py-2 rounded-full border shadow-sm transition-colors"
        >
          Today : <b>{timeDisplay}</b>
        </button>
        <p className="invisible">{tickCount}</p>

        {message && (
          <span className="text-sm text-green-600 font-medium">{message}</span>
        )}
      </div>
    </div>
  );
};

export default Timer;
