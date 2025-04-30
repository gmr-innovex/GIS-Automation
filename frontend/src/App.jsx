import React, { useState } from 'react';
import { Layout, message } from 'antd';
import CoordinateInput from './components/CoordinateInput';
import axios from 'axios';

const { Header, Content } = Layout;

// Configure axios defaults
axios.defaults.withCredentials = true;

const App = () => {
  const [loading, setLoading] = useState(false);

  const handleCoordinatesSubmit = async (coordinates) => {
    try {
      setLoading(true);
      console.log('Input Coordinates:', coordinates);
      
      // Ensure all values are properly serialized numbers
      const formattedCoordinates = coordinates.map(coord => ({
        lat_deg: Number(coord.lat_deg),
        lat_min: Number(coord.lat_min),
        lat_sec: Number(coord.lat_sec),
        lat_dir: String(coord.lat_dir),
        lon_deg: Number(coord.lon_deg),
        lon_min: Number(coord.lon_min),
        lon_sec: Number(coord.lon_sec),
        lon_dir: String(coord.lon_dir),
        amsl: Number(coord.amsl)
      }));
      
      const response = await axios.post(
        'http://localhost:5000/api/convert', 
        { coordinates: formattedCoordinates },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/dxf'
          }
        }
      );
      
      // Check if the response is valid
      if (response.status !== 200) {
        throw new Error(`Server returned status ${response.status}`);
      }
      
      // Get the converted values from headers
      const convertedValues = response.headers['x-converted-values'];
      if (convertedValues) {
        console.log('Converted Values:', JSON.parse(convertedValues));
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'coordinates.dxf');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();
      
      message.success('DXF file downloaded successfully!');
    } catch (error) {
      console.error('Error submitting coordinates:', error);
      message.error('Error generating DXF file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white', fontSize: '20px' }}>
        Coordinate Converter
      </Header>
      <Content style={{ padding: '24px' }}>
        <CoordinateInput 
          onCoordinatesSubmit={handleCoordinatesSubmit} 
          loading={loading}
        />
      </Content>
    </Layout>
  );
};

export default App;