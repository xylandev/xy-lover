import React, { useState, Suspense, useContext, useEffect, useRef, useCallback } from 'react';
import { TreeContextType, AppState, TreeContext, PointerCoords } from './types';
import Experience from './components/Experience';
import { AnimatePresence, motion } from 'framer-motion';


// --- 梦幻光标组件 ---
const DreamyCursor: React.FC<{ pointer: PointerCoords | null, progress: number }> = ({ pointer, progress }) => {
    if (!pointer) return null;
    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[200]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: 1,
                scale: 1,
                left: `${pointer.x * 100}%`,
                top: `${pointer.y * 100}%`
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            style={{ x: "-50%", y: "-50%" }}
        >
            {/* 核心光点 */}
            <div className={`rounded-full transition-all duration-300 ${progress > 0.8 ? 'w-4 h-4 bg-emerald-400 shadow-[0_0_20px_#34d399]' : 'w-2 h-2 bg-amber-200 shadow-[0_0_15px_#fcd34d]'}`} />

            {/* 进度光环 - 魔法符文风格 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/20 animate-spin-slow"></div>

            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 -rotate-90 overflow-visible">
                <defs>
                    <linearGradient id="magicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                {/* 倒计时圆环 */}
                <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="url(#magicGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 * (1 - progress)}
                    filter="url(#glow)"
                    className="transition-[stroke-dashoffset] duration-75 ease-linear"
                />
            </svg>

            {/* 粒子拖尾装饰 (CSS 动画) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-full blur-xl animate-pulse"></div>
        </motion.div>
    );
};

// --- 照片弹窗 ---
const PhotoModal: React.FC<{ url: string | null, onClose: () => void }> = ({ url, onClose }) => {
    if (!url) return null;
    return (
        <motion.div
            id="photo-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, y: 50, rotate: -5 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative max-w-4xl max-h-full bg-white p-3 rounded shadow-[0_0_50px_rgba(255,215,0,0.3)] border-8 border-white"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={url} alt="Memory" className="max-h-[80vh] object-contain rounded shadow-inner" />
                <div className="absolute -bottom-12 w-full text-center text-red-300/70 cinzel text-sm">
                    ❄️ Precious Moment ❄️ Tap to close
                </div>
            </motion.div>
        </motion.div>
    );
}

const AppContent: React.FC = () => {
    const { state, setState, setPointer, hoverProgress, selectedPhotoUrl, setSelectedPhotoUrl, clickTrigger, setClickTrigger, setZoomOffset, setRotationBoost, pointer } = useContext(TreeContext) as TreeContextType;

    // 触摸滑动状态
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

    // 处理触摸开始
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        const x = touch.clientX / window.innerWidth;
        const y = touch.clientY / window.innerHeight;
        touchStartRef.current = { x, y, time: Date.now() };
        lastTouchRef.current = { x, y };
        setPointer({ x, y });
    }, [setPointer]);

    // 处理触摸移动
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!lastTouchRef.current) return;
        const touch = e.touches[0];
        const x = touch.clientX / window.innerWidth;
        const y = touch.clientY / window.innerHeight;

        const dx = x - lastTouchRef.current.x;
        const dy = y - lastTouchRef.current.y;

        // 更新旋转（水平滑动控制旋转）
        if (state === 'FORMED') {
            setRotationBoost(prev => {
                const newBoost = prev + dx * 5.0;
                return Math.max(Math.min(newBoost, 3.0), -3.0);
            });
        }

        // 更新缩放（垂直滑动控制缩放）
        if (state === 'CHAOS') {
            setZoomOffset(prev => {
                const next = prev + dy * 50;
                return Math.max(-20, Math.min(next, 40));
            });
        }

        lastTouchRef.current = { x, y };
        setPointer({ x, y });
    }, [state, setRotationBoost, setZoomOffset, setPointer]);

    // 处理触摸结束
    const handleTouchEnd = useCallback(() => {
        if (touchStartRef.current) {
            const duration = Date.now() - touchStartRef.current.time;
            // 短按视为点击
            if (duration < 200) {
                setClickTrigger(Date.now());
            }
        }
        touchStartRef.current = null;
        lastTouchRef.current = null;
        setPointer(null);
    }, [setClickTrigger, setPointer]);

    // 双击切换状态
    const lastTapRef = useRef<number>(0);
    const handleDoubleTap = useCallback(() => {
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
            setState(state === 'CHAOS' ? 'FORMED' : 'CHAOS');
        }
        lastTapRef.current = now;
    }, [state, setState]);

    useEffect(() => {
        if (selectedPhotoUrl && pointer) {
            const x = pointer.x * window.innerWidth;
            const y = pointer.y * window.innerHeight;
            const element = document.elementFromPoint(x, y);
            if (element) {
                const isImage = element.tagName === 'IMG';
                const isBackdrop = element.id === 'photo-modal-backdrop';
                if (isBackdrop || isImage) setSelectedPhotoUrl(null);
            }
        }
    }, [clickTrigger]);

    return (
        <main
            className="relative w-full h-screen bg-black text-white overflow-hidden"
            onTouchStart={(e) => { handleTouchStart(e); handleDoubleTap(); }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* 3D 场景层 (z-10) */}
            <div className="absolute inset-0 z-10">
                <Suspense fallback={<div className="flex items-center justify-center h-full text-red-400 cinzel animate-pulse text-2xl">🎄 Loading Christmas Magic... ❄️</div>}>
                    <Experience />
                </Suspense>
            </div>

            {/* UI 层 (z-30) */}
            <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 md:p-8">
                {/* 顶部祝福语 */}
                <header className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-bold cinzel text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 drop-shadow-[0_0_25px_rgba(255,200,200,0.8)]">
                            To 子集宝宝
                        </h1>
                        <p className="text-2xl md:text-4xl mt-3 font-bold cinzel text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-teal-200 drop-shadow-[0_0_20px_rgba(100,255,150,0.7)]">
                            🎄 圣诞节快乐 🎄
                        </p>
                    </motion.div>
                </header>

                {/* 中间留空给圣诞树 */}
                <div className="flex-1" />

                {/* 底部祝福语 + 提示 */}
                <footer className="text-center space-y-2">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="space-y-1 text-amber-100/90 drop-shadow-[0_0_12px_rgba(255,220,150,0.6)]"
                    >
                        <p className="text-base md:text-lg">今年最幸运的事，就是遇到宝</p>
                        <p className="text-base md:text-lg">你的出现让我真的感到很幸福</p>
                        <p className="text-base md:text-lg">让我的生活有了期盼</p>
                        <p className="text-base md:text-lg font-medium text-rose-200">未来要继续一起走下去哦 ❤️</p>
                    </motion.div>
                    <p className="text-white/40 text-xs md:text-sm pt-2">
                        👆 滑动旋转 · 双击切换模式 · 点击照片查看
                    </p>
                </footer>
            </div>

            {/* 光标层 (z-200) */}
            <DreamyCursor pointer={pointer} progress={hoverProgress} />

            {/* 弹窗层 (z-100) */}
            <AnimatePresence>
                {selectedPhotoUrl && <PhotoModal url={selectedPhotoUrl} onClose={() => setSelectedPhotoUrl(null)} />}
            </AnimatePresence>
        </main>
    );
};

const App: React.FC = () => {
    const [state, setState] = useState<AppState>('CHAOS');
    const [rotationSpeed, setRotationSpeed] = useState<number>(0.3);
    const [rotationBoost, setRotationBoost] = useState<number>(0);
    const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false); // 禁用摄像头
    const [pointer, setPointer] = useState<PointerCoords | null>(null);
    const [hoverProgress, setHoverProgress] = useState<number>(0);
    const [clickTrigger, setClickTrigger] = useState<number>(0);
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
    const [panOffset, setPanOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [zoomOffset, setZoomOffset] = useState<number>(0);

    return (
        <TreeContext.Provider value={{
            state, setState,
            rotationSpeed, setRotationSpeed,
            webcamEnabled, setWebcamEnabled,
            pointer, setPointer,
            hoverProgress, setHoverProgress,
            clickTrigger, setClickTrigger,
            selectedPhotoUrl, setSelectedPhotoUrl,
            panOffset, setPanOffset,
            rotationBoost, setRotationBoost,
            zoomOffset, setZoomOffset
        }}>
            <AppContent />
        </TreeContext.Provider>
    );
};

export default App;