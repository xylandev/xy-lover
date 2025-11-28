import React, { useState, useCallback, useEffect } from 'react';
import { PaperCardData } from './types';
import { DraggablePaper } from './components/DraggablePaper';
import { TypewriterConsole } from './components/TypewriterConsole';
import { LoginScreen } from './components/LoginScreen';
import { ConnectionLines } from './components/ConnectionLines';
import { DateNavigator } from './components/DateNavigator';
import { DEFAULT_CARD_WIDTH } from './constants';
import { getRandomStamp } from './utils/stampUtils';
import * as cardService from './utils/cardService';

const USER_STORAGE_KEY = 'current-user';

const App: React.FC = () => {
  // User authentication
  const [currentUser, setCurrentUser] = useState<'ziji' | 'xu' | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved as 'ziji' | 'xu' | null;
    } catch (error) {
      return null;
    }
  });

  // Cards state - loaded from Supabase
  const [cards, setCards] = useState<PaperCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Start z-index lower so cards can be behind the machine (which we'll give a high z-index)
  const [topZIndex, setTopZIndex] = useState(10);

  // Selected card for replying
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Canvas panning/viewport state
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Current viewing date
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  // Helper function to get date key from timestamp
  const getDateKey = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Daily area dimensions (each day gets a fixed area)
  const DAILY_AREA_WIDTH = 2000;
  const DAILY_AREA_HEIGHT = 1500;

  const handlePrint = async (text: string) => {
    if (!currentUser) return;

    const now = Date.now();
    const dateKey = getDateKey(now);

    // Calculate world position (convert screen center to world coordinates)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Center in viewport
    const screenCenterX = viewportWidth / 2 - DEFAULT_CARD_WIDTH / 2;
    const screenCenterY = viewportHeight - 550;

    // Convert to world coordinates
    const worldX = screenCenterX - viewportOffset.x;
    const worldY = screenCenterY - viewportOffset.y;

    const newCard: PaperCardData = {
      id: crypto.randomUUID(),
      text,
      author: currentUser,
      x: worldX,
      y: worldY,
      rotation: (Math.random() * 4) - 2, // Slight variation
      timestamp: now,
      dateKey,
      isTyping: true,
      replyTo: selectedCardId || undefined, // Link to selected card if replying
    };

    // 立即添加到本地状态（乐观更新）
    setCards(prev => [...prev, newCard]);

    // 保存到服务器
    try {
      await cardService.createCard(newCard);
      // 打字动画完成后更新状态
      setTimeout(() => {
        setCards(prev => prev.map(card =>
          card.id === newCard.id ? { ...card, isTyping: false } : card
        ));
      }, text.length * 50 + 500); // 根据打字速度估算
    } catch (error) {
      console.error('Failed to save card:', error);
      // 如果保存失败，移除本地卡片
      setCards(prev => prev.filter(card => card.id !== newCard.id));
      alert('保存便签失败，请检查网络连接');
    }

    // Clear selection after printing reply
    if (selectedCardId) {
      setSelectedCardId(null);
    }
  };

  const handleUpdateCard = useCallback(async (id: string, updates: Partial<PaperCardData>) => {
    // 乐观更新本地状态
    setCards(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));

    // 保存到服务器
    try {
      await cardService.updateCard(id, updates);
    } catch (error) {
      console.error('Failed to update card:', error);
      // 可以考虑回滚更新或显示错误提示
    }
  }, []);

  const handleDeleteCard = useCallback(async (id: string) => {
    // 乐观更新本地状态
    setCards(prev => prev.filter(card => card.id !== id));

    // 从服务器删除
    try {
      await cardService.deleteCard(id);
    } catch (error) {
      console.error('Failed to delete card:', error);
      // 可以考虑恢复卡片或显示错误提示
    }
  }, []);

  // Load cards from Supabase on mount
  useEffect(() => {
    if (!currentUser) return; // 只在登录后加载

    const loadCards = async () => {
      try {
        setIsLoading(true);
        const data = await cardService.getAllCards();
        setCards(data);
      } catch (error) {
        console.error('Failed to load cards from Supabase:', error);
        // 可以显示错误提示给用户
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [currentUser]);

  // 实时同步 - 订阅数据库变化
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = cardService.subscribeToCards(
      // onInsert: 其他用户创建了新卡片
      (newCard) => {
        setCards(prev => {
          // 避免重复添加（本地创建的卡片已经在状态中了）
          if (prev.some(card => card.id === newCard.id)) {
            return prev;
          }
          return [...prev, newCard];
        });
      },
      // onUpdate: 其他用户更新了卡片
      (updatedCard) => {
        setCards(prev => prev.map(card =>
          card.id === updatedCard.id ? { ...card, ...updatedCard } : card
        ));
      },
      // onDelete: 其他用户删除了卡片
      (deletedId) => {
        setCards(prev => prev.filter(card => card.id !== deletedId));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleLogin = (username: 'ziji' | 'xu') => {
    setCurrentUser(username);
    localStorage.setItem(USER_STORAGE_KEY, username);
  };

  // Get list of dates that have cards
  const availableDates = Array.from(new Set(cards.map(card => card.dateKey))).sort();

  // Handle date change - jump viewport to that date's area
  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    // 启用过渡动画
    setIsTransitioning(true);
    // 重置视口
    setViewportOffset({ x: 0, y: 0 });
    // 动画完成后禁用过渡
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Canvas panning handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Start panning with middle mouse button or space + left click
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setViewportOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, panStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleCanvasMouseMove);
      window.addEventListener('mouseup', handleCanvasMouseUp);
      document.body.style.cursor = 'grabbing';
    } else {
      window.removeEventListener('mousemove', handleCanvasMouseMove);
      window.removeEventListener('mouseup', handleCanvasMouseUp);
      document.body.style.cursor = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleCanvasMouseMove);
      window.removeEventListener('mouseup', handleCanvasMouseUp);
      document.body.style.cursor = '';
    };
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  const handleFocus = useCallback((id: string, force = false) => {
    setCards(prev => {
      const clickedIndex = prev.findIndex(c => c.id === id);
      if (clickedIndex === -1) return prev;

      // If already the last (topmost) card, no need to reorder
      if (clickedIndex === prev.length - 1) {
        return prev;
      }

      const clickedCard = prev[clickedIndex];

      // If force is true (e.g., when dragging), always bring to front
      if (force) {
        const others = prev.filter(c => c.id !== id);
        setTopZIndex(p => p + 1);
        return [...others, clickedCard];
      }

      // Check if any card with higher z-index (later in array) actually overlaps
      const cardsAbove = prev.slice(clickedIndex + 1);
      const hasOverlap = cardsAbove.some(upperCard => {
        // Use actual card dimensions if available, otherwise use defaults
        const clickedWidth = clickedCard.width || 280;
        const clickedHeight = clickedCard.height || 150;
        const upperWidth = upperCard.width || 280;
        const upperHeight = upperCard.height || 150;

        const clickedBox = {
          left: clickedCard.x,
          right: clickedCard.x + clickedWidth,
          top: clickedCard.y,
          bottom: clickedCard.y + clickedHeight,
        };

        const upperBox = {
          left: upperCard.x,
          right: upperCard.x + upperWidth,
          top: upperCard.y,
          bottom: upperCard.y + upperHeight,
        };

        // Check for overlap
        return !(
          clickedBox.right < upperBox.left ||
          clickedBox.left > upperBox.right ||
          clickedBox.bottom < upperBox.top ||
          clickedBox.top > upperBox.bottom
        );
      });

      // Only bring to front if there's actual overlap
      if (!hasOverlap) {
        return prev;
      }

      const others = prev.filter(c => c.id !== id);
      setTopZIndex(p => p + 1);
      return [...others, clickedCard];
    });
  }, []);

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-pink-50 to-white">
      {/* Modern Gradient Background with subtle animation */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: `
               radial-gradient(circle at 20% 80%, rgba(219, 234, 254, 0.6) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(252, 231, 243, 0.6) 0%, transparent 50%),
               radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.8) 0%, transparent 50%)
             `
           }}>
      </div>

      {/* Subtle floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* App Title */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 opacity-40 pointer-events-none select-none text-center">
         <h1 className="font-['VT323'] text-6xl bg-gradient-to-r from-blue-600 via-pink-500 to-blue-600 bg-clip-text text-transparent tracking-tighter">Our Space</h1>
         <p className="text-base tracking-[0.6em] text-pink-400/60 mt-[-5px] font-bold uppercase">Ziji & Xu</p>
      </div>

      {/* Date Navigator */}
      <div className="absolute top-8 left-8 pointer-events-auto z-50">
        <DateNavigator
          currentDate={currentDate}
          availableDates={availableDates}
          onDateChange={handleDateChange}
        />
      </div>

      {/* User Info */}
      <div className="absolute top-8 right-8 pointer-events-auto z-50">
        <div className="bg-white/80 backdrop-blur-xl rounded-full px-4 py-2 shadow-lg border border-blue-100/50 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentUser === 'ziji' ? 'bg-pink-500' : 'bg-blue-500'} animate-pulse`}></div>
          <span className={`font-bold text-sm ${currentUser === 'ziji' ? 'text-pink-600' : 'text-blue-600'}`}>
            {currentUser}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentUser(null);
              localStorage.removeItem(USER_STORAGE_KEY);
              setCards([]); // 清空卡片
              setIsLoading(true); // 重置加载状态
            }}
            className="ml-2 px-2 py-1 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            title="Logout"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Card Rendering Area */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ zIndex: 1, cursor: isPanning ? 'grabbing' : 'default' }}
        onClick={() => setSelectedCardId(null)}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Canvas with viewport transform */}
        <div
          style={{
            transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px)`,
            width: '100%',
            height: '100%',
            position: 'relative',
            transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {/* Connection Lines */}
          <ConnectionLines cards={cards.filter(card => card.dateKey === currentDate)} />

          {/* Cards */}
          {cards
            .filter(card => card.dateKey === currentDate)
            .map((card, index) => (
              <DraggablePaper
                key={card.id}
                data={card}
                currentUser={currentUser}
                isSelected={card.id === selectedCardId}
                // Cards stack starting at 10.
                // The Machine is at z-index 50.
                // So newly printed cards (if we don't manually set high z) will be behind machine.
                zIndex={index + 10}
                onUpdate={handleUpdateCard}
                onDelete={handleDeleteCard}
                onSelect={() => setSelectedCardId(card.id)}
                onFocus={(force) => handleFocus(card.id, force)}
              />
            ))}
        </div>
      </div>

      {/* Console UI - Centered at bottom */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none z-50">
        <TypewriterConsole
          onPrint={handlePrint}
          selectedCardAuthor={selectedCardId ? cards.find(c => c.id === selectedCardId)?.author : undefined}
          onCancelReply={() => setSelectedCardId(null)}
        />
      </div>
    </div>
  );
};

export default App;