import { useState, useEffect } from "react";
import type { RoofFace, RoofLine } from "../utils/xmlParser";

interface MeasurementsPanelProps {
  faces: RoofFace[];
  lines: RoofLine[];
  activeFileName: string | null;
  selectedFaceIds: string[];
  toggleSelection: (id: string) => void;
}

export const MeasurementsPanel = ({
  faces,
  lines,
  activeFileName,
  toggleSelection,
  selectedFaceIds,
}: MeasurementsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"faces" | "lines" | "summary">(
    "faces"
  );
  const totalArea = faces.reduce((sum, face) => sum + face.size, 0);
  const avgPitch =
    faces.reduce((sum, face) => sum + face.pitch, 0) / (faces.length || 1);

  const sortedFaces = [...faces].sort((a, b) => {
    const aSelected = selectedFaceIds.includes(a.id);
    const bSelected = selectedFaceIds.includes(b.id);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  useEffect(() => {
    return () => {
      setActiveTab("faces");
    };
  }, [selectedFaceIds]);

  return (
    <div className="w-[350px] flex flex-col bg-white border-l border-gray-200 shadow-lg z-20">
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800">Measurement Data</h3>

        {activeFileName ? (
          <div className="mt-2 text-sm flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
            <span>📄</span>
            <span className="font-medium truncate" title={activeFileName}>
              {activeFileName}
            </span>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500">Using Default Data</div>
        )}
      </div>

      <div className="flex border-b border-gray-200">
        {["faces", "lines", "summary"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors
              ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab(tab as "faces" | "lines" | "summary")}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === "faces" && (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
              <tr>
                <th className="p-3">Face</th>
                <th className="p-3">Pitch</th>
                <th className="p-3 text-right">Area</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedFaces.map((face) => (
                <tr
                  key={face.id}
                  onClick={() => {
                    toggleSelection(face.id);
                    setActiveTab("faces");
                  }}
                  className={`hover:bg-blue-50 transition-colors ${
                    selectedFaceIds.includes(face.id) ? "bg-blue-100" : ""
                  }`}
                >
                  <td className="p-3 font-medium text-blue-600 ">
                    {face.designator}
                  </td>
                  <td className="p-3">{face.pitch}°</td>
                  <td className="p-3 text-right font-mono">
                    {Math.round(face.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "lines" && (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="ml-2">{` ${line.id}  `} </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase
                     ${
                       line.type === "RIDGE"
                         ? "bg-red-100 text-red-700"
                         : line.type === "EAVE"
                         ? "bg-purple-100 text-purple-700"
                         : "bg-gray-100 text-gray-700"
                     }
                     ${
                       line.type === "RAKE"
                         ? "bg-green-100 text-green-800"
                         : line.type === "WALL"
                         ? "bg-gray-100 text-gray-100"
                         : "bg-gray-200 text-gray-200"
                     }
                     ${
                       line.type === "VALLEY"
                         ? "bg-blue-100 text-blue-600"
                         : line.type === "STEPFLASH"
                         ? "bg-orange-100 text-orange-600"
                         : "bg-gray-300 text-gray-900"
                     }
                   `}
                    >
                      {line.type}
                    </span>
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {line.path.length} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "summary" && (
          <div className="p-4 grid grid-cols-2 gap-3">
            <SummaryCard
              label="Total Area"
              value={`${Math.round(totalArea)} sq ft`}
            />
            <SummaryCard label="Avg Pitch" value={`${avgPitch.toFixed(1)}°`} />
            <SummaryCard label="Total Faces" value={faces.length} />
            <SummaryCard label="Total Lines" value={lines.length} />
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-md">
    <div className="text-xs text-purple-200 uppercase font-bold tracking-wider mb-1">
      {label}
    </div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);
