import { useState } from "react";

const TimerInput = ({ onStart }: { onStart: (number:number) => void })=> {
  // const TimerInput = ({ onStart } : { onStart : (timeInSeconds : number )}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  
  // useEffect(()=> {
  //   handleStartClick()
  // }, [inputValue])

  const handleStartClick = () => {
    const timeInSeconds = parseInt(inputValue, 10);
    if (!isNaN(timeInSeconds) && timeInSeconds >= 0) {
      onStart(timeInSeconds);
    }
  };

  return (
    <div className="flex flex-col">
      <h3 className="">Set Timer Duration</h3>
      <div className="">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          className="border-2 border-indigo-600 rounded-xl p-2 w-40"
          placeholder="Enter seconds"
          // onChange={handleCombine}
          // onClick={handleStartClick}
        />
        <br />
        <button
          onClick={handleStartClick}
          className="bg-blue-500 text-white w-[3rem] ml-2 rounded-xl"
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default TimerInput;
