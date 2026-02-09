'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Select,
  DatePicker,
  Badge,
  Space,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  StopOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ----- Types -----

interface ActionDetail {
  type: string;
  status: 'executed' | 'skipped' | 'failed';
  details: string;
}

interface ExecutionRecord {
  id: string;
  timestamp: string;
  ruleName: string;
  entityType: string;
  entityId: string;
  triggerEvent: string;
  conditionsPassed: boolean;
  actions: ActionDetail[];
  suppressionReason: string | null;
  testMode: boolean;
  outcome: 'successful' | 'suppressed' | 'failed';
}

// ----- Mock data: 24 records spanning 7 days -----

const now = dayjs();

const mockExecutions: ExecutionRecord[] = [
  {
    id: 'EXEC-001',
    timestamp: now.subtract(12, 'minute').toISOString(),
    ruleName: 'New Lead Auto-Reply',
    entityType: 'Lead',
    entityId: 'LEAD-4821',
    triggerEvent: 'lead.created',
    conditionsPassed: true,
    actions: [
      { type: 'Send SMS', status: 'executed', details: 'SMS sent to +1 (555) 234-8901 via Twilio. Message: "Thanks for your inquiry! We\'ll be in touch shortly."' },
      { type: 'Send Email', status: 'executed', details: 'Welcome email sent to john.smith@email.com using template "new_lead_welcome".' },
      { type: 'Assign Owner', status: 'executed', details: 'Lead assigned to Jake Thompson (round-robin, Sales team).' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-002',
    timestamp: now.subtract(45, 'minute').toISOString(),
    ruleName: 'Follow-Up Reminder (48h)',
    entityType: 'Lead',
    entityId: 'LEAD-4790',
    triggerEvent: 'lead.no_response_48h',
    conditionsPassed: true,
    actions: [
      { type: 'Send SMS', status: 'executed', details: 'Follow-up SMS sent to +1 (555) 876-5432. Message: "Hi Mike, just checking in on your power wash estimate."' },
      { type: 'Create Task', status: 'executed', details: 'Task "Call Mike Wilson" created and assigned to Sarah Chen, due in 24 hours.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-003',
    timestamp: now.subtract(2, 'hour').toISOString(),
    ruleName: 'Job Completed - Request Review',
    entityType: 'Job',
    entityId: 'JOB-2026-0281',
    triggerEvent: 'job.status_changed',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Review request email sent to emily.brown@email.com with direct link to Google review page.' },
      { type: 'Send SMS', status: 'executed', details: 'SMS sent to +1 (555) 345-6789. Message: "Thanks for choosing us! We\'d love your feedback."' },
      { type: 'Update Field', status: 'executed', details: 'Set customer.review_requested = true on CUST-1203.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-004',
    timestamp: now.subtract(3, 'hour').toISOString(),
    ruleName: 'Estimate Follow-Up (24h)',
    entityType: 'Estimate',
    entityId: 'EST-2026-0042',
    triggerEvent: 'estimate.no_response_24h',
    conditionsPassed: false,
    actions: [
      { type: 'Send Email', status: 'skipped', details: 'Skipped: conditions not met. Customer already responded within 24 hours.' },
    ],
    suppressionReason: 'Customer responded before trigger window elapsed.',
    testMode: false,
    outcome: 'suppressed',
  },
  {
    id: 'EXEC-005',
    timestamp: now.subtract(4, 'hour').toISOString(),
    ruleName: 'New Lead Auto-Reply',
    entityType: 'Lead',
    entityId: 'LEAD-4819',
    triggerEvent: 'lead.created',
    conditionsPassed: true,
    actions: [
      { type: 'Send SMS', status: 'failed', details: 'Twilio API error 21610: SMS send failed for +1 (555) 000-1234. Number is on the unsubscribe list.' },
      { type: 'Send Email', status: 'executed', details: 'Welcome email sent to robert.davis@email.com using template "new_lead_welcome".' },
      { type: 'Assign Owner', status: 'executed', details: 'Lead assigned to Marcus Rivera (round-robin, Sales team).' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'failed',
  },
  {
    id: 'EXEC-006',
    timestamp: now.subtract(5, 'hour').toISOString(),
    ruleName: 'Invoice Overdue Reminder',
    entityType: 'Invoice',
    entityId: 'INV-2026-0148',
    triggerEvent: 'invoice.overdue_7d',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Payment reminder email sent to abc.property@email.com. Invoice amount: $3,400.00.' },
      { type: 'Create Task', status: 'executed', details: 'Task "Follow up on overdue invoice INV-2026-0148" created for Jake Thompson.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-007',
    timestamp: now.subtract(8, 'hour').toISOString(),
    ruleName: 'Seasonal Re-engagement',
    entityType: 'Customer',
    entityId: 'CUST-0892',
    triggerEvent: 'customer.inactive_90d',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Re-engagement email sent to lisa.garcia@email.com with 10% seasonal discount code SPRING10.' },
    ],
    suppressionReason: null,
    testMode: true,
    outcome: 'successful',
  },
  {
    id: 'EXEC-008',
    timestamp: now.subtract(10, 'hour').toISOString(),
    ruleName: 'Lead Score Update',
    entityType: 'Lead',
    entityId: 'LEAD-4815',
    triggerEvent: 'lead.activity_detected',
    conditionsPassed: true,
    actions: [
      { type: 'Update Field', status: 'executed', details: 'Lead score updated from 45 to 72. Activity: opened estimate email 3 times in last 2 hours.' },
      { type: 'Send Notification', status: 'executed', details: 'Internal notification sent to Sarah Chen: "Hot lead alert - LEAD-4815 score increased to 72."' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-009',
    timestamp: now.subtract(1, 'day').subtract(2, 'hour').toISOString(),
    ruleName: 'Job Completed - Request Review',
    entityType: 'Job',
    entityId: 'JOB-2026-0278',
    triggerEvent: 'job.status_changed',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Review request email sent to james.parker@email.com with Google review link.' },
      { type: 'Send SMS', status: 'executed', details: 'Review request SMS sent to +1 (555) 789-0123.' },
      { type: 'Update Field', status: 'executed', details: 'Set customer.review_requested = true on CUST-0945.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-010',
    timestamp: now.subtract(1, 'day').subtract(5, 'hour').toISOString(),
    ruleName: 'Follow-Up Reminder (48h)',
    entityType: 'Lead',
    entityId: 'LEAD-4801',
    triggerEvent: 'lead.no_response_48h',
    conditionsPassed: false,
    actions: [
      { type: 'Send SMS', status: 'skipped', details: 'Skipped: suppression rule matched. Lead already contacted within 24h by another rule.' },
    ],
    suppressionReason: 'Duplicate contact suppression: Lead was contacted 18 hours ago by "New Lead Auto-Reply" rule.',
    testMode: false,
    outcome: 'suppressed',
  },
  {
    id: 'EXEC-011',
    timestamp: now.subtract(1, 'day').subtract(8, 'hour').toISOString(),
    ruleName: 'New Lead Auto-Reply',
    entityType: 'Lead',
    entityId: 'LEAD-4808',
    triggerEvent: 'lead.created',
    conditionsPassed: true,
    actions: [
      { type: 'Send SMS', status: 'executed', details: 'SMS sent to +1 (555) 456-7890.' },
      { type: 'Send Email', status: 'executed', details: 'Welcome email sent to nancy.clark@email.com.' },
      { type: 'Assign Owner', status: 'executed', details: 'Lead assigned to Derek Williams (round-robin, Sales team).' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-012',
    timestamp: now.subtract(2, 'day').subtract(1, 'hour').toISOString(),
    ruleName: 'Invoice Overdue Reminder',
    entityType: 'Invoice',
    entityId: 'INV-2026-0141',
    triggerEvent: 'invoice.overdue_7d',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'failed', details: 'Email delivery failed: bounce detected for invalid@defunct-company.com. Hard bounce - address does not exist.' },
      { type: 'Create Task', status: 'executed', details: 'Task "Verify customer contact info for INV-2026-0141" created for admin team.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'failed',
  },
  {
    id: 'EXEC-013',
    timestamp: now.subtract(2, 'day').subtract(4, 'hour').toISOString(),
    ruleName: 'Seasonal Re-engagement',
    entityType: 'Customer',
    entityId: 'CUST-0734',
    triggerEvent: 'customer.inactive_90d',
    conditionsPassed: false,
    actions: [
      { type: 'Send Email', status: 'skipped', details: 'Skipped: customer has opted out of marketing emails.' },
    ],
    suppressionReason: 'Customer marketing opt-out preference is enabled.',
    testMode: false,
    outcome: 'suppressed',
  },
  {
    id: 'EXEC-014',
    timestamp: now.subtract(2, 'day').subtract(6, 'hour').toISOString(),
    ruleName: 'Estimate Follow-Up (24h)',
    entityType: 'Estimate',
    entityId: 'EST-2026-0039',
    triggerEvent: 'estimate.no_response_24h',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Follow-up email sent to tom.baker@email.com. Subject: "Your estimate is ready - any questions?"' },
      { type: 'Create Task', status: 'executed', details: 'Task "Call Tom Baker re: estimate EST-2026-0039" assigned to Jake Thompson, due tomorrow.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-015',
    timestamp: now.subtract(3, 'day').subtract(3, 'hour').toISOString(),
    ruleName: 'Lead Score Update',
    entityType: 'Lead',
    entityId: 'LEAD-4795',
    triggerEvent: 'lead.activity_detected',
    conditionsPassed: true,
    actions: [
      { type: 'Update Field', status: 'executed', details: 'Lead score updated from 30 to 55. Activity: visited pricing page and downloaded service brochure.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-016',
    timestamp: now.subtract(3, 'day').subtract(7, 'hour').toISOString(),
    ruleName: 'Job Completed - Request Review',
    entityType: 'Job',
    entityId: 'JOB-2026-0272',
    triggerEvent: 'job.status_changed',
    conditionsPassed: false,
    actions: [
      { type: 'Send Email', status: 'skipped', details: 'Skipped: customer already left a review within the past 30 days.' },
      { type: 'Send SMS', status: 'skipped', details: 'Skipped: review already received.' },
    ],
    suppressionReason: 'Customer reviewed on 2026-01-20. Cooldown period (30 days) has not elapsed.',
    testMode: false,
    outcome: 'suppressed',
  },
  {
    id: 'EXEC-017',
    timestamp: now.subtract(4, 'day').subtract(2, 'hour').toISOString(),
    ruleName: 'New Lead Auto-Reply',
    entityType: 'Lead',
    entityId: 'LEAD-4788',
    triggerEvent: 'lead.created',
    conditionsPassed: true,
    actions: [
      { type: 'Send SMS', status: 'executed', details: 'SMS sent to +1 (555) 321-6547.' },
      { type: 'Send Email', status: 'executed', details: 'Welcome email sent to kevin.wright@email.com.' },
      { type: 'Assign Owner', status: 'executed', details: 'Lead assigned to Sarah Chen (round-robin, Sales team).' },
    ],
    suppressionReason: null,
    testMode: true,
    outcome: 'successful',
  },
  {
    id: 'EXEC-018',
    timestamp: now.subtract(4, 'day').subtract(9, 'hour').toISOString(),
    ruleName: 'Invoice Overdue Reminder',
    entityType: 'Invoice',
    entityId: 'INV-2026-0135',
    triggerEvent: 'invoice.overdue_7d',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Payment reminder email sent to wilson.properties@email.com. Invoice amount: $1,850.00.' },
      { type: 'Create Task', status: 'executed', details: 'Task "Follow up on overdue invoice INV-2026-0135" assigned to billing team.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-019',
    timestamp: now.subtract(5, 'day').subtract(1, 'hour').toISOString(),
    ruleName: 'Follow-Up Reminder (48h)',
    entityType: 'Lead',
    entityId: 'LEAD-4780',
    triggerEvent: 'lead.no_response_48h',
    conditionsPassed: true,
    actions: [
      { type: 'Send SMS', status: 'executed', details: 'Follow-up SMS sent to +1 (555) 654-3210. Message: "Hi, just following up on your inquiry."' },
      { type: 'Create Task', status: 'failed', details: 'Failed to create task: CRM API timeout after 30 seconds. Retry scheduled.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'failed',
  },
  {
    id: 'EXEC-020',
    timestamp: now.subtract(5, 'day').subtract(5, 'hour').toISOString(),
    ruleName: 'Seasonal Re-engagement',
    entityType: 'Customer',
    entityId: 'CUST-0651',
    triggerEvent: 'customer.inactive_90d',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Re-engagement email sent to patricia.moore@email.com with 15% discount code COMEBACK15.' },
    ],
    suppressionReason: null,
    testMode: true,
    outcome: 'successful',
  },
  {
    id: 'EXEC-021',
    timestamp: now.subtract(6, 'day').subtract(3, 'hour').toISOString(),
    ruleName: 'New Lead Auto-Reply',
    entityType: 'Lead',
    entityId: 'LEAD-4772',
    triggerEvent: 'lead.created',
    conditionsPassed: true,
    actions: [
      { type: 'Send SMS', status: 'executed', details: 'SMS sent to +1 (555) 999-8877.' },
      { type: 'Send Email', status: 'executed', details: 'Welcome email sent to david.jones@email.com.' },
      { type: 'Assign Owner', status: 'executed', details: 'Lead assigned to Jake Thompson (round-robin, Sales team).' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-022',
    timestamp: now.subtract(6, 'day').subtract(6, 'hour').toISOString(),
    ruleName: 'Estimate Follow-Up (24h)',
    entityType: 'Estimate',
    entityId: 'EST-2026-0035',
    triggerEvent: 'estimate.no_response_24h',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Follow-up email sent to sandra.lee@email.com regarding estimate for roof wash service.' },
      { type: 'Create Task', status: 'executed', details: 'Task "Follow up with Sandra Lee on EST-2026-0035" assigned to Marcus Rivera.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-023',
    timestamp: now.subtract(6, 'day').subtract(10, 'hour').toISOString(),
    ruleName: 'Lead Score Update',
    entityType: 'Lead',
    entityId: 'LEAD-4768',
    triggerEvent: 'lead.activity_detected',
    conditionsPassed: true,
    actions: [
      { type: 'Update Field', status: 'executed', details: 'Lead score updated from 60 to 85. Activity: requested a callback via website form.' },
      { type: 'Send Notification', status: 'executed', details: 'Hot lead alert sent to Derek Williams.' },
      { type: 'Create Task', status: 'executed', details: 'Urgent callback task created and assigned to Derek Williams, due in 1 hour.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'successful',
  },
  {
    id: 'EXEC-024',
    timestamp: now.subtract(7, 'day').subtract(2, 'hour').toISOString(),
    ruleName: 'Job Completed - Request Review',
    entityType: 'Job',
    entityId: 'JOB-2026-0265',
    triggerEvent: 'job.status_changed',
    conditionsPassed: true,
    actions: [
      { type: 'Send Email', status: 'executed', details: 'Review request email sent to maria.gonzalez@email.com.' },
      { type: 'Send SMS', status: 'failed', details: 'SMS delivery failed: carrier rejected message. Number may be a landline.' },
      { type: 'Update Field', status: 'executed', details: 'Set customer.review_requested = true on CUST-0812.' },
    ],
    suppressionReason: null,
    testMode: false,
    outcome: 'failed',
  },
];

// ----- Derived filter options -----

const ruleNameOptions = Array.from(new Set(mockExecutions.map((e) => e.ruleName))).map(
  (name) => ({ value: name, label: name })
);

const entityTypeOptions = Array.from(new Set(mockExecutions.map((e) => e.entityType))).map(
  (type) => ({ value: type, label: type })
);

// ----- Color helpers -----

const actionStatusColor: Record<string, string> = {
  executed: 'green',
  skipped: 'gold',
  failed: 'red',
};

const outcomeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  successful: { color: '#52c41a', icon: <CheckCircleOutlined /> },
  suppressed: { color: '#8c8c8c', icon: <StopOutlined /> },
  failed: { color: '#ff4d4f', icon: <CloseCircleOutlined /> },
};

// ----- Page Component -----

export default function AutomationExecutionsPage() {
  const [ruleFilter, setRuleFilter] = useState<string | null>(null);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | null>(null);
  const [testModeFilter, setTestModeFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Filtered data
  const filteredExecutions = useMemo(() => {
    return mockExecutions.filter((exec) => {
      if (ruleFilter && exec.ruleName !== ruleFilter) return false;
      if (entityTypeFilter && exec.entityType !== entityTypeFilter) return false;
      if (testModeFilter !== null && testModeFilter !== undefined) {
        const isTest = testModeFilter === 'test';
        if (exec.testMode !== isTest) return false;
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        const execDate = dayjs(exec.timestamp);
        if (execDate.isBefore(dateRange[0].startOf('day')) || execDate.isAfter(dateRange[1].endOf('day'))) {
          return false;
        }
      }
      return true;
    });
  }, [ruleFilter, entityTypeFilter, testModeFilter, dateRange]);

  // Summary stats (today only, computed from all data - not filtered)
  const todayStart = now.startOf('day');
  const todayExecutions = mockExecutions.filter((e) => dayjs(e.timestamp).isAfter(todayStart));
  const totalToday = todayExecutions.length;
  const successfulToday = todayExecutions.filter((e) => e.outcome === 'successful').length;
  const suppressedToday = todayExecutions.filter((e) => e.outcome === 'suppressed').length;
  const failedToday = todayExecutions.filter((e) => e.outcome === 'failed').length;

  // Expandable row renderer
  const expandedRowRender = (record: ExecutionRecord) => {
    const actionColumns: ColumnsType<ActionDetail> = [
      {
        title: 'Action Type',
        dataIndex: 'type',
        key: 'type',
        width: 160,
        render: (type: string) => (
          <Space>
            <PlayCircleOutlined />
            <Text strong>{type}</Text>
          </Space>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: 'executed' | 'skipped' | 'failed') => (
          <Tag color={actionStatusColor[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        ),
      },
      {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
        render: (details: string) => (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {details}
          </Text>
        ),
      },
    ];

    return (
      <Table
        columns={actionColumns}
        dataSource={record.actions}
        rowKey={(_, index) => `${record.id}-action-${index}`}
        pagination={false}
        size="small"
        style={{ margin: '0 0 0 24px' }}
      />
    );
  };

  // Main table columns
  const columns: ColumnsType<ExecutionRecord> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend',
      render: (ts: string) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(ts).format('MMM D, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(ts).format('h:mm:ss A')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Rule Name',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 220,
      render: (name: string, record: ExecutionRecord) => (
        <Space>
          <ThunderboltOutlined style={{ color: '#1890ff' }} />
          <div>
            <Text strong>{name}</Text>
            {record.testMode && (
              <div style={{ marginTop: 2 }}>
                <Badge
                  count={
                    <Tag
                      icon={<ExperimentOutlined />}
                      color="purple"
                      style={{ marginRight: 0, fontSize: 11 }}
                    >
                      TEST MODE
                    </Tag>
                  }
                />
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
      render: (type: string, record: ExecutionRecord) => (
        <div>
          <Tag color="blue">{type}</Tag>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>{record.entityId}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Trigger Event',
      dataIndex: 'triggerEvent',
      key: 'triggerEvent',
      width: 200,
      render: (event: string) => (
        <Tag icon={<FireOutlined />} color="geekblue">
          {event}
        </Tag>
      ),
    },
    {
      title: 'Conditions Passed',
      dataIndex: 'conditionsPassed',
      key: 'conditionsPassed',
      width: 150,
      align: 'center',
      render: (passed: boolean) =>
        passed ? (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
        ),
    },
    {
      title: 'Actions Taken',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: ExecutionRecord) => {
        const executedCount = record.actions.filter((a) => a.status === 'executed').length;
        const skippedCount = record.actions.filter((a) => a.status === 'skipped').length;
        const failedCount = record.actions.filter((a) => a.status === 'failed').length;
        return (
          <Space size={4} wrap>
            {executedCount > 0 && (
              <Tag color="green">{executedCount} executed</Tag>
            )}
            {skippedCount > 0 && (
              <Tag color="gold">{skippedCount} skipped</Tag>
            )}
            {failedCount > 0 && (
              <Tag color="red">{failedCount} failed</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Suppression Reason',
      dataIndex: 'suppressionReason',
      key: 'suppressionReason',
      width: 250,
      render: (reason: string | null) =>
        reason ? (
          <Space align="start">
            <WarningOutlined style={{ color: '#8c8c8c', marginTop: 3 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {reason}
            </Text>
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>--</Text>
        ),
    },
    {
      title: 'Outcome',
      dataIndex: 'outcome',
      key: 'outcome',
      width: 130,
      align: 'center',
      filters: [
        { text: 'Successful', value: 'successful' },
        { text: 'Suppressed', value: 'suppressed' },
        { text: 'Failed', value: 'failed' },
      ],
      onFilter: (value, record) => record.outcome === value,
      render: (outcome: string) => {
        const config = outcomeConfig[outcome];
        return (
          <Tag icon={config.icon} color={config.color === '#8c8c8c' ? 'default' : outcome === 'successful' ? 'success' : 'error'}>
            {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Automation Execution Log</h1>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Executions (Today)"
              value={totalToday}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Successful"
              value={successfulToday}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Suppressed"
              value={suppressedToday}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Failed"
              value={failedToday}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters + Table */}
      <Card title="Execution Records">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Select
            placeholder="Rule Name"
            allowClear
            style={{ width: 240 }}
            value={ruleFilter}
            onChange={(value) => setRuleFilter(value)}
            options={ruleNameOptions}
          />
          <Select
            placeholder="Entity Type"
            allowClear
            style={{ width: 160 }}
            value={entityTypeFilter}
            onChange={(value) => setEntityTypeFilter(value)}
            options={entityTypeOptions}
          />
          <RangePicker
            onChange={(dates) =>
              setDateRange(dates as [Dayjs | null, Dayjs | null] | null)
            }
          />
          <Select
            placeholder="Test Mode"
            allowClear
            style={{ width: 160 }}
            value={testModeFilter}
            onChange={(value) => setTestModeFilter(value)}
            options={[
              { value: 'test', label: 'Test Mode Only' },
              { value: 'live', label: 'Live Only' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredExecutions}
          rowKey="id"
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.actions.length > 0,
          }}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} executions`,
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}
