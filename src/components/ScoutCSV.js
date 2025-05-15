import React, { useState } from 'react';
import styled from 'styled-components';

const CSVContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CSVTable = styled.div`
  flex: 1;
  overflow: auto;
  border: 1px solid #e0e0e0;
  background-color: white;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const THead = styled.thead`
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
`;

const TH = styled.th`
  padding: 10px;
  border: 1px solid #e0e0e0;
  text-align: left;
  font-weight: 500;
`;

const TD = styled.td`
  padding: 10px;
  border: 1px solid #e0e0e0;
  min-width: 150px;
`;

const TR = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
`;

const ExportButton = styled.button`
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #1a252f;
  }
`;

// Initial columns for the CSV
const initialColumns = ['Address', 'Price', 'Rooms', 'Area', 'Latitude', 'Longitude', 'URL', 'Notes'];

const ScoutCSV = () => {
  const [csvData, setCsvData] = useState([
    // Empty initial data with one blank row
    Array(initialColumns.length).fill('')
  ]);
  
  // Export CSV function
  const exportCSV = () => {
    const header = initialColumns.join(',');
    const rows = csvData.map(row => row.join(','));
    const csv = [header, ...rows].join('\n');
    
    // Create a download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `property_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <CSVContainer>
      <ButtonBar>
        <ExportButton onClick={exportCSV}>
          Export CSV
        </ExportButton>
      </ButtonBar>
      <CSVTable>
        <Table>
          <THead>
            <TR>
              {initialColumns.map((column, index) => (
                <TH key={index}>{column}</TH>
              ))}
            </TR>
          </THead>
          <tbody>
            {csvData.map((row, rowIndex) => (
              <TR key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TD key={cellIndex}>
                    <input
                      type="text"
                      value={cell}
                      style={{ 
                        width: '100%', 
                        border: 'none',
                        background: 'transparent',
                        outline: 'none'
                      }}
                      onChange={(e) => {
                        const newData = [...csvData];
                        newData[rowIndex][cellIndex] = e.target.value;
                        setCsvData(newData);
                        
                        // Add a new row if we're editing the last row
                        if (rowIndex === csvData.length - 1) {
                          setCsvData([...newData, Array(initialColumns.length).fill('')]);
                        }
                      }}
                    />
                  </TD>
                ))}
              </TR>
            ))}
          </tbody>
        </Table>
      </CSVTable>
    </CSVContainer>
  );
};

export default ScoutCSV; 