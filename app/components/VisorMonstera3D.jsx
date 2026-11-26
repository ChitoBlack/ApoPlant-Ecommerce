'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

export default function VisorMonstera3D({
  nombre,
  modelo = '/models/monstera.glb',
  decorativa = false,
  className = '',
}) {
  const viewerRef = useRef(null)
  const controlsRef = useRef(null)
  const cameraRef = useRef(null)
  const initialViewRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [isRotating, setIsRotating] = useState(true)

  useEffect(() => {
    const container = viewerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100)
    camera.position.set(0, 1.45, 3.9)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x75866b, 2))

    const keyLight = new THREE.DirectionalLight(0xffffff, 3)
    keyLight.position.set(3, 5, 4)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xdcebd5, 1.5)
    fillLight.position.set(-4, 2, -3)
    scene.add(fillLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.25
    controls.enableZoom = false
    controls.enablePan = false
    controls.minDistance = 1.1
    controls.maxDistance = 8
    controls.target.set(0, 1, 0)
    controlsRef.current = controls

    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath('/three/basis/')
      .detectSupport(renderer)

    const gltfLoader = new GLTFLoader()
      .setKTX2Loader(ktx2Loader)
      .setMeshoptDecoder(MeshoptDecoder)

    let disposed = false
    let loadedScene = null

    gltfLoader.load(
      modelo,
      (gltf) => {
        if (disposed) return

        const plant = gltf.scene
        loadedScene = plant
        plant.traverse((object) => {
          if (!object.isMesh) return
          object.castShadow = true
          object.receiveShadow = true
          if (object.material) object.material.side = THREE.DoubleSide
        })

        const box = new THREE.Box3().setFromObject(plant)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const maxDimension = Math.max(size.x, size.y, size.z)
        const scale = 2.35 / maxDimension

        plant.scale.setScalar(scale)
        plant.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
        scene.add(plant)

        controls.target.set(0, 1, 0)
        camera.position.set(0, 1.45, 3.9)
        controls.update()
        initialViewRef.current = {
          camera: camera.position.clone(),
          target: controls.target.clone(),
        }
        setLoading(false)
      },
      (event) => {
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100))
      },
      () => {
        if (!disposed) {
          setError('No se pudo cargar el modelo 3D.')
          setLoading(false)
        }
      },
    )

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()
    renderer.setAnimationLoop(() => {
      controls.update()
      renderer.render(scene, camera)
    })

    return () => {
      disposed = true
      resizeObserver.disconnect()
      renderer.setAnimationLoop(null)
      if (loadedScene) {
        loadedScene.traverse((object) => {
          if (!object.isMesh) return
          object.geometry?.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material?.dispose()
          }
        })
      }
      ktx2Loader.dispose()
      controls.dispose()
      renderer.dispose()
      container.replaceChildren()
    }
  }, [modelo])

  const toggleRotation = () => {
    const controls = controlsRef.current
    if (!controls) return
    controls.autoRotate = !controls.autoRotate
    setIsRotating(controls.autoRotate)
  }

  const resetView = () => {
    const controls = controlsRef.current
    const camera = cameraRef.current
    const initialView = initialViewRef.current
    if (!controls || !camera || !initialView) return
    camera.position.copy(initialView.camera)
    controls.target.copy(initialView.target)
    controls.autoRotate = true
    setIsRotating(true)
    controls.update()
  }

  return (
    <div className={`${decorativa ? 'relative w-full' : 'relative h-80 w-full'} overflow-hidden rounded-3xl ${decorativa ? '' : 'bg-gradient-to-br from-green-50 via-white to-green-100'} ${className}`}>
      <div
        ref={viewerRef}
        className="absolute inset-0 touch-none"
        role="img"
        aria-label={`Modelo 3D de ${nombre}`}
      />

      {loading && !decorativa && (
        <div className={`absolute inset-0 z-10 grid place-items-center text-sm text-green-800 ${decorativa ? 'bg-green-50/40' : 'bg-green-50/80'}`}>
          <span className="rounded-full bg-white/90 px-3 py-1.5 shadow-sm">
            Cargando modelo 3D… {progress > 0 ? `${progress}%` : ''}
          </span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-green-50 px-6 text-center text-sm text-green-800">
          {error}
        </div>
      )}

      {!error && !decorativa && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] text-gray-600 shadow-sm">
            Arrastra para girar
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleRotation}
              className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm"
            >
              {isRotating ? 'Pausar' : 'Girar'}
            </button>
            <button
              type="button"
              onClick={resetView}
              className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm"
            >
              Restablecer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
