'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ADNBackdropProps {
  intensity?: number
  speed?: number
  className?: string
}

export function ADNBackdrop({ 
  intensity = 0.5, 
  speed = 1,
  className = ""
}: ADNBackdropProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Create DNA-like helix structure
    const group = new THREE.Group()
    
    // Create particles for DNA strands
    const particleCount = 200
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const t = (i / particleCount) * Math.PI * 4
      const radius = 1.5
      
      // Create two strands
      const strand = i % 2
      const angle = t + (strand * Math.PI)
      
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = (i / particleCount) * 6 - 3
      positions[i3 + 2] = Math.sin(angle) * radius

      // Color based on position
      const hue = (i / particleCount) * 0.3 + 0.7 // Purple to pink range
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: intensity,
      blending: THREE.AdditiveBlending
    })

    const dnaStrand = new THREE.Points(particles, material)
    group.add(dnaStrand)

    // Add connecting lines
    const lineGeometry = new THREE.BufferGeometry()
    const linePositions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      linePositions[i3] = positions[i3]
      linePositions[i3 + 1] = positions[i3 + 1]
      linePositions[i3 + 2] = positions[i3 + 2]
    }

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: intensity * 0.3
    })

    const line = new THREE.Line(lineGeometry, lineMaterial)
    group.add(line)

    scene.add(group)

    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      
      if (group) {
        group.rotation.y += 0.005 * speed
        group.rotation.x += 0.002 * speed
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      const mountElement = mountRef.current
      if (mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [intensity, speed])

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 ${className}`}
      style={{ zIndex: -1 }}
    />
  )
}
