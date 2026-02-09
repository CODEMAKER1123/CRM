'use client';

import { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Switch,
  Tabs,
  Space,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// ----- Types -----

interface CommissionRule {
  id: string;
  name: string;
  roleType: 'crew' | 'sales_rep';
  businessLine: string;
  rate: number; // decimal, e.g. 0.12 = 12%
  base: 'gross_revenue' | 'net_of_expenses';
  trigger: 'on_job_complete' | 'on_invoice_paid';
  isActive: boolean;
  effectiveDate: string;
}

interface BonusRule {
  id: string;
  name: string;
  roleType: 'crew' | 'sales_rep';
  metric: string;
  threshold: number;
  bonusAmountCents: number;
  period: 'weekly' | 'monthly' | 'quarterly';
  isActive: boolean;
}

// ----- Mock Data -----

const mockCommissionRules: CommissionRule[] = [
  {
    id: 'CR-001',
    name: 'Crew Standard - Gross',
    roleType: 'crew',
    businessLine: 'Residential',
    rate: 0.12,
    base: 'gross_revenue',
    trigger: 'on_job_complete',
    isActive: true,
    effectiveDate: '2024-01-01',
  },
  {
    id: 'CR-002',
    name: 'Crew Standard - Net',
    roleType: 'crew',
    businessLine: 'Residential',
    rate: 0.10,
    base: 'net_of_expenses',
    trigger: 'on_job_complete',
    isActive: true,
    effectiveDate: '2024-01-01',
  },
  {
    id: 'CR-003',
    name: 'Sales Rep Standard',
    roleType: 'sales_rep',
    businessLine: 'Commercial',
    rate: 0.10,
    base: 'gross_revenue',
    trigger: 'on_invoice_paid',
    isActive: true,
    effectiveDate: '2024-01-01',
  },
  {
    id: 'CR-004',
    name: 'Sales Rep Self-Gen',
    roleType: 'sales_rep',
    businessLine: 'All',
    rate: 0.08,
    base: 'gross_revenue',
    trigger: 'on_invoice_paid',
    isActive: true,
    effectiveDate: '2024-03-01',
  },
  {
    id: 'CR-005',
    name: 'Crew Premium - Commercial',
    roleType: 'crew',
    businessLine: 'Commercial',
    rate: 0.15,
    base: 'net_of_expenses',
    trigger: 'on_job_complete',
    isActive: false,
    effectiveDate: '2023-06-01',
  },
];

const mockBonusRules: BonusRule[] = [
  {
    id: 'BR-001',
    name: 'Monthly Revenue Bonus',
    roleType: 'sales_rep',
    metric: 'Total Revenue',
    threshold: 5000000, // in cents
    bonusAmountCents: 50000,
    period: 'monthly',
    isActive: true,
  },
  {
    id: 'BR-002',
    name: 'Jobs Completed Bonus',
    roleType: 'crew',
    metric: 'Jobs Completed',
    threshold: 20,
    bonusAmountCents: 25000,
    period: 'monthly',
    isActive: true,
  },
  {
    id: 'BR-003',
    name: 'Quarterly Sales Target',
    roleType: 'sales_rep',
    metric: 'New Customers',
    threshold: 15,
    bonusAmountCents: 100000,
    period: 'quarterly',
    isActive: false,
  },
];

// ----- Helpers -----

const formatRate = (rate: number): string => {
  return `${(rate * 100).toFixed(0)}%`;
};

const centsToDollars = (cents: number): string => {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const roleTypeColor: Record<string, string> = {
  crew: 'blue',
  sales_rep: 'green',
};

const roleTypeLabels: Record<string, string> = {
  crew: 'Crew',
  sales_rep: 'Sales Rep',
};

const baseLabels: Record<string, string> = {
  gross_revenue: 'Gross Revenue',
  net_of_expenses: 'Net of Expenses',
};

const triggerLabels: Record<string, string> = {
  on_job_complete: 'On Job Complete',
  on_invoice_paid: 'On Invoice Paid',
};

const periodLabels: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};

// ----- Page Component -----

export default function CommissionRulesPage() {
  const [commissionRules, setCommissionRules] =
    useState<CommissionRule[]>(mockCommissionRules);
  const [bonusRules, setBonusRules] =
    useState<BonusRule[]>(mockBonusRules);

  const handleToggleCommissionRule = (id: string, checked: boolean) => {
    setCommissionRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: checked } : r))
    );
    message.success(
      `Commission rule ${checked ? 'activated' : 'deactivated'}`
    );
  };

  const handleToggleBonusRule = (id: string, checked: boolean) => {
    setBonusRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: checked } : r))
    );
    message.success(`Bonus rule ${checked ? 'activated' : 'deactivated'}`);
  };

  const handleDeactivateCommissionRule = (id: string) => {
    setCommissionRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: false } : r))
    );
    message.success('Commission rule deactivated');
  };

  const handleDeactivateBonusRule = (id: string) => {
    setBonusRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: false } : r))
    );
    message.success('Bonus rule deactivated');
  };

  const handleEditCommissionRule = (id: string) => {
    message.info(`Edit commission rule ${id}`);
  };

  const handleEditBonusRule = (id: string) => {
    message.info(`Edit bonus rule ${id}`);
  };

  // ----- Commission Rules Columns -----

  const commissionColumns: ColumnsType<CommissionRule> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Role Type',
      dataIndex: 'roleType',
      key: 'roleType',
      width: 120,
      filters: [
        { text: 'Crew', value: 'crew' },
        { text: 'Sales Rep', value: 'sales_rep' },
      ],
      onFilter: (value, record) => record.roleType === value,
      render: (roleType: string) => (
        <Tag color={roleTypeColor[roleType]}>
          {roleTypeLabels[roleType]}
        </Tag>
      ),
    },
    {
      title: 'Business Line',
      dataIndex: 'businessLine',
      key: 'businessLine',
      width: 130,
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.rate - b.rate,
      render: (rate: number) => (
        <span className="font-semibold">{formatRate(rate)}</span>
      ),
    },
    {
      title: 'Base',
      dataIndex: 'base',
      key: 'base',
      width: 150,
      filters: [
        { text: 'Gross Revenue', value: 'gross_revenue' },
        { text: 'Net of Expenses', value: 'net_of_expenses' },
      ],
      onFilter: (value, record) => record.base === value,
      render: (base: string) => baseLabels[base],
    },
    {
      title: 'Trigger',
      dataIndex: 'trigger',
      key: 'trigger',
      width: 150,
      render: (trigger: string) => (
        <Tag>{triggerLabels[trigger]}</Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) =>
            handleToggleCommissionRule(record.id, checked)
          }
        />
      ),
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 130,
      sorter: (a, b) =>
        new Date(a.effectiveDate).getTime() -
        new Date(b.effectiveDate).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditCommissionRule(record.id)}
            />
          </Tooltip>
          <Tooltip title="Deactivate">
            <Button
              type="text"
              size="small"
              danger
              icon={<StopOutlined />}
              disabled={!record.isActive}
              onClick={() => handleDeactivateCommissionRule(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ----- Bonus Rules Columns -----

  const bonusColumns: ColumnsType<BonusRule> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Role Type',
      dataIndex: 'roleType',
      key: 'roleType',
      width: 120,
      filters: [
        { text: 'Crew', value: 'crew' },
        { text: 'Sales Rep', value: 'sales_rep' },
      ],
      onFilter: (value, record) => record.roleType === value,
      render: (roleType: string) => (
        <Tag color={roleTypeColor[roleType]}>
          {roleTypeLabels[roleType]}
        </Tag>
      ),
    },
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
      width: 150,
    },
    {
      title: 'Threshold',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 120,
      align: 'right',
      render: (value: number, record) => {
        if (record.metric === 'Total Revenue') {
          return centsToDollars(value);
        }
        return value.toLocaleString();
      },
    },
    {
      title: 'Bonus Amount',
      dataIndex: 'bonusAmountCents',
      key: 'bonusAmountCents',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.bonusAmountCents - b.bonusAmountCents,
      render: (cents: number) => (
        <span className="font-semibold">{centsToDollars(cents)}</span>
      ),
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      width: 110,
      filters: [
        { text: 'Weekly', value: 'weekly' },
        { text: 'Monthly', value: 'monthly' },
        { text: 'Quarterly', value: 'quarterly' },
      ],
      onFilter: (value, record) => record.period === value,
      render: (period: string) => (
        <Tag>{periodLabels[period]}</Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={(checked) =>
            handleToggleBonusRule(record.id, checked)
          }
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditBonusRule(record.id)}
            />
          </Tooltip>
          <Tooltip title="Deactivate">
            <Button
              type="text"
              size="small"
              danger
              icon={<StopOutlined />}
              disabled={!record.isActive}
              onClick={() => handleDeactivateBonusRule(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ----- Tab Items -----

  const tabItems = [
    {
      key: 'commission',
      label: `Commission Rules (${commissionRules.length})`,
      children: (
        <Card
          title="Commission Rules"
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              New Commission Rule
            </Button>
          }
        >
          <Table
            columns={commissionColumns}
            dataSource={commissionRules}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${total} rules`,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'bonus',
      label: `Bonus Rules (${bonusRules.length})`,
      children: (
        <Card
          title="Bonus Rules"
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              New Bonus Rule
            </Button>
          }
        >
          <Table
            columns={bonusColumns}
            dataSource={bonusRules}
            rowKey="id"
            scroll={{ x: 1050 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${total} rules`,
            }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Commission Rules</h1>
      </div>

      <Tabs
        defaultActiveKey="commission"
        items={tabItems}
        size="large"
      />
    </div>
  );
}
