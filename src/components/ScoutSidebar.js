import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { CSVContext } from '../contexts/CSVContext';

const SidebarContainer = styled.div`
  width: 320px;
  height: 100%;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SidebarSection = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
`;

// New styled components for the updated layout
const WebsiteButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const WebsiteButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  flex: 1;
  min-width: 80px;
  
  &:hover {
    background-color: #3e8e41;
  }
`;

const InsertSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const InsertInput = styled.input`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const AddButton = styled.button`
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #1a252f;
  }
`;

const ScoutSidebar = () => {
  const { csvData, setCsvData, columns } = useContext(CSVContext);
  const [linkInput, setLinkInput] = useState('');

  // Website URLs for each source
  const sourceUrls = {
    homegate: "https://www.homegate.ch",
    immoscout24: "https://www.immoscout24.ch",
    comparis: "https://en.comparis.ch/immobilien/default"
  };

  // Open website for a specific source
  const openWebsite = (source) => {
    window.open(sourceUrls[source], '_blank');
    console.log(`Opening website for ${source}`);
  };

  // Add a new blank row to the Excel data
  const addBlankRow = () => {
    if (columns.length === 0) {
      // If no columns exist, create default columns
      const defaultColumns = ['Property Link', 'Address', 'Price', 'Description'];
      const newRow = Array(defaultColumns.length).fill('');
      // Add the link to the first column if provided
      if (linkInput.trim()) {
        newRow[0] = linkInput.trim();
      }
      setCsvData([newRow]);
    } else {
      // Add a blank row with empty values for each column
      const newRow = Array(columns.length).fill('');
      // Try to find a column that looks like it should contain links
      const linkColumnIndex = columns.findIndex(col => 
        col.toLowerCase().includes('link') || 
        col.toLowerCase().includes('url') || 
        col.toLowerCase().includes('property')
      );
      
      // Add the link to the appropriate column if found, otherwise add to first column
      if (linkInput.trim()) {
        const targetIndex = linkColumnIndex !== -1 ? linkColumnIndex : 0;
        newRow[targetIndex] = linkInput.trim();
      }
      
      setCsvData([...csvData, newRow]);
    }
    
    // Clear the input after adding
    setLinkInput('');
    console.log('Added new row with link:', linkInput);
  };

  return (
    <SidebarContainer>
      <SidebarSection>
        <SectionTitle>Scout Settings</SectionTitle>
        <p>Select a source and click to visit the property website.</p>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>Data Sources</SectionTitle>
        
        <WebsiteButtonRow>
          <WebsiteButton onClick={() => openWebsite('homegate')}>
            Homegate
          </WebsiteButton>
          <WebsiteButton onClick={() => openWebsite('immoscout24')}>
            Immoscout24
          </WebsiteButton>
          <WebsiteButton onClick={() => openWebsite('comparis')}>
            Comparis
          </WebsiteButton>
        </WebsiteButtonRow>
        
        <InsertSection>
          <InsertInput
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Paste property link here..."
          />
          <AddButton onClick={addBlankRow}>
            Add
          </AddButton>
        </InsertSection>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>Instructions</SectionTitle>
        <p>1. Click the website buttons to visit property sites</p>
        <p>2. Paste a property link and click "Add" to insert it into the Excel sheet</p>
        <p>3. Review and edit the data in the Excel viewer</p>
        <p>4. Use the Import button to load data from an Excel file</p>
        <p>5. Use the Export button to save as Excel file</p>
      </SidebarSection>
    </SidebarContainer>
  );
};

export default ScoutSidebar; 