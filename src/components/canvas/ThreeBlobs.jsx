'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Environment, Float } from '@react-three/drei'

function Blob({ color, position, scale, distort, speed, factor }) {
  const mesh = useRef()

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.x = clock.getElapsedTime() * 0.2 * factor
      mesh.current.rotation.y = clock.getElapsedTime() * 0.3 * factor
    }
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

export default function ThreeBlobs() {
  return (
    <>
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
    </>
  )
}
