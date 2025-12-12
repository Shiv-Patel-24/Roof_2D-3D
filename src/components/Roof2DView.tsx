import { useMemo, useState } from "react";
import type { RoofFace, RoofLine, Point } from "../utils/xmlParser";

interface Roof2DViewProps {
  faces: RoofFace[];
  lines: RoofLine[];
  selectedFaceIds?: string[];
  faceId?: string[];
  toggleSelection: (id: string) => void;
  onFaceSelect?: (id: string) => void;
}

const LINE_COLORS: Record<string, string> = {
  RIDGE: "#f81900ff" ,
  HIP: "#85453dff",
  VALLEY: "#045c97ff",
  RAKE: "#27ae60",
  EAVE: "#8e44ad",
  STEPFLASH: "#e67e22",
  WALL: "#7f8c8d",
  DEFAULT: "#616b6cff",
};

export const Roof2DView = ({
  faces,
  lines,
  selectedFaceIds,
  faceId,
  toggleSelection,
}: Roof2DViewProps) => {
  const selectedIds = selectedFaceIds ?? faceId ?? [];

  const [pitchValues, setPitchValues] = useState<Record<string, number>>({});
  const [firstFaceForEdit, setFirstFaceForEdit] = useState<string | null>(null);
  const [secondFaceForEdit, setSecondFaceForEdit] = useState<string | null>(
    null
  );
  const [operation, setOperation] = useState<"add" | "sub">("add");

  if (!faces || faces.length === 0) {
    return <div style={{ padding: "20px" }}>No roof data to display</div>;
  }

  const sortedFaces = useMemo(() => {
    return [...faces].sort((a, b) => b.size - a.size);
  }, [faces]);

  const bounds = useMemo(() => {
    const allPoints = [
      ...faces.flatMap((f) => f.path),
      ...lines.flatMap((l) => l.path),
    ];
    return {
      minX: Math.min(...allPoints.map((p) => p.lng)),
      maxX: Math.max(...allPoints.map((p) => p.lng)),
      minY: Math.min(...allPoints.map((p) => p.lat)),
      maxY: Math.max(...allPoints.map((p) => p.lat)),
    };
  }, [faces, lines]);

  const padding = 40;
  const svgWidth = 800;
  const svgHeight = 800;
  const dataWidth = bounds.maxX - bounds.minX || 1;
  const dataHeight = bounds.maxY - bounds.minY || 1;
  const scale = Math.min(
    (svgWidth - 2 * padding) / dataWidth,
    (svgHeight - 2 * padding) / dataHeight
  );

  const toSVG = (x: number, y: number) => {
    return {
      x: (x - bounds.minX) * scale + padding,
      y: svgHeight - ((y - bounds.minY) * scale + padding),
    };
  };

  const getLength = (p1: Point, p2: Point) => {
    const dx = p1.lng - p2.lng;
    const dy = p1.lat - p2.lat;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getLineInfo = (p1: Point, p2: Point) => {
    const key1 = `${p1.id}-${p2.id}`;
    const key2 = `${p2.id}-${p1.id}`;

    const match = lines.find((line) => {
      const lineKey = line.path.map((p) => p.id).join("-");
      return lineKey === key1 || lineKey === key2;
    });

    const type = match ? match.type : "UNKNOWN";
    const color = LINE_COLORS[type] || LINE_COLORS.DEFAULT;
    return { type, color };
  };

  const getLineTotalsForFace = (face: RoofFace) => {
    const totals: Record<string, number> = {};

    face.path.forEach((p1, i) => {
      const p2 = face.path[(i + 1) % face.path.length];
      const length = getLength(p1, p2);
      const { type } = getLineInfo(p1, p2);
      if (type === "UNKNOWN") return;

      if (!totals[type]) totals[type] = 0;
      totals[type] += length;
    });

    return totals;
  };

  const getCombinedRoofData = () => {
    if (!firstFaceForEdit || !secondFaceForEdit) return null;

    const firstFace = faces.find((f) => f.id === firstFaceForEdit);
    const secondFace = faces.find((f) => f.id === secondFaceForEdit);
    if (!firstFace || !secondFace) return null;

    const pitch1 = pitchValues[firstFace.id] ?? firstFace.pitch;
    const pitch2 = pitchValues[secondFace.id] ?? secondFace.pitch;

    console.log(setPitchValues, "getCombinedRoofData");

    let totalArea = 0;
    if (operation === "add") totalArea = firstFace.size + secondFace.size;
    if (operation === "sub")
      totalArea = Math.max(0, firstFace.size - secondFace.size);

    const combinedPitch =
      operation === "add"
        ? Math.round(
            (pitch1 * firstFace.size + pitch2 * secondFace.size) /
              (firstFace.size + secondFace.size)
          )
        : pitch1;

    console.log(combinedPitch);
    const totals1 = getLineTotalsForFace(firstFace);
    const totals2 = getLineTotalsForFace(secondFace);
    const combined: Record<string, number> = {};
    const allTypes = new Set([
      ...Object.keys(totals1),
      ...Object.keys(totals2),
    ]);
    allTypes.forEach((type) => {
      const v1 = totals1[type] || 0;
      const v2 = totals2[type] || 0;
      combined[type] = operation === "add" ? v1 + v2 : Math.max(0, v1 - v2);
    });

    return { totalArea, combinedPitch, combined };
  };

  const handleClear = () => {
    selectedIds.forEach((id) => toggleSelection(id));
    setFirstFaceForEdit(null);
    setSecondFaceForEdit(null);
  };

  const selectAll = () => {
    if (selectedIds.length === faces.length) {
      faces.forEach((f) => {
        if (selectedIds.includes(f.id)) toggleSelection(f.id);
      });
    } else {
      faces.forEach((f) => {
        if (!selectedIds.includes(f.id)) toggleSelection(f.id);
      });
    }
  };

  const removeSingleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      toggleSelection(id);
    }
  };

  const selectedFaces = faces.filter((f) => selectedIds.includes(f.id));
  const totalSelectedArea = selectedFaces.reduce((sum, f) => sum + f.size, 0);
  const totalProjectArea = faces.reduce((sum, f) => sum + f.size, 0);

  const combinedData =
    firstFaceForEdit && secondFaceForEdit ? getCombinedRoofData() : null;
  return (
    <div
      className="w-full flex flex-row h-full border-3 border-solid border-black"
    >
      <div 
      className="flex-1 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full bg-white"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {sortedFaces.map((face) => {
            const isSelected = selectedIds.includes(face.id);
            const pathData =
              face.path
                .map((p, i) => {
                  const { x, y } = toSVG(p.lng, p.lat);
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ") + " Z";

            const centroid = face.path.reduce(
              (acc, p) => ({
                lng: acc.lng + p.lng / face.path.length,
                lat: acc.lat + p.lat / face.path.length,
              }),
              { lng: 0, lat: 0 }
            );
            const centerSVG = toSVG(centroid.lng, centroid.lat);

            return (
              <g
                key={face.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection(face.id); 
                }}
                className="cursor-pointer pointer-events-auto"
              >
                <path
                  d={pathData}
                  fill={isSelected ? "#3498db" : "#ecf0f1"}
                  stroke={isSelected ? "#2980b9" : "#bdc3c7"}
                  strokeWidth={isSelected ? 3 : 1}
                  opacity={isSelected ? 0.9 : 0.8}
                />

                <text
                  x={centerSVG.x}
                  y={centerSVG.y}
                  textAnchor="middle"
                  fill={isSelected ? "#fff" : "#7f8c8d"}
                  fontWeight="bold"
                  fontSize={isSelected ? 20 : 12}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {face.designator}
                </text>

                {isSelected &&
                  face.path.map((p1, i) => {
                    const p2 = face.path[(i + 1) % face.path.length];
                    const length = getLength(p1, p2);
                    if (length < 1) return null;
                    const midX = (p1.lng + p2.lng) / 2;
                    const midY = (p1.lat + p2.lat) / 2;
                    const svgMid = toSVG(midX, midY);
                    const { color } = getLineInfo(p1, p2);
                    
                    return (
                      <g key={`lbl-${face.id}-${i}`}>
                        <rect
                          x={svgMid.x - 16}
                          y={svgMid.y - 9}
                          width="32"
                          height="18"
                          rx="4"
                          fill={color}
                          opacity="0.9"
                        />
                      
                            <text
                              x={svgMid.x}
                              y={svgMid.y + 4}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize="10"
                          fontWeight="bold"
                          style={{ pointerEvents: "none" }}
                        >
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

      <div
        className="w-80 bg-white border-l-1 border-gray-500 flex flex-col z-<10> shadow-(<-2px 0 10px rgba(0,0,0,0.05)>)"
      >
        <div
          className="pt-3 pl-4 h-[5rem] border-b-1 border-white flex justify-between align-center bg-gray-200"
        >
          <h3  className="text-blue-800 m-0 font-bold text-xl">Roof Details</h3>
          <div  className="flex gap-8">
            <button
              onClick={selectAll}
              className=" bg-blue-300 text-black border-none rounded-xl cursor-pointer h-[2rem] w-[5rem] mb-2 "
            >
              {selectedIds.length === faces.length
                ? "Unselect All"
                : "Select All"}
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={handleClear}
                className="bg-red-500 rounded-xl cursor-pointer  h-[3rem] w-[5rem] text-white"
              >
                Reset ✖
              </button>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-4 border-b-1 border-solid border-white gap-8 ">
            <div className="flex gap-8 mb-2">
              <div  className="flex-1">
                <label className="block mb-2.5 text-sm font-medium text-heading">
                  First Roof Section
                </label>
                <select
                  value={firstFaceForEdit ?? ""}
                  onChange={(e) => setFirstFaceForEdit(e.target.value || null)}
                  className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
                >
                  <option value="" className="border-2 border-solid">Select</option>
                  {selectedIds.map((id) => {
                    const f = faces.find((x) => x.id === id);
                    return f ? (
                      <option key={id} value={id} >
                        {f.designator} — {Math.round(f.size)} sq ft | {f.pitch}{" "}
                        Pitch
                      </option>
                    ) : null;
                  })}
                </select>
              </div>

              <div className="flex-1">
                <label className="block mb-2.5 text-sm font-medium text-heading">
                  Second Roof Section
                </label>
                <select
                  value={secondFaceForEdit ?? ""}
                  onChange={(e) => setSecondFaceForEdit(e.target.value || null)}
                  className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
                >
                  <option value="">Select</option>
                  {selectedIds.map((id) => {
                    const f = faces.find((x) => x.id === id);
                    return f ? (
                      <option key={id} value={id}>
                        {f.designator} — {Math.round(f.size)} sq ft | {f.pitch}{" "}
                        Pitch
                      </option>
                    ) : null;
                  })}
                </select>
              </div>
            </div>

            <div
              className="flex gap-8 align-center mb-3"
            >
              <label  className="block mb-2.5 text-sm font-medium text-heading ">
                Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as "add" | "sub")}
                className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
              >
                <option value="add">Add</option>
                <option value="sub">Subtract</option>
              </select>
            </div>
          </div>
        )}

        {combinedData && (
          <div className="p-1 border-solid border-gray-500 bg-gray-200 text-black ">
            <div className=" text-base font-bold  ">
              Combined Roof Data
            </div>
            <div className="text-base" >
              Total Area: {Math.round(combinedData.totalArea)} sq ft
            </div>
            <div className="text-base">
              Pitch: {combinedData.combinedPitch}/12
            </div>

            <div className="mt-5 text-lg">
              <h4 className=" font-bold ">Combined Line Lengths</h4>
              {Object.entries(combinedData.combined).map(([type, len]) => (
                <div key={type} className="text-base">
                  {type} — {len.toFixed(1)} ft
                </div>
              ))}
            </div>

            <div className="mt-5">
              <button
                onClick={() => {
                  setFirstFaceForEdit(null);
                  setSecondFaceForEdit(null);
                }}
                className="bg-red-700 text-white rounded-md cursor-pointer w-[4rem] h-[2rem]"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className=" overflow-auto flex-1">
          <div
            className="h-[5rem] rounded-lg mb-3 bg-gray-300 mt-2 p-2 w-[18rem] ml-4"
          >
            <div
              className="text-gray-500 uppercase text-xs"
            >
              Total Project Area
            </div>
            <div className="text-xl text-blue-800 font-bold">
              {Math.round(totalProjectArea)} sq ft
            </div>
          </div>

          {selectedIds.length > 0 ? (
            <>
              <div
                className="h-[5rem] rounded-lg mb-3 bg-indigo-900 mt-2 p-2 w-[18rem] ml-4 text-white cursor-pointer"  onClick={selectAll} 
              >
                <div
                  className="text-xs opacity-[.67] uppercase"
                >
                  Selected Area ({selectedIds.length})
                </div>
                <div  className="text-2xl font-bold">
                  {Math.round(totalSelectedArea)} sq ft
                </div>
              </div>

              <h4
                className="mb-2 text-gray-500 uppercase"
              >
                Selected Sections
              </h4>

              <div
                className="flex flex-col gap-3 "
              >
                {selectedFaces.map((f) => (
                  <div
                    key={f.id}
                    className="p-2 border border-solid border-gray-500 rounded-md bg-white flex items-center"
                  >
                    <div
                      className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center font-bold mr-6"
                    >
                      {f.designator}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-blue-900">
                        {Math.round(f.size)} sq ft
                      </div>
                      <div className="text-sm text-gray-400">
                        Pitch: {f.pitch}/12 
                      </div>
                    </div>
                    <button
                      onClick={() => removeSingleSelection(f.id)}
                      className="bg-none border-none text-sm cursor-pointer text-red-900"
                    >
                     ×
                    </button>
                  </div>
                ))}
              </div>

              <div
                className="mt-5 pt-5 border-t border-gray-400"
              >
                <h4  className="mb-4 text-blue-900">
                  Line Details
                </h4>

                {selectedFaces.map((face) => {
                  const totals = getLineTotalsForFace(face);
                  return (
                    <div key={face.id} className="mb-4 cursor-pointer">
                      <h5
                        className="mb-4 text-blue-800  font-black"
                        // onClick={handleForHighlightLines}
                      >
                        {face.designator} Lines
                      </h5>
                      {Object.entries(totals).map(([type, len]) => (
                        <div
                          key={type}
                          className="flex justify-between mb-2 text-sm"
                        >
                          <div
                            className="flex align-center gap-4 "
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background:
                                  LINE_COLORS[type] ?? LINE_COLORS.DEFAULT,
                              }}
                            />
                            <span
                              style={{
                                background: `${LINE_COLORS[type]}20`,
                                color: LINE_COLORS[type],
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: "bold",
                                textTransform: "uppercase",
                              }}
                            >
                              {type} • Pitch {face.pitch}/12
                            </span>
                          </div>
                          <strong className="text-blue-800">
                            {len.toFixed(1)} ft
                          </strong>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div
              className="text-center text-gray-500 mt-50 flex flex-col align-center gap-10"
            >
              <span className="font-4xl">👆</span>
              <p>
                Click multiple areas on the blueprint to calculate total
                materials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
