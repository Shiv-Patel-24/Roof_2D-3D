// import './ReportHeader.css';

// interface ReportHeaderProps {
//   selectedFile: string;
//   onFileChange: (file: string) => void;
//   totalFaces: number;
//   totalLines: number;
// }

// export const ReportHeader = ({ selectedFile, onFileChange, totalFaces, totalLines }: ReportHeaderProps) => {
//   return (
//     <header className="report-header">
//       <div className="header-left">
//         <div className="logo">
//           <h1>🏘️ RoofView</h1>
//           <p className="tagline">Professional Roof Measurement Analysis</p>
//         </div>
//       </div>

//       <div className="header-center">
//         <div className="report-info">
//           <div className="info-item">
//             <span className="label">Total Faces</span>
//             <span className="value">{totalFaces}</span>
//           </div>
//           <div className="info-item">
//             <span className="label">Total Lines</span>
//             <span className="value">{totalLines}</span>
//           </div>
//           <div className="info-item">
//             <span className="label">Total Area</span>
//             <span className="value">
//               {Math.round(totalFaces * 100)} sq ft
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="header-right">
//         <input type="file" />
//         <button >Submit</button>
//         <select 
//           value={selectedFile}
//           onChange={(e) => onFileChange(e.target.value)}
//           className="file-selector"
//         >
//           <option value="eagleview-data.xml">Building 1</option>
//           <option value="eagleview-data-2.xml">Building 2</option>
          
//         </select>
         
//       </div>
//     </header>
//   );
// };


import './ReportHeader.css';

interface ReportHeaderProps {
  selectedFile: string;
  onFileChange: (file: string) => void;
  onUploadXml: (xmlText: string) => void;
  isUploadActive: boolean;
  totalFaces: number;
  totalLines: number;
}

export const ReportHeader = ({ 
  selectedFile, 
  onFileChange, 
  onUploadXml,
  isUploadActive,
  totalFaces, 
  totalLines 
}: ReportHeaderProps) => {

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // console.log('📤 File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Use FileReader to read the file properly
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const xmlText = event.target?.result as string;
      
      if (!xmlText || xmlText.trim().length === 0) {
        console.error('❌ File is empty or could not be read');
        alert('Error: File is empty or could not be read');
        return;
      }
      
      // console.log('✅ File read successfully, length:', xmlText.length);
      // console.log('📄 First 200 characters:', xmlText.substring(0, 200));
      
      onUploadXml(xmlText);
    };
    
    reader.onerror = (error) => {
      console.error(' Error reading file:', error);
      alert('Error reading file. Please try again.');
    };
    
    // Read as text
    reader.readAsText(file);
    
    e.target.value = '';
  };

  return (
    <header className="report-header">
      <div className="header-left">
        <div className="logo">
          <h1>🏘️ RoofView</h1>
          <p className="tagline">Professional Roof Measurement Analysis</p>
        </div>
      </div>

      <div className="header-center">
        <div className="report-info">
          <div className="info-item">
            <span className="label">Total Faces</span>
            <span className="value">{totalFaces}</span>
          </div>
          <div className="info-item">
            <span className="label">Total Lines</span>
            <span className="value">{totalLines}</span>
          </div>
          <div className="info-item">
            <span className="label">Source</span>
            <span className="value">{isUploadActive ? '📤 Upload' : '📁 Built-in'}</span>
          </div>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select 
          value={selectedFile}
          onChange={(e) => onFileChange(e.target.value)}
          className="file-selector"
          disabled={isUploadActive}
          style={{ opacity: isUploadActive ? 0.5 : 1 }}
        >
          <option value="eagleview-xml-response-1.xml">Building 1</option>
          {/* <option value="eagleview-xml-response-2.xml">Building 2</option> */}
        </select>

        <label 
          className="file-selector upload-btn"
          style={{ 
            cursor: 'pointer',
            background: isUploadActive ? '#4CAF50' : 'rgba(255,255,255,0.1)',
            fontWeight: isUploadActive ? 'bold' : 'normal'
          }}
        >
          {isUploadActive ? '✓ Custom' : '+ Upload'} XML
          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </header>
  );
};
