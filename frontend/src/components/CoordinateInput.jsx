import React, { useState } from 'react';
import { Button, Table, Form, InputNumber, Space, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const CoordinateInput = ({ onCoordinatesSubmit, loading }) => {
  const [form] = Form.useForm();
  const [coordinates, setCoordinates] = useState([{ id: 1 }]);

  const handleAddRow = () => {
    setCoordinates([...coordinates, { id: coordinates.length + 1 }]);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      // Filter out empty coordinates and validate all fields are present
      const validCoordinates = values.coordinates.filter(coord => {
        return coord && 
               coord.lat_deg !== undefined && 
               coord.lat_min !== undefined && 
               coord.lat_sec !== undefined && 
               coord.lat_dir && 
               coord.lon_deg !== undefined && 
               coord.lon_min !== undefined && 
               coord.lon_sec !== undefined && 
               coord.lon_dir && 
               coord.amsl !== undefined;
      });
      
      if (validCoordinates.length === 0) {
        console.error('No valid coordinates found');
        return;
      }
      
      // Make sure to convert string values to numbers before submitting
      const formattedCoordinates = validCoordinates.map(coord => ({
        lat_deg: Number(coord.lat_deg) || 0,
        lat_min: Number(coord.lat_min) || 0,
        lat_sec: Number(coord.lat_sec) || 0,
        lat_dir: coord.lat_dir,
        lon_deg: Number(coord.lon_deg) || 0,
        lon_min: Number(coord.lon_min) || 0,
        lon_sec: Number(coord.lon_sec) || 0,
        lon_dir: coord.lon_dir,
        amsl: Number(coord.amsl) || 0
      }));
      
      console.log('Formatted coordinates:', formattedCoordinates);
      onCoordinatesSubmit(formattedCoordinates);
    }).catch(errorInfo => {
      console.error('Validation failed:', errorInfo);
    });
  };

  const columns = [
    {
      title: 'Latitude',
      children: [
        {
          title: 'Degrees',
          dataIndex: 'lat_deg',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lat_deg']} rules={[{ required: true, message: 'Required' }]} initialValue={0}>
              <InputNumber min={0} max={90} placeholder="Deg" precision={0} />
            </Form.Item>
          ),
        },
        {
          title: 'Minutes',
          dataIndex: 'lat_min',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lat_min']} rules={[{ required: true, message: 'Required' }]} initialValue={0}>
              <InputNumber min={0} max={59} placeholder="Min" precision={0} />
            </Form.Item>
          ),
        },
        {
          title: 'Seconds',
          dataIndex: 'lat_sec',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lat_sec']} rules={[{ required: true, message: 'Required' }]} initialValue={0}>
              <InputNumber min={0} max={59.999} step={0.001} placeholder="Sec" precision={3} />
            </Form.Item>
          ),
        },
        {
          title: 'Direction',
          dataIndex: 'lat_dir',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lat_dir']} initialValue="N" rules={[{ required: true, message: 'Required' }]}>
              <Select>
                <Option value="N">N</Option>
                <Option value="S">S</Option>
              </Select>
            </Form.Item>
          ),
        },
      ],
    },
    {
      title: 'Longitude',
      children: [
        {
          title: 'Degrees',
          dataIndex: 'lon_deg',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lon_deg']} rules={[{ required: true, message: 'Required' }]} initialValue={0}>
              <InputNumber min={0} max={180} placeholder="Deg" precision={0} />
            </Form.Item>
          ),
        },
        {
          title: 'Minutes',
          dataIndex: 'lon_min',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lon_min']} rules={[{ required: true, message: 'Required' }]} initialValue={0}>
              <InputNumber min={0} max={59} placeholder="Min" precision={0} />
            </Form.Item>
          ),
        },
        {
          title: 'Seconds',
          dataIndex: 'lon_sec',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lon_sec']} rules={[{ required: true, message: 'Required' }]} initialValue={0}>
              <InputNumber min={0} max={59.999} step={0.001} placeholder="Sec" precision={3} />
            </Form.Item>
          ),
        },
        {
          title: 'Direction',
          dataIndex: 'lon_dir',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lon_dir']} initialValue="E" rules={[{ required: true, message: 'Required' }]}>
              <Select>
                <Option value="E">E</Option>
                <Option value="W">W</Option>
              </Select>
            </Form.Item>
          ),
        },
      ],
    },
    {
      title: 'AMSL (m)',
      dataIndex: 'amsl',
      render: (_, record, index) => (
        <Form.Item name={['coordinates', index, 'amsl']} rules={[{ required: true, message: 'Required' }]} initialValue={0}>
          <InputNumber min={0} placeholder="AMSL" precision={1} />
        </Form.Item>
      ),
    },
  ];

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Table
        columns={columns}
        dataSource={coordinates}
        pagination={false}
        rowKey="id"
        footer={() => (
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddRow}
              disabled={loading}
            >
              Add Coordinate
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              disabled={loading}
            >
              Generate DXF
            </Button>
          </Space>
        )}
      />
    </Form>
  );
};

export default CoordinateInput;