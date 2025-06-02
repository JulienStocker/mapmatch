import React, { useState, useRef, useContext } from 'react';
import styled from 'styled-components';
import { CSVContext } from '../contexts/CSVContext';

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
  gap: 10px;
`;

const Button = styled.button`
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

const ImportButton = styled(Button)`
  background-color: #3498db;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ScoutCSV = () => {
  const { csvData, setCsvData, columns, setColumns } = useContext(CSVContext);
  const fileInputRef = useRef(null);
  
  // Export CSV function
  const exportCSV = () => {
    const header = columns.join(',');
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

  // Import CSV function
  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      
      if (lines.length > 0) {
        // Parse the header row to get column names
        const headerRow = lines[0].split(',');
        setColumns(headerRow);
        
        // Parse data rows
        const parsedData = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() !== '') {
            const row = lines[i].split(',');
            
            // Ensure each row has the same number of columns as the header
            while (row.length < headerRow.length) {
              row.push('');
            }
            
            parsedData.push(row);
          }
        }
        
        // Add an empty row at the end for new entries
        parsedData.push(Array(headerRow.length).fill(''));
        
        setCsvData(parsedData);
      }
    };
    reader.readAsText(file);
    
    // Reset the file input to allow re-importing the same file
    event.target.value = '';
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  return (
    <CSVContainer>
      <ButtonBar>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ImportButton onClick={handleImportClick}>
            Import CSV
          </ImportButton>
          <HiddenInput 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            onChange={importCSV}
          />
          <Button onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </ButtonBar>
      <CSVTable>
        <Table>
          <THead>
            <TR>
              {columns.map((column, index) => (
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
                          setCsvData([...newData, Array(columns.length).fill('')]);
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