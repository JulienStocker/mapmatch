import React from 'react';
import styled from 'styled-components';
import ScoutSidebar from './ScoutSidebar';
import ScoutCSV from './ScoutCSV';

const ScoutContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const SidebarWrapper = styled.div`
  flex: 0 0 320px;
  height: 100%;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 20px;
  overflow: hidden;
`;

const ScoutView = () => {
  return (
    <ScoutContainer>
      <SidebarWrapper>
        <ScoutSidebar />
      </SidebarWrapper>
      <ContentWrapper>
        <ScoutCSV />
      </ContentWrapper>
    </ScoutContainer>
  );
};

export default ScoutView; 