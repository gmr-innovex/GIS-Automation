import React, { useState, useRef, useEffect } from 'react';
import { Button, Table, Form, InputNumber, Space, Select, Modal, Input, Row, Col, message } from 'antd';
import { PlusOutlined, EyeOutlined, FileTextOutlined, FileProtectOutlined, DeleteOutlined } from '@ant-design/icons';
import LetterheadCertificate from './certificate';
import AuthorisationCertificate from './Authorisation';
import UndertakingCertificate from './undertaking';

const { Option } = Select;

const CoordinateInput = ({ 
  onCoordinatesSubmit, 
  loading, 
  initialValues, 
  onEditComplete 
}) => {
  const [form] = Form.useForm();
  const [coordinates, setCoordinates] = useState([{ id: 1 }]);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [isUndertakingVisible, setIsUndertakingVisible] = useState(false);
  const inputRefs = useRef({});

  useEffect(() => {
    if (initialValues) {
      // When in edit mode, populate the form
      form.setFieldsValue({
        surveyNo: initialValues.survey_no,
        villageName: initialValues.village_name,
        owner: initialValues.owner,
        facility: initialValues.facility,
        coordinates: initialValues.coordinates,
        userName: initialValues.userName,
        userAddress: initialValues.userAddress,
        userPhone: initialValues.userPhone,
        userEmail: initialValues.userEmail,
      });
      setCoordinates(initialValues.coordinates);
      setShowActionButtons(true); // Show action buttons immediately in edit mode
    } else {
      // Reset form when not in edit mode
      form.resetFields();
      setCoordinates([{ id: 1 }]);
      setShowActionButtons(false);
    }
  }, [initialValues, form]);

  const handleAddRow = () => {
    setCoordinates([...coordinates, { id: coordinates.length + 1 }]);
  };

  const handleKeyDown = (e, currentIndex, currentField) => {
    const fields = ['lat_deg', 'lat_min', 'lat_sec', 'lat_dir', 'lon_deg', 'lon_min', 'lon_sec', 'lon_dir', 'amsl'];
    const currentFieldIndex = fields.indexOf(currentField);
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentFieldIndex < fields.length - 1) {
        // Move to next field in same row
        const nextField = fields[currentFieldIndex + 1];
        const nextInput = inputRefs.current[`${currentIndex}-${nextField}`];
        if (nextInput) {
          nextInput.focus();
        }
      } else if (currentIndex < coordinates.length - 1) {
        // Move to first field of next row
        const nextInput = inputRefs.current[`${currentIndex + 1}-lat_deg`];
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentFieldIndex > 0) {
        // Move to previous field in same row
        const prevField = fields[currentFieldIndex - 1];
        const prevInput = inputRefs.current[`${currentIndex}-${prevField}`];
        if (prevInput) {
          prevInput.focus();
        }
      } else if (currentIndex > 0) {
        // Move to last field of previous row
        const prevInput = inputRefs.current[`${currentIndex - 1}-amsl`];
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  const validateAndFormatCoordinates = () => {
    const values = form.getFieldsValue();
    if (!values.coordinates) return [];

    return values.coordinates
      .filter(coord => 
        coord && 
        coord.lat_deg !== undefined && 
        coord.lat_min !== undefined && 
        coord.lat_sec !== undefined && 
        coord.lat_dir && 
        coord.lon_deg !== undefined && 
        coord.lon_min !== undefined && 
        coord.lon_sec !== undefined && 
        coord.lon_dir && 
        coord.amsl !== undefined
      )
      .map(coord => ({
        lat_deg: Number(coord.lat_deg),
        lat_min: Number(coord.lat_min),
        lat_sec: Number(coord.lat_sec),
        lat_dir: coord.lat_dir,
        lon_deg: Number(coord.lon_deg),
        lon_min: Number(coord.lon_min),
        lon_sec: Number(coord.lon_sec),
        lon_dir: coord.lon_dir,
        amsl: Number(coord.amsl)
      }));
  };

  const handlePreview = () => {
    form.validateFields().then(values => {
      const validCoordinates = validateAndFormatCoordinates();
      if (validCoordinates.length === 0) {
        console.error('No valid coordinates found');
        return;
      }
      setCoordinates(validCoordinates);
      setIsPreviewVisible(true);
    }).catch(errorInfo => {
      console.error('Validation failed:', errorInfo);
    });
  };

  const handleAuthPreview = () => {
    form.validateFields().then(values => {
      const validCoordinates = validateAndFormatCoordinates();
      if (validCoordinates.length === 0) {
        console.error('No valid coordinates found');
        return;
      }
      setCoordinates(validCoordinates);
      setIsAuthVisible(true);
    }).catch(errorInfo => {
      console.error('Validation failed:', errorInfo);
    });
  };

  const handleUndertakingPreview = () => {
    form.validateFields().then(values => {
      const validCoordinates = validateAndFormatCoordinates();
      if (validCoordinates.length === 0) {
        console.error('No valid coordinates found');
        return;
      }
      setCoordinates(validCoordinates);
      setIsUndertakingVisible(true);
    }).catch(errorInfo => {
      console.error('Validation failed:', errorInfo);
    });
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const validCoordinates = validateAndFormatCoordinates();
      console.log('Form values:', values);
      console.log('Validated coordinates:', validCoordinates);
      
      if (validCoordinates.length === 0) {
        message.error('No valid coordinates found');
        return;
      }

      // Prepare the data for saving
      const certificateData = {
        survey_no: String(values.surveyNo).trim(),
        village_name: String(values.villageName).trim(),
        owner: String(values.owner).trim(),
        facility: String(values.facility).trim(),
        coordinates: validCoordinates.map(coord => ({
          lat_deg: Number(coord.lat_deg) || 0,
          lat_min: Number(coord.lat_min) || 0,
          lat_sec: Number(coord.lat_sec) || 0,
          lat_dir: String(coord.lat_dir).toUpperCase().trim(),
          lon_deg: Number(coord.lon_deg) || 0,
          lon_min: Number(coord.lon_min) || 0,
          lon_sec: Number(coord.lon_sec) || 0,
          lon_dir: String(coord.lon_dir).toUpperCase().trim(),
          amsl: Number(coord.amsl) || 0
        })),
        certificate_type: 'letterhead',
        userName: values.userName,
        userAddress: values.userAddress,
        userPhone: values.userPhone,
        userEmail: values.userEmail,
      };

      // Validate the data
      if (!certificateData.survey_no || !certificateData.village_name || 
          !certificateData.owner || !certificateData.facility) {
        message.error('Please fill all required fields');
        return;
      }

      if (certificateData.coordinates.length === 0) {
        message.error('Please add at least one coordinate');
        return;
      }

      // Validate coordinate values
      const invalidCoords = certificateData.coordinates.some(coord => 
        coord.lat_deg < 0 || coord.lat_deg > 90 ||
        coord.lat_min < 0 || coord.lat_min > 59 ||
        coord.lat_sec < 0 || coord.lat_sec > 59.999 ||
        !['N', 'S'].includes(coord.lat_dir) ||
        coord.lon_deg < 0 || coord.lon_deg > 180 ||
        coord.lon_min < 0 || coord.lon_min > 59 ||
        coord.lon_sec < 0 || coord.lon_sec > 59.999 ||
        !['E', 'W'].includes(coord.lon_dir)
      );

      if (invalidCoords) {
        message.error('Please check coordinate values. They must be within valid ranges.');
        return;
      }

      // Call the parent's onCoordinatesSubmit function to save the data
      onCoordinatesSubmit(validCoordinates, certificateData);
      setShowActionButtons(true);
    }).catch(errorInfo => {
      console.error('Validation failed:', errorInfo);
      message.error('Please fill all required fields correctly');
    });
  };

  const handleDeleteRow = (rowIndex) => {
    setCoordinates(prev => prev.filter((_, idx) => idx !== rowIndex));
    // Also remove from form values
    const values = form.getFieldsValue();
    if (values.coordinates) {
      values.coordinates.splice(rowIndex, 1);
      form.setFieldsValue({ coordinates: values.coordinates });
    }
  };

  const columns = [
    {
      title: 'Latitude',
      children: [
        {
          title: 'Degrees',
          dataIndex: 'lat_deg',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lat_deg']} rules={[{ required: true, message: 'Required' }]}>
              <InputNumber 
                min={0} 
                max={90} 
                placeholder="Deg" 
                precision={0}
                ref={ref => inputRefs.current[`${index}-lat_deg`] = ref}
                onKeyDown={(e) => handleKeyDown(e, index, 'lat_deg')}
              />
            </Form.Item>
          ),
        },
        {
          title: 'Minutes',
          dataIndex: 'lat_min',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lat_min']} rules={[{ required: true, message: 'Required' }]} >
              <InputNumber 
                min={0} 
                max={59} 
                placeholder="Min" 
                precision={0}
                ref={ref => inputRefs.current[`${index}-lat_min`] = ref}
                onKeyDown={(e) => handleKeyDown(e, index, 'lat_min')}
              />
            </Form.Item>
          ),
        },
        {
          title: 'Seconds',
          dataIndex: 'lat_sec',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lat_sec']} rules={[{ required: true, message: 'Required' }]} >
              <InputNumber 
                min={0} 
                max={59.999} 
                step={0.001} 
                placeholder="Sec"
                ref={ref => inputRefs.current[`${index}-lat_sec`] = ref}
                onKeyDown={(e) => handleKeyDown(e, index, 'lat_sec')}
              />
            </Form.Item>
          ),
        },
        {
          title: 'Direction',
          dataIndex: 'lat_dir',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lat_dir']} initialValue="N" rules={[{ required: true, message: 'Required' }]}>
              <Select
                ref={ref => inputRefs.current[`${index}-lat_dir`] = ref}
                onKeyDown={(e) => handleKeyDown(e, index, 'lat_dir')}
              >
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
            <Form.Item name={['coordinates', index, 'lon_deg']} rules={[{ required: true, message: 'Required' }]} >
              <InputNumber 
                min={0} 
                max={180} 
                placeholder="Deg" 
                precision={0}
                ref={ref => inputRefs.current[`${index}-lon_deg`] = ref}
                onKeyDown={(e) => handleKeyDown(e, index, 'lon_deg')}
              />
            </Form.Item>
          ),
        },
        {
          title: 'Minutes',
          dataIndex: 'lon_min',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lon_min']} rules={[{ required: true, message: 'Required' }]} >
              <InputNumber 
                min={0} 
                max={59} 
                placeholder="Min" 
                precision={0}
                ref={ref => inputRefs.current[`${index}-lon_min`] = ref}
                onKeyDown={(e) => handleKeyDown(e, index, 'lon_min')}
              />
            </Form.Item>
          ),
        },
        {
          title: 'Seconds',
          dataIndex: 'lon_sec',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lon_sec']} rules={[{ required: true, message: 'Required' }]} >
              <InputNumber 
                min={0} 
                max={59.999} 
                step={0.001} 
                placeholder="Sec" 
                precision={3}
                ref={ref => inputRefs.current[`${index}-lon_sec`] = ref}
                onKeyDown={(e) => handleKeyDown(e, index, 'lon_sec')}
              />
            </Form.Item>
          ),
        },
        {
          title: 'Direction',
          dataIndex: 'lon_dir',
          render: (_, record, index) => (
            <Form.Item name={['coordinates', index, 'lon_dir']} initialValue="E" rules={[{ required: true, message: 'Required' }]}>
              <Select
                ref={ref => inputRefs.current[`${index}-lon_dir`] = ref}
                onKeyDown={(e) => handleKeyDown(e, index, 'lon_dir')}
              >
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
        <Form.Item name={['coordinates', index, 'amsl']} rules={[{ required: true, message: 'Required' }]} >
          <InputNumber 
            min={0} 
            placeholder="AMSL" 
            precision={1}
            ref={ref => inputRefs.current[`${index}-amsl`] = ref}
            onKeyDown={(e) => handleKeyDown(e, index, 'amsl')}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Button danger onClick={() => handleDeleteRow(index)} disabled={coordinates.length === 1} icon={<DeleteOutlined />} />
      ),
    },
  ];

  return (
    <>
      <Form form={form} onFinish={handleSave}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Form.Item
              name="surveyNo"
              label="Survey No"
              rules={[{ required: true, message: 'Please enter Survey No' }]}
            >
              <Input placeholder="Enter Survey No" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="villageName"
              label="Village Name"
              rules={[{ required: true, message: 'Please select Village Name' }]}
            >
              <Select placeholder="Select Village">
                <Option value="Ananthareddy">Ananthareddy</Option>
                <Option value="Mamidipally">Mamidipally</Option>
                <Option value="others">Others</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="facility"
              label="Facility"
              rules={[{ required: true, message: 'Please enter Facility Name' }]}
            >
              <Input placeholder="Enter Facility Name" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="owner"
              label="Owner"
              rules={[{ required: true, message: 'Please select Owner' }]}
            >
              <Select placeholder="Select Owner">
                <Option value="GMR Hyderabad International Airport Limited">GMR Hyderabad International Airport Limited</Option>
                <Option value="GMR Hyderabad Aerotropolis Limited">GMR Hyderabad Aerotropolis Limited</Option>
                <Option value="GMR Hyderabad Aviation SEZ Limited">GMR Hyderabad Aviation SEZ Limited</Option>
                <Option value="GMR Air Cargo and Aerospace Engineering Limited">GMR Air Cargo and Aerospace Engineering Limited</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* User Details Section */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <h3 style={{ marginBottom: 16 }}>User Details</h3>
          </Col>
          <Col span={6}>
            <Form.Item
              name="userName"
              label="Name"
            >
              <Input placeholder="Enter Name" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="userAddress"
            >
              <Input placeholder="Enter Address" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="userPhone"
            >
              <Input placeholder="Enter Phone No" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="userEmail"
              label="Email-ID"
              rules={[{ type: 'email', message: 'Please enter a valid Email-ID' }]}
            >
              <Input placeholder="Enter Email-ID" />
            </Form.Item>
          </Col>
        </Row>

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
                {initialValues ? 'Update' : 'Save'}
              </Button>
              {showActionButtons && (
                <>
                  <Button 
                    type="primary" 
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    disabled={loading}
                  >
                    Preview Certificate
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />}
                    onClick={handleAuthPreview}
                    disabled={loading}
                  >
                    Authorization Letter
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<FileProtectOutlined />}
                    onClick={handleUndertakingPreview}
                    disabled={loading}
                  >
                    Undertaking
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => {
                      const formValues = form.getFieldsValue();
                      const coords = validateAndFormatCoordinates();
                      onCoordinatesSubmit(coords);
                    }}
                    loading={loading}
                    disabled={loading}
                  >
                    Generate DXF
                  </Button>
                </>
              )}
            </Space>
          )}
        />
      </Form>

      <Modal
        title="Certificate Preview"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={null}
      >
        <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
          <LetterheadCertificate 
            coordinates={coordinates} 
            surveyNo={form.getFieldValue('surveyNo')}
            villageName={form.getFieldValue('villageName')}
            owner={form.getFieldValue('owner')}
            facility={form.getFieldValue('facility')}
          />
        </div>
      </Modal>

      <Modal
        title="Authorization Letter"
        open={isAuthVisible}
        onCancel={() => setIsAuthVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={null}
      >
        <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
          <AuthorisationCertificate 
            coordinates={coordinates} 
            surveyNo={form.getFieldValue('surveyNo')}
            villageName={form.getFieldValue('villageName')}
            owner={form.getFieldValue('owner')}
            facility={form.getFieldValue('facility')}
          />
        </div>
      </Modal>

      <Modal
        title="Undertaking Letter"
        open={isUndertakingVisible}
        onCancel={() => setIsUndertakingVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={null}
      >
        <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
          <UndertakingCertificate
            coordinates={coordinates}
            surveyNo={form.getFieldValue('surveyNo')}
            villageName={form.getFieldValue('villageName')}
            owner={form.getFieldValue('owner')}
            facility={form.getFieldValue('facility')}
            userName={form.getFieldValue('userName')}
            userAddress={form.getFieldValue('userAddress')}
            userPhone={form.getFieldValue('userPhone')}
            userEmail={form.getFieldValue('userEmail')}
          />
        </div>
      </Modal>
    </>
  );
};

export default CoordinateInput;