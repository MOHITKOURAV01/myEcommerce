import * as THREE from 'three'
import { useMemo } from 'react'
import { Float, RoundedBox, Sparkles } from '@react-three/drei'

// Magical Fireflies using Sparkles for better quality
export const Fireflies = ({ count = 40 }) => {
  return (
    <Sparkles 
      count={count}
      scale={15}
      size={5}
      speed={0.4}
      opacity={0.8}
      color="#FFD700" 
    />
  )
}

// Low-poly soft clay tree
export const ClayTree = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <RoundedBox args={[0.3, 2, 0.3]} radius={0.15} step={4}>
        <meshStandardMaterial color="#4A2810" roughness={0.9} />
      </RoundedBox>
      {/* Foliage - Soft clay spheres */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.9} />
        </mesh>
      </Float>
      <mesh position={[0.4, 0.8, 0.2]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#40916C" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Catenary String Lights
export const StringLights = ({ start, end, count = 15 }) => {
  const bulbs = useMemo(() => {
    const arr = []
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      const p = new THREE.Vector3().lerpVectors(startVec, endVec, t)
      p.y += Math.sin(t * Math.PI) * -0.8 // catenary dip
      arr.push({ pos: [p.x, p.y, p.z], isLight: i % 3 === 0 })
    }
    return arr
  }, [start, end, count])

  return (
    <group>
      {bulbs.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial 
              color="#FFE066" 
              emissive="#FFB347" 
              emissiveIntensity={b.isLight ? 2 : 0} 
            />
          </mesh>
          {b.isLight && <pointLight color="#FFB347" intensity={0.5} distance={2} />}
        </group>
      ))}
    </group>
  )
}

// Simple floating island base
export const FloatingIsland = () => {
  return (
    <group position={[0, -2.8, 0]}>
      {/* Grass layer */}
      <RoundedBox args={[12, 0.8, 10]} radius={0.4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#40916C" roughness={0.9} />
      </RoundedBox>
      {/* Dirt layer */}
      <RoundedBox args={[11, 2, 9]} radius={1} position={[0, -1.2, 0]}>
        <meshStandardMaterial color="#3A2814" roughness={0.9} />
      </RoundedBox>
    </group>
  )
}

// Static Stars for night sky
export const Stars = ({ count = 1000 }) => {
  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
        pos.push(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 50 + 20, 
            (Math.random() - 0.5) * 100 - 15
        )
    }
    return new Float32Array(pos)
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={0xFFFFFF} size={0.1} transparent opacity={0.6} />
    </points>
  )
}
