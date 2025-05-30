import React, { useState } from 'react';
import { Layout, Tabs, message } from 'antd';
import CoordinateInput from './components/CoordinateInput';
import CertificateHistory from './components/CertificateHistory';
import axios from 'axios';

const { Header, Content } = Layout;
const { TabPane } = Tabs;

// Configure axios defaults
axios.defaults.withCredentials = true;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [editCertificate, setEditCertificate] = useState(null);

  const handleCoordinatesSubmit = async (coordinates, certificateData) => {
    try {
      setLoading(true);
      
      if (certificateData) {
        let response;
        
        // If we're editing, update the existing certificate
        if (editCertificate) {
          // Create update data with only the fields we want to update
          const updateData = {
            survey_no: certificateData.survey_no,
            village_name: certificateData.village_name,
            owner: certificateData.owner,
            facility: certificateData.facility,
            coordinates: certificateData.coordinates,
            certificate_type: certificateData.certificate_type
          };
          
          // Debug logging
          console.log('Edit Certificate ID:', editCertificate._id);
          console.log('Update Data being sent:', JSON.stringify(updateData, null, 2));
          
          response = await axios.put(
            `http://localhost:5000/api/certificates/${editCertificate._id}`,
            updateData,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('Backend response:', response.data);
          message.success('Certificate updated successfully!');
        } else {
          // Create new certificate
          response = await axios.post('http://localhost:5000/api/certificates', certificateData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('Backend response:', response.data);
          message.success('Certificate saved successfully!');
        }

        // Only refresh the certificate history if we're on the history tab
        if (activeTab === "2") {
          const historyComponent = document.querySelector('[data-testid="certificate-history"]');
          if (historyComponent) {
            historyComponent.dispatchEvent(new Event('refresh'));
          }
        }
        
        // Clear edit mode after successful save/update
        setEditCertificate(null);
      } else {
        // Handle DXF generation
        // Log the exact coordinates being sent
        console.log('Raw coordinates before processing:', coordinates);
        
        // Ensure all coordinate values are properly formatted
        const processedCoordinates = coordinates.map(coord => ({
          lat_deg: Number(coord.lat_deg),
          lat_min: Number(coord.lat_min),
          lat_sec: Number(coord.lat_sec),
          lat_dir: String(coord.lat_dir).toUpperCase().trim(),
          lon_deg: Number(coord.lon_deg),
          lon_min: Number(coord.lon_min),
          lon_sec: Number(coord.lon_sec),
          lon_dir: String(coord.lon_dir).toUpperCase().trim(),
          amsl: Number(coord.amsl)
        }));
        
        console.log('Processed coordinates:', processedCoordinates);
        
        // Validate coordinates before sending
        const validationErrors = [];
        processedCoordinates.forEach((coord, index) => {
          if (coord.lat_deg < 0 || coord.lat_deg > 90) {
            validationErrors.push(`Coordinate ${index + 1}: Latitude degrees must be between 0 and 90`);
          }
          if (coord.lon_deg < 0 || coord.lon_deg > 180) {
            validationErrors.push(`Coordinate ${index + 1}: Longitude degrees must be between 0 and 180`);
          }
          if (!['N', 'S'].includes(coord.lat_dir)) {
            validationErrors.push(`Coordinate ${index + 1}: Latitude direction must be N or S (got: ${coord.lat_dir})`);
          }
          if (!['E', 'W'].includes(coord.lon_dir)) {
            validationErrors.push(`Coordinate ${index + 1}: Longitude direction must be E or W (got: ${coord.lon_dir})`);
          }
        });

        if (validationErrors.length > 0) {
          console.error('Validation errors:', validationErrors);
          message.error(validationErrors.join('\n'));
          return;
        }

        // Generate DXF
        console.log('Sending coordinates to backend:', processedCoordinates);
        const response = await axios.post(
          'http://localhost:5000/api/convert',
          { coordinates: processedCoordinates },
          {
            responseType: 'blob',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/dxf'
            }
          }
        );

        // Handle DXF download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'coordinates.dxf');
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
        message.success('DXF file downloaded successfully!');
      }
    } catch (error) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers,
        requestData: error.config?.data
      });
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.detail;
        const errorMessage = Array.isArray(validationErrors) 
          ? validationErrors.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n')
          : 'Validation error: Please check your input data';
        message.error(errorMessage);
      } else {
        message.error(error.response?.data?.detail || 'Error processing request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditCertificate = (certificate) => {
    setEditCertificate(certificate);
    setActiveTab("1"); // Switch to New Certificate tab
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white', fontSize: '20px' }}>
        GIS Automation
      </Header>
      <Content style={{ padding: '24px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={editCertificate ? "Edit Certificate" : "New Certificate"} key="1">
            <CoordinateInput 
              onCoordinatesSubmit={handleCoordinatesSubmit}
              loading={loading}
              initialValues={editCertificate}
              onEditComplete={() => setEditCertificate(null)}
            />
          </TabPane>
          <TabPane tab="Certificate History" key="2">
            <CertificateHistory onEditCertificate={handleEditCertificate} />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default App;