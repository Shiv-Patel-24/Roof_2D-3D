import { useState, useEffect } from "react";
import { parseRoofXML, type RoofData } from "./utils/xmlParser";
import { Roof2DView } from "./components/Roof2DView";
import { Roof3DView } from "./components/Roof3DView";
import { MeasurementsPanel } from "./components/MeasurementsPanel";
import { ReportHeader } from "./components/ReportHeader";
import Timer from "./components/Timer";
import TimerInput from "./components/TimerInput";
import Display from "./components/Display";
import "./App.css";

interface UploadedFile {
  name: string;
  xml: string;
}

export default function App() {
  const [roofData, setRoofData] = useState<RoofData | null>(null);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaceIds, setSelectedFaceIds] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [showFileSidebar, setShowFileSidebar] = useState(false);
  const [selectedBuiltin, setSelectedBuiltin] = useState(
    "eagleview-data-1.xml"
  );
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [timeInSeconds, setTimeInSecond] = useState<number>(0);

  const handleStartTimer : (timeInSeconds: number) => void = (timeInSeconds: number) => {
    setTimeInSecond(timeInSeconds);
  };

  const loadBuiltinFile = async (filename: string) => {
    setLoading(true);
    setError(null);
    setIsCustomUpload(false);
    setActiveFileName(filename);

    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) throw new Error(`Failed to load ${filename}`);
      const xmlText = await response.text();

      const data = parseRoofXML(xmlText);
      if (!data.faces.length) throw new Error("No roof faces found in XML");
      setRoofData(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (newFiles: UploadedFile[]) => {
    if (!newFiles || newFiles.length === 0) return;
    setUploadedFiles((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name)
      );
    });

    const fileToLoad = newFiles[0];
    handleSelectFile(fileToLoad.name, fileToLoad.xml);

    setIsCustomUpload(true);
    setShowFileSidebar(true);
  };

  const handleSelectFile = (fileName: string, xmlContent?: string) => {
    let xml = xmlContent;
    if (!xml) {
      const found = uploadedFiles.find((f) => f.name === fileName);
      if (found) xml = found.xml;
    }

    if (!xml) return;

    setActiveFileName(fileName);
    setIsCustomUpload(true);
    setError(null);

    try {
      const data = parseRoofXML(xml);
      setRoofData(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Error parsing ${e.message}`);
      } else {
        setError(`Error parsing ${fileName}`);
      }
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedFaceIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((faceId) => faceId !== id);
      } else {
        return [...prev, id];
      }
    });
    setShowMeasurements(true);
  };

  useEffect(() => {
    loadBuiltinFile(selectedBuiltin);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
        <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading roof data...</p>
      </div>
    );
  }

  if (error || !roofData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
        <h3 className="text-xl font-bold">Error</h3>
        <p className="mb-6">{error || "No data available"}</p>
        <button className="px-6 py-3 bg-green-500 rounded-lg text-white font-bold hover:bg-green-600"></button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <ReportHeader
        selectedFile={selectedBuiltin}
        onFileChange={(filename) => {
          setSelectedBuiltin(filename);
          loadBuiltinFile(filename);
        }}
        onUploadXml={handleUpload}
        isUploadActive={isCustomUpload}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative flex flex-col bg-gray-50 border-r border-gray-200">
          <div className="absolute left-4 top-4 z-10 flex gap-2">
            <button
              className={`px-4 py-2 rounded-full  h-[4rem] border shadow-sm transition-colors ${
                view === "3d"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => {
                setView("3d");
                setShowMeasurements(!showMeasurements);
              }}
            >
              🏠 3D View
            </button>
            <button
              className={`px-4 py-2 rounded-full  h-[4rem] border shadow-sm transition-colors ${
                view === "2d"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setView("2d")}
            >
              📐 2D Blueprint
            </button>
            <button
              className={`px-4 py-2 rounded-full  h-[4rem] border shadow-sm transition-colors ${
                showMeasurements
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setShowMeasurements(!showMeasurements)}
            >
              📊 {showMeasurements ? "Hide" : "Show"} Data
            </button>
            <button
              className={`px-4 py-2 rounded-full h-[4rem] border shadow-sm transition-colors ${
                showFileSidebar
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setShowFileSidebar(!showFileSidebar)}
            >
              Files ({uploadedFiles.length})
            </button>
            <div className="h-[3rem]">
              <Timer />
            </div>
            <div className="flex flex-row items-start gap-2 p-2 border rounded-lg">
              <TimerInput onStart={handleStartTimer} />
              <Display timeInSeconds={timeInSeconds} />
            </div>
          </div>

          {showFileSidebar && (
            <div className="absolute right-0 top-16 z-20 w-64 bg-white shadow-2xl border-l border-gray-200 rounded-l-lg overflow-hidden flex flex-col max-h-[80%]">
              <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Uploaded Files</h3>
                <button
                  onClick={() => setShowFileSidebar(false)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto p-2">
                {uploadedFiles.length === 0 ? (
                  <p className="text-gray-400 text-center py-4 text-sm">
                    No files uploaded yet.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {uploadedFiles.map((file, idx) => (
                      <li
                        key={`${idx}`}
                        onClick={() => handleSelectFile(file.name)}
                        className={`p-3 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                          activeFileName === file.name
                            ? "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
                            : "bg-white hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span className="text-lg">📄</span>
                        <span className="truncate">{file.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 relative size-full overflow-hidden">
            {view === "2d" ? (
              <Roof2DView
                faces={roofData.faces}
                lines={roofData.lines}
                selectedFaceIds={selectedFaceIds}
                toggleSelection={toggleSelection}
              />
            ) : (
              <Roof3DView
                faces={roofData.faces}
                lines={roofData.lines}
                selectedFaceIds={selectedFaceIds}
                toggleSelection={toggleSelection}
              />
            )}
          </div>
        </div>

        {showMeasurements && (
          <MeasurementsPanel
            faces={roofData.faces}
            lines={roofData.lines}
            activeFileName={activeFileName}
            selectedFaceIds={selectedFaceIds}
            toggleSelection={toggleSelection}
          />
        )}
      </div>
    </div>
  );
}
