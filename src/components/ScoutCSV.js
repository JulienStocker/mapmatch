import React, { useState, useRef, useContext } from 'react';
import styled from 'styled-components';
import { CSVContext } from '../contexts/CSVContext';
import { MapContext } from '../contexts/MapContext';
import * as XLSX from 'xlsx';

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

const ExportButton = styled(Button)`
  background-color: #2c3e50;
  
  &:hover {
    background-color: #1a252f;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

// Styled component for clickable URL
const LinkIcon = styled.span`
  cursor: pointer;
  color: #3498db;
  font-size: 16px;
  margin-left: 5px;
  &:hover {
    color: #2980b9;
  }
`;

// Add a modal for coordinate entry
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ModalButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &.cancel {
    background-color: #e0e0e0;
    &:hover {
      background-color: #d0d0d0;
    }
  }
  
  &.confirm {
    background-color: #2c3e50;
    color: white;
    &:hover {
      background-color: #1a252f;
    }
  }
`;

const ScoutCSV = () => {
  const { csvData, setCsvData, columns, setColumns, extractCoordsFromMapsUrl } = useContext(CSVContext);
  const { setProperties } = useContext(MapContext);
  const fileInputRef = useRef(null);
  
  // State for the coordinate input modal
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [coordLatValue, setCoordLatValue] = useState('');
  const [coordLngValue, setCoordLngValue] = useState('');
  const [currentRow, setCurrentRow] = useState(null);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  
  // Export to Excel function
  const exportToExcel = () => {
    try {
      console.log("Exporting data to Excel:", csvData);
      
      // Filter out empty rows except for the last one
      const nonEmptyData = csvData.filter((row, index) => {
        // Keep the last row or rows with actual data
        return index === csvData.length - 1 || row.some(cell => cell.trim() !== '');
      });
      
      // Prepare data for export - ensure all cells are strings
      const exportData = [
        columns.map(col => col.toString()), // Headers as strings
        ...nonEmptyData.map(row => 
          row.map(cell => cell !== null && cell !== undefined ? cell.toString() : '')
        )
      ];
      
      console.log("Formatted export data:", exportData);
      
      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      
      // Set column widths
      const colWidths = columns.map(() => ({ width: 20 })); // Default width
      ws['!cols'] = colWidths;
      
      // Create workbook and add the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Properties');
      
      // Generate Excel file and trigger download
      const filename = `property_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log("Saving Excel file:", filename);
      XLSX.writeFile(wb, filename);
      
      console.log("Excel export complete");
    } catch (error) {
      console.error("Excel export failed:", error);
      alert(`Failed to export Excel file: ${error.message}`);
    }
  };

  // Import Excel function
  const importExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // For debugging
    console.log("Importing Excel file:", file.name);

    try {
      // Create a secondary import function to try if the main one fails
      const tryAlternativeImport = () => {
        console.log("Trying alternative import method...");
        const fileReader = new FileReader();
        
        fileReader.onload = (event) => {
          try {
            const arrayBuffer = event.target.result;
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            console.log("Alternative method - workbook:", workbook);
            processWorkbook(workbook);
          } catch (altError) {
            console.error("Alternative import method failed:", altError);
            alert(`All import methods failed. Please try a different Excel file. Error: ${altError.message}`);
          }
        };
        
        fileReader.readAsArrayBuffer(file);
      };

      // Process workbook function (shared between both methods)
      const processWorkbook = (workbook) => {
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        if (!worksheetName) {
          throw new Error("No worksheet found in the Excel file");
        }
        
        console.log("Found worksheet:", worksheetName);
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert worksheet to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log("Parsed Excel data:", jsonData);
        
        if (jsonData && jsonData.length > 0) {
          // First row contains column headers
          const headerRow = jsonData[0].map(header => 
            header !== null && header !== undefined ? header.toString() : '');
          
          if (headerRow.length === 0) {
            throw new Error("No headers found in Excel file");
          }
          
          console.log("Headers found:", headerRow);
          setColumns(headerRow);
          
          // Rest of rows contain data
          const dataRows = jsonData.slice(1);
          
          // Ensure each row has the same number of columns as the header
          const formattedData = dataRows.map(row => {
            // Convert all values to strings and handle undefined/null
            const formattedRow = Array.isArray(row) ? row.map(cell => 
              cell !== null && cell !== undefined ? cell.toString() : '') : [];
            
            // Ensure row has correct length
            while (formattedRow.length < headerRow.length) {
              formattedRow.push('');
            }
            return formattedRow;
          });
          
          // Add an empty row at the end for new entries
          formattedData.push(Array(headerRow.length).fill(''));
          
          console.log("Formatted data:", formattedData);
          setCsvData(formattedData);
        } else {
          throw new Error("No data found in Excel file");
        }
      };

      // Try main import method first
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log("Main method - file loaded successfully");
          const binaryData = e.target.result;
          const workbook = XLSX.read(binaryData, { type: 'binary' });
          processWorkbook(workbook);
        } catch (error) {
          console.error('Primary import method failed:', error);
          tryAlternativeImport();
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error in primary method:', error);
        tryAlternativeImport();
      };
      
      reader.readAsBinaryString(file);
    } catch (outerError) {
      console.error("Outer import error:", outerError);
      alert(`Import failed: ${outerError.message}`);
    }
    
    // Reset the file input to allow re-importing the same file
    event.target.value = '';
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  // Function to check if cell content looks like a URL
  const isURL = (text) => {
    return text && (
      text.startsWith('http://') || 
      text.startsWith('https://') || 
      text.startsWith('www.')
    );
  };

  // Function to open URL in new tab
  const openURL = (url) => {
    if (!url) return;
    
    let fullUrl = url;
    if (url.startsWith('www.')) {
      fullUrl = 'https://' + url;
    }
    
    window.open(fullUrl, '_blank');
  };

  // Add coordinates to a row when user manually inputs them
  const addCoordinates = (rowIndex, latValue, lngValue) => {
    // Find latitude and longitude column indices
    const latIndex = columns.findIndex(col => 
      col.toLowerCase().includes('lat') || col.toLowerCase() === 'latitude');
    const lngIndex = columns.findIndex(col => 
      col.toLowerCase().includes('lng') || col.toLowerCase().includes('lon') || 
      col.toLowerCase() === 'longitude');
    
    // If columns exist, update them
    if (latIndex !== -1 && lngIndex !== -1) {
      const newData = [...csvData];
      newData[rowIndex][latIndex] = latValue.toString();
      newData[rowIndex][lngIndex] = lngValue.toString();
      setCsvData(newData);
      console.log(`Added coordinates to row ${rowIndex}: Lat=${latValue}, Lng=${lngValue}`);
    } else {
      // If columns don't exist, we need to add them
      const newColumns = [...columns, 'Latitude', 'Longitude'];
      setColumns(newColumns);
      
      // Add empty values to all existing rows for the new columns
      const newData = csvData.map(row => {
        const newRow = [...row];
        while (newRow.length < newColumns.length) {
          newRow.push('');
        }
        return newRow;
      });
      
      // Update the specific row with coordinates
      const latColIndex = newColumns.length - 2; // Second to last column
      const lngColIndex = newColumns.length - 1; // Last column
      newData[rowIndex][latColIndex] = latValue.toString();
      newData[rowIndex][lngColIndex] = lngValue.toString();
      
      setCsvData(newData);
      console.log(`Added new coordinate columns and populated row ${rowIndex}`);
    }
  };
  
  // Handle showing the coordinate modal for a row
  const showCoordinateModal = (rowIndex, row) => {
    setCurrentRow(row);
    setCurrentRowIndex(rowIndex);
    
    // Try to pre-fill with any existing coordinates
    const latIndex = columns.findIndex(col => 
      col.toLowerCase().includes('lat') || col.toLowerCase() === 'latitude');
    const lngIndex = columns.findIndex(col => 
      col.toLowerCase().includes('lng') || col.toLowerCase().includes('lon') || 
      col.toLowerCase() === 'longitude');
    
    if (latIndex !== -1 && row[latIndex]) {
      setCoordLatValue(row[latIndex]);
    } else {
      setCoordLatValue('');
    }
    
    if (lngIndex !== -1 && row[lngIndex]) {
      setCoordLngValue(row[lngIndex]);
    } else {
      setCoordLngValue('');
    }
    
    setShowCoordModal(true);
  };
  
  // Handle confirming coordinate entry
  const handleConfirmCoordinates = () => {
    const latValue = parseFloat(coordLatValue);
    const lngValue = parseFloat(coordLngValue);
    
    if (isNaN(latValue) || isNaN(lngValue) ||
        latValue < -90 || latValue > 90 ||
        lngValue < -180 || lngValue > 180) {
      alert("Please enter valid coordinates:\n- Latitude must be between -90 and 90\n- Longitude must be between -180 and 180");
      return;
    }
    
    // Add the coordinates to the row
    addCoordinates(currentRowIndex, latValue, lngValue);
    
    // Close the modal
    setShowCoordModal(false);
    setCurrentRow(null);
    setCurrentRowIndex(null);
  };

  return (
    <CSVContainer>
      <ButtonBar>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ImportButton onClick={handleImportClick}>
            Import Excel
          </ImportButton>
          <HiddenInput 
            type="file" 
            ref={fileInputRef} 
            accept=".xlsx, .xls" 
            onChange={importExcel}
          />
          <ExportButton onClick={exportToExcel}>
            Export Excel
          </ExportButton>
        </div>
      </ButtonBar>
      <CSVTable>
        <Table>
          <THead>
            <TR>
              {columns.map((column, index) => (
                <TH key={index}>{column}</TH>
              ))}
              <TH>Actions</TH>
            </TR>
          </THead>
          <tbody>
            {csvData.map((row, rowIndex) => (
              <TR key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TD key={cellIndex}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
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
                      {isURL(cell) && (
                        <LinkIcon 
                          onClick={() => openURL(cell)}
                          title="Open link in new tab"
                        >
                          🔗
                        </LinkIcon>
                      )}
                    </div>
                  </TD>
                ))}
                <TD>
                  <button 
                    onClick={() => showCoordinateModal(rowIndex, row)}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#3498db',
                      fontSize: '14px'
                    }}
                  >
                    📍 Set Coordinates
                  </button>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </CSVTable>
      
      {/* Coordinate Input Modal */}
      {showCoordModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>Enter Coordinates</ModalHeader>
            <div>
              <label>Latitude:</label>
              <ModalInput 
                type="text" 
                value={coordLatValue}
                onChange={(e) => setCoordLatValue(e.target.value)}
                placeholder="e.g. 47.0331"
              />
            </div>
            <div>
              <label>Longitude:</label>
              <ModalInput 
                type="text" 
                value={coordLngValue}
                onChange={(e) => setCoordLngValue(e.target.value)}
                placeholder="e.g. 8.3156"
              />
            </div>
            <ModalButtonRow>
              <ModalButton 
                className="cancel"
                onClick={() => setShowCoordModal(false)}
              >
                Cancel
              </ModalButton>
              <ModalButton 
                className="confirm"
                onClick={handleConfirmCoordinates}
              >
                Save Coordinates
              </ModalButton>
            </ModalButtonRow>
          </ModalContent>
        </ModalOverlay>
      )}
    </CSVContainer>
  );
};

export default ScoutCSV; 