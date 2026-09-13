import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-zinc-950 border border-zinc-850 rounded-lg p-5 transition-all duration-150',
          hoverEffect && 'hover:border-zinc-700 hover:bg-zinc-900/60',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
