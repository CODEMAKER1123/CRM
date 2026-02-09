'use client';

import { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Statistic, Select, DatePicker, Space, Modal, Input } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExportOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface CommissionRecord {
  id: string;
  employeeName: string;
  roleType: 'crew' | 'sales_rep';
  jobNumber: string;
  customer: string;
  grossRevenueCents: number;
  deductionsCents: number;
  commissionBaseCents: number;
  commissionRate: number;
  commissionCents: number;
  status: 'pending' | 'approved' | 'paid';
  payPeriod: string;
  createdAt: string;
}

const mockRecords: CommissionRecord[] = [
  { id: '1', employeeName: 'Carlos Rivera', roleType: 'crew', jobNumber: 'JOB-2026-0034', customer: 'John Smith', grossRevenueCents: 125000, deductionsCents: 0, commissionBaseCents: 125000, commissionRate: 0.12, commissionCents: 15000, status: 'pending', payPeriod: 'Feb 1-15, 2026', createdAt: '2026-02-08' },
  { id: '2', employeeName: 'Derek Watson', roleType: 'crew', jobNumber: 'JOB-2026-0035', customer: 'Sarah Johnson', grossRevenueCents: 245000, deductionsCents: 15000, commissionBaseCents: 230000, commissionRate: 0.12, commissionCents: 27600, status: 'pending', payPeriod: 'Feb 1-15, 2026', createdAt: '2026-02-07' },
  { id: '3', employeeName: 'Jake Thompson', roleType: 'sales_rep', jobNumber: 'JOB-2026-0033', customer: 'ABC Property Mgmt', grossRevenueCents: 450000, deductionsCents: 0, commissionBaseCents: 450000, commissionRate: 0.10, commissionCents: 45000, status: 'pending', payPeriod: 'Feb 1-15, 2026', createdAt: '2026-02-06' },
  { id: '4', employeeName: 'Carlos Rivera', roleType: 'crew', jobNumber: 'JOB-2026-0030', customer: 'Mike Wilson', grossRevenueCents: 85000, deductionsCents: 0, commissionBaseCents: 85000, commissionRate: 0.12, commissionCents: 10200, status: 'approved', payPeriod: 'Jan 16-31, 2026', createdAt: '2026-01-28' },
  { id: '5', employeeName: 'Olivia Davis', roleType: 'sales_rep', jobNumber: 'JOB-2026-0029', customer: 'Emily Brown', grossRevenueCents: 320000, deductionsCents: 0, commissionBaseCents: 320000, commissionRate: 0.10, commissionCents: 32000, status: 'approved', payPeriod: 'Jan 16-31, 2026', createdAt: '2026-01-25' },
  { id: '6', employeeName: 'Raj Patel', roleType: 'crew', jobNumber: 'JOB-2026-0028', customer: 'Robert Davis', grossRevenueCents: 185000, deductionsCents: 8500, commissionBaseCents: 176500, commissionRate: 0.12, commissionCents: 21180, status: 'paid', payPeriod: 'Jan 1-15, 2026', createdAt: '2026-01-14' },
  { id: '7', employeeName: 'Jake Thompson', roleType: 'sales_rep', jobNumber: 'JOB-2026-0025', customer: 'Lisa Anderson', grossRevenueCents: 275000, deductionsCents: 0, commissionBaseCents: 275000, commissionRate: 0.10, commissionCents: 27500, status: 'paid', payPeriod: 'Jan 1-15, 2026', createdAt: '2026-01-10' },
  { id: '8', employeeName: 'Derek Watson', roleType: 'crew', jobNumber: 'JOB-2026-0024', customer: 'David Williams', grossRevenueCents: 195000, deductionsCents: 12000, commissionBaseCents: 183000, commissionRate: 0.12, commissionCents: 21960, status: 'paid', payPeriod: 'Jan 1-15, 2026', createdAt: '2026-01-08' },
  { id: '9', employeeName: 'Carlos Rivera', roleType: 'crew', jobNumber: 'JOB-2026-0022', customer: 'Jennifer Moore', grossRevenueCents: 92000, deductionsCents: 0, commissionBaseCents: 92000, commissionRate: 0.12, commissionCents: 11040, status: 'paid', payPeriod: 'Dec 16-31, 2025', createdAt: '2025-12-29' },
  { id: '10', employeeName: 'Olivia Davis', roleType: 'sales_rep', jobNumber: 'JOB-2026-0020', customer: 'James Taylor', grossRevenueCents: 520000, deductionsCents: 0, commissionBaseCents: 520000, commissionRate: 0.08, commissionCents: 41600, status: 'paid', payPeriod: 'Dec 16-31, 2025', createdAt: '2025-12-22' },
];

const fmt = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const statusColors: Record<string, string> = {
  pending: 'gold',
  approved: 'blue',
  paid: 'green',
};

export default function CommissionRecordsPage() {
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const filtered = mockRecords.filter((r) => {
    if (roleFilter && r.roleType !== roleFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const pendingTotal = filtered.filter((r) => r.status === 'pending').reduce((s, r) => s + r.commissionCents, 0);
  const approvedTotal = filtered.filter((r) => r.status === 'approved').reduce((s, r) => s + r.commissionCents, 0);
  const paidTotal = filtered.filter((r) => r.status === 'paid').reduce((s, r) => s + r.commissionCents, 0);

  const columns = [
    { title: 'Employee', dataIndex: 'employeeName', key: 'employeeName', sorter: (a: CommissionRecord, b: CommissionRecord) => a.employeeName.localeCompare(b.employeeName) },
    {
      title: 'Role',
      dataIndex: 'roleType',
      key: 'roleType',
      render: (role: string) => <Tag color={role === 'crew' ? 'blue' : 'green'}>{role === 'crew' ? 'Crew' : 'Sales Rep'}</Tag>,
    },
    { title: 'Job #', dataIndex: 'jobNumber', key: 'jobNumber' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Gross Revenue', dataIndex: 'grossRevenueCents', key: 'gross', render: (v: number) => fmt(v), align: 'right' as const },
    { title: 'Deductions', dataIndex: 'deductionsCents', key: 'deductions', render: (v: number) => v > 0 ? <span style={{ color: '#ff4d4f' }}>-{fmt(v)}</span> : '-', align: 'right' as const },
    { title: 'Rate', dataIndex: 'commissionRate', key: 'rate', render: (v: number) => `${(v * 100).toFixed(0)}%`, align: 'center' as const },
    { title: 'Commission', dataIndex: 'commissionCents', key: 'commission', render: (v: number) => <strong>{fmt(v)}</strong>, align: 'right' as const },
    { title: 'Pay Period', dataIndex: 'payPeriod', key: 'payPeriod' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: CommissionRecord) => (
        <Space>
          {record.status === 'pending' && (
            <Button type="primary" size="small" icon={<CheckCircleOutlined />}>
              Approve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Commission Records</h1>
        <Button icon={<ExportOutlined />}>Export</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Pending Approval"
              value={pendingTotal / 100}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#faad14' }}
              suffix={<Tag color="gold">{filtered.filter((r) => r.status === 'pending').length}</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Approved (Not Paid)"
              value={approvedTotal / 100}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
              suffix={<Tag color="blue">{filtered.filter((r) => r.status === 'approved').length}</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Paid"
              value={paidTotal / 100}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
              suffix={<Tag color="green">{filtered.filter((r) => r.status === 'paid').length}</Tag>}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker />
          <Select
            placeholder="Role Type"
            allowClear
            style={{ width: 140 }}
            onChange={(v) => setRoleFilter(v)}
            options={[
              { label: 'Crew', value: 'crew' },
              { label: 'Sales Rep', value: 'sales_rep' },
            ]}
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 140 }}
            onChange={(v) => setStatusFilter(v)}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Paid', value: 'paid' },
            ]}
          />
        </Space>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20 }}
          summary={(data) => {
            const totalCommission = data.reduce((s, r) => s + r.commissionCents, 0);
            const totalGross = data.reduce((s, r) => s + r.grossRevenueCents, 0);
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <strong>Total ({data.length} records)</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <strong>{fmt(totalGross)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} colSpan={2} />
                  <Table.Summary.Cell index={7} align="right">
                    <strong>{fmt(totalCommission)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8} colSpan={3} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
    </div>
  );
}
