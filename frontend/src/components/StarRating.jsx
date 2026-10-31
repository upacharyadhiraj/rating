import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  maxStars = 5,
  size = 18,
  interactive = false,
  onRate = () => {},
  showValue = true,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const currentVal = hoverRating || rating || 0;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= currentVal;

          return (
            <button
              key={starNumber}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate(starNumber)}
              onMouseEnter={() => interactive && setHoverRating(starNumber)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${
                interactive
                  ? 'cursor-pointer star-hover p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded'
                  : 'cursor-default'
              }`}
              title={interactive ? `Rate ${starNumber} of ${maxStars}` : `${rating} stars`}
            >
              <Star
                size={size}
                className={`${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-slate-100 text-slate-300'
                } transition-colors duration-150`}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-slate-700 ml-0.5">
          {rating > 0 ? Number(rating).toFixed(1) : 'No ratings'}
        </span>
      )}
    </div>
  );
};
