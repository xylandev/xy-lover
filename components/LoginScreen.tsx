import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: 'ziji' | 'xu') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.toLowerCase() === 'ziji' || password.toLowerCase() === 'xu') {
      onLogin(password.toLowerCase() as 'ziji' | 'xu');
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setError(false);
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-pink-50 to-white">
      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Login Card */}
      <div className={`relative ${shake ? 'animate-shake' : ''}`}>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
          .animate-shake {
            animation: shake 0.6s ease-in-out;
          }
        `}</style>

        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-blue-100/50"
             style={{
               boxShadow: `
                 0 20px 60px rgba(59, 130, 246, 0.15),
                 0 10px 30px rgba(236, 72, 153, 0.1),
                 inset 0 2px 10px rgba(255,255,255,0.8)
               `
             }}>

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100/20 via-transparent to-pink-100/20 pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 w-80 flex flex-col items-center">
            {/* Logo/Icon */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-400 via-pink-400 to-blue-500 p-6 rounded-full shadow-lg">
                <Heart size={48} className="text-white" fill="white" />
              </div>
              <Sparkles size={20} className="absolute -top-2 -right-2 text-pink-400 animate-pulse" />
              <Sparkles size={16} className="absolute -bottom-1 -left-1 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
              Our Space
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full">
              <div className="mb-6">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-pink-50 border-2 ${
                    error ? 'border-red-400' : 'border-blue-200/50'
                  } focus:border-pink-400 focus:outline-none transition-all duration-300 text-lg text-center font-['VT323'] tracking-wider placeholder-pink-300/50`}
                  placeholder=""
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-500 text-center animate-pulse">
                    Try "ziji" or "xu"
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 text-lg tracking-wider uppercase"
                style={{
                  boxShadow: '0 8px 20px rgba(147, 51, 234, 0.3)'
                }}
              >
                Enter
              </button>
            </form>

            {/* Hint */}
            <div className="mt-8 text-center">
              <p className="text-xs text-blue-400/60 italic">
                Leave little notes for each other ♡
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
