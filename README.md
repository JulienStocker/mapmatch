# MapMatch - Real Estate Mapping Tool

MapMatch is a comprehensive real estate mapping tool that allows users to explore properties at different geographic levels (city, neighborhood, street) and view points of interest such as grocery stores, shopping malls, transportation hubs, and hospitals.

## Features

- **Multi-level map navigation**: Seamlessly switch between city, neighborhood, and street-level views
- **Points of Interest (POI) overlay**: Toggle visibility of different POI types (groceries, malls, transport, hospitals)
- **Property listings**: Browse available properties with detailed information
- **Interactive interface**: Select properties and POIs to view detailed information
- **Database integration**: MongoDB backend for storing property and POI data
- **RESTful API**: Complete API for managing properties and POIs

## Tech Stack

### Frontend
- React.js
- Mapbox GL / Leaflet for mapping
- Styled Components for styling
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose for data storage
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Mapbox API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mapmatch.git
   cd mapmatch
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   REACT_APP_MAPBOX_TOKEN=your_mapbox_api_token
   ```

4. Replace the mapbox token in `src/components/MapView.js` with your token:
   ```javascript
   mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
   ```

### Running the application

1. For development (runs both client and server with hot-reloading):
   ```
   npm run dev
   ```

2. For production:
   ```
   npm run build
   npm start
   ```

## API Endpoints

### Properties

- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get a specific property by ID
- `GET /api/properties/type/:type` - Get properties by type (sale, rent, new_construction)
- `GET /api/properties/radius/:lat/:lng/:radius` - Get properties within a radius
- `POST /api/properties` - Create a new property
- `PUT /api/properties/:id` - Update a property
- `DELETE /api/properties/:id` - Delete a property

### Points of Interest (POI)

- `GET /api/poi` - Get all POIs
- `GET /api/poi/:id` - Get a specific POI by ID
- `GET /api/poi/type/:type` - Get POIs by type (groceries, malls, transport, hospitals)
- `GET /api/poi/radius/:lat/:lng/:radius` - Get POIs within a radius
- `GET /api/poi/radius/:lat/:lng/:radius/type/:type` - Get POIs of a specific type within a radius
- `POST /api/poi` - Create a new POI
- `PUT /api/poi/:id` - Update a POI
- `DELETE /api/poi/:id` - Delete a POI

## Future Enhancements

- User authentication and profiles
- Saved/favorite properties
- Advanced filtering (price range, bedrooms, etc.)
- Property comparison tool
- Integration with real estate listing services
- Mobile app version

## License

This project is licensed under the ISC License.

## Acknowledgments

- Mapbox/Leaflet for mapping capabilities
- MongoDB for database solutions
- React community for component libraries and tools 