import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Particle3DBackgroundProps {
  className?: string;
  particleCount?: number;
  color?: string;
}

export const Particle3DBackground: React.FC<Particle3DBackgroundProps> = ({
  className = '',
  particleCount = 100,
  color = '#D89AA7',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (import.meta.env.MODE === 'test') {
      return undefined;
    }

    const probe = document.createElement('canvas');
    const hasWebGl = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));

    if (!container || reducedMotion || particleCount <= 0 || !hasWebGl) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !window.matchMedia('(max-width: 768px)').matches,
        powerPreference: 'low-power',
      });
    } catch {
      return undefined;
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;

    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'particle-canvas';
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount * 3; index += 1) {
      positions[index] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.028,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 3;

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      particles.rotation.y += 0.00045 + pointerX * 0.00018;
      particles.rotation.x += 0.00022 + pointerY * 0.00012;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.remove();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [particleCount, color]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.32 }}
      aria-hidden="true"
    />
  );
};
