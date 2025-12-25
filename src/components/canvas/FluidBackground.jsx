'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// 动态导入 Three.js 组件，禁用 SSR
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false })
const ThreeComponents = dynamic(() => import('./ThreeBlobs'), { ssr: false })

function StaticBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      {/* 蓝白粉流动渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-pink-100 animate-gradient-shift" />

      {/* 流动光晕 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-sky-300/40 to-transparent rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-pink-300/40 to-transparent rounded-full blur-3xl animate-float-slow-reverse" />
        <div className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-gradient-radial from-white/60 to-transparent rounded-full blur-2xl animate-pulse-slow" />
      </div>

      {/* 噪点 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  )
}

export default function FluidBackground() {
  const [webglSupported, setWebglSupported] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 检测 WebGL 支持
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setWebglSupported(!!gl)
    } catch {
      setWebglSupported(false)
    }
  }, [])

  // 服务端或未挂载时显示静态背景
  if (!mounted) {
    return <StaticBackground />
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      {/* 蓝白粉流动渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-pink-100 animate-gradient-shift" />

      {/* 流动光晕 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-sky-300/40 to-transparent rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-pink-300/40 to-transparent rounded-full blur-3xl animate-float-slow-reverse" />
        <div className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-gradient-radial from-white/60 to-transparent rounded-full blur-2xl animate-pulse-slow" />
      </div>

      {/* 3D 球体 - 仅在支持 WebGL 时渲染 */}
      {webglSupported && (
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ThreeComponents />
        </Canvas>
      )}

      {/* 噪点 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  )
}
