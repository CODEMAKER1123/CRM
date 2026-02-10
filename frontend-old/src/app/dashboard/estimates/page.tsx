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
  DatePicker,
  Select,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  SendOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface Estimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  address: string;
  status: string;
  totalAmount: number;
  expiryDate: string;
  createdAt: string;
}

// Mock data
const mockEstimates: Estimate[] = [
  {
    id: '1',
    estimateNumber: 'EST-2024-0042',
    customerName: 'John Smith',
    address: '123 Main St, Lincoln, NE',
    status: 'sent',
    totalAmount: 450,
    expiryDate: '2024-02-15',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    estimateNumber: 'EST-2024-0043',
    customerName: 'ABC Corporation',
    address: '456 Business Park Dr, Lincoln, NE',
    status: 'draft',
    totalAmount: 1200,
    expiryDate: '2024-02-18',
    createdAt: '2024-01-11',
  },
  {
    id: '3',
    estimateNumber: 'EST-2024-0044',
    customerName: 'Sarah Johnson',
    address: '789 Oak Ave, Lincoln, NE',
    status: 'approved',
    totalAmount: 250,
    expiryDate: '2024-02-20',
    createdAt: '2024-01-12',
  },
  {
    id: '4',
    estimateNumber: 'EST-2024-0045',
    customerName: 'Mike Wilson',
    address: '321 Pine Rd, Lincoln, NE',
    status: 'expired',
    totalAmount: 850,
    expiryDate: '2024-01-05',
    createdAt: '2023-12-28',
  },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Draft' },
  sent: { color: 'blue', label: 'Sent' },
  viewed: { color: 'cyan', label: 'Viewed' },
  approved: { color: 'success', label: 'Approved' },
  declined: { color: 'error', label: 'Declined' },
  expired: { color: 'warning', label: 'Expired' },
  converted: { color: 'purple', label: 'Converted' },
};

export default function EstimatesPage() {
  const [estimates] = useState<Estimate[]>(mockEstimates);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const columns: ColumnsType<Estimate> = [
    {
      title: 'Estimate #',
      dataIndex: 'estimateNumber',
      key: 'estimateNumber',
      width: 150,
      render: (text) => <a className="font-medium">{text}</a>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customerName}</div>
          <div className="text-xs text-gray-500">{record.address}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 150,
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View / Edit' },
              { key: 'pdf', label: 'Download PDF', icon: <FilePdfOutlined /> },
              { type: 'divider' },
              { key: 'send', label: 'Send to Customer', icon: <SendOutlined /> },
              { key: 'convert', label: 'Convert to Job', icon: <CheckCircleOutlined /> },
              { type: 'divider' },
              { key: 'delete', label: 'Delete', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredEstimates = estimates.filter((est) => {
    const matchesSearch =
      est.estimateNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      est.customerName.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = !statusFilter || est.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = estimates.reduce((acc, est) => {
    acc[est.status] = (acc[est.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estimates</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          New Estimate
        </Button>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Tag
          className="cursor-pointer px-3 py-1"
          color={!statusFilter ? 'blue' : 'default'}
          onClick={() => setStatusFilter(null)}
        >
          All ({estimates.length})
        </Tag>
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = statusCounts[status] || 0;
          if (count === 0) return null;
          return (
            <Tag
              key={status}
              className="cursor-pointer px-3 py-1"
              color={statusFilter === status ? config.color : 'default'}
              onClick={() => setStatusFilter(statusFilter === status ? null : status)}
            >
              {config.label} ({count})
            </Tag>
          );
        })}
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search estimates..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <DatePicker.RangePicker />
          <Select
            placeholder="Sort By"
            style={{ width: 150 }}
            defaultValue="newest"
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'amount_high', label: 'Amount (High-Low)' },
              { value: 'amount_low', label: 'Amount (Low-High)' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredEstimates}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} estimates`,
          }}
        />
      </Card>
    </div>
  );
}
