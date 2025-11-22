'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'

// India coordinates approximately
const INDIA_LAT = 20.5937
const INDIA_LON = 78.9629

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [rotation, setRotation] = useState(0)

  // Create Earth texture programmatically
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    // Background - ocean blue
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1a3d5c')
    gradient.addColorStop(0.5, '#2b5876')
    gradient.addColorStop(1, '#1a3d5c')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw continents with more detail
    ctx.fillStyle = '#2d5016'

    // India region - more detailed shape
    const indiaX = canvas.width * (INDIA_LON + 180) / 360
    const indiaY = canvas.height * (90 - INDIA_LAT) / 180

    ctx.beginPath()
    // Rough India shape
    ctx.moveTo(indiaX - 60, indiaY - 120)
    ctx.lineTo(indiaX + 40, indiaY - 120)
    ctx.lineTo(indiaX + 80, indiaY - 80)
    ctx.lineTo(indiaX + 90, indiaY - 40)
    ctx.lineTo(indiaX + 85, indiaY)
    ctx.lineTo(indiaX + 80, indiaY + 40)
    ctx.lineTo(indiaX + 60, indiaY + 80)
    ctx.lineTo(indiaX + 40, indiaY + 100)
    ctx.lineTo(indiaX + 20, indiaY + 120)
    ctx.lineTo(indiaX - 10, indiaY + 130)
    ctx.lineTo(indiaX - 30, indiaY + 120)
    ctx.lineTo(indiaX - 40, indiaY + 90)
    ctx.lineTo(indiaX - 50, indiaY + 60)
    ctx.lineTo(indiaX - 60, indiaY + 20)
    ctx.lineTo(indiaX - 65, indiaY - 20)
    ctx.lineTo(indiaX - 70, indiaY - 60)
    ctx.lineTo(indiaX - 65, indiaY - 90)
    ctx.closePath()
    ctx.fill()

    // Highlight India
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 8
    ctx.stroke()

    // Add glow to India
    ctx.shadowColor = '#4CAF50'
    ctx.shadowBlur = 20
    ctx.stroke()

    // Add some other landmasses for context
    ctx.shadowBlur = 0
    ctx.fillStyle = '#2d5016'

    // Asia
    ctx.fillRect(indiaX + 100, indiaY - 200, 300, 250)
    ctx.fillRect(indiaX + 150, indiaY - 150, 250, 200)

    // Africa
    ctx.fillRect(indiaX - 400, indiaY - 100, 200, 400)

    // Europe
    ctx.fillRect(indiaX - 250, indiaY - 250, 180, 150)

    // Add cloud layer texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 80 + 40
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Create bump map for terrain
  const bumpTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add noise for terrain
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const brightness = Math.random() * 100 + 100
      ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`
      ctx.fillRect(x, y, 2, 2)
    }

    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
      setRotation(meshRef.current.rotation.y)
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={earthTexture}
        bumpMap={bumpTexture}
        bumpScale={0.05}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  )
}

function Atmosphere() {
  return (
    <mesh scale={[1.05, 1.05, 1.05]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshBasicMaterial
        color="#4da6ff"
        transparent
        opacity={0.15}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

function IndiaMarker() {
  const markerRef = useRef<THREE.Mesh>(null)
  const position = latLonToVector3(INDIA_LAT, INDIA_LON, 2.05)

  useFrame((state) => {
    if (markerRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      markerRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group position={position}>
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
      <pointLight color="#ff3333" intensity={2} distance={1} />
    </group>
  )
}

export default function EarthScene() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars radius={300} depth={60} count={5000} factor={7} fade speed={1} />

        <Earth />
        <Atmosphere />
        <IndiaMarker />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '24px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        🇮🇳 India From Space
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'monospace',
        fontSize: '14px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        pointerEvents: 'none'
      }}>
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
