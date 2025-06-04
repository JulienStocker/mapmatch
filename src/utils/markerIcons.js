// Map POI types to Ionicons and color schemes
export const getMarkerConfig = (poiType, isSelected = false) => {
  const configs = {
    // Grocery stores
    migros: {
      iconName: 'storefront',
      bgColor: '#fff',
      borderColor: '#ff9f43',
      iconColor: '#ff9f43',
      selectedBgColor: '#ff9f43',
      selectedIconColor: '#fff'
    },
    coop: {
      iconName: 'storefront',
      bgColor: '#fff',
      borderColor: '#ffa94d',
      iconColor: '#ffa94d',
      selectedBgColor: '#ffa94d',
      selectedIconColor: '#fff'
    },
    aldi: {
      iconName: 'storefront',
      bgColor: '#fff',
      borderColor: '#ff922b',
      iconColor: '#ff922b',
      selectedBgColor: '#ff922b',
      selectedIconColor: '#fff'
    },
    lidl: {
      iconName: 'storefront',
      bgColor: '#fff',
      borderColor: '#fd7e14',
      iconColor: '#fd7e14',
      selectedBgColor: '#fd7e14',
      selectedIconColor: '#fff'
    },
    denner: {
      iconName: 'storefront',
      bgColor: '#fff',
      borderColor: '#e8590c',
      iconColor: '#e8590c',
      selectedBgColor: '#e8590c',
      selectedIconColor: '#fff'
    },
    spar: {
      iconName: 'storefront',
      bgColor: '#fff',
      borderColor: '#d9480f',
      iconColor: '#d9480f',
      selectedBgColor: '#d9480f',
      selectedIconColor: '#fff'
    },
    
    // Transportation
    trainStation: {
      iconName: 'train',
      bgColor: '#fff',
      borderColor: '#3498db',
      iconColor: '#3498db',
      selectedBgColor: '#3498db',
      selectedIconColor: '#fff'
    },
    busStop: {
      iconName: 'bus',
      bgColor: '#fff',
      borderColor: '#4dabf7',
      iconColor: '#4dabf7',
      selectedBgColor: '#4dabf7',
      selectedIconColor: '#fff'
    },
    
    // Healthcare
    hospitals: {
      iconName: 'medical',
      bgColor: '#fff',
      borderColor: '#ff4757',
      iconColor: '#ff4757',
      selectedBgColor: '#ff4757',
      selectedIconColor: '#fff'
    },
    
    // Shopping
    malls: {
      iconName: 'bag',
      bgColor: '#fff',
      borderColor: '#9c88ff',
      iconColor: '#9c88ff',
      selectedBgColor: '#9c88ff',
      selectedIconColor: '#fff'
    },
    
    // Properties
    properties: {
      iconName: 'home',
      bgColor: '#fff',
      borderColor: '#E74C3C',
      iconColor: '#E74C3C',
      selectedBgColor: '#E74C3C',
      selectedIconColor: '#fff'
    },
    
    // Main pin (location marker)
    location: {
      iconName: 'location',
      bgColor: '#fff',
      borderColor: '#ff0000',
      iconColor: '#ff0000',
      selectedBgColor: '#ff0000',
      selectedIconColor: '#fff'
    },
    
    // Generic fallback
    default: {
      iconName: 'location-outline',
      bgColor: '#fff',
      borderColor: '#2d3436',
      iconColor: '#2d3436',
      selectedBgColor: '#2d3436',
      selectedIconColor: '#fff'
    }
  };

  const config = configs[poiType] || configs.default;
  
  return {
    iconName: config.iconName,
    bgColor: isSelected ? config.selectedBgColor : config.bgColor,
    borderColor: config.borderColor,
    iconColor: isSelected ? config.selectedIconColor : config.iconColor,
    size: '20px'
  };
};

// Get different icon variants for different contexts
export const getIconVariant = (iconName, variant = 'default') => {
  const variants = {
    default: iconName,
    outline: `${iconName}-outline`,
    sharp: `${iconName}-sharp`
  };
  
  return variants[variant] || iconName;
};

// Alternative icons for different purposes
export const getAlternativeIcons = () => ({
  // Location pins
  locationPins: ['location', 'pin', 'navigate', 'compass'],
  
  // Grocery stores
  grocery: ['storefront', 'basket', 'cart', 'bag'],
  
  // Transportation
  transport: ['car', 'bus', 'train', 'bicycle', 'walk'],
  
  // Healthcare
  medical: ['medical', 'fitness', 'heart', 'pulse'],
  
  // Shopping
  shopping: ['bag', 'storefront', 'card', 'pricetag'],
  
  // Properties
  housing: ['home', 'business', 'bed', 'key']
}); 