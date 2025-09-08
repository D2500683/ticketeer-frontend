import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center justify-center gap-2 text-red-400">
          <Calendar className="h-5 w-5" />
          <span className="font-semibold">Event has started!</span>
        </div>
      </motion.div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black border border-gray-700 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-purple-400" />
        <span className="text-lg font-semibold text-white">Event Starts In</span>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <motion.div
              key={unit.value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-black/30 rounded-lg p-3 mb-2 border border-white/10"
            >
              <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                {unit.value.toString().padStart(2, '0')}
              </div>
            </motion.div>
            <div className="text-sm text-gray-300 font-medium">
              {unit.label}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/*<div className="mt-4 text-center">
        <div className="text-sm text-gray-400">
          {new Date(targetDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>*/}
    </motion.div>
  );
};

export default CountdownTimer;
