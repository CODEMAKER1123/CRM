'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Dropdown,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Lead {
  id: string;
  contactName: string;
  email: string;
  phone: string;
  source: string;
  pipeline: string;
  stage: string;
  businessLine: string;
  assignedRep: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Stage colour map
// ---------------------------------------------------------------------------

const stageColorMap: Record<string, string> = {
  new: 'blue',
  contacted: 'cyan',
  estimate_sent: 'orange',
  won: 'green',
  lost: 'red',
};

const stageLabel: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  estimate_sent: 'Estimate Sent',
  won: 'Won',
  lost: 'Lost',
};

// ---------------------------------------------------------------------------
// Dropdown options
// ---------------------------------------------------------------------------

const pipelineOptions = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'referral', label: 'Referral' },
];

const stageOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'estimate_sent', label: 'Estimate Sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const businessLineOptions = [
  { value: 'power_washing', label: 'Power Washing' },
  { value: 'holiday_lights', label: 'Holiday Lights' },
  { value: 'gutter_cleaning', label: 'Gutter Cleaning' },
  { value: 'window_cleaning', label: 'Window Cleaning' },
];

const assignedRepOptions = [
  { value: 'Jake Morrison', label: 'Jake Morrison' },
  { value: 'Lisa Tran', label: 'Lisa Tran' },
  { value: 'Derek Schultz', label: 'Derek Schultz' },
  { value: 'Maria Gonzalez', label: 'Maria Gonzalez' },
];

const businessLineLabel: Record<string, string> = {
  power_washing: 'Power Washing',
  holiday_lights: 'Holiday Lights',
  gutter_cleaning: 'Gutter Cleaning',
  window_cleaning: 'Window Cleaning',
};

// ---------------------------------------------------------------------------
// Mock data – 24 realistic leads for a power washing / holiday lights company
// ---------------------------------------------------------------------------

const mockLeads: Lead[] = [
  {
    id: '1',
    contactName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(402) 555-0101',
    source: 'Google Ads',
    pipeline: 'residential',
    stage: 'new',
    businessLine: 'power_washing',
    assignedRep: 'Jake Morrison',
    createdAt: '2025-12-02',
  },
  {
    id: '2',
    contactName: 'Sarah Johnson',
    email: 'sarah.j@gmail.com',
    phone: '(402) 555-0102',
    source: 'Referral',
    pipeline: 'residential',
    stage: 'contacted',
    businessLine: 'holiday_lights',
    assignedRep: 'Lisa Tran',
    createdAt: '2025-12-05',
  },
  {
    id: '3',
    contactName: 'Mike Davis',
    email: 'mdavis@outlook.com',
    phone: '(402) 555-0103',
    source: 'Website',
    pipeline: 'residential',
    stage: 'estimate_sent',
    businessLine: 'power_washing',
    assignedRep: 'Jake Morrison',
    createdAt: '2025-12-08',
  },
  {
    id: '4',
    contactName: 'Emily Rodriguez',
    email: 'emily.r@yahoo.com',
    phone: '(402) 555-0104',
    source: 'Nextdoor',
    pipeline: 'residential',
    stage: 'won',
    businessLine: 'holiday_lights',
    assignedRep: 'Derek Schultz',
    createdAt: '2025-11-15',
  },
  {
    id: '5',
    contactName: 'Robert Chen',
    email: 'rchen@abcrealty.com',
    phone: '(402) 555-0105',
    source: 'Google Ads',
    pipeline: 'commercial',
    stage: 'new',
    businessLine: 'power_washing',
    assignedRep: 'Maria Gonzalez',
    createdAt: '2026-01-03',
  },
  {
    id: '6',
    contactName: 'Jessica Williams',
    email: 'jwilliams@hotmail.com',
    phone: '(402) 555-0106',
    source: 'Facebook',
    pipeline: 'residential',
    stage: 'contacted',
    businessLine: 'power_washing',
    assignedRep: 'Jake Morrison',
    createdAt: '2026-01-05',
  },
  {
    id: '7',
    contactName: 'David Brown',
    email: 'dbrown@lincolnbiz.com',
    phone: '(402) 555-0107',
    source: 'Referral',
    pipeline: 'commercial',
    stage: 'estimate_sent',
    businessLine: 'power_washing',
    assignedRep: 'Lisa Tran',
    createdAt: '2025-12-20',
  },
  {
    id: '8',
    contactName: 'Amanda Martinez',
    email: 'amanda.m@gmail.com',
    phone: '(402) 555-0108',
    source: 'Yard Sign',
    pipeline: 'residential',
    stage: 'lost',
    businessLine: 'holiday_lights',
    assignedRep: 'Derek Schultz',
    createdAt: '2025-11-28',
  },
  {
    id: '9',
    contactName: 'Chris Taylor',
    email: 'ctaylor@email.com',
    phone: '(402) 555-0109',
    source: 'Google Ads',
    pipeline: 'residential',
    stage: 'new',
    businessLine: 'holiday_lights',
    assignedRep: 'Maria Gonzalez',
    createdAt: '2026-01-10',
  },
  {
    id: '10',
    contactName: 'Patricia Anderson',
    email: 'panderson@outlook.com',
    phone: '(402) 555-0110',
    source: 'Website',
    pipeline: 'residential',
    stage: 'contacted',
    businessLine: 'power_washing',
    assignedRep: 'Jake Morrison',
    createdAt: '2026-01-12',
  },
  {
    id: '11',
    contactName: 'Brian Thompson',
    email: 'bthompson@gmail.com',
    phone: '(402) 555-0111',
    source: 'Referral',
    pipeline: 'referral',
    stage: 'won',
    businessLine: 'power_washing',
    assignedRep: 'Lisa Tran',
    createdAt: '2025-12-01',
  },
  {
    id: '12',
    contactName: 'Megan Clark',
    email: 'mclark@yahoo.com',
    phone: '(402) 555-0112',
    source: 'Door Hanger',
    pipeline: 'residential',
    stage: 'estimate_sent',
    businessLine: 'holiday_lights',
    assignedRep: 'Derek Schultz',
    createdAt: '2025-12-18',
  },
  {
    id: '13',
    contactName: 'Kevin Lewis',
    email: 'klewis@lewisgroup.com',
    phone: '(402) 555-0113',
    source: 'Google Ads',
    pipeline: 'commercial',
    stage: 'contacted',
    businessLine: 'power_washing',
    assignedRep: 'Maria Gonzalez',
    createdAt: '2026-01-15',
  },
  {
    id: '14',
    contactName: 'Laura Walker',
    email: 'lwalker@email.com',
    phone: '(402) 555-0114',
    source: 'Facebook',
    pipeline: 'residential',
    stage: 'new',
    businessLine: 'gutter_cleaning',
    assignedRep: 'Jake Morrison',
    createdAt: '2026-01-18',
  },
  {
    id: '15',
    contactName: 'Steven Hall',
    email: 'shall@hallproperties.com',
    phone: '(402) 555-0115',
    source: 'Referral',
    pipeline: 'commercial',
    stage: 'won',
    businessLine: 'power_washing',
    assignedRep: 'Lisa Tran',
    createdAt: '2025-11-20',
  },
  {
    id: '16',
    contactName: 'Karen Young',
    email: 'kyoung@gmail.com',
    phone: '(402) 555-0116',
    source: 'Nextdoor',
    pipeline: 'residential',
    stage: 'contacted',
    businessLine: 'holiday_lights',
    assignedRep: 'Derek Schultz',
    createdAt: '2026-01-20',
  },
  {
    id: '17',
    contactName: 'Jason King',
    email: 'jking@email.com',
    phone: '(402) 555-0117',
    source: 'Website',
    pipeline: 'residential',
    stage: 'estimate_sent',
    businessLine: 'power_washing',
    assignedRep: 'Maria Gonzalez',
    createdAt: '2026-01-22',
  },
  {
    id: '18',
    contactName: 'Nicole Wright',
    email: 'nwright@outlook.com',
    phone: '(402) 555-0118',
    source: 'Google Ads',
    pipeline: 'residential',
    stage: 'lost',
    businessLine: 'window_cleaning',
    assignedRep: 'Jake Morrison',
    createdAt: '2025-12-10',
  },
  {
    id: '19',
    contactName: 'Daniel Scott',
    email: 'dscott@scottenterprises.com',
    phone: '(402) 555-0119',
    source: 'Referral',
    pipeline: 'commercial',
    stage: 'new',
    businessLine: 'power_washing',
    assignedRep: 'Lisa Tran',
    createdAt: '2026-01-25',
  },
  {
    id: '20',
    contactName: 'Rachel Green',
    email: 'rgreen@gmail.com',
    phone: '(402) 555-0120',
    source: 'Yard Sign',
    pipeline: 'residential',
    stage: 'contacted',
    businessLine: 'holiday_lights',
    assignedRep: 'Derek Schultz',
    createdAt: '2026-01-27',
  },
  {
    id: '21',
    contactName: 'Thomas Mitchell',
    email: 'tmitchell@mitchellco.com',
    phone: '(402) 555-0121',
    source: 'Google Ads',
    pipeline: 'commercial',
    stage: 'estimate_sent',
    businessLine: 'power_washing',
    assignedRep: 'Maria Gonzalez',
    createdAt: '2026-01-28',
  },
  {
    id: '22',
    contactName: 'Stephanie Perez',
    email: 'sperez@yahoo.com',
    phone: '(402) 555-0122',
    source: 'Facebook',
    pipeline: 'residential',
    stage: 'won',
    businessLine: 'holiday_lights',
    assignedRep: 'Jake Morrison',
    createdAt: '2025-12-22',
  },
  {
    id: '23',
    contactName: 'Mark Robinson',
    email: 'mrobinson@email.com',
    phone: '(402) 555-0123',
    source: 'Nextdoor',
    pipeline: 'referral',
    stage: 'new',
    businessLine: 'gutter_cleaning',
    assignedRep: 'Lisa Tran',
    createdAt: '2026-02-01',
  },
  {
    id: '24',
    contactName: 'Angela Hughes',
    email: 'ahughes@outlook.com',
    phone: '(402) 555-0124',
    source: 'Door Hanger',
    pipeline: 'residential',
    stage: 'contacted',
    businessLine: 'power_washing',
    assignedRep: 'Derek Schultz',
    createdAt: '2026-02-03',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LeadsListPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState<string | undefined>(undefined);
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);
  const [businessLineFilter, setBusinessLineFilter] = useState<string | undefined>(undefined);
  const [assignedRepFilter, setAssignedRepFilter] = useState<string | undefined>(undefined);

  // Derived filtered data
  const filteredLeads = useMemo(() => {
    return mockLeads.filter((lead) => {
      const query = searchText.toLowerCase();
      const matchesSearch =
        !searchText ||
        lead.contactName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.phone.includes(searchText);

      const matchesPipeline = !pipelineFilter || lead.pipeline === pipelineFilter;
      const matchesStage = !stageFilter || lead.stage === stageFilter;
      const matchesBusinessLine = !businessLineFilter || lead.businessLine === businessLineFilter;
      const matchesRep = !assignedRepFilter || lead.assignedRep === assignedRepFilter;

      return matchesSearch && matchesPipeline && matchesStage && matchesBusinessLine && matchesRep;
    });
  }, [searchText, pipelineFilter, stageFilter, businessLineFilter, assignedRepFilter]);

  // Actions
  const handleRowClick = (record: Lead) => {
    // Placeholder – navigate to lead detail page
    message.info(`Navigating to lead detail for ${record.contactName}...`);
    router.push(`/dashboard/leads/${record.id}`);
  };

  const handleAction = (key: string, record: Lead) => {
    switch (key) {
      case 'view':
        handleRowClick(record);
        break;
      case 'edit':
        message.info(`Edit lead: ${record.contactName}`);
        break;
      default:
        break;
    }
  };

  const handleNewLead = () => {
    message.info('New Lead form coming soon');
  };

  const handleExport = () => {
    message.success('Leads exported successfully');
  };

  // Table columns
  const columns: ColumnsType<Lead> = [
    {
      title: 'Contact Name',
      dataIndex: 'contactName',
      key: 'contactName',
      sorter: (a, b) => a.contactName.localeCompare(b.contactName),
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <span className="text-sm">{text}</span>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'Pipeline',
      dataIndex: 'pipeline',
      key: 'pipeline',
      width: 120,
      render: (text: string) => (
        <span style={{ textTransform: 'capitalize' }}>{text}</span>
      ),
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      width: 140,
      sorter: (a, b) => {
        const order = ['new', 'contacted', 'estimate_sent', 'won', 'lost'];
        return order.indexOf(a.stage) - order.indexOf(b.stage);
      },
      render: (stage: string) => (
        <Tag color={stageColorMap[stage] || 'default'}>
          {stageLabel[stage] || stage}
        </Tag>
      ),
    },
    {
      title: 'Business Line',
      dataIndex: 'businessLine',
      key: 'businessLine',
      width: 150,
      render: (bl: string) => businessLineLabel[bl] || bl,
    },
    {
      title: 'Assigned Rep',
      dataIndex: 'assignedRep',
      key: 'assignedRep',
      width: 150,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'View' },
              { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              handleAction(key, record);
            },
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Leads</h1>
        <Space>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            Export
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewLead}>
            New Lead
          </Button>
        </Space>
      </div>

      <Card>
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Search leads..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Select
            placeholder="Pipeline"
            options={pipelineOptions}
            value={pipelineFilter}
            onChange={(val) => setPipelineFilter(val)}
            allowClear
            style={{ width: 160 }}
          />
          <Select
            placeholder="Stage"
            options={stageOptions}
            value={stageFilter}
            onChange={(val) => setStageFilter(val)}
            allowClear
            style={{ width: 160 }}
          />
          <Select
            placeholder="Business Line"
            options={businessLineOptions}
            value={businessLineFilter}
            onChange={(val) => setBusinessLineFilter(val)}
            allowClear
            style={{ width: 170 }}
          />
          <Select
            placeholder="Assigned Rep"
            options={assignedRepOptions}
            value={assignedRepFilter}
            onChange={(val) => setAssignedRepFilter(val)}
            allowClear
            style={{ width: 170 }}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredLeads}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `${total} leads`,
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}
