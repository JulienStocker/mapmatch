import React, { createContext, useState } from 'react';

// Initial columns for the CSV
const initialColumns = ['Address', 'Price', 'Rooms', 'Area', 'Latitude', 'Longitude', 'URL', 'Notes'];

export const CSVContext = createContext();

export const CSVProvider = ({ children }) => {
  const [csvData, setCsvData] = useState([
    // Empty initial data with one blank row
    Array(initialColumns.length).fill('')
  ]);
  const [columns, setColumns] = useState(initialColumns);
  
  return (
    <CSVContext.Provider
      value={{
        csvData,
        setCsvData,
        columns,
        setColumns
      }}
    >
      {children}
    </CSVContext.Provider>
  );
}; 