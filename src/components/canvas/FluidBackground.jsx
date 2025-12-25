'use client'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Environment, Float } from '@react-three/drei'

function Blob({ color, position, scale, distort, speed, factor }) {
  const mesh = useRef()

  useFrame(({ clock }) => {
    mesh.current.rotation.x = clock.getElapsedTime() * 0.2 * factor
    mesh.current.rotation.y = clock.getElapsedTime() * 0.3 * factor
  })

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.8}>
      <Sphere args={[1, 64, 64]} position={position} scale={scale} ref={mesh}>
        <MeshDistortMaterial
          color={color}
          envMapIntensity={0.6}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          metalness={0.1}
          roughness={0.3}
          distort={distort}
          speed={speed}
        />
      </Sphere>
    </Float>
  )
}

export default function FluidBackground() {
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

      {/* 3D 球体 */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 7]} intensity={1} />

        <Environment preset="city" />

        {/* 蓝色球体 */}
        <Blob color="#7dd3fc" position={[-3, 1.5, -2]} scale={1.2} distort={0.4} speed={1.5} factor={1} />

        {/* 粉色球体 */}
        <Blob color="#f9a8d4" position={[3, -1, -2]} scale={1.0} distort={0.5} speed={2} factor={-1} />

        {/* 白色小球 */}
        <Blob color="#ffffff" position={[0, 2, -4]} scale={0.6} distort={0.3} speed={1.2} factor={0.5} />
        <Blob color="#bae6fd" position={[-2, -2, -3]} scale={0.5} distort={0.35} speed={1.8} factor={-0.7} />

        <fog attach="fog" args={['#f8fafc', 6, 18]} />
      </Canvas>

      {/* 噪点 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  )
}
