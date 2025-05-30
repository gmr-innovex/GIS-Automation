import React, { useState, useEffect } from 'react';
import { Table, Button, message, Space, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const CertificateHistory = ({ onEditCertificate }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/certificates');
      console.log('Fetched certificates:', response.data);
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      message.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();

    // Add refresh event listener
    const handleRefresh = () => {
      fetchCertificates();
    };

    const historyComponent = document.querySelector('[data-testid="certificate-history"]');
    if (historyComponent) {
      historyComponent.addEventListener('refresh', handleRefresh);
    }

    // Cleanup
    return () => {
      if (historyComponent) {
        historyComponent.removeEventListener('refresh', handleRefresh);
      }
    };
  }, []);

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/certificates/${id}`);
      message.success('Certificate deleted successfully');
      fetchCertificates(); // Refresh the list
    } catch (error) {
      console.error('Error deleting certificate:', error);
      message.error('Failed to delete certificate');
    }
  };

  const columns = [
    {
      title: 'Facility Name',
      dataIndex: 'facility',
      key: 'facility',
      sorter: (a, b) => a.facility.localeCompare(b.facility),
    },
    {
      title: 'Survey No',
      dataIndex: 'survey_no',
      key: 'survey_no',
      sorter: (a, b) => a.survey_no.localeCompare(b.survey_no),
    },
    {
      title: 'Village Name',
      dataIndex: 'village_name',
      key: 'village_name',
      sorter: (a, b) => a.village_name.localeCompare(b.village_name),
    },
    {
      title: 'Date & Time',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => formatDateTime(text),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditCertificate(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this certificate?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }} data-testid="certificate-history">
      <h2 style={{ marginBottom: '24px' }}>Certificate History</h2>
      <Table
        columns={columns}
        dataSource={certificates}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} certificates`,
        }}
      />
    </div>
  );
};

export default CertificateHistory; 