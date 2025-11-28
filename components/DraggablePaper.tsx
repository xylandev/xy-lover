import React, { useState, useEffect, useRef } from 'react';
import { PaperCardData, Coordinates, EmojiReaction } from '../types';
import { X, Smile } from 'lucide-react';

interface DraggablePaperProps {
  data: PaperCardData;
  currentUser: 'ziji' | 'xu';
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<PaperCardData>) => void;
  onDelete: (id: string) => void;
  onSelect: () => void;
  zIndex: number;
  onFocus: (force?: boolean) => void;
}

const EMOJI_OPTIONS = ['❤️', '😊', '👍', '🎉', '😂', '🤔', '💡', '✨', '🔥', '👀'];

export const DraggablePaper: React.FC<DraggablePaperProps> = ({
  data,
  currentUser,
  isSelected,
  onUpdate,
  onDelete,
  onSelect,
  zIndex,
  onFocus,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Coordinates>({ x: 0, y: 0 });
  const [displayedText, setDisplayedText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Refs for typing animation and DOM element
  const textIndex = useRef(0);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Typing effect logic
  useEffect(() => {
    if (data.isTyping) {
      setDisplayedText('');
      textIndex.current = 0;

      const typeNextChar = () => {
        if (textIndex.current < data.text.length) {
          setDisplayedText((prev) => prev + data.text.charAt(textIndex.current));
          textIndex.current++;

          // Dynamic typing speed adjustment:
          // Short text (<50 chars): 30-80ms per char (Detailed, rhythmic)
          // Medium text (50-150 chars): 15-40ms per char (Brisk)
          // Long text (>150 chars): 5-20ms per char (Fast thermal print)
          const length = data.text.length;
          let minDelay = 30;
          let variance = 50;

          if (length > 150) {
            minDelay = 5;
            variance = 15;
          } else if (length > 50) {
            minDelay = 15;
            variance = 25;
          }

          const delay = Math.random() * variance + minDelay;
          typingTimeout.current = setTimeout(typeNextChar, delay);
        } else {
          // Finished typing
          onUpdate(data.id, { isTyping: false });
        }
      };

      // Start typing
      typingTimeout.current = setTimeout(typeNextChar, 100);
    } else {
      setDisplayedText(data.text);
    }

    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.isTyping, data.text]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Bring to front immediately when grabbed (force=true to skip overlap check)
    onFocus(true);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - data.x,
      y: e.clientY - data.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onUpdate(data.id, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.isTyping && !isDragging) {
      onSelect();
    }
  };

  const handleAddEmoji = (emoji: string) => {
    const newReaction: EmojiReaction = {
      emoji,
      author: currentUser,
      timestamp: Date.now(),
    };

    onUpdate(data.id, {
      emojiReactions: [...(data.emojiReactions || []), newReaction],
    });

    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragOffset]);

  // Update card dimensions when content changes
  useEffect(() => {
    if (cardRef.current && !data.isTyping) {
      const rect = cardRef.current.getBoundingClientRect();
      if (data.width !== rect.width || data.height !== rect.height) {
        onUpdate(data.id, {
          width: rect.width,
          height: rect.height,
        });
      }
    }
  }, [displayedText, data.isTyping, data.id, data.width, data.height, onUpdate]);

  // Calculate printing progress for extrusion effect
  // 0 = Start (paper hidden), 1 = End (paper fully printed up to hold point)
  const progress = data.text.length > 0 ? displayedText.length / data.text.length : 0;

  // Determine translateY based on state
  // If typing: Interpolate from 100% (hidden) to 15% (holding point) based on progress
  // If done: Use animation class to eject to 0%
  const typingTranslateY = 100 - (progress * 85);

  // Format timestamp
  const dateObj = new Date(data.timestamp);
  const dateStr = dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  return (
    <div
      ref={cardRef}
      className={`absolute cursor-pointer select-none ${data.isTyping ? 'pointer-events-none' : 'pointer-events-auto'}`}
      style={{
        left: data.x,
        top: data.y,
        zIndex: zIndex,
        width: '280px',
        // Apply Rotation and Scale on the container
        // When grabbed: lift up with scale and shadow
        transform: `rotate(${data.rotation}deg) scale(${isDragging ? 1.05 : 1})`,
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease-out',
        filter: isDragging ? 'drop-shadow(0 10px 25px rgba(0,0,0,0.3))' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <style>{`
        @keyframes ejecting {
          0% {
            transform: translateY(15%);
          }
          50% {
            /* Bounce up slightly to simulate release tension */
            transform: translateY(-5%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Animation Wrapper: Separated to avoid transform conflicts */}
      <div
        style={{
          transform: data.isTyping
            ? `translateY(${typingTranslateY}%)`
            : undefined,
          animation: !data.isTyping
            ? 'ejecting 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            : 'none',
          // Add a small transition to smooth out the stepped movement of typing
          transition: data.isTyping ? 'transform 0.1s linear' : 'none',
          transformOrigin: 'bottom center',
        }}
      >
        {/* Visual Paper Card */}
        <div
          className={`relative shadow-lg rounded-lg overflow-hidden transition-all duration-200 ${
            isSelected
              ? 'border-2 border-pink-400 ring-4 ring-pink-200/50'
              : 'border border-blue-100/50'
          }`}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #fdf2f8 100%)',
            filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.15))'
          }}
        >

          {/* Top Serrated Edge */}
          <div
            className="absolute -top-1.5 left-0 w-full h-3"
            style={{
               background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #fdf2f8 100%)',
               maskImage: 'radial-gradient(circle at 5px 0, transparent 5px, black 5.5px)',
               maskSize: '10px 10px',
               maskRepeat: 'repeat-x',
               maskPosition: 'bottom',
               WebkitMaskImage: 'radial-gradient(circle at 5px 0, transparent 5px, black 5.5px)',
               WebkitMaskSize: '10px 10px',
               WebkitMaskRepeat: 'repeat-x',
               WebkitMaskPosition: 'bottom',
            }}
          ></div>

          {/* Paper Content */}
          <div className="px-5 py-6 relative overflow-hidden">

            {/* Stamp Image (Only show when not typing and has stampImage) */}
            {!data.isTyping && data.stampImage && data.stampPosition && (
              <div
                className="absolute z-10"
                style={{
                  right: `${data.stampPosition.x}px`,
                  bottom: `${data.stampPosition.y}px`,
                  transform: `rotate(${data.stampRotation || 0}deg)`,
                }}
              >
                <img
                  src={data.stampImage}
                  alt="stamp"
                  draggable={false}
                  className="w-[80px] h-[80px] object-contain opacity-60"
                  style={{
                    filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2))',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )}

            {/* Delete Button (Only show when not typing) */}
            {!data.isTyping && (
              <button
                onMouseDown={(e) => {
                  // Prevent triggering drag on delete button
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(data.id);
                }}
                className="absolute top-2 right-2 text-pink-300 hover:text-pink-600 transition-colors z-10"
              >
                <X size={14} />
              </button>
            )}

            {/* Header Info */}
            <div className="flex flex-col items-center border-b border-dashed border-blue-200/70 pb-3 mb-4 opacity-80 font-mono text-[10px] text-blue-600">
              <span className="uppercase tracking-widest font-bold text-[11px] bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">Pager Message</span>
              <div className="flex justify-between w-full mt-1.5 px-1 text-[9px] tracking-tight text-pink-500">
                 <span>ID: {data.id.slice(0,6).toUpperCase()}</span>
                 <span className="font-semibold">{dateStr} {timeStr}</span>
              </div>
            </div>

            {/* Message Body */}
            <div
              className="font-['Special_Elite'] font-['Noto_Serif_SC'] text-lg leading-relaxed bg-gradient-to-br from-slate-800 to-blue-900 bg-clip-text text-transparent break-words whitespace-pre-wrap min-h-[2.5rem]"
              style={{ textShadow: 'none' }}
            >
              {displayedText}
              {data.isTyping && (
                <span className="inline-block w-2.5 h-4 bg-gradient-to-r from-blue-500 to-pink-500 ml-0.5 animate-pulse align-middle opacity-80"></span>
              )}
            </div>

            {/* Emoji Reactions */}
            {!data.isTyping && (
              <div className="mt-4 pt-3 border-t border-blue-200/40">
                {/* Existing Reactions */}
                {data.emojiReactions && data.emojiReactions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {data.emojiReactions.map((reaction, index) => (
                      <div
                        key={`${reaction.emoji}-${index}`}
                        className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
                          reaction.author === 'ziji'
                            ? 'bg-pink-100 border border-pink-200'
                            : 'bg-blue-100 border border-blue-200'
                        }`}
                      >
                        <span>{reaction.emoji}</span>
                        <span className={`text-[10px] font-bold ${
                          reaction.author === 'ziji' ? 'text-pink-600' : 'text-blue-600'
                        }`}>
                          {reaction.author}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Emoji Button & Picker */}
                <div className="relative">
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-600 transition-colors"
                  >
                    <Smile size={14} />
                    <span className="font-semibold">Add Reaction</span>
                  </button>

                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-blue-200 p-2 flex flex-wrap gap-1.5 w-48 z-50"
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddEmoji(emoji);
                          }}
                          className="text-xl hover:scale-125 transition-transform p-1 hover:bg-blue-50 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Barcode-ish look */}
            <div className="mt-5 pt-3 border-t border-pink-200/40 flex justify-between items-end opacity-50 text-blue-500">
               <div className="h-3 w-20 bg-current opacity-30" style={{ maskImage: 'linear-gradient(90deg, black 50%, transparent 50%)', maskSize: '3px 100%' }}></div>
               <span className="text-[8px] font-mono tracking-wide">
                 {data.author === 'ziji' ? 'FROM ZIJI' : 'FROM XU'}
               </span>
            </div>
          </div>

          {/* Bottom Serrated Edge */}
          <div
            className="absolute -bottom-1.5 left-0 w-full h-3"
            style={{
               background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #fdf2f8 100%)',
               maskImage: 'radial-gradient(circle at 5px 10px, transparent 5px, black 5.5px)',
               maskSize: '10px 10px',
               maskRepeat: 'repeat-x',
               maskPosition: 'top',
               WebkitMaskImage: 'radial-gradient(circle at 5px 10px, transparent 5px, black 5.5px)',
               WebkitMaskSize: '10px 10px',
               WebkitMaskRepeat: 'repeat-x',
               WebkitMaskPosition: 'top',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
