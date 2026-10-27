import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface PatientAvatarProps {
  image?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  image,
  name,
  size = 'md',
  fallback,
  className,
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n: string) => {
    if (fallback) return fallback;
    const parts = n.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'P';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg font-semibold',
  };

  const showImg = image && !imgError;

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-brand-50 text-brand-700 font-medium border border-brand-100 shadow-subtle',
        sizes[size],
        className
      )}
    >
      {showImg ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
