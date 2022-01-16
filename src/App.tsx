import React, { useEffect, useRef } from 'react'
// @ts-ignore
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { iter, matrix_sum } from './alg';
import SimplexNoise from 'simplex-noise'

import './App.css'

import Button from './Button'

function App(): JSX.Element {
  const mountRef = useRef(null)

  let play = false
  let stepForward = false

  useEffect(
    () => {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

      const renderer = new THREE.WebGLRenderer()
      renderer.setSize(window.innerWidth, window.innerHeight)

      // @ts-ignore
      mountRef.current.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0x808080))
      const light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(3, 3, 3)
      scene.add(light)

      const Y_SIZE = 150;
      const X_SIZE = 150;
      let geometry = new THREE.PlaneGeometry(5, 5, X_SIZE, Y_SIZE)
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
      let plane = new THREE.Mesh(geometry, material)

      const positionAttribute = plane.geometry.getAttribute('position')
      const vertex = new THREE.Vector3()
      const simplex = new SimplexNoise()

      let lower = new Array(X_SIZE).fill(0).map((_) => new Array(Y_SIZE).fill(0))
      let delta = new Array(X_SIZE).fill(0).map((_) => new Array(Y_SIZE).fill(0))
      let upper = new Array(X_SIZE).fill(0).map((_) => new Array(Y_SIZE).fill(0.1))

      let upper_geo = new THREE.PlaneGeometry(5, 5, X_SIZE, Y_SIZE)
      let upper_plane = new THREE.Mesh(upper_geo, material)

      for (let i = 0; i < X_SIZE; i++) {
        for (let j = 0; j < Y_SIZE; j++) {
          upper[i][j] = simplex.noise2D(i / 150. * 5., j / 150. * 5.) / 20.;
        }
      }

      console.log(lower)
      console.log(delta)
      console.log(upper)

      let j = Y_SIZE - 1
      let i = 0
      for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {

        vertex.fromBufferAttribute(positionAttribute, vertexIndex)

        const value = simplex.noise2D(vertex.x, vertex.y);
        // console.log(`${vertex.x} ${vertex.y}`)
        plane.geometry.attributes.position.setXYZ(vertexIndex, vertex.x, vertex.y, value)

        if (i === X_SIZE) {
          // must be end of loop
          break
        }
        lower[i][j] = value
        upper_plane.geometry.attributes.position.setXYZ(vertexIndex, vertex.x, vertex.y, (upper[i][j] * 7 + 5))

        j--
        if (j === -1) {
          j = Y_SIZE - 1
          i++
        }


        // console.log(lower)
      }
      plane.geometry.computeVertexNormals()
      upper_plane.geometry.computeVertexNormals()

      scene.add(plane)
      scene.add(upper_plane)

      camera.position.z = 7

      const controls = new OrbitControls(camera, renderer.domElement)

      function feedbackLoop(): void {
        const positionAttribute = plane.geometry.getAttribute('position')
        const upperPositionAttribute = upper_plane.geometry.getAttribute('position')

        let old_x = Math.floor(Math.random() * 150)
        let old_y = Math.floor(Math.random() * 150)
        let new_upper = iter(old_x, old_y, lower, upper, delta, 10)
        let matrix = matrix_sum(lower, delta)

        const vertex = new THREE.Vector3()

        let j = Y_SIZE - 1
        let i = 0

        for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {

          vertex.fromBufferAttribute( positionAttribute, vertexIndex )

          if (i === X_SIZE) {
            // must be end of loop
            break
          }
          plane.geometry.attributes.position.setXYZ( vertexIndex, vertex.x, vertex.y, matrix[i][j])

          if (i === new_upper.x && j === new_upper.y) {
            vertex.fromBufferAttribute( upperPositionAttribute, vertexIndex )
            upper_plane.geometry.attributes.position.setXYZ( vertexIndex, vertex.x, vertex.y, (upper[i][j] * 7 + 5))
          }

          // lower[i][j] = value
          j--
  
          if (j === -1) {
            j = Y_SIZE - 1
            i++
          }

        }

        plane.geometry.attributes.position.needsUpdate = true
        upper_plane.geometry.attributes.position.needsUpdate = true
        plane.geometry.computeVertexNormals()
        upper_plane.geometry.computeVertexNormals()
      }

      function animate(): void {
        requestAnimationFrame(animate)
        if (play || stepForward) {
          feedbackLoop()
          stepForward = false
        }
        controls.update()
        renderer.render(scene, camera)
      }

      animate()

      function onWindowResize(): void {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      window.addEventListener("resize", onWindowResize, false)

      // {
      //   iter(75, 75, lower, upper, delta, 10);
      // }
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
    <div className="container">
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
