// import { useEffect, useState } from "react";
// import React from "react";
// // import Display from "./Display";
// import TimeInput from "./TimerInput";

// const ReverseTimer = () => {
//   //   const [reverseTimer, setReverseTime] = useState<number>(0);
//   // const [isRunning, setIsRunning] = useState<boolean>();
//   const [seconds, setSeconds] = useState<number>(0);

//   useEffect(() => {
//     let intervalId = null;

//     if (isRunning && seconds > 0) {
//       intervalId = setInterval(() => {
//         setSeconds((prevSeconds) => prevSeconds - 1);
//       }, 1000);
//     }

//     return () => {
//       if (intervalId) {
//         clearInterval(intervalId);
//       }
//     };
//   }, [isRunning, seconds]);

//   const handleStartTimer = (timeInSeconds) => {
//     setSeconds(timeInSeconds);
//     setIsRunning(true);
//   };

//   return (
//     <div className="flex flex-row  items-center">
//       <TimeInput
//         isRunning={isRunning}
//         onStart={handleStartTimer}
//         seconds={seconds}
//       />

//       {/* <Display seconds={seconds} /> */}

//     </div>
//   );
// };

// export default ReverseTimer;

// //   const handleChange = (event) => {
// //     console.log(inputValue, " InputValue")
// //     setInputValue(event.target.value);
// //   };

// //   const handleStart = () => {
// //     const timeInSeconds = parseInt(inputValue, 10);
// //     if (!isNaN(timeInSeconds) && timeInSeconds > 0) {
// //       setSeconds(timeInSeconds);
// //       setIsRunning(true);
// //     }
// //   }

// //   const formatTime = (t) => {
// //     const mins = Math.floor(t / 60);
// //     const secs = t % 60;
// //     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
// //   }

// {
//   /* <button className="px-4 py-2  flex flex-row rounded-full border shadow-sm transition-colors">
//             <input
//         type="number"
//         value={inputValue}
//         onChange={handleChange}
//         className="border-2 border-indigo-600 rounded-xl"
//         placeholder="Enter seconds"
//       />
//       <button onClick={handleStart} disabled={isRunning} className="mr-4">Start</button> <br />
//       <button onClick={handleStop} disabled={!isRunning} className="mr-4">Stop</button>
//       <h2>Time Remaining: <b>{formatTime(seconds)}</b></h2> 

//         </button> */
// }
// {
//   /* <TimeInput 
//            onStart={handleStartTimer}
//         onStop={handleStop} /> */
// }
