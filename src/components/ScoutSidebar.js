import React from 'react';
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
  margin-bottom: 10px;
  color: #333;
`;

const ScoutSidebar = () => {
  return (
    <SidebarContainer>
      <SidebarSection>
        <SectionTitle>Scout Settings</SectionTitle>
        <p>This is the Scout sidebar. You can add controls specific to Scout mode here.</p>
      </SidebarSection>
    </SidebarContainer>
  );
};

export default ScoutSidebar; 