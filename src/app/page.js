'use client'
import { useState, useEffect, useRef } from 'react'
import FluidBackground from '@/components/canvas/FluidBackground'
import Timeline from '@/components/Timeline'
import { ArrowDown, UploadCloud, X, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SECRET_CODE = '250627'

// 安全的 localStorage 操作
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // ignore
    }
  }
}

function LockScreen({ onUnlock }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(false)
  const inputRefs = useRef([])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError(false)

    // 自动跳转到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // 检查是否输入完成
    const fullCode = newCode.join('')
    if (fullCode.length === 6) {
      if (fullCode === SECRET_CODE) {
        safeLocalStorage.setItem('unlocked', 'true')
        onUnlock()
      } else {
        setError(true)
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      const newCode = paste.split('')
      setCode(newCode)
      if (paste === SECRET_CODE) {
        safeLocalStorage.setItem('unlocked', 'true')
        onUnlock()
      } else {
        setError(true)
        setTimeout(() => {
          setCode(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }, 500)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <FluidBackground />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-8"
          >
            <Heart className="w-16 h-16 mx-auto text-pink-400 fill-pink-200" />
          </motion.div>

          {/* 6位密码输入框 */}
          <div className="flex gap-3 justify-center mb-6">
            {code.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-xl border-2 bg-white/80 backdrop-blur outline-none transition-all ${
                  error
                    ? 'border-red-400 text-red-500'
                    : digit
                    ? 'border-pink-400 text-gray-800'
                    : 'border-gray-200 text-gray-800'
                } focus:border-sky-400 focus:shadow-lg`}
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm"
              >
                密码错误，请重试
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const [memories, setMemories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ content: '', date: '', file: null })
  const [preview, setPreview] = useState(null)
  const [unlocked, setUnlocked] = useState(null) // null = loading, true/false = state
  const fileInputRef = useRef(null)

  // 检查是否已解锁
  useEffect(() => {
    const isUnlocked = safeLocalStorage.getItem('unlocked') === 'true'
    setUnlocked(isUnlocked)
  }, [])

  // 获取记忆列表
  const fetchMemories = async () => {
    const res = await fetch('/api/memories')
    const data = await res.json()
    setMemories(data)
  }

  useEffect(() => {
    if (unlocked) {
      fetchMemories()
    }
  }, [unlocked])

  // 处理文件选择
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm({ ...form, file })
      setPreview(URL.createObjectURL(file))
    }
  }

  // 提交新记忆
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.file || !form.content || !form.date) return

    setUploading(true)

    const formData = new FormData()
    formData.append('file', form.file)
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    const { url } = await uploadRes.json()

    await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: form.content,
        imageUrl: url,
        date: form.date
      })
    })

    setForm({ content: '', date: '', file: null })
    setPreview(null)
    setShowModal(false)
    setUploading(false)
    fetchMemories()
  }

  // 加载中
  if (unlocked === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <FluidBackground />
      </div>
    )
  }

  // 未解锁 - 显示密码界面
  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />
  }

  return (
    <main className="min-h-screen relative">
      <FluidBackground />

      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center px-4"
        >
          <h1 className="text-5xl md:text-8xl font-serif font-bold mb-4 tracking-tighter">
            <span className="text-gray-800">Xylan</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-pink-500">Vicky</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium tracking-[0.3em] uppercase">
            Our Story
          </p>
        </motion.div>

        <motion.div
          className="absolute bottom-10 text-gray-500 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="text-xs tracking-widest">SCROLL TO EXPLORE</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ArrowDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <Timeline items={memories} />

      {/* Upload Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white/80 backdrop-blur border border-white rounded-full flex items-center justify-center text-gray-600 shadow-xl hover:scale-110 hover:rotate-12 transition-all z-50 group"
      >
        <UploadCloud size={24} className="group-hover:text-his-blue transition-colors" />
      </button>

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-gray-800">添加新记忆</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-his-blue transition-colors overflow-hidden"
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <UploadCloud size={32} className="mx-auto mb-2" />
                      <span className="text-sm">点击上传图片</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <input
                  type="text"
                  placeholder="日期 (如: 2024.01.01)"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-his-blue focus:outline-none transition-colors"
                />

                <textarea
                  placeholder="写下这一刻的故事..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-his-blue focus:outline-none transition-colors resize-none"
                />

                <button
                  type="submit"
                  disabled={uploading || !form.file || !form.content || !form.date}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-his-blue to-her-pink text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  {uploading ? '上传中...' : '保存记忆'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
