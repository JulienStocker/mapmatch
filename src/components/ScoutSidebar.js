import React, { useState } from 'react';
import styled from 'styled-components';

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

const SourceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SourceName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RunButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #3e8e41;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.status === 'running' ? '#ffc107' : 
                              props.status === 'complete' ? '#4caf50' : 
                              props.status === 'error' ? '#f44336' : '#cccccc'};
  margin-right: 5px;
`;

const ScoutSidebar = () => {
  // Track the status of each source
  const [sourcesStatus, setSourcesStatus] = useState({
    homegate: 'idle',
    immoscout24: 'idle',
    comparis: 'idle'
  });

  // Website URLs for each source
  const sourceUrls = {
    homegate: "https://www.homegate.ch",
    immoscout24: "https://www.immoscout24.ch",
    comparis: "https://en.comparis.ch/immobilien/default"
  };

  // Open website for a specific source
  const openWebsite = (source) => {
    // Open the website in a new tab
    window.open(sourceUrls[source], '_blank');
    
    // For a real implementation, this would also track that the site was visited
    console.log(`Opening website for ${source}`);
  };

  return (
    <SidebarContainer>
      <SidebarSection>
        <SectionTitle>Scout Settings</SectionTitle>
        <p>Select a source and click Open to visit the property website.</p>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>Data Sources</SectionTitle>
        
        <SourceItem>
          <SourceName>
            <StatusIndicator status={sourcesStatus.homegate} />
            Homegate
          </SourceName>
          <RunButton 
            onClick={() => openWebsite('homegate')}
          >
            Open
          </RunButton>
        </SourceItem>
        
        <SourceItem>
          <SourceName>
            <StatusIndicator status={sourcesStatus.immoscout24} />
            Immoscout24
          </SourceName>
          <RunButton 
            onClick={() => openWebsite('immoscout24')}
          >
            Open
          </RunButton>
        </SourceItem>
        
        <SourceItem>
          <SourceName>
            <StatusIndicator status={sourcesStatus.comparis} />
            Comparis
          </SourceName>
          <RunButton 
            onClick={() => openWebsite('comparis')}
          >
            Open
          </RunButton>
        </SourceItem>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>Instructions</SectionTitle>
        <p>1. Click the Open button next to a source to visit the website</p>
        <p>2. Review and edit the data in the CSV viewer</p>
        <p>3. Use the Import button to load data from a CSV file</p>
        <p>4. Use the Export button to save as CSV file</p>
      </SidebarSection>
    </SidebarContainer>
  );
};

export default ScoutSidebar; 