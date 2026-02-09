'use client';

import { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Switch,
  Badge,
  Descriptions,
  Space,
  Typography,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  MailOutlined,
  MessageOutlined,
  BellOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  StopOutlined,
  FireOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AutomationCondition {
  field: string;
  operator: string;
  value: string;
}

interface AutomationAction {
  type: string;
  label: string;
  detail: string;
}

interface AutomationConstraints {
  cooldownMinutes?: number;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  maxFiresPerContact?: number;
  businessDaysOnly?: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  triggerLabel: string;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  constraints: AutomationConstraints;
  isActive: boolean;
  isTestMode: boolean;
  executionCount: number;
  lastFiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockRules: AutomationRule[] = [
  {
    id: 'rule-001',
    name: 'Welcome email on new lead',
    description: 'Sends a personalized welcome email when a new lead is created from any source.',
    triggerEvent: 'lead.created',
    triggerLabel: 'Lead Created',
    conditions: [
      { field: 'Lead Source', operator: 'is not', value: 'Manual Entry' },
      { field: 'Email', operator: 'is not empty', value: '' },
    ],
    actions: [
      { type: 'email', label: 'Send Email', detail: 'Template: "Welcome to Sparkle Wash" to lead email' },
      { type: 'internal', label: 'Assign Lead', detail: 'Round-robin assign to sales team' },
      { type: 'internal', label: 'Create Task', detail: 'Follow-up call task due in 2 hours' },
    ],
    constraints: {
      cooldownMinutes: 0,
      maxFiresPerContact: 1,
      businessDaysOnly: false,
    },
    isActive: true,
    isTestMode: false,
    executionCount: 847,
    lastFiredAt: '2026-02-09T08:32:00Z',
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2026-01-10T14:30:00Z',
  },
  {
    id: 'rule-002',
    name: 'Follow-up SMS after 48h no response',
    description: 'Sends an SMS follow-up if a lead has not responded within 48 hours of initial contact.',
    triggerEvent: 'lead.no_response',
    triggerLabel: 'Lead No Response (48h)',
    conditions: [
      { field: 'Lead Stage', operator: 'equals', value: 'Contacted' },
      { field: 'Hours Since Last Contact', operator: 'greater than', value: '48' },
      { field: 'Phone Number', operator: 'is not empty', value: '' },
    ],
    actions: [
      { type: 'sms', label: 'Send SMS', detail: 'Template: "Following up on your power washing inquiry"' },
      { type: 'internal', label: 'Update Stage', detail: 'Move lead to "Follow Up" stage' },
      { type: 'internal', label: 'Log Activity', detail: 'Record automated follow-up attempt' },
    ],
    constraints: {
      cooldownMinutes: 1440,
      quietHoursStart: '20:00',
      quietHoursEnd: '08:00',
      maxFiresPerContact: 2,
      businessDaysOnly: true,
    },
    isActive: true,
    isTestMode: false,
    executionCount: 312,
    lastFiredAt: '2026-02-09T10:15:00Z',
    createdAt: '2025-07-01T09:00:00Z',
    updatedAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'rule-003',
    name: 'Manager alert on high-value lead',
    description: 'Notifies the sales manager immediately when a lead with an estimated value over $2,000 is created.',
    triggerEvent: 'lead.created',
    triggerLabel: 'Lead Created',
    conditions: [
      { field: 'Estimated Value', operator: 'greater than', value: '$2,000' },
    ],
    actions: [
      { type: 'notification', label: 'Push Notification', detail: 'Alert sales manager with lead details' },
      { type: 'email', label: 'Send Email', detail: 'Priority lead summary to manager@sparklewash.com' },
      { type: 'internal', label: 'Set Priority', detail: 'Mark lead as "High Priority"' },
    ],
    constraints: {
      cooldownMinutes: 0,
      maxFiresPerContact: 1,
      businessDaysOnly: false,
    },
    isActive: true,
    isTestMode: true,
    executionCount: 56,
    lastFiredAt: '2026-02-08T16:45:00Z',
    createdAt: '2025-08-10T08:00:00Z',
    updatedAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'rule-004',
    name: 'Job completion thank-you email',
    description: 'Sends a thank-you email with care tips after a job is marked as completed.',
    triggerEvent: 'job.completed',
    triggerLabel: 'Job Completed',
    conditions: [
      { field: 'Job Status', operator: 'changed to', value: 'Completed' },
      { field: 'Customer Email', operator: 'is not empty', value: '' },
    ],
    actions: [
      { type: 'email', label: 'Send Email', detail: 'Template: "Thank you for choosing Sparkle Wash" with care tips' },
      { type: 'internal', label: 'Create Task', detail: 'Schedule review request for 3 days later' },
    ],
    constraints: {
      cooldownMinutes: 60,
      quietHoursStart: '21:00',
      quietHoursEnd: '07:00',
      maxFiresPerContact: 1,
      businessDaysOnly: false,
    },
    isActive: true,
    isTestMode: false,
    executionCount: 1203,
    lastFiredAt: '2026-02-09T15:20:00Z',
    createdAt: '2025-05-20T10:00:00Z',
    updatedAt: '2025-12-05T16:00:00Z',
  },
  {
    id: 'rule-005',
    name: 'Review request 3 days after completion',
    description: 'Sends a Google Review request email 3 days after the job is completed.',
    triggerEvent: 'job.completed',
    triggerLabel: 'Job Completed (+3 days delay)',
    conditions: [
      { field: 'Days Since Completion', operator: 'equals', value: '3' },
      { field: 'Customer Email', operator: 'is not empty', value: '' },
      { field: 'Customer Has Reviewed', operator: 'equals', value: 'No' },
    ],
    actions: [
      { type: 'email', label: 'Send Email', detail: 'Template: "How did we do?" with Google Review link' },
      { type: 'sms', label: 'Send SMS', detail: 'Short review request with direct link' },
    ],
    constraints: {
      cooldownMinutes: 4320,
      quietHoursStart: '20:00',
      quietHoursEnd: '09:00',
      maxFiresPerContact: 1,
      businessDaysOnly: true,
    },
    isActive: false,
    isTestMode: false,
    executionCount: 489,
    lastFiredAt: '2026-01-28T11:00:00Z',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
  },
  {
    id: 'rule-006',
    name: 'Overdue invoice reminder',
    description: 'Sends a payment reminder when an invoice becomes overdue by more than 7 days.',
    triggerEvent: 'invoice.overdue',
    triggerLabel: 'Invoice Overdue (7+ days)',
    conditions: [
      { field: 'Days Overdue', operator: 'greater than', value: '7' },
      { field: 'Invoice Status', operator: 'equals', value: 'Unpaid' },
      { field: 'Amount Due', operator: 'greater than', value: '$0' },
    ],
    actions: [
      { type: 'email', label: 'Send Email', detail: 'Template: "Payment Reminder" with invoice link and amount' },
      { type: 'notification', label: 'Push Notification', detail: 'Alert office manager of overdue account' },
      { type: 'internal', label: 'Update Flag', detail: 'Flag customer account as "Payment Overdue"' },
    ],
    constraints: {
      cooldownMinutes: 10080,
      quietHoursStart: '18:00',
      quietHoursEnd: '08:00',
      maxFiresPerContact: 3,
      businessDaysOnly: true,
    },
    isActive: true,
    isTestMode: false,
    executionCount: 134,
    lastFiredAt: '2026-02-07T09:05:00Z',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2026-01-15T12:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const actionTypeIcon: Record<string, React.ReactNode> = {
  email: <MailOutlined />,
  sms: <MessageOutlined />,
  notification: <BellOutlined />,
  internal: <ThunderboltOutlined />,
};

const actionTypeColor: Record<string, string> = {
  email: 'blue',
  sms: 'green',
  notification: 'orange',
  internal: 'purple',
};

const triggerEventColor: Record<string, string> = {
  'lead.created': 'cyan',
  'lead.no_response': 'gold',
  'job.completed': 'green',
  'invoice.overdue': 'red',
};

function formatCooldown(minutes: number): string {
  if (minutes === 0) return 'None';
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);

  const handleToggleActive = (ruleId: string, checked: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: checked } : r)),
    );
  };

  const handleToggleTestMode = (ruleId: string, checked: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isTestMode: checked } : r)),
    );
  };

  const handleDelete = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  // -- Summary stats --
  const activeCount = rules.filter((r) => r.isActive).length;
  const testModeCount = rules.filter((r) => r.isTestMode).length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);

  // -- Table columns --
  const columns: ColumnsType<AutomationRule> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (name: string, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Trigger Event',
      dataIndex: 'triggerLabel',
      key: 'triggerLabel',
      width: 200,
      render: (label: string, record) => (
        <Tag
          color={triggerEventColor[record.triggerEvent] || 'default'}
          icon={<ThunderboltOutlined />}
        >
          {label}
        </Tag>
      ),
    },
    {
      title: '# Conditions',
      key: 'conditions',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Badge
          count={record.conditions.length}
          style={{ backgroundColor: '#8c8c8c' }}
          overflowCount={99}
        />
      ),
    },
    {
      title: '# Actions',
      key: 'actions_count',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Badge
          count={record.actions.length}
          style={{ backgroundColor: '#1890ff' }}
          overflowCount={99}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={record.isActive ? 'Active - click to deactivate' : 'Inactive - click to activate'}>
          <Switch
            checked={record.isActive}
            onChange={(checked) => handleToggleActive(record.id, checked)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<PauseCircleOutlined />}
            style={{
              backgroundColor: record.isActive ? '#52c41a' : '#bfbfbf',
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Test Mode',
      key: 'testMode',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={record.isTestMode ? 'Test mode ON - actions are logged but not sent' : 'Test mode OFF - actions execute normally'}>
          <Switch
            checked={record.isTestMode}
            onChange={(checked) => handleToggleTestMode(record.id, checked)}
            checkedChildren={<ExperimentOutlined />}
            unCheckedChildren={<ExperimentOutlined />}
            style={{
              backgroundColor: record.isTestMode ? '#faad14' : '#bfbfbf',
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Executions',
      dataIndex: 'executionCount',
      key: 'executionCount',
      width: 110,
      align: 'center',
      sorter: (a, b) => a.executionCount - b.executionCount,
      render: (count: number) => (
        <Text strong style={{ fontSize: 14 }}>
          {count.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Last Fired',
      dataIndex: 'lastFiredAt',
      key: 'lastFiredAt',
      width: 150,
      sorter: (a, b) => {
        if (!a.lastFiredAt) return -1;
        if (!b.lastFiredAt) return 1;
        return dayjs(a.lastFiredAt).unix() - dayjs(b.lastFiredAt).unix();
      },
      render: (date: string | null) =>
        date ? (
          <Tooltip title={dayjs(date).format('MMM D, YYYY h:mm A')}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(date).fromNow()}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>Never</Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit rule">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Popconfirm
            title="Delete automation rule"
            description={`Are you sure you want to delete "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete rule">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // -- Expandable row renderer --
  const expandedRowRender = (record: AutomationRule) => (
    <div style={{ padding: '8px 0' }}>
      <Row gutter={[24, 16]}>
        {/* Trigger & Conditions */}
        <Col xs={24} lg={8}>
          <Card
            size="small"
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                <span>Trigger &amp; Conditions</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>TRIGGER EVENT</Text>
              <br />
              <Tag
                color={triggerEventColor[record.triggerEvent] || 'default'}
                style={{ marginTop: 4 }}
              >
                {record.triggerLabel}
              </Tag>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>CONDITIONS</Text>
              {record.conditions.map((condition, index) => (
                <div
                  key={index}
                  style={{
                    padding: '6px 10px',
                    marginTop: 6,
                    backgroundColor: '#fafafa',
                    borderRadius: 6,
                    border: '1px solid #f0f0f0',
                    fontSize: 13,
                  }}
                >
                  <Text strong>{condition.field}</Text>{' '}
                  <Text type="secondary">{condition.operator}</Text>{' '}
                  {condition.value && <Text code>{condition.value}</Text>}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Actions */}
        <Col xs={24} lg={8}>
          <Card
            size="small"
            title={
              <Space>
                <PlayCircleOutlined style={{ color: '#52c41a' }} />
                <span>Actions ({record.actions.length})</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            {record.actions.map((action, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 10px',
                  marginBottom: index < record.actions.length - 1 ? 8 : 0,
                  backgroundColor: '#fafafa',
                  borderRadius: 6,
                  border: '1px solid #f0f0f0',
                }}
              >
                <div style={{ marginBottom: 4 }}>
                  <Tag
                    color={actionTypeColor[action.type] || 'default'}
                    icon={actionTypeIcon[action.type]}
                    style={{ marginRight: 8 }}
                  >
                    {action.label}
                  </Tag>
                  <Text style={{ fontSize: 12 }}>Step {index + 1}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {action.detail}
                </Text>
              </div>
            ))}
          </Card>
        </Col>

        {/* Constraints */}
        <Col xs={24} lg={8}>
          <Card
            size="small"
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#faad14' }} />
                <span>Constraints</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Descriptions
              column={1}
              size="small"
              labelStyle={{ fontSize: 12, color: '#8c8c8c', width: 140 }}
              contentStyle={{ fontSize: 13 }}
            >
              <Descriptions.Item label="Cooldown Period">
                {formatCooldown(record.constraints.cooldownMinutes ?? 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Quiet Hours">
                {record.constraints.quietHoursStart && record.constraints.quietHoursEnd ? (
                  <Tag icon={<StopOutlined />} color="volcano">
                    {record.constraints.quietHoursStart} - {record.constraints.quietHoursEnd}
                  </Tag>
                ) : (
                  <Text type="secondary">None</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Max Fires / Contact">
                {record.constraints.maxFiresPerContact != null ? (
                  <Tag icon={<FireOutlined />} color="orange">
                    {record.constraints.maxFiresPerContact}x max
                  </Tag>
                ) : (
                  <Text type="secondary">Unlimited</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Business Days Only">
                {record.constraints.businessDaysOnly ? (
                  <Tag color="blue">Yes</Tag>
                ) : (
                  <Tag>No</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // -- Row class for color-coding --
  const rowClassName = (record: AutomationRule) => {
    if (record.isTestMode) return 'automation-row-test';
    if (!record.isActive) return 'automation-row-inactive';
    return 'automation-row-active';
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Inline styles for row color coding */}
      <style>{`
        .automation-row-active {
          background-color: #f6ffed;
        }
        .automation-row-active:hover > td {
          background-color: #d9f7be !important;
        }
        .automation-row-inactive {
          background-color: #fafafa;
        }
        .automation-row-inactive:hover > td {
          background-color: #f0f0f0 !important;
        }
        .automation-row-test {
          background-color: #fffbe6;
        }
        .automation-row-test:hover > td {
          background-color: #fff1b8 !important;
        }
      `}</style>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          <ThunderboltOutlined style={{ marginRight: 10 }} />
          Automation Rules
        </Title>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          New Rule
        </Button>
      </div>

      {/* Summary Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="Active Rules"
              value={activeCount}
              suffix={`/ ${rules.length}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="In Test Mode"
              value={testModeCount}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="Total Executions"
              value={totalExecutions}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Color-code Legend */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Space>
          <Badge color="#52c41a" />
          <Text type="secondary" style={{ fontSize: 12 }}>Active</Text>
        </Space>
        <Space>
          <Badge color="#d9d9d9" />
          <Text type="secondary" style={{ fontSize: 12 }}>Inactive</Text>
        </Space>
        <Space>
          <Badge color="#faad14" />
          <Text type="secondary" style={{ fontSize: 12 }}>Test Mode</Text>
        </Space>
      </div>

      {/* Rules Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          rowClassName={rowClassName}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} automation rules`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
