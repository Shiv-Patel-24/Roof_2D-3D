// import { XMLParser } from 'fast-xml-parser';

// export interface Point {
//   lat: number;
//   lng: number;
//   ele: number;
//   id?: string;
// }

// export interface RoofFace {
//   id: string;
//   designator: string;
//   type: string;
//   orientation: string;
//   pitch: number;
//   size: number;
//   path: Point[];
// }

// export interface RoofLine {
//   id: string;
//   type: string;
//   path: Point[];
// }

// export interface RoofData {
//   faces: RoofFace[];
//   lines: RoofLine[];
// }

// export const parseRoofXML = (xmlString: string): RoofData => {
//   const options = {
//     ignoreAttributes: false,
//     attributeNamePrefix: '',
//     parseAttributeValue: true,
//     isArray: (name: string) => ['FACE', 'LINE', 'POINT', 'POLYGON'].includes(name)
//   };

//   const parser = new XMLParser(options);
//   const result = parser.parse(xmlString);

//   const eagleview = result?.EAGLEVIEW_EXPORT;
//   const structures = eagleview?.STRUCTURES;
//   const roof = structures?.ROOF;

//   if (!roof) return { faces: [], lines: [] };

//   // --- 1. Map Points ---
//   const pointsMap = new Map<string, Point>();
//   (roof.POINTS?.POINT || []).forEach((point: any) => {
//     if (point?.id && typeof point.data === 'string') {
//       const coords = point.data.split(',').map((s: string) => parseFloat(s.trim()));
//       if (coords.length >= 2) {
//         pointsMap.set(point.id, {
//           id: point.id,
//           lat: coords[1], // Y
//           lng: coords[0], // X
//           ele: coords[2] || 0 // Z
//         });
//       }
//     }
//   });

//   // --- 2. Map Lines ---
//   const linesMap = new Map<string, string[]>(); 
//   (roof.LINES?.LINE || []).forEach((line: any) => {
//     if (line?.id && line.path) {
//       linesMap.set(line.id, line.path.split(',').map((s: string) => s.trim()));
//     }
//   });

//   // --- 3. Build Faces with Smart Stitching ---
//   const faces: RoofFace[] = [];
//   (roof.FACES?.FACE || []).forEach((face: any) => {
//     const polygon = Array.isArray(face.POLYGON) ? face.POLYGON[0] : face.POLYGON;
//     if (!polygon?.path) return;

//     const lineIds = polygon.path.split(',').map((s: string) => s.trim());
//     let orderedPointIds: string[] = [];

//     lineIds.forEach((lineId, index) => {
//       const linePoints = linesMap.get(lineId);
//       if (!linePoints) return;

//       if (index === 0) {
//         orderedPointIds = [...linePoints];
//       } else {
//         const currentTail = orderedPointIds[orderedPointIds.length - 1];
//         const nextLineHead = linePoints[0];
//         const nextLineTail = linePoints[linePoints.length - 1];

//         // If the next line is backwards (Tail-to-Tail), flip it
//         if (currentTail === nextLineTail) {
//           const reversedLine = [...linePoints].reverse();
//           orderedPointIds.push(...reversedLine.slice(1));
//         } 
//         // If it connects normally (Tail-to-Head), add it
//         else if (currentTail === nextLineHead) {
//           orderedPointIds.push(...linePoints.slice(1));
//         } 
//         // Fallback for gaps
//         else {
//           orderedPointIds.push(...linePoints);
//         }
//       }
//     });

//     const path = orderedPointIds
//       .map(pid => pointsMap.get(pid))
//       .filter((p): p is Point => p !== undefined);

//     if (path.length >= 3) {
//       faces.push({
//         id: face.id,
//         designator: face.designator,
//         type: face.type || 'ROOF',
//         orientation: polygon.orientation || '0',
//         pitch: parseFloat(polygon.pitch || '0'),
//         size: parseFloat(polygon.size || '0'),
//         path: path
//       });
//     }
//   });

//   // --- 4. Build Lines ---
//   const lines: RoofLine[] = [];
//   (roof.LINES?.LINE || []).forEach((line: any) => {
//     if (!line.path) return;
//     const pIds = line.path.split(',').map((s: string) => s.trim());
//     const path = pIds.map(pid => pointsMap.get(pid)).filter((p): p is Point => p !== undefined);
//     if (path.length >= 2) {
//       lines.push({ id: line.id, type: line.type || 'UNKNOWN', path });
//     }
//   });

//   return { faces, lines };
// };

import { XMLParser } from 'fast-xml-parser';

export interface Point {
  lat: number;
  lng: number;
  ele: number;
  id?: string;
}

export interface RoofFace {
  id: string;
  designator: string;
  type: string;
  orientation: string;
  pitch: number;
  size: number;
  path: Point[];
}

export interface RoofLine {
  id: string;
  type: string;
  path: Point[];
}

export interface RoofData {
  faces: RoofFace[];
  lines: RoofLine[];
}

export const parseRoofXML = (xmlString: string): RoofData => {
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    isArray: (name: string) => ['FACE', 'LINE', 'POINT', 'POLYGON'].includes(name)
  };

  const parser = new XMLParser(options);
  const result = parser.parse(xmlString);

  const eagleview = result?.EAGLEVIEW_EXPORT;
  const structures = eagleview?.STRUCTURES;
  const roof = structures?.ROOF;

  if (!roof) return { faces: [], lines: [] };

  const cleanFloat = (val: any): number => {
    if (val === undefined || val === null) return 0;
    const cleanStr = String(val).replace(/\u2212/g, '-').replace(/−/g, '-');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
  };

  const pointsMap = new Map<string, Point>();
  (roof.POINTS?.POINT || []).forEach((point: any) => {
    if (!point?.id) return;

    let lat = 0, lng = 0, ele = 0;
    let found = false;

    // Case A: data="x,y,z" (Cleaned)
    if (typeof point.data === 'string') {
      const cleanData = String(point.data).replace(/\u2212/g, '-').replace(/−/g, '-');
      const coords = cleanData.split(',').map((s: string) => parseFloat(s.trim()));
      
      if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        lng = coords[0];
        lat = coords[1];
        ele = coords[2] || 0;
        found = true;
      }
    } 
    // Case B: Direct Attributes (Cleaned)
    else if (point.x !== undefined || point.y !== undefined) {
      lng = cleanFloat(point.x || point.lng);
      lat = cleanFloat(point.y || point.lat);
      ele = cleanFloat(point.z || point.ele);
      found = true;
    }
    // Case C: Lat/Lng Attributes (Cleaned)
    else if (point.lat !== undefined || point.long !== undefined) {
      lat = cleanFloat(point.lat);
      lng = cleanFloat(point.long || point.lng);
      ele = cleanFloat(point.ele || point.z);
      found = true;
    }

    if (found) {
      pointsMap.set(point.id, { id: point.id, lat, lng, ele });
    }
  });

  // --- 2. Map Lines ---
  const linesMap = new Map<string, string[]>(); 
  (roof.LINES?.LINE || []).forEach((line: any) => {
    if (line?.id && line.path) {
      linesMap.set(line.id, line.path.split(',').map((s: string) => s.trim()));
    }
  });

  const faces: RoofFace[] = [];
  (roof.FACES?.FACE || []).forEach((face: any) => {
    const polygon = Array.isArray(face.POLYGON) ? face.POLYGON[0] : face.POLYGON;
    if (!polygon?.path) return;

    const lineIds = polygon.path.split(',').map((s: string) => s.trim());
    let orderedPointIds: string[] = [];

    lineIds.forEach((lineId : any, index : any) => {
      const linePoints = linesMap.get(lineId);
      if (!linePoints) return;

      if (index === 0) {
        orderedPointIds = [...linePoints];
      } else {
        const currentTail = orderedPointIds[orderedPointIds.length - 1];
        const nextLineHead = linePoints[0];
        const nextLineTail = linePoints[linePoints.length - 1];

        if (currentTail === nextLineTail) {
          const reversedLine = [...linePoints].reverse();
          orderedPointIds.push(...reversedLine.slice(1));
        } else if (currentTail === nextLineHead) {
          orderedPointIds.push(...linePoints.slice(1));
        } else {
          orderedPointIds.push(...linePoints);
        }
      }
    });

    const path = orderedPointIds
      .map(pid => pointsMap.get(pid))
      .filter((p): p is Point => p !== undefined);

    if (path.length >= 3) {
      faces.push({
        id: face.id,
        designator: face.designator,
        type: face.type || 'ROOF',
        orientation: polygon.orientation || '0',
        pitch: cleanFloat(polygon.pitch),
        size: cleanFloat(polygon.size),
        path: path
      });
    }
  });

  const lines: RoofLine[] = [];
  (roof.LINES?.LINE || []).forEach((line: any) => {
    if (!line.path) return;
    const pIds = line.path.split(',').map((s: string) => s.trim());
    const path = pIds.map((pid : any) => pointsMap.get(pid)).filter((p : any): p is Point => p !== undefined);
    if (path.length >= 2) {
      lines.push({ id: line.id, type: line.type || 'UNKNOWN', path });
    }
  });

  return { faces, lines };
};