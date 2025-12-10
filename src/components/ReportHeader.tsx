import React from 'react';

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const loadedFiles: { name: string; xml: string }[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const xmlText = event.target?.result as string;
        loadedFiles.push({ name: file.name, xml: xmlText });
        processedCount++;

        if (processedCount === files.length) {
          onUploadXml(loadedFiles);
        }
      };

      reader.readAsText(file);
    });

    e.target.value = "";
  };

  return (
    <header className="bg-blue-600 h-16 flex items-center px-6 shadow-md z-30">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-3xl">🏘️</span>
        <h1 className='text-white font-bold text-xl tracking-wide'>RoofView Pro</h1>
      </div>

      <div className="flex items-center gap-4">
        <label 
          className={`
            cursor-pointer px-6 py-2 rounded-full font-medium transition-all shadow-sm
            ${isUploadActive 
              ? 'bg-white text-blue-600 border-2 border-transparent' 
              : 'bg-blue-700 text-white border-2 border-blue-400 hover:bg-blue-800'}
          `}
        >
          <span>{isUploadActive ? '+ Add More Files' : 'Upload XML'}</span>
          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            className="hidden"
            multiple 
            onChange={handleFileUpload}
            placeholder='This is input of ReaportHeader'
          />
        </label> 
      </div>
    </header>
  );
};