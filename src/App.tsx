import React, { useEffect, useRef } from 'react'
// @ts-ignore
import * as THREE from 'three'

import './App.css'

function App() {
  const mountRef = useRef(null);

  useEffect(
    () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // @ts-ignore
      mountRef.current.appendChild(renderer.domElement);

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);

      scene.add(cube);
      camera.position.z = 5;

      function animate(): void {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.1;
        cube.rotation.y -= 0.05;
        cube.rotation.z += 0.01;
        renderer.render(scene, camera);
      }

      animate()

      // @ts-ignore
      return () => mountRef.current.removeChild( renderer.domElement);
    },
    []
  )

  return (
    <div ref={mountRef}>

    </div>
  )
}

export default App
