import React, { useState, useEffect } from 'react';

interface LoopingTypewriterProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
  className?: string;
  cursorClassName?: string;
}

export const LoopingTypewriter: React.FC<LoopingTypewriterProps> = ({
  phrases,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseMs = 2200,
  className = '',
  cursorClassName = '',
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const targetPhrase = phrases[phraseIndex % phrases.length];

    let timer: any;

    if (!isDeleting) {
      // Typing forward
      if (currentText.length < targetPhrase.length) {
        timer = setTimeout(() => {
          setCurrentText(targetPhrase.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        // Paused at full phrase before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseMs);
      }
    } else {
      // Deleting backwards
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(targetPhrase.slice(0, currentText.length - 1));
        }, deletingSpeed);
      } else {
        // Switch to next phrase and start typing forward
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <span
        className={`inline-block w-[3px] h-[1.05em] bg-white ml-1.5 align-middle animate-pulse ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
};
