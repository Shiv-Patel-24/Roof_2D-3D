// import { useMemo } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, Line } from '@react-three/drei';
// import * as THREE from 'three';
// import Earcut from 'earcut'; // Import the triangulation library
// import type { RoofFace, RoofLine } from '../utils/xmlParser';

// interface RoofPlaneProps {
//   face: RoofFace;
//   globalCenter: { x: number; z: number; y: number };
//   faceIndex: number;
// }

// const RoofPlane = ({ face, globalCenter, faceIndex }: RoofPlaneProps) => {
//   const { geometry, edges, centerPoint } = useMemo(() => {
//     if (!face.path || face.path.length < 3) {
//       return { geometry: null, edges: [], centerPoint: null };
//     }

//     // --- 1. CONVERT POINTS TO 3D VECTORS ---
//     const vertices3D: THREE.Vector3[] = [];
    
//     face.path.forEach(point => {
//       // Map XML coordinates to Three.js 3D space
//       // XML: lng=X, lat=Y, ele=Z
//       // ThreeJS: x=Width, y=Height, z=Depth
//       const x = point.lng - globalCenter.x;
//       const z = point.lat - globalCenter.z;
//       const y = (point.ele || 0) - globalCenter.y;

//       vertices3D.push(new THREE.Vector3(x, y, z));
//     });

//     // --- 2. CREATE EDGES (WIREFRAME) ---
//     const edgeLines: [THREE.Vector3, THREE.Vector3][] = [];
//     for (let i = 0; i < vertices3D.length; i++) {
//       const next = (i + 1) % vertices3D.length;
//       edgeLines.push([vertices3D[i].clone(), vertices3D[next].clone()]);
//     }

//     // --- 3. ROBUST TRIANGULATION WITH EARCUT ---
//     const positions: number[] = [];
//     const flatCoordinatesForEarcut: number[] = [];

//     vertices3D.forEach(v => {
//       // For the 3D geometry
//       positions.push(v.x, v.y, v.z);
//       // For triangulation, project onto the XZ plane (top-down view)
//       flatCoordinatesForEarcut.push(v.x, v.z);
//     });

//     // Use Earcut to get the correct triangle indices for complex shapes
//     // The '2' indicates we are passing 2D (x,z) coordinates
//     const indices = Earcut(flatCoordinatesForEarcut, null, 2);

//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
//     geometry.setIndex(indices);
//     geometry.computeVertexNormals();

//     // Calculate visual center for the label
//     const centerX = vertices3D.reduce((sum, v) => sum + v.x, 0) / vertices3D.length;
//     const centerY = vertices3D.reduce((sum, v) => sum + v.y, 0) / vertices3D.length;
//     const centerZ = vertices3D.reduce((sum, v) => sum + v.z, 0) / vertices3D.length;

//     return { 
//       geometry, 
//       edges: edgeLines,
//       centerPoint: new THREE.Vector3(centerX, centerY, centerZ) 
//     };
//   }, [face, globalCenter]);

//   if (!geometry) return null;

//   // Color palette for distinct faces
//   const colors = [
//     '#E0C097', '#D4B48C', '#C2A278', '#DEB887', 
//     '#E6BC8A', '#D9B382', '#CDAA7D', '#C7A374'
//   ];
//   const faceColor = colors[faceIndex % colors.length];

//   return (
//     <group>
//       {/* 1. The Roof Face Surface */}
//       <mesh geometry={geometry} castShadow receiveShadow>
//         <meshStandardMaterial 
//           color={faceColor}
//           side={THREE.DoubleSide} // Ensure face is visible from both sides
//           metalness={0.1}
//           roughness={0.8}
//           flatShading={true} 
//         />
//       </mesh>

//       {/* 2. Black Edges Outline */}
//       {edges.map((edge, idx) => (
//         <Line
//           key={`edge-${faceIndex}-${idx}`}
//           points={edge}
//           color="#2d3436"
//           lineWidth={1.5}
//         />
//       ))}

//       {/* 3. Face ID Label (Red Dot) */}
//       {centerPoint && (
//         <group position={[centerPoint.x, centerPoint.y + 0.5, centerPoint.z]}>
//           <mesh>
//             <sphereGeometry args={[0.3, 8, 8]} />
//             <meshBasicMaterial color="#d63031" />
//           </mesh>
//         </group>
//       )}
//     </group>
//   );
// };

// // --- MAIN COMPONENT ---

// export const Roof3DView = ({ faces, lines }: Roof3DViewProps) => {
//   // Calculate the center of the entire roof to position it at (0,0,0)
//   const globalCenter = useMemo(() => {
//     if (!faces || faces.length === 0) return { x: 0, z: 0, y: 0 };

//     const allPoints = faces.flatMap(f => f.path || []);
//     if (allPoints.length === 0) return { x: 0, z: 0, y: 0 };

//     const minX = Math.min(...allPoints.map(p => p.lng));
//     const maxX = Math.max(...allPoints.map(p => p.lng));
//     const minZ = Math.min(...allPoints.map(p => p.lat));
//     const maxZ = Math.max(...allPoints.map(p => p.lat));
//     const minEle = Math.min(...allPoints.map(p => p.ele || 0));

//     return {
//       x: (minX + maxX) / 2,
//       z: (minZ + maxZ) / 2,
//       y: minEle // Base height
//     };
//   }, [faces]);

//   if (!faces || faces.length === 0) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
//         No roof faces to display
//       </div>
//     );
//   }

//   return (
//     <Canvas 
//       camera={{ position: [50, 60, 50], fov: 40 }}
//       style={{ width: '100%', height: '100%', background: '#f5f7fa' }}
//       shadows
//     >
//       <color attach="background" args={['#f5f7fa']} />
//       <fog attach="fog" args={['#f5f7fa', 100, 300]} />
      
//       <ambientLight intensity={0.7} />
//       <directionalLight 
//         position={[50, 80, 50]} 
//         intensity={1.2} 
//         castShadow 
//         shadow-bias={-0.0005}
//       />
//       <hemisphereLight args={['#ffffff', '#b0bec5', 0.6]} />

//       <OrbitControls 
//         makeDefault 
//         minPolarAngle={0} 
//         maxPolarAngle={Math.PI / 2 - 0.1}
//         enableDamping
//         dampingFactor={0.05}
//       />

//       <group>
//         {faces.map((face, idx) => (
//           <RoofPlane 
//             key={face.id || idx} 
//             face={face} 
//             globalCenter={globalCenter}
//             faceIndex={idx}
//           />
//         ))}
        
//         <gridHelper args={[200, 50, '#bdc3c7', '#e0e0e0']} position={[0, -0.1, 0]} />
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
//           <planeGeometry args={[500, 500]} />
//           <meshStandardMaterial color="#f5f7fa" />
//         </mesh>
//       </group>
//     </Canvas>
//   );
// };


// import { useMemo } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, Line } from '@react-three/drei';
// import * as THREE from 'three';
// import Earcut from 'earcut'; 
// import type { RoofFace, RoofLine } from '../utils/xmlParser';

// interface RoofPlaneProps {
//   face: RoofFace;
//   globalCenter: { x: number; z: number; y: number };
//   faceIndex: number;
// }

// const RoofPlane = ({ face, globalCenter, faceIndex }: RoofPlaneProps) => {
//   const { geometry, edges, centerPoint } = useMemo(() => {
//     if (!face.path || face.path.length < 3) {
//       return { geometry: null, edges: [], centerPoint: null };
//     }

//     // --- 1. CONVERT POINTS TO 3D VECTORS ---
//     const vertices3D: THREE.Vector3[] = [];
    
//     face.path.forEach(point => {
//       // FIX: INVERT THE X AXIS
//       // We multiply X by -1 to flip the model horizontally.
//       // This fixes the "Left side is on Right side" issue.
//       const x = -(point.lng - globalCenter.x); 
      
//       // Map Latitude (Y in XML) to Z in 3D
//       // We might also need to invert Z depending on if North is "Up" or "Down"
//       const z = -(point.lat - globalCenter.z); 
      
//       // Map Elevation to Y (Height) in 3D
//       const y = (point.ele || 0) - globalCenter.y;

//       vertices3D.push(new THREE.Vector3(x, y, z));
//     });

//     // --- 2. CREATE EDGES (WIREFRAME) ---
//     const edgeLines: [THREE.Vector3, THREE.Vector3][] = [];
//     for (let i = 0; i < vertices3D.length; i++) {
//       const next = (i + 1) % vertices3D.length;
//       edgeLines.push([vertices3D[i].clone(), vertices3D[next].clone()]);
//     }

//     // --- 3. ROBUST TRIANGULATION (Using Earcut) ---
//     const positions: number[] = [];
//     const flatCoordinatesForEarcut: number[] = [];

//     vertices3D.forEach(v => {
//       positions.push(v.x, v.y, v.z);
//       // Project 3D points to 2D for the triangulation algorithm
//       flatCoordinatesForEarcut.push(v.x, v.z);
//     });

//     // Run Earcut to stitch the vertices into a solid shape
//     const indices = Earcut(flatCoordinatesForEarcut, null, 2);

//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
//     geometry.setIndex(indices);
//     geometry.computeVertexNormals();

//     // Calculate visual center
//     const centerX = vertices3D.reduce((sum, v) => sum + v.x, 0) / vertices3D.length;
//     const centerY = vertices3D.reduce((sum, v) => sum + v.y, 0) / vertices3D.length;
//     const centerZ = vertices3D.reduce((sum, v) => sum + v.z, 0) / vertices3D.length;

//     return { 
//       geometry, 
//       edges: edgeLines,
//       centerPoint: new THREE.Vector3(centerX, centerY, centerZ) 
//     };
//   }, [face, globalCenter]);

//   if (!geometry) return null;

//   const colors = [
//     '#E0C097', '#D4B48C', '#C2A278', '#DEB887', 
//     '#E6BC8A', '#D9B382', '#CDAA7D', '#C7A374'
//   ];
//   const faceColor = colors[faceIndex % colors.length];

//   return (
//     <group>
//       <mesh geometry={geometry} castShadow receiveShadow>
//         <meshStandardMaterial 
//           color={faceColor}
//           side={THREE.DoubleSide}
//           metalness={0.1}
//           roughness={0.8}
//           flatShading={true} 
//         />
//       </mesh>

//       {edges.map((edge, idx) => (
//         <Line
//           key={`edge-${faceIndex}-${idx}`}
//           points={edge}
//           color="#2d3436"
//           lineWidth={1.5}
//         />
//       ))}

//       {centerPoint && (
//         <group position={[centerPoint.x, centerPoint.y + 0.5, centerPoint.z]}>
//           <mesh>
//             <sphereGeometry args={[0.3, 8, 8]} />
//             <meshBasicMaterial color="#d63031" />
//           </mesh>
//         </group>
//       )}
//     </group>
//   );
// };

// export const Roof3DView = ({ faces, lines }: Roof3DViewProps) => {
//   const globalCenter = useMemo(() => {
//     if (!faces || faces.length === 0) return { x: 0, z: 0, y: 0 };

//     const allPoints = faces.flatMap(f => f.path || []);
//     if (allPoints.length === 0) return { x: 0, z: 0, y: 0 };

//     const minX = Math.min(...allPoints.map(p => p.lng));
//     const maxX = Math.max(...allPoints.map(p => p.lng));
//     const minZ = Math.min(...allPoints.map(p => p.lat));
//     const maxZ = Math.max(...allPoints.map(p => p.lat));
//     const minEle = Math.min(...allPoints.map(p => p.ele || 0));

//     return {
//       x: (minX + maxX) / 2,
//       z: (minZ + maxZ) / 2,
//       y: minEle 
//     };
//   }, [faces]);

//   if (!faces || faces.length === 0) {
//     return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>No Data</div>;
//   }

//   return (
//     <Canvas 
//       camera={{ position: [50, 60, 50], fov: 40 }}
//       style={{ width: '100%', height: '100%', background: '#f5f7fa' }}
//       shadows
//     >
//       <color attach="background" args={['#f5f7fa']} />
//       <fog attach="fog" args={['#f5f7fa', 100, 300]} />
      
//       <ambientLight intensity={0.7} />
//       <directionalLight 
//         position={[50, 80, 50]} 
//         intensity={1.2} 
//         castShadow 
//       />
//       <hemisphereLight args={['#ffffff', '#b0bec5', 0.6]} />

//       <OrbitControls 
//         makeDefault 
//         minPolarAngle={0} 
//         maxPolarAngle={Math.PI / 2 - 0.1}
//         enableDamping
//       />

//       <group>
//         {faces.map((face, idx) => (
//           <RoofPlane 
//             key={face.id || idx} 
//             face={face} 
//             globalCenter={globalCenter}
//             faceIndex={idx}
//           />
//         ))}
        
//         <gridHelper args={[200, 50, '#bdc3c7', '#e0e0e0']} position={[0, -0.1, 0]} />
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
//           <planeGeometry args={[500, 500]} />
//           <meshStandardMaterial color="#f5f7fa" />
//         </mesh>
//       </group>
//     </Canvas>
//   );
// };


import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import Earcut from 'earcut'; 
import type { RoofFace, RoofLine } from '../utils/xmlParser';

interface RoofPlaneProps {
  face: RoofFace;
  globalCenter: { x: number; z: number; y: number };
  faceIndex: number;
}

const RoofPlane = ({ face, globalCenter, faceIndex }: RoofPlaneProps) => {
  const { geometry, edges, centerPoint } = useMemo(() => {
    if (!face.path || face.path.length < 3) {
      return { geometry: null, edges: [], centerPoint: null };
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

    const indices = Earcut(flatCoordinates, undefined , 2);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices3D.flatMap(v => [v.x, v.y, v.z]), 3));
    geometry.setIndex(indices);
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

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color={faceColor}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
          flatShading={true}
        />
      </mesh>
      {edges.map((edge, i) => (
        <Line key={i} points={edge} color="#2d3436" lineWidth={1.5} />
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

export const Roof3DView = ({ faces }: { faces: RoofFace[]; lines: RoofLine[] }) => {
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
    return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>No Data</div>;
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
        {faces.map((face, idx) => (
          <RoofPlane 
            key={face.id || idx} 
            face={face} 
            globalCenter={globalCenter}
            faceIndex={idx}
          />
        ))}
        
        <gridHelper args={[200, 50, '#bdc3c7', '#e0e0e0']} position={[0, -0.5, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#f5f7fa" />
        </mesh>
      </group>
    </Canvas>
  );
};
