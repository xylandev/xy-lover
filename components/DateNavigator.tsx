import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
  availableDates: string[]; // List of dates that have cards
  onDateChange: (date: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  availableDates,
  onDateChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateObj = new Date(dateStr + 'T00:00:00');
    dateObj.setHours(0, 0, 0, 0);

    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const navigateDay = (direction: number) => {
    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() + direction);
    const newDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onDateChange(newDateStr);
  };

  const goToToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onDateChange(todayStr);
    setShowDatePicker(false);
  };

  return (
    <div className="relative">
      {/* Main Date Display */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-lg border border-blue-100/50 flex items-center gap-3">
        {/* Previous Day */}
        <button
          onClick={() => navigateDay(-1)}
          className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
          title="Previous day"
        >
          <ChevronLeft size={16} className="text-blue-600" />
        </button>

        {/* Current Date */}
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Calendar size={16} className="text-pink-500" />
          <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent min-w-[80px]">
            {formatDisplayDate(currentDate)}
          </span>
        </button>

        {/* Next Day */}
        <button
          onClick={() => navigateDay(1)}
          className="p-1 hover:bg-pink-100 rounded-lg transition-colors"
          title="Next day"
        >
          <ChevronRight size={16} className="text-pink-600" />
        </button>
      </div>

      {/* Date Picker Popup */}
      {showDatePicker && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-blue-200 p-4 min-w-[250px] z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-gray-700">Jump to Date</h3>
            <button
              onClick={() => setShowDatePicker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Quick Actions */}
          <button
            onClick={goToToday}
            className="w-full mb-3 px-3 py-2 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
          >
            Go to Today
          </button>

          {/* Available Dates List */}
          {availableDates.length > 0 && (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Days with cards:</p>
              {availableDates
                .sort((a, b) => b.localeCompare(a)) // Most recent first
                .map((date) => {
                  const cardCount = 0; // You can pass this as a prop if needed
                  return (
                    <button
                      key={date}
                      onClick={() => {
                        onDateChange(date);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        date === currentDate
                          ? 'bg-gradient-to-r from-blue-100 to-pink-100 border border-pink-300'
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={date === currentDate ? 'font-bold text-blue-600' : 'text-gray-700'}>
                          {formatDisplayDate(date)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {date}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {availableDates.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No cards yet</p>
          )}
        </div>
      )}
    </div>
  );
};
