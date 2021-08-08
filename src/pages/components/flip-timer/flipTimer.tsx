import React from 'react'

import './flipTimer.css'

const AnimatedCard = ({ animation, digit }: any) => {
  return (
    <div className={`flipCard ${animation}`}>
      <span>{digit}</span>
    </div>
  );
};

const StaticCard = ({ position, digit }: any) => {
  return (
    <div className={position}>
      <span>{digit}</span>
    </div>
  );
};

interface FlipTimerProps {
  digit: any;
  shuffle: any;
  unit: any;
  display: 'small' | 'large';
}

const FlipTimer = ({ digit, shuffle, unit, display }: FlipTimerProps) => {
  // assign digit values
  let currentDigit: any = digit;
  let previousDigit: any = digit + 1;

  // to prevent a negative value
  if (unit !== 'hours') {
    previousDigit = previousDigit === 60
      ? 59
      : previousDigit;
  } else {
    previousDigit = previousDigit === 24
      ? 23
      : previousDigit;
  }

  // add zero
  if (unit === 'days') {
    currentDigit = `${currentDigit.toString().padStart(3, '0')}`
    previousDigit = `${previousDigit.toString().padStart(3, '0')}`
  } else {
    currentDigit = `${currentDigit.toString().padStart(2, '0')}`
    previousDigit = `${previousDigit.toString().padStart(2, '0')}`
  }

  // shuffle digits
  const digit1 = shuffle
    ? previousDigit
    : currentDigit;
  const digit2 = !shuffle
    ? previousDigit
    : currentDigit;

  // shuffle animations
  const animation1 = shuffle
    ? 'fold'
    : 'unfold';
  const animation2 = !shuffle
    ? 'fold'
    : 'unfold';

  return (
    <div className={`flipUnitContainer ${display === 'small' ? 'small-flipUnitContainer' : ''}`}>
      <StaticCard
        position={'upperCard'}
        digit={currentDigit}
      />
      <StaticCard
        position={'lowerCard'}
        digit={previousDigit}
      />
      <AnimatedCard
        digit={digit1}
        animation={animation1}
      />
      <AnimatedCard
        digit={digit2}
        animation={animation2}
      />
    </div>
  );
};

export default FlipTimer
