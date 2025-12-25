'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

function TimelineItem({ data, index, onImageClick }) {
  const isEven = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, type: 'spring' }}
      className={`relative flex items-center justify-between mb-24 w-full ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* 内容卡片 */}
      <div className="w-5/12">
        <div
          onClick={() => onImageClick(data)}
          className="group relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
        >
          {/* 图片容器 */}
          <div className="relative w-full">
            <img
              src={data.imageUrl}
              alt={data.date}
              className="w-full h-auto max-h-80 object-contain bg-gray-50 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{data.date}</span>
              <span className={`w-2 h-2 rounded-full ${isEven ? 'bg-his-blue' : 'bg-her-pink'}`} />
            </div>
            <p className="text-gray-700 font-serif leading-relaxed text-sm">{data.content}</p>
          </div>
        </div>
      </div>

      {/* 中轴节点 */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-white border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 relative">
          <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isEven ? 'bg-his-blue' : 'bg-her-pink'}`} />
        </div>
        <div className={`absolute h-[1px] w-12 bg-white/60 top-1/2 ${isEven ? 'right-full mr-2' : 'left-full ml-2'}`} />
      </div>

      {/* 装饰区域 */}
      <div className="w-5/12 px-6">
        <div className={`text-4xl opacity-20 font-serif ${isEven ? 'text-left' : 'text-right'}`}>
          {index === 0 ? "Start" : String(index + 1).padStart(2, '0')}
        </div>
      </div>
    </motion.div>
  )
}

export default function Timeline({ items }) {
  const ref = useRef(null)
  const [selected, setSelected] = useState(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  })

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <>
      <div ref={ref} className="relative w-full max-w-5xl mx-auto py-20 px-4">
        {/* 生长的丝线 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gray-200/30 rounded-full overflow-hidden">
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="w-full h-full bg-gradient-to-b from-his-blue via-white to-her-pink"
          />
        </div>

        {items.map((item, idx) => (
          <TimelineItem key={item.id} data={item} index={idx} onImageClick={setSelected} />
        ))}

        <div className="text-center mt-20 pb-20">
          <span className="px-4 py-2 rounded-full bg-white/40 text-gray-500 text-xs tracking-[0.3em] font-serif border border-white">
            TO BE CONTINUED
          </span>
        </div>
      </div>

      {/* 灯箱 - 点击放大查看 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selected.imageUrl}
                alt={selected.date}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-center">
                <p className="text-white/90 font-serif text-lg">{selected.content}</p>
                <span className="text-white/60 text-sm mt-2 block">{selected.date}</span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
