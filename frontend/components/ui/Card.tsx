import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hover = false }) => {
  const baseStyles = 'bg-white rounded-lg shadow-md p-4';
  const hoverStyles = hover || onClick ? 'cursor-pointer transition-shadow hover:shadow-lg' : '';

  const content = (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );

  if (onClick || hover) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
