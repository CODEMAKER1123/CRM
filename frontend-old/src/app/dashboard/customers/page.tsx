'use client';

import { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Modal,
  Form,
  Select,
  message,
  Drawer,
  Descriptions,
  Tabs,
  Timeline,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Customer {
  id: string;
  name: string;
  accountType: 'residential' | 'commercial';
  primaryEmail?: string;
  primaryPhone?: string;
  leadSource?: string;
  lifetimeValue: number;
  outstandingBalance: number;
  jobCount: number;
  lastJobDate?: string;
  isActive: boolean;
  createdAt: string;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    accountType: 'residential',
    primaryEmail: 'john.smith@email.com',
    primaryPhone: '(555) 123-4567',
    leadSource: 'referral',
    lifetimeValue: 4500,
    outstandingBalance: 0,
    jobCount: 8,
    lastJobDate: '2024-01-10',
    isActive: true,
    createdAt: '2023-03-15',
  },
  {
    id: '2',
    name: 'ABC Corporation',
    accountType: 'commercial',
    primaryEmail: 'contact@abccorp.com',
    primaryPhone: '(555) 987-6543',
    leadSource: 'google_ads',
    lifetimeValue: 25000,
    outstandingBalance: 1500,
    jobCount: 24,
    lastJobDate: '2024-01-12',
    isActive: true,
    createdAt: '2022-08-20',
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    accountType: 'residential',
    primaryEmail: 'sarah.j@email.com',
    primaryPhone: '(555) 456-7890',
    leadSource: 'website',
    lifetimeValue: 1200,
    outstandingBalance: 350,
    jobCount: 3,
    lastJobDate: '2024-01-05',
    isActive: true,
    createdAt: '2023-11-01',
  },
];

const leadSourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'nextdoor', label: 'Nextdoor' },
  { value: 'yard_sign', label: 'Yard Sign' },
  { value: 'door_hanger', label: 'Door Hanger' },
  { value: 'repeat_customer', label: 'Repeat Customer' },
  { value: 'other', label: 'Other' },
];

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<Customer> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div>
          <a onClick={() => openCustomerDrawer(record)} className="font-medium">
            {text}
          </a>
          <div className="text-xs text-gray-500">
            <Tag color={record.accountType === 'residential' ? 'blue' : 'purple'}>
              {record.accountType}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="text-sm">
          {record.primaryEmail && (
            <div>
              <MailOutlined className="mr-1" /> {record.primaryEmail}
            </div>
          )}
          {record.primaryPhone && (
            <div>
              <PhoneOutlined className="mr-1" /> {record.primaryPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Lead Source',
      dataIndex: 'leadSource',
      key: 'leadSource',
      render: (source) => source && <Tag>{source.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Jobs',
      dataIndex: 'jobCount',
      key: 'jobCount',
      sorter: (a, b) => a.jobCount - b.jobCount,
      align: 'center',
    },
    {
      title: 'Lifetime Value',
      dataIndex: 'lifetimeValue',
      key: 'lifetimeValue',
      sorter: (a, b) => a.lifetimeValue - b.lifetimeValue,
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Balance',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      render: (value) => (
        <span className={value > 0 ? 'text-red-500' : 'text-green-500'}>
          ${value.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Details' },
              { key: 'edit', label: 'Edit' },
              { key: 'job', label: 'Create Job' },
              { key: 'estimate', label: 'Create Estimate' },
              { type: 'divider' },
              { key: 'deactivate', label: 'Deactivate', danger: true },
            ],
            onClick: ({ key }) => handleAction(key, record),
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleAction = (key: string, record: Customer) => {
    switch (key) {
      case 'view':
        openCustomerDrawer(record);
        break;
      case 'edit':
        message.info('Edit functionality coming soon');
        break;
      case 'job':
        message.info('Redirecting to create job...');
        break;
      case 'estimate':
        message.info('Redirecting to create estimate...');
        break;
      case 'deactivate':
        Modal.confirm({
          title: 'Deactivate Customer',
          content: `Are you sure you want to deactivate ${record.name}?`,
          onOk: () => message.success('Customer deactivated'),
        });
        break;
    }
  };

  const openCustomerDrawer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleCreateCustomer = async (values: unknown) => {
    console.log('Creating customer:', values);
    message.success('Customer created successfully');
    setIsModalOpen(false);
    form.resetFields();
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.primaryEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
      c.primaryPhone?.includes(searchText)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search customers..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      {/* Create Customer Modal */}
      <Modal
        title="Add New Customer"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCustomer}>
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="John Smith or Company Name" />
          </Form.Item>

          <Form.Item
            name="accountType"
            label="Account Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="residential">Residential</Select.Option>
              <Select.Option value="commercial">Commercial</Select.Option>
            </Select>
          </Form.Item>

          <Space className="w-full" size="large">
            <Form.Item name="primaryEmail" label="Email" className="flex-1">
              <Input placeholder="email@example.com" />
            </Form.Item>
            <Form.Item name="primaryPhone" label="Phone" className="flex-1">
              <Input placeholder="(555) 123-4567" />
            </Form.Item>
          </Space>

          <Form.Item name="leadSource" label="Lead Source">
            <Select options={leadSourceOptions} placeholder="Select lead source" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Create Customer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Customer Detail Drawer */}
      <Drawer
        title={selectedCustomer?.name}
        placement="right"
        width={600}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedCustomer && (
          <Tabs
            items={[
              {
                key: 'details',
                label: 'Details',
                children: (
                  <>
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="Account Type">
                        <Tag color={selectedCustomer.accountType === 'residential' ? 'blue' : 'purple'}>
                          {selectedCustomer.accountType}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {selectedCustomer.primaryEmail || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {selectedCustomer.primaryPhone || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Lead Source">
                        {selectedCustomer.leadSource?.replace('_', ' ') || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Customer Since">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                      </Descriptions.Item>
                    </Descriptions>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Card size="small">
                        <div className="text-gray-500 text-sm">Lifetime Value</div>
                        <div className="text-2xl font-bold text-green-600">
                          ${selectedCustomer.lifetimeValue.toLocaleString()}
                        </div>
                      </Card>
                      <Card size="small">
                        <div className="text-gray-500 text-sm">Outstanding Balance</div>
                        <div className={`text-2xl font-bold ${selectedCustomer.outstandingBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          ${selectedCustomer.outstandingBalance.toLocaleString()}
                        </div>
                      </Card>
                    </div>

                    <div className="mt-6">
                      <Space>
                        <Button type="primary">Create Job</Button>
                        <Button>Create Estimate</Button>
                        <Button>Send Message</Button>
                      </Space>
                    </div>
                  </>
                ),
              },
              {
                key: 'jobs',
                label: `Jobs (${selectedCustomer.jobCount})`,
                children: (
                  <div className="text-gray-500 text-center py-8">
                    Job history will be displayed here
                  </div>
                ),
              },
              {
                key: 'invoices',
                label: 'Invoices',
                children: (
                  <div className="text-gray-500 text-center py-8">
                    Invoice history will be displayed here
                  </div>
                ),
              },
              {
                key: 'activity',
                label: 'Activity',
                children: (
                  <Timeline
                    items={[
                      { children: 'Invoice #INV-2024-0156 paid - $1,250', color: 'green' },
                      { children: 'Job completed - Power washing' },
                      { children: 'Estimate approved' },
                      { children: 'Estimate sent' },
                      { children: 'Customer created' },
                    ]}
                  />
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
}
