import React from 'react';

interface FroggoLogoProps { size?: number | string; className?: string; }

/** The selected lawyer frog redrawn as a light ink-and-wash sketch. */
export const FroggoLogo: React.FC<FroggoLogoProps> = ({ size = 38, className = '' }) => (
  <span
    className={`froggo-lawyer-logo inline-block shrink-0 ${className}`}
    style={{ width: size, height: size }}
    role="img"
    aria-label="Froggo lawyer frog"
  />
);
