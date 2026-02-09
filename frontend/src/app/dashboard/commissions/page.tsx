'use client';

import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Select,
  DatePicker,
  Space,
  message,
} from 'antd';
import {
  DollarOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ----- Types -----

interface CommissionRecord {
  id: string;
  employee: string;
  roleType: 'crew' | 'sales_rep';
  jobNumber: string;
  jobDescription: string;
  grossRevenueCents: number;
  deductionsCents: number;
  commissionBaseCents: number;
  ratePercent: number;
  commissionAmountCents: number;
  bonusCents: number;
  status: 'pending' | 'approved' | 'paid';
  jobDate: string;
}

// ----- Mock data -----

const mockCommissions: CommissionRecord[] = [
  {
    id: 'COM-001',
    employee: 'Marcus Rivera',
    roleType: 'crew',
    jobNumber: 'JOB-2024-00048',
    jobDescription: 'Residential driveway power wash',
    grossRevenueCents: 45000,
    deductionsCents: 2500,
    commissionBaseCents: 42500,
    ratePercent: 12,
    commissionAmountCents: 5100,
    bonusCents: 0,
    status: 'paid',
    jobDate: '2024-01-03',
  },
  {
    id: 'COM-002',
    employee: 'Jake Thompson',
    roleType: 'sales_rep',
    jobNumber: 'JOB-2024-00049',
    jobDescription: 'Commercial building exterior wash',
    grossRevenueCents: 285000,
    deductionsCents: 15000,
    commissionBaseCents: 270000,
    ratePercent: 10,
    commissionAmountCents: 27000,
    bonusCents: 5000,
    status: 'paid',
    jobDate: '2024-01-05',
  },
  {
    id: 'COM-003',
    employee: 'Marcus Rivera',
    roleType: 'crew',
    jobNumber: 'JOB-2024-00050',
    jobDescription: 'Pool deck & patio power wash',
    grossRevenueCents: 62000,
    deductionsCents: 3500,
    commissionBaseCents: 58500,
    ratePercent: 12,
    commissionAmountCents: 7020,
    bonusCents: 0,
    status: 'approved',
    jobDate: '2024-01-08',
  },
  {
    id: 'COM-004',
    employee: 'Sarah Chen',
    roleType: 'sales_rep',
    jobNumber: 'JOB-2024-00051',
    jobDescription: 'HOA common areas - 12 buildings',
    grossRevenueCents: 480000,
    deductionsCents: 28000,
    commissionBaseCents: 452000,
    ratePercent: 8,
    commissionAmountCents: 36160,
    bonusCents: 10000,
    status: 'approved',
    jobDate: '2024-01-09',
  },
  {
    id: 'COM-005',
    employee: 'Derek Williams',
    roleType: 'crew',
    jobNumber: 'JOB-2024-00052',
    jobDescription: 'Residential full house wash',
    grossRevenueCents: 55000,
    deductionsCents: 3000,
    commissionBaseCents: 52000,
    ratePercent: 15,
    commissionAmountCents: 7800,
    bonusCents: 2000,
    status: 'pending',
    jobDate: '2024-01-10',
  },
  {
    id: 'COM-006',
    employee: 'Jake Thompson',
    roleType: 'sales_rep',
    jobNumber: 'JOB-2024-00053',
    jobDescription: 'Restaurant patio & walkways',
    grossRevenueCents: 125000,
    deductionsCents: 7500,
    commissionBaseCents: 117500,
    ratePercent: 10,
    commissionAmountCents: 11750,
    bonusCents: 0,
    status: 'pending',
    jobDate: '2024-01-11',
  },
  {
    id: 'COM-007',
    employee: 'Tony Martinez',
    roleType: 'crew',
    jobNumber: 'JOB-2024-00054',
    jobDescription: 'Driveway & sidewalk cleaning',
    grossRevenueCents: 38000,
    deductionsCents: 2000,
    commissionBaseCents: 36000,
    ratePercent: 10,
    commissionAmountCents: 3600,
    bonusCents: 0,
    status: 'paid',
    jobDate: '2024-01-04',
  },
  {
    id: 'COM-008',
    employee: 'Sarah Chen',
    roleType: 'sales_rep',
    jobNumber: 'JOB-2024-00055',
    jobDescription: 'Apartment complex - 6 units exterior',
    grossRevenueCents: 340000,
    deductionsCents: 18000,
    commissionBaseCents: 322000,
    ratePercent: 9,
    commissionAmountCents: 28980,
    bonusCents: 7500,
    status: 'pending',
    jobDate: '2024-01-12',
  },
  {
    id: 'COM-009',
    employee: 'Derek Williams',
    roleType: 'crew',
    jobNumber: 'JOB-2024-00056',
    jobDescription: 'Fence & deck staining prep wash',
    grossRevenueCents: 72000,
    deductionsCents: 4500,
    commissionBaseCents: 67500,
    ratePercent: 13,
    commissionAmountCents: 8775,
    bonusCents: 0,
    status: 'approved',
    jobDate: '2024-01-07',
  },
  {
    id: 'COM-010',
    employee: 'Tony Martinez',
    roleType: 'crew',
    jobNumber: 'JOB-2024-00057',
    jobDescription: 'Garage floor & oil stain removal',
    grossRevenueCents: 28000,
    deductionsCents: 1500,
    commissionBaseCents: 26500,
    ratePercent: 11,
    commissionAmountCents: 2915,
    bonusCents: 0,
    status: 'pending',
    jobDate: '2024-01-13',
  },
  {
    id: 'COM-011',
    employee: 'Marcus Rivera',
    roleType: 'crew',
    jobNumber: 'JOB-2024-00058',
    jobDescription: 'Roof soft wash - 2 story home',
    grossRevenueCents: 85000,
    deductionsCents: 5000,
    commissionBaseCents: 80000,
    ratePercent: 14,
    commissionAmountCents: 11200,
    bonusCents: 3000,
    status: 'pending',
    jobDate: '2024-01-14',
  },
  {
    id: 'COM-012',
    employee: 'Jake Thompson',
    roleType: 'sales_rep',
    jobNumber: 'JOB-2024-00059',
    jobDescription: 'Strip mall storefront cleaning',
    grossRevenueCents: 195000,
    deductionsCents: 10000,
    commissionBaseCents: 185000,
    ratePercent: 12,
    commissionAmountCents: 22200,
    bonusCents: 0,
    status: 'approved',
    jobDate: '2024-01-06',
  },
];

// ----- Helpers -----

const centsToDollars = (cents: number): string => {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusColorMap: Record<string, string> = {
  pending: 'gold',
  approved: 'blue',
  paid: 'green',
};

const roleTypeLabels: Record<string, string> = {
  crew: 'Crew',
  sales_rep: 'Sales Rep',
};

// ----- Computed data for the bar chart -----

function buildChartData(records: CommissionRecord[]) {
  const byEmployee: Record<
    string,
    { commissionCents: number; bonusCents: number }
  > = {};

  records.forEach((r) => {
    if (!byEmployee[r.employee]) {
      byEmployee[r.employee] = { commissionCents: 0, bonusCents: 0 };
    }
    byEmployee[r.employee].commissionCents += r.commissionAmountCents;
    byEmployee[r.employee].bonusCents += r.bonusCents;
  });

  return Object.entries(byEmployee)
    .map(([name, data]) => ({
      name,
      commissions: data.commissionCents / 100,
      bonuses: data.bonusCents / 100,
    }))
    .sort((a, b) => b.commissions + b.bonuses - (a.commissions + a.bonuses));
}

// ----- Page Component -----

export default function CommissionsPage() {
  const [records, setRecords] = useState<CommissionRecord[]>(mockCommissions);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Apply filters
  const filteredRecords = records.filter((r) => {
    const matchesRole = !roleFilter || r.roleType === roleFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesRole && matchesStatus;
  });

  // Metrics computed from current (all) records
  const totalCommissionsCents = records.reduce(
    (sum, r) => sum + r.commissionAmountCents,
    0
  );
  const totalBonusesCents = records.reduce((sum, r) => sum + r.bonusCents, 0);
  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const avgRate =
    records.length > 0
      ? records.reduce((sum, r) => sum + r.ratePercent, 0) / records.length
      : 0;

  // Chart data from filtered records
  const chartData = buildChartData(filteredRecords);

  // Approve handler
  const handleApprove = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r))
    );
    message.success('Commission approved');
  };

  // Table columns
  const columns: ColumnsType<CommissionRecord> = [
    {
      title: 'Employee',
      key: 'employee',
      width: 160,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.employee}</div>
          <Tag color={record.roleType === 'crew' ? 'cyan' : 'purple'}>
            {roleTypeLabels[record.roleType]}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Job #',
      dataIndex: 'jobNumber',
      key: 'jobNumber',
      width: 150,
      render: (text: string, record) => (
        <div>
          <a className="font-medium">{text}</a>
          <div className="text-xs text-gray-500">{record.jobDescription}</div>
        </div>
      ),
    },
    {
      title: 'Gross Revenue',
      dataIndex: 'grossRevenueCents',
      key: 'grossRevenue',
      width: 120,
      align: 'right',
      render: (cents: number) => centsToDollars(cents),
    },
    {
      title: 'Deductions',
      dataIndex: 'deductionsCents',
      key: 'deductions',
      width: 110,
      align: 'right',
      render: (cents: number) => (
        <span className="text-red-500">-{centsToDollars(cents)}</span>
      ),
    },
    {
      title: 'Commission Base',
      dataIndex: 'commissionBaseCents',
      key: 'commissionBase',
      width: 130,
      align: 'right',
      render: (cents: number) => centsToDollars(cents),
    },
    {
      title: 'Rate',
      dataIndex: 'ratePercent',
      key: 'rate',
      width: 70,
      align: 'center',
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'Commission',
      dataIndex: 'commissionAmountCents',
      key: 'commissionAmount',
      width: 120,
      align: 'right',
      render: (cents: number) => (
        <span className="font-semibold">{centsToDollars(cents)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) =>
        record.status === 'pending' ? (
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.id)}
          >
            Approve
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Commissions Overview</h1>

      {/* ---- Top Metrics ---- */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Commissions (MTD)"
              value={totalCommissionsCents / 100}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Bonuses (MTD)"
              value={totalBonusesCents / 100}
              precision={2}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approval"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Commission Rate"
              value={avgRate}
              precision={1}
              prefix={<PercentageOutlined />}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ---- Bar Chart: Commissions by Team Member ---- */}
      <Card title="Commissions by Team Member" className="mb-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              tickFormatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <Legend />
            <Bar dataKey="commissions" name="Commissions" fill="#1890ff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="bonuses" name="Bonuses" fill="#722ed1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ---- Filters + Table ---- */}
      <Card title="Commission Records">
        <div className="flex gap-4 mb-4 flex-wrap">
          <DatePicker.RangePicker />
          <Select
            placeholder="Role Type"
            allowClear
            style={{ width: 160 }}
            value={roleFilter}
            onChange={(value) => setRoleFilter(value)}
            options={[
              { value: 'crew', label: 'Crew' },
              { value: 'sales_rep', label: 'Sales Rep' },
            ]}
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'paid', label: 'Paid' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} records`,
          }}
        />
      </Card>
    </div>
  );
}
