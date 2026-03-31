import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text, PresentationControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Main Shop Component
const ClayShop = () => {
  const signRef = useRef();
  const smokeRef = useRef();
  const firefliesRef = useRef();
  const clockHandsRef = useRef();

  // Materials
  const tealMat = new THREE.MeshToonMaterial({ color: '#7EC8C0' });
  const terracottaMat = new THREE.MeshToonMaterial({ color: '#C8603A' });
  const brownMat = new THREE.MeshToonMaterial({ color: '#3A1A08' });
  const creamMat = new THREE.MeshToonMaterial({ color: '#FFF5E1' });
  const emissiveOrange = new THREE.MeshBasicMaterial({ color: '#FFB347' });

  // Smoke Particles
  const smokeParticles = useMemo(() => {
    const temp = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) {
        temp[i * 3] = (Math.random() - 0.5) * 0.5;
        temp[i * 3 + 1] = Math.random() * 3;
        temp[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return temp;
  }, []);

  // Fireflies (Yellow floaters)
  const fireflies = useMemo(() => {
    const temp = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 15;
      temp[i * 3 + 1] = Math.random() * 5 + 0.5;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return temp;
  }, []);

  useEffect(() => {
    if (signRef.current) {
      gsap.to(signRef.current.rotation, {
        z: 0.1,
        yoyo: true,
        repeat: -1,
        duration: 2,
        ease: 'sine.inOut'
      });
    }
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Animate Smoke
    if (smokeRef.current) {
        const positions = smokeRef.current.geometry.attributes.position.array;
        for (let i = 0; i < 30; i++) {
            positions[i * 3 + 1] += 0.02; // Move up
            if (positions[i * 3 + 1] > 3) {
                positions[i * 3 + 1] = 0; // Reset
            }
        }
        smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate Fireflies
    if (firefliesRef.current) {
        const positions = firefliesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < 30; i++) {
            positions[i * 3 + 1] += Math.sin(time + i) * 0.005; 
        }
        firefliesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate Clock
    if (clockHandsRef.current) {
        clockHandsRef.current.rotation.z = -time * 0.5;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshToonMaterial color="#1A1208" />
      </mesh>

      {/* Side Background Buildings (Silhouettes) */}
      <mesh position={[-6, 2.5, -2]}>
         <boxGeometry args={[4, 5, 2]} />
         <meshToonMaterial color="#2B2635" transparent opacity={0.6}/>
      </mesh>
      <mesh position={[6, 3, -2]}>
         <boxGeometry args={[4, 6, 2]} />
         <meshToonMaterial color="#2B2635" transparent opacity={0.6}/>
      </mesh>

      {/* Main Building Body */}
      <mesh position={[0, 2.5, 0]} material={tealMat}>
        <boxGeometry args={[4, 5, 2.5]} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 5.9, 0]} rotation={[0, Math.PI / 4, 0]} material={terracottaMat}>
        <cylinderGeometry args={[0, 3.2, 1.8, 4]} />
      </mesh>

      {/* Chimney */}
      <mesh position={[1.2, 6.5, 0]} material={brownMat}>
         <boxGeometry args={[0.4, 1.2, 0.4]} />
      </mesh>
      
      {/* Smoke */}
      <points ref={smokeRef} position={[1.2, 7.1, 0]}>
          <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={30} array={smokeParticles} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.15} color="#CCCCCC" transparent opacity={0.4} />
      </points>

      {/* Door */}
      <group position={[0, 0, 1.25]}>
        {/* Door Body */}
        <mesh position={[0, 1, 0.01]} material={brownMat}>
          <boxGeometry args={[1.2, 2, 0.1]} />
        </mesh>
        {/* Door Arch */}
        <mesh position={[0, 2, 0.01]} rotation={[Math.PI / 2, 0, 0]} material={brownMat}>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 16, 1, false, 0, Math.PI]} />
        </mesh>
        {/* Door Trim */}
        <mesh position={[0, 1, 0.06]} material={creamMat}>
            <boxGeometry args={[1.4, 2.8, 0.05]} />
        </mesh>
      </group>

      {/* Windows */}
      {[[-1.2, 1.5], [1.2, 1.5], [-1.2, 3.5], [1.2, 3.5]].map((pos, idx) => (
        <group key={idx} position={[pos[0], pos[1], 1.26]}>
            {/* Trim */}
            <mesh position={[0, 0, -0.05]} material={creamMat}>
                <boxGeometry args={[1, 1.2, 0.1]} />
            </mesh>
            {/* Glass */}
            <mesh material={emissiveOrange}>
                <planeGeometry args={[0.8, 1]} />
            </mesh>
            {/* Frame lines */}
            <mesh position={[0, 0, 0.01]} material={brownMat}>
                <boxGeometry args={[0.05, 1, 0.02]} />
            </mesh>
            <mesh position={[0, 0, 0.01]} material={brownMat}>
                <boxGeometry args={[0.8, 0.05, 0.02]} />
            </mesh>
            <pointLight color="#FFB347" intensity={2} distance={3} position={[0, 0, 0.5]} />
            {/* Flower box logic for bottom windows */}
            {pos[1] === 1.5 && (
                <group position={[0, -0.6, 0.1]}>
                    <mesh material={terracottaMat}>
                        <boxGeometry args={[1.1, 0.2, 0.3]} />
                    </mesh>
                    <mesh position={[-0.3, 0.15, 0]} material={new THREE.MeshToonMaterial({color: '#CC2244'})}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                    </mesh>
                    <mesh position={[0.3, 0.15, 0]} material={new THREE.MeshToonMaterial({color: '#FF88AA'})}>
                        <sphereGeometry args={[0.12, 8, 8]} />
                    </mesh>
                </group>
            )}
        </group>
      ))}

      {/* Clock Above Door */}
      <group position={[0, 3.5, 1.3]}>
        <mesh material={creamMat}>
            <torusGeometry args={[0.4, 0.05, 16, 32]} />
        </mesh>
        <mesh material={new THREE.MeshToonMaterial({ color: '#FFFFFF' })}>
             <circleGeometry args={[0.38, 32]} />
        </mesh>
        <group ref={clockHandsRef} position={[0, 0, 0.02]}>
            <mesh position={[0, 0.1, 0]} material={brownMat}>
                <boxGeometry args={[0.04, 0.2, 0.02]} />
            </mesh>
        </group>
      </group>

      {/* Hanging Sign */}
      <group position={[-1.5, 3.5, 1.4]}>
        <mesh material={brownMat} position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        </mesh>
        <group ref={signRef}>
            <mesh material={creamMat}>
                <boxGeometry args={[0.8, 0.5, 0.05]} />
            </mesh>
            <Text position={[0, 0, 0.03]} fontSize={0.15} color="#2D6A4F" font="https://fonts.gstatic.com/s/fredokaone/v14/k3kUo8kEI-tA1RRcTZGmTlHGCac.woff">
                BookSmart
            </Text>
        </group>
      </group>

      {/* Fireflies */}
      <points ref={firefliesRef}>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={30} array={fireflies} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#FFD700" transparent opacity={0.8} />
      </points>

      {/* Street Lamp */}
      <group position={[-3, 0, 3]}>
        <mesh position={[0, 2, 0]} material={brownMat}>
             <cylinderGeometry args={[0.05, 0.1, 4]} />
        </mesh>
        <mesh position={[0, 4, 0]} material={new THREE.MeshBasicMaterial({color: '#FFD700'})}>
             <sphereGeometry args={[0.3, 16, 16]} />
             <pointLight color="#FFD700" intensity={3} distance={8} />
        </mesh>
      </group>
    </group>
  );
};

// Catenary String Lights Helper
const StringLights = () => {
    const bulbs = [];
    for (let i = 0; i < 25; i++) {
        const t = i / 24;
        const x = -4 + t * 8;
        const y = 2.5 + Math.sin(t * Math.PI) * -0.8;
        const z = 2.5;
        
        bulbs.push(
            <group key={i} position={[x, y, z]}>
                <mesh material={new THREE.MeshBasicMaterial({ color: '#FFFFFF' })}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                </mesh>
                {i % 4 === 0 && <pointLight color="#FFE066" intensity={0.5} distance={2} />}
            </group>
        );
    }
    return <group>{bulbs}</group>;
};

// Stars Background
const Stars = () => {
    const starGeom = useMemo(() => {
        const temp = new Float32Array(3000 * 3);
        for(let i=0; i<3000; i++) {
            temp[i*3] = (Math.random() - 0.5) * 100;
            temp[i*3+1] = Math.random() * 50 + 10;
            temp[i*3+2] = (Math.random() - 0.5) * 50 - 20;
        }
        return temp;
    }, []);
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={3000} array={starGeom} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.1} color="#FFFFFF" transparent opacity={0.8} />
        </points>
    );
};

const BookshopScene = () => {
  return (
    <>
      <ambientLight color="#1A1535" intensity={0.4} />
      <directionalLight color="#8899CC" intensity={0.6} position={[5, 10, -5]} />
      <directionalLight color="#40916C" intensity={0.3} position={[-10, 5, 0]} />
      
      <Stars />
      <StringLights />
      
      <PresentationControls
        global={false}
        cursor={true}
        snap={true}
        speed={1}
        zoom={1}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 12, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <Float rotationIntensity={0.2} floatIntensity={0.5} speed={1.5}>
            <ClayShop />
        </Float>
      </PresentationControls>
    </>
  );
};

export default BookshopScene;
