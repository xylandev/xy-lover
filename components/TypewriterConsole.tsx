import React, { useState } from 'react';
import { TypewriterState } from '../types';
import { Printer, MessageSquare, BatteryMedium, Signal, Reply } from 'lucide-react';

interface TypewriterConsoleProps {
  onPrint: (text: string) => void;
  selectedCardAuthor?: 'ziji' | 'xu';
  onCancelReply?: () => void;
}

export const TypewriterConsole: React.FC<TypewriterConsoleProps> = ({ onPrint, selectedCardAuthor, onCancelReply }) => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<TypewriterState>(TypewriterState.IDLE);


  const handlePrint = () => {
    if (!input.trim()) return;
    onPrint(input);
    setInput('');
  };

  return (
    // Container wraps the device to provide the "bottom center" alignment context
    // added pointer-events-auto so interacting with the machine works
    <div className="relative pointer-events-auto mb-6 scale-90 md:scale-100 origin-bottom transition-transform duration-300">
      
      {/* Realistic Device Container */}
      <div
        className="relative w-[380px] md:w-[440px] bg-gradient-to-br from-blue-400 via-pink-400 to-blue-500 rounded-[3rem] p-6 shadow-2xl border-t border-white/40"
        style={{
          boxShadow: `
            0 50px 60px -20px rgba(147, 51, 234, 0.4),
            inset 0 2px 10px rgba(255,255,255,0.5),
            inset 0 -10px 20px rgba(0,0,0,0.1)
          `
        }}
      >
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-white/20 via-transparent to-pink-300/20 pointer-events-none"></div>

        {/* Paper Exit Slot - Visual Only (Top Center) */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-64 h-5 bg-gradient-to-b from-blue-900 to-pink-900 rounded-full shadow-inner border-b border-pink-500/30 z-0"></div>

        {/* Glossy Highlight on Top Edge */}
        <div className="absolute top-2 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full blur-[1px]"></div>

        {/* Inner Bezel/Frame */}
        <div className="relative bg-gradient-to-br from-blue-300/80 via-pink-300/80 to-blue-400/80 rounded-3xl p-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.2),0_2px_4px_rgba(255,255,255,0.3)] border border-white/30 backdrop-blur-sm">
          
          {/* Top Panel (Brand & Indicators) */}
          <div className="flex justify-between items-end mb-3 px-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse shadow-[0_0_5px_rgb(236,72,153)]"></div>
                <span className="text-[10px] font-black tracking-widest text-blue-900 uppercase font-['VT323']">Auto-Feed</span>
              </div>
              <div className="text-pink-700/60 text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">Series 9000</div>
            </div>
            <div className="flex items-center gap-1 opacity-60 text-blue-900">
              <Signal size={14} />
              <span className="text-xs font-['VT323']">5G</span>
            </div>
          </div>

          {/* The Screen (LCD) */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 rounded-xl p-1 pb-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-b-2 border-pink-500/20 relative overflow-hidden">
            {/* Screen Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(59,130,246,0.06),rgba(236,72,153,0.04),rgba(139,92,246,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

            <div className="relative z-20 p-2">
              <div className="flex justify-between text-pink-400/80 text-xs mb-1 font-['VT323'] border-b border-pink-500/30 pb-1">
                <div className="flex gap-2 items-center">
                  {selectedCardAuthor ? (
                    <>
                      <Reply size={12} className="animate-pulse" />
                      <span>REPLYING TO {selectedCardAuthor.toUpperCase()}</span>
                      {onCancelReply && (
                        <button
                          onClick={onCancelReply}
                          className="ml-1 text-[10px] text-pink-500/60 hover:text-pink-500 transition-colors"
                        >
                          [ESC]
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <MessageSquare size={12} />
                      <span>COMPOSE_MODE</span>
                    </>
                  )}
                </div>
                <BatteryMedium size={12} />
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-20 bg-transparent resize-none outline-none font-['VT323'] text-xl text-blue-300 placeholder-pink-500/40 tracking-wider leading-tight"
                placeholder="TYPE MESSAGE HERE..."
                spellCheck={false}
                style={{ textShadow: '0 0 8px rgba(147, 197, 253, 0.6)' }}
              />
            </div>
          </div>

          {/* Control Panel / Buttons */}
          <div className="mt-5 flex justify-center">
            {/* Centered Print Button */}
            <button
              onClick={handlePrint}
              disabled={state !== TypewriterState.IDLE || !input.trim()}
              className="w-48 h-14 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg shadow-[0_5px_0_#be185d,0_8px_15px_rgba(147,51,234,0.4)] active:shadow-none active:translate-y-[5px] transition-all border-t border-pink-300 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
              <span className="font-['VT323'] text-2xl text-white font-bold drop-shadow-lg mt-1">PRINT</span>
              <Printer size={20} className="text-white mb-0.5 drop-shadow-lg" />
            </button>
          </div>
        </div>

        {/* Bottom branding sticker */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-900/90 to-purple-900/90 px-3 py-0.5 rounded text-[8px] text-pink-300 font-mono tracking-widest border border-pink-400/40 shadow-sm">
          MOTOROLA
        </div>

      </div>

      {/* Reflection on desk */}
      <div className="absolute -bottom-4 left-10 right-10 h-8 bg-gradient-to-r from-blue-400/30 via-pink-400/30 to-blue-400/30 blur-xl rounded-full z-[-1]"></div>
    </div>
  );
};