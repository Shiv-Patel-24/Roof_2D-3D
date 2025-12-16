import { useState } from "react";

const TimerInput = ({onStart}) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleStartClick = () => {
    const timeInSeconds = parseInt(inputValue, 10);
    console.log(timeInSeconds, "outside");
    if (!isNaN(timeInSeconds) && timeInSeconds > 0) {
      onStart(timeInSeconds);
      console.log("inside");
    }
  };

  return (
    <div >
      <h3 className="">Set Timer Duration</h3>
      <div className="">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          className="border-2 border-indigo-600 rounded-xl p-2 w-40"
          placeholder="Enter seconds"
        />
        <button onClick={handleStartClick} className="bg-black text-white w-[3rem] ml-2 rounded-xl">Start</button>

      </div>
    </div>
  );
};

export default TimerInput;


  // useEffect(() => {
  //   let intervalId = null;

  //   if (isRunning && seconds > 0) {
  //     intervalId = setInterval(() => {
  //       setSeconds((prevSeconds) => prevSeconds - 1);
  //     }, 1000);
  //   }

  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [isRunning, seconds]);

  // const handleStartTimer = (timeInSeconds: number) => {
  //   setSeconds(timeInSeconds);
  //   setIsRunning(true);
  // };
{
  /* <button
          onClick={onStop}
          disabled={!isRunning}
          className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
            !isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600'
          }`}
        >
          Stop
        </button> */
}
