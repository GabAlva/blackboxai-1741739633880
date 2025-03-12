import React, { useState, useEffect } from 'react';

const DiceRoll = () => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [rolling, setRolling] = useState(true);

  useEffect(() => {
    let rollInterval;
    if (rolling) {
      rollInterval = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * 6) + 1);
      }, 100);

      // Parar o dado após 2 segundos
      setTimeout(() => {
        clearInterval(rollInterval);
        setRolling(false);
      }, 2000);
    }

    return () => clearInterval(rollInterval);
  }, []);

  const getDiceFace = (number) => {
    switch (number) {
      case 1:
        return <i className="fas fa-dice-one"></i>;
      case 2:
        return <i className="fas fa-dice-two"></i>;
      case 3:
        return <i className="fas fa-dice-three"></i>;
      case 4:
        return <i className="fas fa-dice-four"></i>;
      case 5:
        return <i className="fas fa-dice-five"></i>;
      case 6:
        return <i className="fas fa-dice-six"></i>;
      default:
        return <i className="fas fa-dice"></i>;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      <div className={`text-8xl text-pokemon-yellow ${rolling ? 'animate-bounce' : ''}`}>
        {getDiceFace(currentNumber)}
      </div>
    </div>
  );
};

export default DiceRoll;
