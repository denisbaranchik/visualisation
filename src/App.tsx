import React, { useEffect, useRef } from 'react'
// @ts-ignore
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import './App.css'

import Button from './Button'

function App(): JSX.Element {
  const mountRef = useRef(null)

  let play = true
  let stepForward = false

  useEffect(
    () => {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

      const renderer = new THREE.WebGLRenderer()
      renderer.setSize(window.innerWidth, window.innerHeight)

      // @ts-ignore
      mountRef.current.appendChild(renderer.domElement)

      scene.add( new THREE.AmbientLight( 0x808080 ) )
      const light = new THREE.DirectionalLight( 0xffffff, 1 )
      light.position.set( 3, 3, 3 )
      scene.add( light )

      let geometry = new THREE.PlaneGeometry(1, 1, 30, 30)
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
      let plane = new THREE.Mesh( geometry, material )
      scene.add(plane)

      camera.position.z = 5;

      const controls = new OrbitControls( camera, renderer.domElement );

      function feedbackLoop(): void {
        const positionAttribute = plane.geometry.getAttribute( 'position' )

        const vertex = new THREE.Vector3()

        for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {

          vertex.fromBufferAttribute( positionAttribute, vertexIndex )

          plane.geometry.attributes.position.setXYZ( vertexIndex, vertex.x, vertex.y, vertex.z += Math.random() / 100 * (Math.random() < 0.5 ? -1 : 1))

        }

        plane.geometry.attributes.position.needsUpdate = true;
        plane.geometry.computeVertexNormals();
      }

      function animate(): void {
        requestAnimationFrame(animate)
        if (play || stepForward) {
          feedbackLoop();
          stepForward = false
        }
        controls.update();
        renderer.render(scene, camera);
      }

      animate()

      function onWindowResize(): void {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      window.addEventListener("resize", onWindowResize, false)

      // @ts-ignore
      return () => mountRef.current.removeChild(renderer.domElement)
    },
    [],
  )

  function pause() {
    play = !play
  }

  function step() {
    stepForward = true
  }

  return (
    <div style={{ backgroundColor: 'black' }}>
      <Button
        onClick={pause}
        label="▶"
      />

      <Button
        onClick={step}
        label=">>"
      />

      <div ref={mountRef} />
    </div>
  )
}

export default App
