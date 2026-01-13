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
  CalendarOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface Job {
  id: string;
  jobNumber: string;
  customerName: string;
  address: string;
  jobType: string;
  status: string;
  priority: string;
  scheduledDate?: string;
  scheduledTime?: string;
  crewName?: string;
  totalAmount: number;
  createdAt: string;
}

// Mock data
const mockJobs: Job[] = [
  {
    id: '1',
    jobNumber: 'JOB-2024-00052',
    customerName: 'John Smith',
    address: '123 Main St, Lincoln, NE',
    jobType: 'power_washing',
    status: 'scheduled',
    priority: 'normal',
    scheduledDate: '2024-01-15',
    scheduledTime: '9:00 AM',
    crewName: 'Team Alpha',
    totalAmount: 450,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    jobNumber: 'JOB-2024-00053',
    customerName: 'ABC Corporation',
    address: '456 Business Park Dr, Lincoln, NE',
    jobType: 'power_washing',
    status: 'in_progress',
    priority: 'high',
    scheduledDate: '2024-01-15',
    scheduledTime: '11:00 AM',
    crewName: 'Team Beta',
    totalAmount: 1200,
    createdAt: '2024-01-11',
  },
  {
    id: '3',
    jobNumber: 'JOB-2024-00054',
    customerName: 'Sarah Johnson',
    address: '789 Oak Ave, Lincoln, NE',
    jobType: 'gutter_cleaning',
    status: 'lead',
    priority: 'normal',
    totalAmount: 250,
    createdAt: '2024-01-12',
  },
  {
    id: '4',
    jobNumber: 'JOB-2024-00055',
    customerName: 'Mike Wilson',
    address: '321 Pine Rd, Lincoln, NE',
    jobType: 'christmas_lights_install',
    status: 'estimate_sent',
    priority: 'normal',
    totalAmount: 850,
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    jobNumber: 'JOB-2024-00056',
    customerName: 'Emily Brown',
    address: '654 Elm St, Lincoln, NE',
    jobType: 'power_washing',
    status: 'completed',
    priority: 'normal',
    scheduledDate: '2024-01-14',
    crewName: 'Team Alpha',
    totalAmount: 380,
    createdAt: '2024-01-08',
  },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  lead: { color: 'default', label: 'Lead' },
  qualified: { color: 'blue', label: 'Qualified' },
  estimate_sent: { color: 'cyan', label: 'Estimate Sent' },
  estimate_approved: { color: 'geekblue', label: 'Approved' },
  scheduled: { color: 'purple', label: 'Scheduled' },
  dispatched: { color: 'orange', label: 'Dispatched' },
  in_progress: { color: 'processing', label: 'In Progress' },
  completed: { color: 'success', label: 'Completed' },
  invoiced: { color: 'lime', label: 'Invoiced' },
  paid: { color: 'green', label: 'Paid' },
  cancelled: { color: 'error', label: 'Cancelled' },
  lost: { color: 'default', label: 'Lost' },
};

const jobTypeConfig: Record<string, { color: string; label: string }> = {
  power_washing: { color: 'blue', label: 'Power Washing' },
  christmas_lights_install: { color: 'green', label: 'Christmas Lights Install' },
  christmas_lights_removal: { color: 'orange', label: 'Christmas Lights Removal' },
  gutter_cleaning: { color: 'purple', label: 'Gutter Cleaning' },
  window_cleaning: { color: 'cyan', label: 'Window Cleaning' },
  roof_cleaning: { color: 'magenta', label: 'Roof Cleaning' },
};

const priorityConfig: Record<string, { color: string }> = {
  low: { color: 'default' },
  normal: { color: 'blue' },
  high: { color: 'orange' },
  urgent: { color: 'red' },
};

export default function JobsPage() {
  const [jobs] = useState<Job[]>(mockJobs);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const columns: ColumnsType<Job> = [
    {
      title: 'Job #',
      dataIndex: 'jobNumber',
      key: 'jobNumber',
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
      title: 'Type',
      dataIndex: 'jobType',
      key: 'jobType',
      width: 180,
      render: (type) => {
        const config = jobTypeConfig[type] || { color: 'default', label: type };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
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
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Badge
          color={priorityConfig[priority]?.color || 'blue'}
          text={priority.charAt(0).toUpperCase() + priority.slice(1)}
        />
      ),
    },
    {
      title: 'Scheduled',
      key: 'scheduled',
      width: 150,
      render: (_, record) => (
        record.scheduledDate ? (
          <div>
            <div>{dayjs(record.scheduledDate).format('MMM D, YYYY')}</div>
            {record.scheduledTime && (
              <div className="text-xs text-gray-500">{record.scheduledTime}</div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Not scheduled</span>
        )
      ),
    },
    {
      title: 'Crew',
      dataIndex: 'crewName',
      key: 'crewName',
      width: 120,
      render: (crew) => crew || <span className="text-gray-400">Unassigned</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      align: 'right',
      render: (amount) => `$${amount.toLocaleString()}`,
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
              { type: 'divider' },
              { key: 'schedule', label: 'Schedule' },
              { key: 'assign', label: 'Assign Crew' },
              { type: 'divider' },
              { key: 'estimate', label: 'Create Estimate' },
              { key: 'invoice', label: 'Create Invoice' },
              { type: 'divider' },
              { key: 'cancel', label: 'Cancel Job', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      job.address.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = !statusFilter || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Space>
          <Button.Group>
            <Button
              icon={<UnorderedListOutlined />}
              type={viewMode === 'table' ? 'primary' : 'default'}
              onClick={() => setViewMode('table')}
            />
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === 'kanban' ? 'primary' : 'default'}
              onClick={() => setViewMode('kanban')}
            />
            <Button
              icon={<CalendarOutlined />}
              onClick={() => window.location.href = '/dashboard/jobs/calendar'}
            />
          </Button.Group>
          <Button type="primary" icon={<PlusOutlined />}>
            New Job
          </Button>
        </Space>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Tag
          className="cursor-pointer px-3 py-1"
          color={!statusFilter ? 'blue' : 'default'}
          onClick={() => setStatusFilter(null)}
        >
          All ({jobs.length})
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
            placeholder="Search jobs..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Job Type"
            allowClear
            style={{ width: 180 }}
            options={Object.entries(jobTypeConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
          />
          <DatePicker.RangePicker />
          <Select
            placeholder="Crew"
            allowClear
            style={{ width: 150 }}
            options={[
              { value: 'alpha', label: 'Team Alpha' },
              { value: 'beta', label: 'Team Beta' },
              { value: 'gamma', label: 'Team Gamma' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredJobs}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} jobs`,
          }}
        />
      </Card>
    </div>
  );
}
