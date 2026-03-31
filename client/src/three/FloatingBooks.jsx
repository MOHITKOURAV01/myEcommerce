import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const BOOK_COVERS = [
  { isbn: '9780735211292', title: 'Atomic Habits' },
  { isbn: '9780525559474', title: 'Ikigai' },
  { isbn: '9781612680194', title: 'Rich Dad Poor Dad' },
  { isbn: '9781455586691', title: 'Deep Work' },
  { isbn: '9780671027032', title: 'How to Win Friends' },
];

const BOOK_POSITIONS = [
  { pos: [-1.2, 0.3, 0.5], rot: [0, -0.3, 0.08], scale: 0.9 },
  { pos: [0, 0.5, 1], rot: [0, 0.15, -0.05], scale: 1.05 },
  { pos: [1.1, 0.1, 0.3], rot: [0, 0.35, 0.1], scale: 0.85 },
  { pos: [-0.7, -0.9, 0.2], rot: [0, -0.15, -0.08], scale: 0.75 },
  { pos: [0.8, -0.8, 0.4], rot: [0, 0.2, 0.06], scale: 0.78 },
];

function Book({ position, rotation, scale, isbn, title, index, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Create a simple colored texture as fallback
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const colors = ['#C8603A', '#40916C', '#CC9900', '#F2E4C8', '#D4887A'];
    const accents = ['#E07850', '#52B788', '#FFD700', '#D4C4A0', '#E8B4A0'];
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(0, 0, 256, 384);

    // Accent line
    ctx.fillStyle = accents[index % accents.length];
    ctx.fillRect(20, 320, 216, 6);

    // Title text
    ctx.fillStyle = index % 4 === 3 ? '#2C1810' : '#F5ECD8';
    ctx.font = 'bold 24px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    const words = title.split(' ');
    let y = 160;
    words.forEach(word => {
      ctx.fillText(word, 128, y);
      y += 32;
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [index, title]);

  // Try to load the real cover
  const [realTexture, setRealTexture] = useState(null);
  useMemo(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      setRealTexture(tex);
    };
    img.src = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
  }, [isbn]);

  const coverTex = realTexture || texture;

  // Spine and page materials
  const materials = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#8B5A2B', roughness: 0.9 }), // right (wood edge)
    new THREE.MeshStandardMaterial({ color: '#4A2810', map: texture, roughness: 0.9 }), // left (spine)
    new THREE.MeshStandardMaterial({ color: '#E8DCC8', roughness: 0.9 }), // top (pages)
    new THREE.MeshStandardMaterial({ color: '#E8DCC8', roughness: 0.9 }), // bottom (pages)
    new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.9 }), // front
    new THREE.MeshStandardMaterial({ color: '#4A2810', roughness: 0.9 }), // back
  ], [coverTex, texture]);

  useFrame(() => {
    if (meshRef.current) {
      const s = hovered ? scale * 1.08 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
  });

  return (
    <Float
      speed={1.5 + index * 0.3}
      rotationIntensity={0.15}
      floatIntensity={0.4 + index * 0.1}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        material={materials}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(index);
        }}
        castShadow
      >
        <boxGeometry args={[0.65, 0.95, 0.06]} />
      </mesh>

      {/* Glow effect on hover */}
      {hovered && (
        <pointLight
          position={position}
          intensity={0.5}
          distance={2}
          color="#F5A623"
        />
      )}
    </Float>
  );
}

export default function FloatingBooks({ onBookClick }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={0.8} color="#FFB347" />
      <pointLight position={[-3, -1, 2]} intensity={0.5} color="#FF9500" />
      <pointLight position={[0, -3, 1]} intensity={0.4} color="#C8603A" />

      {BOOK_COVERS.map((book, i) => (
        <Book
          key={i}
          index={i}
          position={BOOK_POSITIONS[i].pos}
          rotation={BOOK_POSITIONS[i].rot}
          scale={BOOK_POSITIONS[i].scale}
          isbn={book.isbn}
          title={book.title}
          onClick={onBookClick}
        />
      ))}

      <Environment preset="night" />
    </Canvas>
  );
}
