import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

interface SuccessConfettiProps {
  active: boolean;
  duration?: number;
}

export const SuccessConfetti: React.FC<SuccessConfettiProps> = ({ 
  active, 
  duration = 3000 
}) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isActive, setIsActive] = useState(active);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsActive(active);
    
    if (active && duration > 0) {
      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!isActive) return null;

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
      wind={0.01}
      colors={['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
    />
  );
};
