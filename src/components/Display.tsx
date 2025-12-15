import React from 'react'

const Display = ({seconds}) => {
    
  const formatTime = (t) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return (
    <div>
      <p className="text-4xl font-bold text-indigo-800 mt-1">
        {formatTime(seconds)}
      </p>
      
    </div>
  )
}

export default Display
