import React from 'react';
import { PaperCardData } from '../types';

interface ConnectionLinesProps {
  cards: PaperCardData[];
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({ cards }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      {cards.map((card) => {
        if (!card.replyTo) return null;

        const parentCard = cards.find((c) => c.id === card.replyTo);
        if (!parentCard || !card.width || !card.height || !parentCard.width || !parentCard.height) {
          return null;
        }

        // Calculate center points of each card
        const startX = parentCard.x + parentCard.width / 2;
        const startY = parentCard.y + parentCard.height / 2;
        const endX = card.x + card.width / 2;
        const endY = card.y + card.height / 2;

        // Create a curved path (like a string)
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        // Add some sag to make it look like a hanging string
        const controlY = midY + Math.abs(endX - startX) * 0.15;

        // Determine color based on who created the reply
        const strokeColor = card.author === 'ziji' ? '#ec4899' : '#3b82f6'; // pink or blue

        return (
          <g key={`line-${card.id}`}>
            {/* Main string line */}
            <path
              d={`M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`}
              stroke={strokeColor}
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />

            {/* Start dot */}
            <circle
              cx={startX}
              cy={startY}
              r="4"
              fill={strokeColor}
              opacity="0.8"
            />

            {/* End dot */}
            <circle
              cx={endX}
              cy={endY}
              r="4"
              fill={strokeColor}
              opacity="0.8"
            />
          </g>
        );
      })}
    </svg>
  );
};
