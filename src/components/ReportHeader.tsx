import React from "react";

interface ReportHeaderProps {
  selectedFile: string;
  onFileChange: (file: string) => void;
  onUploadXml: (files: { name: string; xml: string }[]) => void;
  isUploadActive: boolean;
}

export const ReportHeader = ({
  onUploadXml,
  isUploadActive,
}: ReportHeaderProps) => {
  const readFileAsText = (
    file: File
  ): Promise<{ name: string; xml: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          xml: reader.result as string,
        });
      };

      reader.onerror = () => {
        reject(reader.error);
      };

      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);
      const loadedFiles = await Promise.all(fileArray.map(readFileAsText));
      onUploadXml(loadedFiles);
    } catch (error) {
      console.error("Error reading XML files:", error);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <header className="bg-blue-600 h-16 flex items-center px-6 shadow-md z-30">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-3xl">🏘️</span>
        <h1 className="text-white font-bold text-xl tracking-wide">
          RoofView Pro
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <label
          className={`
            cursor-pointer px-6 py-2 rounded-full font-medium transition-all shadow-sm
            ${
              isUploadActive
                ? "bg-white text-blue-600 border-2 border-transparent"
                : "bg-blue-700 text-white border-2 border-blue-400 hover:bg-blue-800"
            }
          `}
        >
          <span>{isUploadActive ? "+ Add More Files" : "Upload XML"}</span>

          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            className="hidden"
            // multiple
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </header>
  );
};
