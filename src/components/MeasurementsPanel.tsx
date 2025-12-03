import { useState } from 'react';
import type { RoofFace, RoofLine } from '../utils/xmlParser';
import './MeasurementsPanel.css';

interface MeasurementsPanelProps {
  faces: RoofFace[];
  lines: RoofLine[];
}

export const MeasurementsPanel = ({ faces, lines }: MeasurementsPanelProps) => {
  const [activeTab, setActiveTab] = useState<'faces' | 'lines' | 'summary'>('faces');

  const totalArea = faces.reduce((sum, face) => sum + face.size, 0);
  const avgPitch = faces.reduce((sum, face) => sum + face.pitch, 0) / faces.length;

  return (
    <div className="measurements-panel">
      <div className="panel-header">
        <h3>Measurements</h3>
      </div>

      <div className="panel-tabs">
        <button 
          className={`tab ${activeTab === 'faces' ? 'active' : ''}`}
          onClick={() => setActiveTab('faces')}
        >
          Faces ({faces.length})
        </button>
        <button 
          className={`tab ${activeTab === 'lines' ? 'active' : ''}`}
          onClick={() => setActiveTab('lines')}
        >
          Lines ({lines.length})
        </button>
        <button 
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'faces' && (
          <div className="faces-list">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Face</th>
                  <th>Pitch</th>
                  <th>Area (sq ft)</th>
                  <th>Orient.</th>
                </tr>
              </thead>
              <tbody>
                {faces.map((face) => (
                  <tr key={face.id} style={{color : "black"}}>
                    <td  className="face-designator">{face.designator}</td>
                    <td >{face.pitch}°</td>
                    <td >{face.size}</td>
                    <td>{face.orientation}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'lines' && (
          <div className="lines-list">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Line ID</th>
                  <th>Type</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} style={{color : "black"}}>
                    <td>{line.id}</td>
                    <td>
                      <span className={`line-type ${line.type.toLowerCase()}`}>
                        {line.type}
                      </span>
                    </td>
                    <td>{line.path.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="summary-panel">
            <div className="summary-card">
              <div className="summary-label">Total Roof Area</div>
              <div className="summary-value">{Math.round(totalArea)} sq ft</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Average Pitch</div>
              <div className="summary-value">{avgPitch.toFixed(1)}°</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Faces</div>
              <div className="summary-value">{faces.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Perimeter Lines</div>
              <div className="summary-value">
                {lines.filter(l => l.type === 'EAVE' || l.type === 'RAKE').length}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Ridge Lines</div>
              <div className="summary-value">
                {lines.filter(l => l.type === 'RIDGE').length}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Valley Lines</div>
              <div className="summary-value">
                {lines.filter(l => l.type === 'VALLEY').length}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};
