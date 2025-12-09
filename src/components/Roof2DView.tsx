import { useMemo, useState } from "react";
import type { RoofFace, RoofLine, Point } from "../utils/xmlParser";

interface Roof2DViewProps {
  faces: RoofFace[];
  lines: RoofLine[];
  selectedFaceIds?: string[];
  faceId?: string[];
  toggleSelection: (id: string) => void;
}

const LINE_COLORS: Record<string, string> = {
  RIDGE: "#f81900ff",
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
  const svgHeight = 600;
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

    console.log(setPitchValues);

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
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        background: "#f9f9f9",
        border: "1px solid #e0e0e0",
      }}
    >
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: "100%",
            height: "100%",
            cursor: "default",
            background: "white",
          }}
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
                style={{ cursor: "pointer", pointerEvents: "all" }}
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
        style={{
          width: "360px",
          background: "#fff",
          borderLeft: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.05)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, color: "#2c3e50" }}>Roof Details</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={selectAll}
              style={{
                padding: "8px 10px",
                background: "#2d98da",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {selectedIds.length === faces.length
                ? "Unselect All"
                : "Select All"}
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={handleClear}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Reset ✖
              </button>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ padding: 16, borderBottom: "1px solid #eee"}}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "#666" }}>
                  First Roof Section
                </label>
                <select
                  value={firstFaceForEdit ?? ""}
                  onChange={(e) => setFirstFaceForEdit(e.target.value || null)}
                  style={{ width: "100%", padding: 8, marginTop: 6 }}
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

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "#666" }}>
                  Second Roof Section
                </label>
                <select
                  value={secondFaceForEdit ?? ""}
                  onChange={(e) => setSecondFaceForEdit(e.target.value || null)}
                  style={{ width: "100%", padding: 8, marginTop: 6 }}
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
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <label style={{ fontSize: 12, color: "#666", minWidth: 72 }}>
                Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as "add" | "sub")}
                style={{ padding: 8 }}
              >
                <option value="add">Add</option>
                <option value="sub">Subtract</option>
              </select>
            </div>
          </div>
        )}

        {/* Combined Results */}
        {combinedData && (
          <div
            style={{
              padding: 16,
              borderBottom: "1px solid #eee",
              background: "#f8f9fa",
              color: "black"
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8}}>
              Combined Roof Data
            </div>
            <div style={{ fontSize: 14 }}>
              Total Area: {Math.round(combinedData.totalArea)} sq ft
            </div>
            <div style={{ fontSize: 14 }}>
              Pitch: {combinedData.combinedPitch}/12
            </div>

            <div style={{ marginTop: 10 }}>
              <h4 style={{ margin: "8px 0 6px 0" }}>Combined Line Lengths</h4>
              {Object.entries(combinedData.combined).map(([type, len]) => (
                <div key={type} style={{ fontSize: 13 }}>
                  {type} — {len.toFixed(1)} ft
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => {
                  setFirstFaceForEdit(null);
                  setSecondFaceForEdit(null);
                }}
                style={{
                  background: "#95a5a6",
                  color: "white",
                  border: "none",
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: "#f8f9fa",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#7f8c8d",
                textTransform: "uppercase",
              }}
            >
              Total Project Area
            </div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#2c3e50" }}>
              {Math.round(totalProjectArea)} sq ft
            </div>
          </div>

          {selectedIds.length > 0 ? (
            <>
              <div
                style={{
                  marginBottom: 12,
                  padding: 16,
                  background: "#34495e",
                  color: "white",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.9,
                    textTransform: "uppercase",
                  }}
                >
                  Selected Area ({selectedIds.length})
                </div>
                <div style={{ fontSize: 28, fontWeight: "bold" }}>
                  {Math.round(totalSelectedArea)} sq ft
                </div>
              </div>

              <h4
                style={{
                  margin: "0 0 12px 0",
                  color: "#666",
                  fontSize: 13,
                  textTransform: "uppercase",
                }}
              >
                Selected Sections
              </h4>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {selectedFaces.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 6,
                      padding: 12,
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "#3498db",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        marginRight: 12,
                      }}
                    >
                      {f.designator}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", color: "#2c3e50" }}>
                        {Math.round(f.size)} sq ft
                      </div>
                      <div style={{ fontSize: 12, color: "#7f8c8d" }}>
                        Pitch: {f.pitch}/12 • 
                      </div>
                    </div>
                    <button
                      onClick={() => removeSingleSelection(f.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e74c3c",
                        fontSize: 18,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 12,
                  borderTop: "2px solid #eee",
                }}
              >
                <h4 style={{ margin: "0 0 12px 0", color: "#2c3e50" }}>
                  Line Details
                </h4>

                {selectedFaces.map((face) => {
                  const totals = getLineTotalsForFace(face);
                  return (
                    <div key={face.id} style={{ marginBottom: 14 }}>
                      <h5
                        style={{
                          margin: "0 0 8px 0",
                          color: "#34495e",
                          fontSize: 12,
                        }}
                      >
                        {face.designator} Lines
                      </h5>
                      {Object.entries(totals).map(([type, len]) => (
                        <div
                          key={type}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "6px 4px",
                            borderBottom: "1px solid #f9f9f9",
                            fontSize: 13,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
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
                          <strong style={{ color: "#2c3e50" }}>
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
              style={{
                textAlign: "center",
                color: "#95a5a6",
                marginTop: 60,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 40 }}>👆</span>
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
