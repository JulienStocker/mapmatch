import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import axios from 'axios';
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
  background-color: ${props => props.loading ? '#6c757d' : '#2c3e50'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  min-width: 60px;
  
  &:hover {
    background-color: ${props => props.loading ? '#6c757d' : '#1a252f'};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StatusMessage = styled.div`
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  
  &.success {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
  }
  
  &.error {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }
  
  &.info {
    background-color: #d1ecf1;
    border: 1px solid #bee5eb;
    color: #0c5460;
  }
`;

const PropertyPreview = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  
  .property-title {
    font-weight: bold;
    margin-bottom: 5px;
    color: #2c3e50;
  }
  
  .property-detail {
    margin-bottom: 3px;
    display: flex;
    justify-content: space-between;
  }
  
  .detail-label {
    font-weight: 500;
    color: #6c757d;
  }
  
  .detail-value {
    color: #495057;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #2c3e50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 5px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ScoutSidebar = () => {
  const { csvData, setCsvData, columns } = useContext(CSVContext);
  const [linkInput, setLinkInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [lastScrapedProperty, setLastScrapedProperty] = useState(null);

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

  // Validate URL format
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Scrape property from URL and add to database
  const scrapeAndAddProperty = async () => {
    const url = linkInput.trim();
    
    if (!url) {
      setStatus({ type: 'error', message: 'Please enter a property URL' });
      return;
    }

    if (!isValidUrl(url)) {
      setStatus({ type: 'error', message: 'Please enter a valid URL' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Extracting property data...' });
    setLastScrapedProperty(null);

    try {
      // Make API call to scrape property
      const response = await axios.post('/api/properties/scrape', { url });
      
      if (response.data.success) {
        const property = response.data.data;
        setLastScrapedProperty(property);
        
        if (response.data.isNew) {
          setStatus({ 
            type: 'success', 
            message: '✅ Property successfully extracted and saved to database!' 
          });
        } else {
          setStatus({ 
            type: 'info', 
            message: '🔄 Property already exists in database' 
          });
        }

        // Also add to CSV for immediate viewing
        addToCSV(property, url);
        
        // Clear input
        setLinkInput('');
        
      } else {
        setStatus({ 
          type: 'error', 
          message: `❌ Failed to extract property: ${response.data.error}` 
        });
      }

    } catch (error) {
      console.error('Error scraping property:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      setStatus({ 
        type: 'error', 
        message: `❌ Error: ${errorMessage}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Add property data to CSV
  const addToCSV = (property, url) => {
    if (columns.length === 0) {
      // Create columns based on property data
      const newColumns = [
        'Property Link', 'Address', 'Price', 'Rooms', 'Bathrooms', 
        'Area m²', 'Zip Code', 'Title', 'Type'
      ];
      const newRow = [
        url,
        property.address?.full || '',
        property.priceRaw || property.price?.toString() || '',
        property.rooms || '',
        property.bathrooms?.toString() || '',
        property.areaM2?.toString() || '',
        property.address?.zip || '',
        property.title || '',
        property.type || ''
      ];
      setCsvData([newRow]);
    } else {
      // Map property data to existing columns
      const newRow = columns.map(column => {
        const col = column.toLowerCase();
        if (col.includes('link') || col.includes('url')) return url;
        if (col.includes('address')) return property.address?.full || '';
        if (col.includes('price')) return property.priceRaw || property.price?.toString() || '';
        if (col.includes('room')) return property.rooms || '';
        if (col.includes('bathroom')) return property.bathrooms?.toString() || '';
        if (col.includes('area') || col.includes('m²') || col.includes('sqm')) return property.areaM2?.toString() || '';
        if (col.includes('zip') || col.includes('postal')) return property.address?.zip || '';
        if (col.includes('title') || col.includes('description')) return property.title || '';
        if (col.includes('type')) return property.type || '';
        return '';
      });
      
      setCsvData([...csvData, newRow]);
    }
  };

  // Add a blank row (fallback for manual entry)
  const addBlankRow = () => {
    if (columns.length === 0) {
      const defaultColumns = ['Property Link', 'Address', 'Price', 'Description'];
      const newRow = Array(defaultColumns.length).fill('');
      if (linkInput.trim()) {
        newRow[0] = linkInput.trim();
      }
      setCsvData([newRow]);
    } else {
      const newRow = Array(columns.length).fill('');
      const linkColumnIndex = columns.findIndex(col => 
        col.toLowerCase().includes('link') || 
        col.toLowerCase().includes('url') || 
        col.toLowerCase().includes('property')
      );
      
      if (linkInput.trim()) {
        const targetIndex = linkColumnIndex !== -1 ? linkColumnIndex : 0;
        newRow[targetIndex] = linkInput.trim();
      }
      
      setCsvData([...csvData, newRow]);
    }
    
    setLinkInput('');
  };

  // Clear status message after a delay
  React.useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <SidebarContainer>
      <SidebarSection>
        <SectionTitle>🏠 Property Scout</SectionTitle>
        <p>AI-powered property data extraction from real estate websites.</p>
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
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && !loading && scrapeAndAddProperty()}
          />
          <AddButton 
            onClick={scrapeAndAddProperty}
            loading={loading}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                AI
              </>
            ) : (
              'Add'
            )}
          </AddButton>
        </InsertSection>

        {status && (
          <StatusMessage className={status.type}>
            {status.message}
          </StatusMessage>
        )}

        {lastScrapedProperty && (
          <PropertyPreview>
            <div className="property-title">{lastScrapedProperty.title}</div>
            <div className="property-detail">
              <span className="detail-label">Price:</span>
              <span className="detail-value">{lastScrapedProperty.priceRaw || lastScrapedProperty.price}</span>
            </div>
            <div className="property-detail">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{lastScrapedProperty.address?.full}</span>
            </div>
            {lastScrapedProperty.rooms && (
              <div className="property-detail">
                <span className="detail-label">Rooms:</span>
                <span className="detail-value">{lastScrapedProperty.rooms}</span>
              </div>
            )}
            {lastScrapedProperty.areaM2 && (
              <div className="property-detail">
                <span className="detail-label">Area:</span>
                <span className="detail-value">{lastScrapedProperty.areaM2} m²</span>
              </div>
            )}
          </PropertyPreview>
        )}
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>Instructions</SectionTitle>
        <p>1. Click website buttons to browse properties</p>
        <p>2. Paste a property URL and click "Add" for AI extraction</p>
        <p>3. Property data will be automatically extracted and saved</p>
        <p>4. Review extracted data in the Excel viewer below</p>
        <p>5. Export data using the Export button</p>
        
        <div style={{ marginTop: '15px', padding: '8px', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '11px' }}>
          <strong>💡 Powered by OpenAI:</strong> Our AI automatically extracts address, price, rooms, bathrooms, area, and other property details from any real estate listing.
        </div>
      </SidebarSection>
    </SidebarContainer>
  );
};

export default ScoutSidebar; 