import { useEffect, useState } from "react";
import moment from "moment";

const Timer = () => {
  const [timeDisplay, setTimeDisplay] = useState<string>("");
  console.log('1')
  const [isStopwatchActive, setIsStopwatchActive] = useState<boolean>(true);
  const [stopwatchStartTime, setStopwatchStartTime] = useState<number>(
    Date.now()
  );
  const [elapsedTimeOnStop, setElapsedTimeOnStop] = useState<number>(0);
  console.log('one')
  const [message, setMessage] = useState<string>("");
  const [tickCount, setTickCount] = useState<number>(0);
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const updateTimer = () => {
      if (isStopwatchActive) {
        const currentTime = Date.now();
        const newElapsedTime =
          elapsedTimeOnStop + (currentTime - stopwatchStartTime);
        const duration = moment.duration(newElapsedTime);
        // using useRef or useState(useState for recode of each 15 seconds )
        const format =
          duration.hours() > 0 ? "MMMM Do YYYY, HH:mm:ss" : "HH:mm:ss:sS";
        setTimeDisplay(moment.utc(duration.asMilliseconds()).format(format));
      } else {
        setTimeDisplay(moment().format("MMMM Do YYYY, HH:mm:ss"));
      }
    };

    const intervalDuration = isStopwatchActive ? 10 : 1000;
    intervalId = setInterval(updateTimer, intervalDuration);

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
        setStopwatchStartTime(Date.now());
      } else {
        const currentTime = Date.now();
        const newElapsedTime =
          elapsedTimeOnStop + (currentTime - stopwatchStartTime);
        setElapsedTimeOnStop(newElapsedTime);
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (!isStopwatchActive) {
      setMessage("");
      setTickCount(0);
      return;
    }

    const interval = setInterval(() => {
      console.log(tickCount);
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
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTimerMode}
          className="px-4 py-2 rounded-full border shadow-sm transition-colors"
        >
          Today : <b>{timeDisplay}</b>
        </button>

        {message && (
          <span className="text-sm text-green-600 font-medium">{message}</span>
        )}
      </div>
    </div>
  );
};

export default Timer;


// take new state. 