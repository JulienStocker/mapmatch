import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  
  span {
    margin-left: 8px;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
  
  svg {
    margin-right: 5px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  font-size: 16px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Header = ({ toggleSidebar }) => {
  return (
    <HeaderContainer>
      <Logo>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
        </svg>
        <span>MapMatch</span>
      </Logo>
      
      <NavLinks>
        <NavLink href="#">Properties</NavLink>
        <NavLink href="#">Map</NavLink>
        <NavLink href="#">Saved</NavLink>
      </NavLinks>
      
      <MenuButton onClick={toggleSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
        Toggle Sidebar
      </MenuButton>
    </HeaderContainer>
  );
};

export default Header; 