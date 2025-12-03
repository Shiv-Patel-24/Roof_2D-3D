import { useState } from 'react';
import { parseRoofXML, type RoofData } from './utils/xmlParser';
import { Roof2DView } from './components/Roof2DView';
import { Roof3DView } from './components/Roof3DView';
import { MeasurementsPanel } from './components/MeasurementsPanel';
import { ReportHeader } from './components/ReportHeader';
import './App.css';

export default function App() {
  const [roofData, setRoofData] = useState<RoofData | null>(null);
  const [view, setView] = useState<'2d' | '3d'>('3d');
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedBuiltin, setSelectedBuiltin] = useState('eagleview-data-2.xml');
  const [isCustomUpload, setIsCustomUpload] = useState(false);

  const loadBuiltinFile = async (filename: string) => {
    setLoading(true);
    setError(null);
    setIsCustomUpload(false);
    
    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) throw new Error(`Failed to load ${filename}`);
      const xmlText = await response.text();
      
      const data = parseRoofXML(xmlText);
      
      if (!data.faces.length) {
        throw new Error('No roof faces found in XML');
      }
      
      // console.log('Parsing successful:', data.faces.length, 'faces,', data.lines.length, 'lines');
      setRoofData(data);
    } catch (e: any) {
      console.error('Error loading built-in file:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (xmlText: string) => {
    setLoading(true);
    setError(null);
    setIsCustomUpload(true);
    
    setTimeout(() => {
      try {
        const data = parseRoofXML(xmlText);
        
        if (!data.faces.length) {
          throw new Error('No roof faces found in uploaded XML');
        }
        
        // console.log('✅ Upload successful:', data.faces.length, 'faces,', data.lines.length, 'lines');
        setRoofData(data);
        setLoading(false);
      } catch (e: any) {
        console.error('❌ Parse error:', e);
        setError(`Parse error: ${e.message}`);
        setLoading(false);
      }
    }, 100);
  };

  // useEffect(() => {
  //   loadBuiltinFile(selectedBuiltin);
  // }, []); 

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading roof data...</p>
      </div>
    );
  }

  if (error || !roofData) {
    return (
      <div className="error-container">
        <h3>Error Loading Data</h3>
        <p>{error || 'No data available'}</p>
        <button 
          onClick={() => loadBuiltinFile(selectedBuiltin)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ReportHeader 
        selectedFile={selectedBuiltin}
        onFileChange={(filename) => {
          setSelectedBuiltin(filename);
          loadBuiltinFile(filename);
        }}
        onUploadXml={handleUpload}
        isUploadActive={isCustomUpload}
        totalFaces={roofData.faces.length}
        totalLines={roofData.lines.length}
      />

      <div className="main-content">
        <div className="visualization-panel">
          <div className="view-controls">
            <button 
              className={`view-btn ${view === '3d' ? 'active' : ''}`}
              onClick={() => setView('3d')}
            >
              <span className="icon">🏠</span> 3D View
            </button>
            <button 
              className={`view-btn ${view === '2d' ? 'active' : ''}`}
              onClick={() => setView('2d')}
            >
              <span className="icon">📐</span> 2D Blueprint
            </button>
            <button 
              className="view-btn"
              onClick={() => setShowMeasurements(!showMeasurements)}
            >
              <span className="icon">📊</span> {showMeasurements ? 'Hide' : 'Show'} Data
            </button>
          </div>

          <div className="view-container">
            {view === '2d' ? (
              <Roof2DView faces={roofData.faces} lines={roofData.lines} />
            ) : (
              <Roof3DView faces={roofData.faces} lines={roofData.lines} />
            )}
          </div>
        </div>

        {showMeasurements && (
          <MeasurementsPanel faces={roofData.faces} lines={roofData.lines} />
        )}
      </div>
    </div>
  );
}
