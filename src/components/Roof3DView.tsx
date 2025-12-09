import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import Earcut from "earcut";
import type { RoofFace, RoofLine } from "../utils/xmlParser";

interface RoofPlaneProps {
  face: RoofFace;
  globalCenter: { x: number; z: number; y: number };
  faceIndex: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const RoofPlane = ({ face, globalCenter, faceIndex, isSelected, onToggle }: RoofPlaneProps) => {
  const { geometry, edges, centerPoint } = useMemo(() => {
    if (!face.path || face.path.length < 3) {
      return { geometry: null as THREE.BufferGeometry | null, edges: [] as [THREE.Vector3, THREE.Vector3][], centerPoint: null as THREE.Vector3 | null };
    }

    const vertices3D: THREE.Vector3[] = [];
    face.path.forEach(point => {
      const x = (point.lng - globalCenter.x);
      const z = -(point.lat - globalCenter.z);
      const y = (point.ele || 0) - globalCenter.y;
      vertices3D.push(new THREE.Vector3(x, y, z));
    });

    const edgeLines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < vertices3D.length; i++) {
      edgeLines.push([vertices3D[i], vertices3D[(i + 1) % vertices3D.length]]);
    }

    const flatCoordinates: number[] = [];
    face.path.forEach(p => {
      flatCoordinates.push(p.lng, p.lat);
    });

    const indices = Earcut(flatCoordinates, undefined, 2);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(vertices3D.length * 3);
    vertices3D.forEach((v, i) => {
      positions[i * 3 + 0] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(Array.from(indices));
    geometry.computeVertexNormals();

    const center = new THREE.Vector3(
      vertices3D.reduce((s, v) => s + v.x, 0) / vertices3D.length,
      vertices3D.reduce((s, v) => s + v.y, 0) / vertices3D.length,
      vertices3D.reduce((s, v) => s + v.z, 0) / vertices3D.length
    );

    return { geometry, edges: edgeLines, centerPoint: center };
  }, [face, globalCenter]);

  if (!geometry) return null;

  const colors = [
    '#E0C097', '#D4B48C', '#C2A278', '#DEB887',
    '#E6BC8A', '#D9B382', '#CDAA7D', '#C7A374'
  ];
  const faceColor = colors[faceIndex % colors.length];
  const displayColor = isSelected ? "#3498db" : faceColor;

  return (
    <group>
      <mesh
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          if (face.id) onToggle(face.id);
        }}
        userData={{ faceId: face.id }}
      >
        <meshStandardMaterial
          color={displayColor}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
          flatShading={true}
          emissive={isSelected ? new THREE.Color(0x2b7bbf) : new THREE.Color(0x000000)}
          emissiveIntensity={isSelected ? 0.15 : 0}
        />
      </mesh>

      {edges.map((edge, i) => (
        <Line key={i} points={[edge[0].toArray() as any, edge[1].toArray() as any]} lineWidth={1.5} color="#2d3436" />
      ))}

      {centerPoint && (
        <mesh position={centerPoint}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial color="#e74c3c" />
        </mesh>
      )}
    </group>
  );
};

interface Roof3DViewProps {
  faces: RoofFace[];
  lines: RoofLine[];
  selectedFaceIds: string[];
  toggleSelection: (id: string) => void; 
}

export const Roof3DView = ({ faces, selectedFaceIds, toggleSelection }: Roof3DViewProps) => {
  const globalCenter = useMemo(() => {
    if (!faces || faces.length === 0) return { x: 0, z: 0, y: 0 };

    const allPoints = faces.flatMap(f => f.path || []);
    if (allPoints.length === 0) return { x: 0, z: 0, y: 0 };

    const minX = Math.min(...allPoints.map(p => p.lng));
    const maxX = Math.max(...allPoints.map(p => p.lng));
    const minZ = Math.min(...allPoints.map(p => p.lat));
    const maxZ = Math.max(...allPoints.map(p => p.lat));
    const minEle = Math.min(...allPoints.map(p => p.ele || 0));

    return {
      x: (minX + maxX) / 2,
      z: (minZ + maxZ) / 2,
      y: minEle
    };
  }, [faces]);

  if (!faces || faces.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>No Data</div>;
  }

  return (
    <Canvas
      camera={{ position: [50, 60, 50], fov: 45 }}
      style={{ width: '100%', height: '100%', background: '#f5f7fa' }}
      shadows
    >
      <color attach="background" args={['#f5f7fa']} />
      <fog attach="fog" args={['#f5f7fa', 100, 300]} />

      <ambientLight intensity={0.7} />
      <directionalLight
        position={[50, 80, 50]}
        intensity={1.5}
        castShadow
        shadow-bias={-0.0005}
      />
      <hemisphereLight args={['#ffffff', '#b0bec5', 0.6]} />

      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 - 0.1}
        enableDamping
      />

      <group>
        {faces.map((face, idx) => {
          const isSelected = selectedFaceIds?.includes(face.id);
          return (
            <RoofPlane
              key={face.id || idx}
              face={face}
              globalCenter={globalCenter}
              faceIndex={idx}
              isSelected={!!isSelected}
              onToggle={toggleSelection}
            />
          );
        })}

        <gridHelper args={[200, 50, '#bdc3c7', '#e0e0e0']} position={[0, -0.5, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#f5f7fa" />
        </mesh>
      </group>
    </Canvas>
  );
};
