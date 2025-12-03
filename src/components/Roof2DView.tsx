// import { useState, useMemo } from 'react';
// import type { RoofFace, RoofLine, Point,  } from '../utils/xmlParser';

// interface Roof2DViewProps {
//   faces: RoofFace[];
//   lines: RoofLine[];
// }

// export const Roof2DView = ({ faces, lines }: Roof2DViewProps) => {
//   const [selectedFaceIds, setSelectedFaceIds] = useState<string[]>([]);
 
//   if (!faces || faces.length === 0) {
//     return <div style={{ padding: '20px' }}>No roof data to display</div>;
//   }

//   // --- 1. Toggle Logic ---
//   const toggleSelection = (id: string) => {
//     setSelectedFaceIds(prev => {
//       if (prev.includes(id)) {
//         return prev.filter(faceId => faceId !== id); // Remove if already selected
//       } else {
//         return [...prev, id]; // Add to selection
//       }
//     });
//   };

//   const clearSelection = () => setSelectedFaceIds([]);

//   // --- 2. Calculate Bounds & Scale (Same as before) ---
//   const bounds = useMemo(() => {
//     const allPoints = [...faces.flatMap(f => f.path), ...lines.flatMap(l => l.path)];
//     return {
//       minX: Math.min(...allPoints.map(p => p.lng)),
//       maxX: Math.max(...allPoints.map(p => p.lng)),
//       minY: Math.min(...allPoints.map(p => p.lat)),
//       maxY: Math.max(...allPoints.map(p => p.lat))
//     };
//   }, [faces, lines]);

//   const padding = 40;
//   const svgWidth = 800; 
//   const svgHeight = 600;
  
//   const dataWidth = bounds.maxX - bounds.minX;
//   const dataHeight = bounds.maxY - bounds.minY;
//   const scale = Math.min(
//     (svgWidth - 2 * padding) / dataWidth, 
//     (svgHeight - 2 * padding) / dataHeight
//   );

//   const toSVG = (x: number, y: number) => {
//     return {
//       x: (x - bounds.minX) * scale + padding,
//       y: svgHeight - ((y - bounds.minY) * scale + padding) 
//     };
//   };

//   const getLength = (p1: Point, p2: Point) => {
//     const dx = p1.lng - p2.lng;
//     const dy = p1.lat - p2.lat;
//     return Math.sqrt(dx * dx + dy * dy);
//   };

//   const selectedFaces = useMemo(() => 
//     faces.filter(f => selectedFaceIds.includes(f.id)), 
//   [faces, selectedFaceIds]);

//   const totalSelectedArea = selectedFaces.reduce((sum, f) => sum + f.size, 0);

//   return (
//     <div style={{ 
//       width: '100%', 
//       height: '100%', 
//       display: 'flex', 
//       flexDirection: 'row', 
//       overflow: 'hidden',
//       background: '#f9f9f9',
//       border: '1px solid #e0e0e0'
//     }}>
      
//       {/* LEFT SIDE: SVG BLUEPRINT */}
//       <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
//         <svg 
//           viewBox={`0 0 ${svgWidth} ${svgHeight}`}
//           preserveAspectRatio="xMidYMid meet"
//           style={{ width: '100%', height: '100%', cursor: 'default', background: 'white' }}
//           onClick={clearSelection} // Click background to reset
//         >
//           <defs>
//             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
//               <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#grid)" />

//           {faces.map((face) => {
//             const isSelected = selectedFaceIds.includes(face.id);
            
//             const pathData = face.path.map((p, i) => {
//               const { x, y } = toSVG(p.lng, p.lat);
//               return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
//             }).join(' ') + ' Z';

//             const centroid = face.path.reduce((acc, p) => ({ 
//               lng: acc.lng + p.lng / face.path.length, 
//               lat: acc.lat + p.lat / face.path.length 
//             }), { lng: 0, lat: 0 });
//             const centerSVG = toSVG(centroid.lng, centroid.lat);

//             return (
//               <g 
//                 key={face.id} 
//                 onClick={(e) => { e.stopPropagation(); toggleSelection(face.id); }}
//                 style={{ cursor: 'pointer', transition: 'all 0.2s' }}
//               >
//                 <path
//                   d={pathData}
//                   fill={isSelected ? '#3498db' : '#ecf0f1'}
//                   stroke={isSelected ? '#2980b9' : '#bdc3c7'}
//                   strokeWidth={isSelected ? 3 : 1}
//                   opacity={isSelected ? 0.9 : 0.8}
//                 />

//                 <text
//                   x={centerSVG.x}
//                   y={centerSVG.y}
//                   textAnchor="middle"
//                   fill={isSelected ? '#fff' : '#7f8c8d'}
//                   fontWeight="bold"
//                   fontSize={isSelected ? 20 : 14}
//                   style={{ pointerEvents: 'none', userSelect: 'none' }}
//                 >
//                   {face.designator}
//                 </text>

//                 {isSelected && face.path.map((p1, i) => {
//                   const p2 = face.path[(i + 1) % face.path.length];
//                   const length = getLength(p1, p2);
//                   if (length < 1) return null;

//                   const midX = (p1.lng + p2.lng) / 2;
//                   const midY = (p1.lat + p2.lat) / 2;
//                   const svgMid = toSVG(midX, midY);

//                   return (
//                     <g key={`lbl-${i}`}>
//                        <rect 
//                         x={svgMid.x - 14} y={svgMid.y - 8} 
//                         width="28" height="16" rx="4" 
//                         fill="rgba(0,0,0,0.6)" 
//                       />
//                       <text
//                         x={svgMid.x}
//                         y={svgMid.y + 4}
//                         textAnchor="middle"
//                         fill="#fff"
//                         fontSize="10"
//                         fontWeight="bold"
//                         style={{ pointerEvents: 'none' }}
//                       >
//                         {Math.round(length)}'
//                       </text>
//                     </g>
//                   );
//                 })}
//               </g>
//             );
//           })}
//         </svg>
//       </div>

//       {/* RIGHT SIDE: DATA PANEL */}
//       <div style={{ 
//         width: '340px', 
//         background: '#fff', 
//         borderLeft: '1px solid #ddd', 
//         display: 'flex', 
//         flexDirection: 'column',
//         boxShadow: '-2px 0 10px rgba(0,0,0,0.05)',
//         zIndex: 10
//       }}>
//         {/* Header with Reset Button */}
//         <div style={{ 
//           padding: '20px', 
//           borderBottom: '1px solid #eee',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <h3 style={{ margin: 0, color: '#2c3e50' }}>Roof Details</h3>
//           {selectedFaceIds.length > 0 && (
//             <button 
//               onClick={clearSelection}
//               style={{
//                 background: '#e74c3c', color: 'white', border: 'none',
//                 padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
//                 fontSize: '12px', fontWeight: 'bold'
//               }}
//             >
//               Reset ✖
//             </button>
//           )}
//         </div>

//         <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
//           {selectedFaceIds.length > 0 ? (
//             <div className="fade-in">
              
//               {/* Summary Card for Multiple Selections */}
//               <div style={{ 
//                 background: '#34495e', color: 'white',
//                 padding: '20px', borderRadius: '8px',
//                 marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
//               }}>
//                 <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>
//                   Total Selected Area ({selectedFaceIds.length})
//                 </div>
//                 <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
//                   {Math.round(totalSelectedArea)} sq ft
//                 </div>
//               </div>

//               {/* List of Selected Faces */}
//               <h4 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '13px', textTransform: 'uppercase' }}>
//                 Selected Sections
//               </h4>

//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                 {selectedFaces.map(face => (
//                   <div key={face.id} style={{
//                     border: '1px solid #e0e0e0', borderRadius: '6px',
//                     padding: '12px', background: '#fff',
//                     display: 'flex', alignItems: 'center'
//                   }}>
//                     <div style={{ 
//                       width: '32px', height: '32px', 
//                       background: '#3498db', color: 'white', 
//                       borderRadius: '50%', display: 'flex', 
//                       alignItems: 'center', justifyContent: 'center',
//                       fontWeight: 'bold', fontSize: '14px',
//                       marginRight: '12px'
//                     }}>
//                       {face.designator}
//                     </div>
                    
//                     <div style={{ flex: 1 }} >
//                       <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{Math.round(face.size)} sq ft</div>
//                       <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
//                       Pitch: {face.pitch}/12 • {face.orientation}° • {face.type} 
//                       </div>
//                     </div>

//                     {/* X button to remove just this one face */}
//                     <button 
//                       onClick={() => toggleSelection(face.id)}
//                       style={{
//                         background: 'none', border: 'none', 
//                         color: '#95a5a6', fontSize: '18px', cursor: 'pointer'
//                       }}
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               {/* Only show detailed Edge dimensions if ONE face is selected */}
//               {selectedFaces.length === 1 && (
//                 <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #eee' }}>
//                    <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Edge Dimensions</h4>
//                    {selectedFaces[0].path.map((p1, i) => {
//                       const p2 = selectedFaces[0].path[(i + 1) % selectedFaces[0].path.length];
//                       const length = getLength(p1, p2);
//                       return (
//                         <div key={i} style={{ 
//                           display: 'flex', justifyContent: 'space-between', 
//                           padding: '8px', borderBottom: '1px solid #f0f0f0',
//                           fontSize: '13px'
//                         }}>
//                           <span style={{ color: '#666' }}>Edge {i + 1}</span>
//                           <strong style={{ color: '#2c3e50' }}>{length.toFixed(1)} ft</strong>
//                         </div>
//                       );
//                    })}
//                 </div>
//               )}

//             </div>
//           ) : (
//             <div style={{ 
//               textAlign: 'center', color: '#95a5a6', marginTop: '60px',
//               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' 
//             }}>
//               <span style={{ fontSize: '40px' }}>👆</span>
//               <p>Click multiple areas on the blueprint to calculate total materials.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


import { useState, useMemo } from 'react';
import type { RoofFace, RoofLine, Point } from '../utils/xmlParser';

interface Roof2DViewProps {
  faces: RoofFace[];
  lines: RoofLine[];
}

const LINE_COLORS: Record<string, string> = {
  RIDGE: '#c0392b',
  HIP: '#c0392b',
  VALLEY: '#2980b9',
  RAKE: '#27ae60',
  EAVE: '#8e44ad',
  STEPFLASH: '#e67e22',
  WALL: '#7f8c8d',
  DEFAULT: '#95a5a6'
};

export const Roof2DView = ({ faces, lines }: Roof2DViewProps) => {
  const [selectedFaceIds, setSelectedFaceIds] = useState<string[]>([]);

  if (!faces || faces.length === 0) {
    return <div style={{ padding: '20px' }}>No roof data to display</div>;
  }

   const sortedFaces = useMemo(() => {
    return [...faces].sort((a, b) => b.size - a.size);
  }, [faces]);

  const bounds = useMemo(() => {
    const allPoints = [...faces.flatMap(f => f.path), ...lines.flatMap(l => l.path)];
    return {
      minX: Math.min(...allPoints.map(p => p.lng)),
      maxX: Math.max(...allPoints.map(p => p.lng)),
      minY: Math.min(...allPoints.map(p => p.lat)),
      maxY: Math.max(...allPoints.map(p => p.lat))
    };
  }, [faces, lines]);

  const padding = 40;
  const svgWidth = 800; 
  const svgHeight = 600;
  
  const dataWidth = bounds.maxX - bounds.minX;
  const dataHeight = bounds.maxY - bounds.minY;
  const scale = Math.min(
    (svgWidth - 2 * padding) / dataWidth, 
    (svgHeight - 2 * padding) / dataHeight
  );

  const toSVG = (x: number, y: number) => {
    return {
      x: (x - bounds.minX) * scale + padding,
      y: svgHeight - ((y - bounds.minY) * scale + padding) 
    };
  };

  const getLength = (p1: Point, p2: Point) => {
    const dx = p1.lng - p2.lng;
    const dy = p1.lat - p2.lat;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getLineInfo = (p1: Point, p2: Point) => {
    const match = lines.find(line => {
      for (let i = 0; i < line.path.length - 1; i++) {
        const lp1 = line.path[i];
        const lp2 = line.path[i + 1];
        const epsilon = 0.001;
        const matchForward = 
          (Math.abs(lp1.lng - p1.lng) < epsilon && Math.abs(lp1.lat - p1.lat) < epsilon) &&
          (Math.abs(lp2.lng - p2.lng) < epsilon && Math.abs(lp2.lat - p2.lat) < epsilon);
        const matchBackward = 
          (Math.abs(lp1.lng - p2.lng) < epsilon && Math.abs(lp1.lat - p2.lat) < epsilon) &&
          (Math.abs(lp2.lng - p1.lng) < epsilon && Math.abs(lp2.lat - p1.lat) < epsilon);
        if (matchForward || matchBackward) return true;
      }
      return false;
    });
    const type = match ? match.type : 'UNKNOWN';
    const color = LINE_COLORS[type] || LINE_COLORS.DEFAULT;
    return { type, color };
  };

  const toggleSelection = (id: string) => {
    setSelectedFaceIds(prev => {
      if (prev.includes(id)) return prev.filter(faceId => faceId !== id);
      return [...prev, id];
    });
  };
  const clearSelection = () => setSelectedFaceIds([]);

  // Data Calculations
  const selectedFaces = useMemo(() => 
    faces.filter(f => selectedFaceIds.includes(f.id)), 
  [faces, selectedFaceIds]);

  const totalSelectedArea = selectedFaces.reduce((sum, f) => sum + f.size, 0);
  const totalProjectArea = faces.reduce((sum, f) => sum + f.size, 0);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden', background: '#f9f9f9', border: '1px solid #e0e0e0' }}>
      
      {/* LEFT SIDE: SVG */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', cursor: 'default', background: 'white' }}
          onClick={clearSelection}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {sortedFaces.map((face) => {
            const isSelected = selectedFaceIds.includes(face.id);
            const pathData = face.path.map((p, i) => {
              const { x, y } = toSVG(p.lng, p.lat);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ' Z';
            const centroid = face.path.reduce((acc, p) => ({ 
              lng: acc.lng + p.lng / face.path.length, 
              lat: acc.lat + p.lat / face.path.length 
            }), { lng: 0, lat: 0 });
            const centerSVG = toSVG(centroid.lng, centroid.lat);

            return (
              <g 
                key={face.id} 
                onClick={(e) => { e.stopPropagation(); toggleSelection(face.id); }}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
              >
                <path
                  d={pathData}
                  fill={isSelected ? '#3498db' : '#ecf0f1'}
                  stroke={isSelected ? '#2980b9' : '#bdc3c7'}
                  strokeWidth={isSelected ? 3 : 1}
                  opacity={isSelected ? 0.9 : 0.8}
                />
                <text
                  x={centerSVG.x}
                  y={centerSVG.y}
                  textAnchor="middle"
                  fill={isSelected ? '#fff' : '#7f8c8d'}
                  fontWeight="bold"
                  fontSize={isSelected ? 20 : 12} 
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {face.designator}
                </text>

                {isSelected && face.path.map((p1, i) => {
                  const p2 = face.path[(i + 1) % face.path.length];
                  const length = getLength(p1, p2);
                  if (length < 1) return null;
                  const midX = (p1.lng + p2.lng) / 2;
                  const midY = (p1.lat + p2.lat) / 2;
                  const svgMid = toSVG(midX, midY);
                  const { color } = getLineInfo(p1, p2);

                  return (
                    <g key={`lbl-${i}`}>
                       <rect x={svgMid.x - 16} y={svgMid.y - 9} width="32" height="18" rx="4" fill={color} opacity="0.9" />
                       <text x={svgMid.x} y={svgMid.y + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                        {Math.round(length)}'
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ width: '360px', background: '#fff', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', boxShadow: '-2px 0 10px rgba(0,0,0,0.05)', zIndex: 10 }}>
        
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>Roof Details</h3>
          {selectedFaceIds.length > 0 && (
            <button onClick={clearSelection} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              Reset ✖
            </button>
          )}
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          
          <div style={{ marginBottom: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '11px', color: '#7f8c8d', textTransform: 'uppercase', marginBottom: '4px' }}>Total Project Area</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>{Math.round(totalProjectArea)} sq ft</div>
          </div>

          {selectedFaceIds.length > 0 ? (
            <div className="fade-in">
              <div style={{ background: '#34495e', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>Selected Area ({selectedFaceIds.length})</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{Math.round(totalSelectedArea)} sq ft</div>
              </div>

              <h4 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '13px', textTransform: 'uppercase' }}>Selected Sections</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedFaces.map(face => (
                  <div key={face.id} style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '12px', background: '#fff', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', background: '#3498db', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', marginRight: '12px' }}>
                      {face.designator}
                    </div>
                    <div style={{ flex: 1 }} >
                      <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{Math.round(face.size)} sq ft</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Pitch: {face.pitch}/12 • {face.orientation}°</div>
                    </div>
                    <button onClick={() => toggleSelection(face.id)} style={{ background: 'none', border: 'none', color: '#95a5a6', fontSize: '18px', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #eee' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Line Details</h4>
                  {selectedFaces.map((face) => (
                    <div key={face.id} style={{ marginBottom: '20px' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#34495e', borderBottom: '1px solid #eee', paddingBottom: '5px', fontSize: '12px', textTransform: 'uppercase' }}>
                        Face {face.designator} Lines
                      </h5>
                      {face.path.map((p1, i) => {
                          const p2 = face.path[(i + 1) % face.path.length];
                          const length = getLength(p1, p2);
                          const { type, color } = getLineInfo(p1, p2);
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px', borderBottom: '1px solid #f9f9f9', fontSize: '13px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
                                <span style={{ background: `${color}20`, color: color, padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{type}</span>
                              </div>
                              <strong style={{ color: '#2c3e50' }}>{length.toFixed(1)} ft</strong>
                            </div>
                          );
                      })}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#95a5a6', marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '40px' }}>👆</span>
              <p>Click multiple areas on the blueprint to calculate total materials.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};