'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Tag,
  Tabs,
  Row,
  Col,
  Button,
  Statistic,
  Typography,
  Badge,
  Avatar,
  Tooltip,
  Space,
} from 'antd';
import {
  PlusOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FunnelPlotOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PipelineKey = 'residential' | 'commercial' | 'holiday_lights';

interface Lead {
  id: string;
  contactName: string;
  source: string;
  phone: string;
  email: string;
  createdAt: string; // ISO date string
  assignedRep: string;
  stage: string;
  value?: number;
  notes?: string;
  company?: string;
}

// ---------------------------------------------------------------------------
// Pipeline stage definitions
// ---------------------------------------------------------------------------

const pipelineStages: Record<PipelineKey, string[]> = {
  residential: ['new', 'contacted', 'estimate_sent', 'follow_up', 'won', 'lost'],
  commercial: [
    'new',
    'contacted',
    'site_visit_scheduled',
    'site_visit_completed',
    'proposal_sent',
    'follow_up',
    'negotiation',
    'won',
    'lost',
  ],
  holiday_lights: [
    'new',
    'consulted',
    'design_proposal_sent',
    'approved',
    'install_scheduled',
    'installed',
    'takedown_scheduled',
    'complete',
    'lost',
  ],
};

// ---------------------------------------------------------------------------
// Stage color mapping
// ---------------------------------------------------------------------------

const getStageColor = (stage: string): string => {
  const colorMap: Record<string, string> = {
    new: 'blue',
    contacted: 'cyan',
    consulted: 'cyan',
    estimate_sent: 'orange',
    proposal_sent: 'orange',
    design_proposal_sent: 'orange',
    follow_up: 'gold',
    negotiation: 'gold',
    won: 'green',
    approved: 'green',
    complete: 'green',
    installed: 'green',
    lost: 'red',
    site_visit_scheduled: 'geekblue',
    site_visit_completed: 'purple',
    install_scheduled: 'geekblue',
    takedown_scheduled: 'volcano',
  };
  return colorMap[stage] || 'default';
};

const getStageHeaderColor = (stage: string): string => {
  const colorMap: Record<string, string> = {
    new: '#1890ff',
    contacted: '#13c2c2',
    consulted: '#13c2c2',
    estimate_sent: '#fa8c16',
    proposal_sent: '#fa8c16',
    design_proposal_sent: '#fa8c16',
    follow_up: '#faad14',
    negotiation: '#faad14',
    won: '#52c41a',
    approved: '#52c41a',
    complete: '#52c41a',
    installed: '#52c41a',
    lost: '#ff4d4f',
    site_visit_scheduled: '#2f54eb',
    site_visit_completed: '#722ed1',
    install_scheduled: '#2f54eb',
    takedown_scheduled: '#fa541c',
  };
  return colorMap[stage] || '#8c8c8c';
};

// ---------------------------------------------------------------------------
// Stage label formatting
// ---------------------------------------------------------------------------

const formatStageName = (stage: string): string => {
  return stage
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ---------------------------------------------------------------------------
// Source colors
// ---------------------------------------------------------------------------

const getSourceColor = (source: string): string => {
  const colors: Record<string, string> = {
    Website: 'blue',
    Referral: 'green',
    'Google Ads': 'volcano',
    'Facebook Ads': 'geekblue',
    'Home Advisor': 'orange',
    Yelp: 'red',
    'Door Knock': 'purple',
    'Phone Call': 'cyan',
    Angi: 'magenta',
    'Yard Sign': 'lime',
    'Repeat Customer': 'gold',
    Thumbtack: 'geekblue',
  };
  return colors[source] || 'default';
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockResidentialLeads: Lead[] = [
  {
    id: 'rl-001',
    contactName: 'James Peterson',
    source: 'Website',
    phone: '(555) 123-4567',
    email: 'jpeterson@email.com',
    createdAt: '2026-02-09T08:30:00Z',
    assignedRep: 'Mike Torres',
    stage: 'new',
    value: 450,
  },
  {
    id: 'rl-002',
    contactName: 'Sarah Mitchell',
    source: 'Google Ads',
    phone: '(555) 234-5678',
    email: 'smitchell@email.com',
    createdAt: '2026-02-09T06:15:00Z',
    assignedRep: 'Mike Torres',
    stage: 'new',
    value: 800,
  },
  {
    id: 'rl-003',
    contactName: 'Robert Chen',
    source: 'Referral',
    phone: '(555) 345-6789',
    email: 'rchen@email.com',
    createdAt: '2026-02-08T14:00:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'new',
    value: 350,
  },
  {
    id: 'rl-004',
    contactName: 'Emily Watson',
    source: 'Yelp',
    phone: '(555) 456-7890',
    email: 'ewatson@email.com',
    createdAt: '2026-02-07T10:00:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'contacted',
    value: 600,
  },
  {
    id: 'rl-005',
    contactName: 'David Garcia',
    source: 'Home Advisor',
    phone: '(555) 567-8901',
    email: 'dgarcia@email.com',
    createdAt: '2026-02-06T09:30:00Z',
    assignedRep: 'Mike Torres',
    stage: 'contacted',
    value: 1200,
  },
  {
    id: 'rl-006',
    contactName: 'Karen Thompson',
    source: 'Facebook Ads',
    phone: '(555) 678-9012',
    email: 'kthompson@email.com',
    createdAt: '2026-02-05T16:00:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'contacted',
    value: 500,
  },
  {
    id: 'rl-007',
    contactName: 'Michael Brown',
    source: 'Website',
    phone: '(555) 789-0123',
    email: 'mbrown@email.com',
    createdAt: '2026-02-04T11:45:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'estimate_sent',
    value: 900,
  },
  {
    id: 'rl-008',
    contactName: 'Jennifer Lee',
    source: 'Referral',
    phone: '(555) 890-1234',
    email: 'jlee@email.com',
    createdAt: '2026-02-03T08:20:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'estimate_sent',
    value: 1500,
  },
  {
    id: 'rl-009',
    contactName: 'William Davis',
    source: 'Door Knock',
    phone: '(555) 901-2345',
    email: 'wdavis@email.com',
    createdAt: '2026-02-01T13:10:00Z',
    assignedRep: 'Mike Torres',
    stage: 'follow_up',
    value: 700,
  },
  {
    id: 'rl-010',
    contactName: 'Amanda Clark',
    source: 'Google Ads',
    phone: '(555) 012-3456',
    email: 'aclark@email.com',
    createdAt: '2026-01-28T15:00:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'follow_up',
    value: 450,
  },
  {
    id: 'rl-011',
    contactName: 'Thomas Anderson',
    source: 'Yard Sign',
    phone: '(555) 111-2222',
    email: 'tanderson@email.com',
    createdAt: '2026-01-25T10:30:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'won',
    value: 1100,
  },
  {
    id: 'rl-012',
    contactName: 'Rachel Green',
    source: 'Referral',
    phone: '(555) 333-4444',
    email: 'rgreen@email.com',
    createdAt: '2026-01-22T09:00:00Z',
    assignedRep: 'Mike Torres',
    stage: 'won',
    value: 850,
  },
  {
    id: 'rl-013',
    contactName: 'Chris Walker',
    source: 'Website',
    phone: '(555) 555-6666',
    email: 'cwalker@email.com',
    createdAt: '2026-01-20T14:20:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'won',
    value: 2000,
  },
  {
    id: 'rl-014',
    contactName: 'Nancy King',
    source: 'Facebook Ads',
    phone: '(555) 777-8888',
    email: 'nking@email.com',
    createdAt: '2026-01-30T12:00:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'lost',
    notes: 'Went with competitor - price too high',
  },
  {
    id: 'rl-015',
    contactName: 'Daniel Harris',
    source: 'Home Advisor',
    phone: '(555) 999-0000',
    email: 'dharris@email.com',
    createdAt: '2026-01-18T08:00:00Z',
    assignedRep: 'Mike Torres',
    stage: 'lost',
    notes: 'No response after 3 attempts',
  },
];

const mockCommercialLeads: Lead[] = [
  {
    id: 'cl-001',
    contactName: 'Patricia Reynolds',
    company: 'Reynolds Property Management',
    source: 'Referral',
    phone: '(555) 200-1001',
    email: 'preynolds@rpm.com',
    createdAt: '2026-02-09T07:00:00Z',
    assignedRep: 'Mike Torres',
    stage: 'new',
    value: 8500,
  },
  {
    id: 'cl-002',
    contactName: 'Frank Morrison',
    company: 'Oakwood HOA',
    source: 'Phone Call',
    phone: '(555) 200-1002',
    email: 'fmorrison@oakwoodhoa.org',
    createdAt: '2026-02-08T16:30:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'new',
    value: 12000,
  },
  {
    id: 'cl-003',
    contactName: 'Victor Huang',
    company: 'Sunrise Plaza LLC',
    source: 'Google Ads',
    phone: '(555) 200-1003',
    email: 'vhuang@sunriseplaza.com',
    createdAt: '2026-02-07T11:00:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'contacted',
    value: 6000,
  },
  {
    id: 'cl-004',
    contactName: 'Deborah Stone',
    company: 'Cornerstone Realty',
    source: 'Website',
    phone: '(555) 200-1004',
    email: 'dstone@cornerstone.com',
    createdAt: '2026-02-05T14:15:00Z',
    assignedRep: 'Mike Torres',
    stage: 'site_visit_scheduled',
    value: 15000,
  },
  {
    id: 'cl-005',
    contactName: 'Greg Palmer',
    company: 'Palmer Industrial Park',
    source: 'Referral',
    phone: '(555) 200-1005',
    email: 'gpalmer@palmerip.com',
    createdAt: '2026-02-03T09:00:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'site_visit_completed',
    value: 22000,
  },
  {
    id: 'cl-006',
    contactName: 'Monica Vega',
    company: 'Lakeview Condominiums',
    source: 'Angi',
    phone: '(555) 200-1006',
    email: 'mvega@lakeviewcondos.com',
    createdAt: '2026-02-01T10:30:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'proposal_sent',
    value: 9500,
  },
  {
    id: 'cl-007',
    contactName: 'Arthur Blake',
    company: 'Blake Office Complex',
    source: 'Phone Call',
    phone: '(555) 200-1007',
    email: 'ablake@blakeoffice.com',
    createdAt: '2026-01-28T13:00:00Z',
    assignedRep: 'Mike Torres',
    stage: 'follow_up',
    value: 18000,
  },
  {
    id: 'cl-008',
    contactName: 'Sandra Kim',
    company: 'Metro Shopping Center',
    source: 'Google Ads',
    phone: '(555) 200-1008',
    email: 'skim@metrosc.com',
    createdAt: '2026-01-25T15:45:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'negotiation',
    value: 35000,
  },
  {
    id: 'cl-009',
    contactName: 'Howard Marsh',
    company: 'Marsh & Associates',
    source: 'Referral',
    phone: '(555) 200-1009',
    email: 'hmarsh@marshassoc.com',
    createdAt: '2026-01-20T08:30:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'won',
    value: 14000,
  },
  {
    id: 'cl-010',
    contactName: 'Irene Castro',
    company: 'Greenfield Apartments',
    source: 'Website',
    phone: '(555) 200-1010',
    email: 'icastro@greenfieldapts.com',
    createdAt: '2026-01-15T11:20:00Z',
    assignedRep: 'Mike Torres',
    stage: 'lost',
    notes: 'Budget constraints - revisit Q3',
  },
];

const mockHolidayLightsLeads: Lead[] = [
  {
    id: 'hl-001',
    contactName: 'Catherine Brooks',
    source: 'Facebook Ads',
    phone: '(555) 300-1001',
    email: 'cbrooks@email.com',
    createdAt: '2026-02-09T09:00:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'new',
    value: 2200,
  },
  {
    id: 'hl-002',
    contactName: 'Steven Wright',
    source: 'Yard Sign',
    phone: '(555) 300-1002',
    email: 'swright@email.com',
    createdAt: '2026-02-08T12:00:00Z',
    assignedRep: 'Mike Torres',
    stage: 'new',
    value: 1800,
  },
  {
    id: 'hl-003',
    contactName: 'Laura Bennett',
    source: 'Referral',
    phone: '(555) 300-1003',
    email: 'lbennett@email.com',
    createdAt: '2026-02-07T14:30:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'consulted',
    value: 3500,
  },
  {
    id: 'hl-004',
    contactName: 'Brian Foster',
    source: 'Website',
    phone: '(555) 300-1004',
    email: 'bfoster@email.com',
    createdAt: '2026-02-05T10:00:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'consulted',
    value: 2800,
  },
  {
    id: 'hl-005',
    contactName: 'Diane Perkins',
    source: 'Repeat Customer',
    phone: '(555) 300-1005',
    email: 'dperkins@email.com',
    createdAt: '2026-02-04T08:45:00Z',
    assignedRep: 'Mike Torres',
    stage: 'design_proposal_sent',
    value: 4200,
  },
  {
    id: 'hl-006',
    contactName: 'Keith Maxwell',
    source: 'Google Ads',
    phone: '(555) 300-1006',
    email: 'kmaxwell@email.com',
    createdAt: '2026-02-02T16:00:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'approved',
    value: 3100,
  },
  {
    id: 'hl-007',
    contactName: 'Susan Hayes',
    source: 'Referral',
    phone: '(555) 300-1007',
    email: 'shayes@email.com',
    createdAt: '2026-01-30T11:30:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'install_scheduled',
    value: 2600,
  },
  {
    id: 'hl-008',
    contactName: 'Roger Simmons',
    source: 'Facebook Ads',
    phone: '(555) 300-1008',
    email: 'rsimmons@email.com',
    createdAt: '2026-01-25T09:15:00Z',
    assignedRep: 'Mike Torres',
    stage: 'installed',
    value: 5000,
  },
  {
    id: 'hl-009',
    contactName: 'Theresa Grant',
    source: 'Website',
    phone: '(555) 300-1009',
    email: 'tgrant@email.com',
    createdAt: '2026-01-20T13:00:00Z',
    assignedRep: 'Lisa Nguyen',
    stage: 'takedown_scheduled',
    value: 1900,
  },
  {
    id: 'hl-010',
    contactName: 'Alan Crawford',
    source: 'Repeat Customer',
    phone: '(555) 300-1010',
    email: 'acrawford@email.com',
    createdAt: '2026-01-15T10:00:00Z',
    assignedRep: 'Jake Rivera',
    stage: 'complete',
    value: 4500,
  },
  {
    id: 'hl-011',
    contactName: 'Betty Lawson',
    source: 'Thumbtack',
    phone: '(555) 300-1011',
    email: 'blawson@email.com',
    createdAt: '2026-01-28T14:00:00Z',
    assignedRep: 'Mike Torres',
    stage: 'lost',
    notes: 'Decided to DIY this year',
  },
];

const pipelineLeads: Record<PipelineKey, Lead[]> = {
  residential: mockResidentialLeads,
  commercial: mockCommercialLeads,
  holiday_lights: mockHolidayLightsLeads,
};

// ---------------------------------------------------------------------------
// Helper: compute metrics
// ---------------------------------------------------------------------------

function computeMetrics(leads: Lead[]) {
  const total = leads.length;
  const now = dayjs();
  const startOfMonth = now.startOf('month');
  const newThisMonth = leads.filter((l) =>
    dayjs(l.createdAt).isAfter(startOfMonth),
  ).length;

  const wonCount = leads.filter(
    (l) => l.stage === 'won' || l.stage === 'complete',
  ).length;
  const lostCount = leads.filter((l) => l.stage === 'lost').length;
  const decidedCount = wonCount + lostCount;
  const conversionRate = decidedCount > 0 ? Math.round((wonCount / decidedCount) * 100) : 0;

  // Average speed-to-lead: hours from creation to first contact (mock)
  const avgSpeedToLead = 1.4; // mock value in hours

  return { total, newThisMonth, conversionRate, avgSpeedToLead };
}

// ---------------------------------------------------------------------------
// Lead Card Component
// ---------------------------------------------------------------------------

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const timeSince = dayjs(lead.createdAt).fromNow();

  return (
    <Card
      size="small"
      hoverable
      onClick={onClick}
      style={{
        marginBottom: 8,
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        cursor: 'pointer',
      }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <Text strong style={{ fontSize: 13, lineHeight: '18px', flex: 1, marginRight: 4 }}>
          {lead.contactName}
        </Text>
        {lead.value && (
          <Text style={{ fontSize: 12, color: '#52c41a', fontWeight: 600, whiteSpace: 'nowrap' }}>
            ${lead.value.toLocaleString()}
          </Text>
        )}
      </div>

      {lead.company && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
          {lead.company}
        </Text>
      )}

      <div style={{ marginBottom: 6 }}>
        <Tag color={getSourceColor(lead.source)} style={{ fontSize: 11, marginRight: 0 }}>
          {lead.source}
        </Tag>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 6 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          <PhoneOutlined style={{ marginRight: 4 }} />
          {lead.phone}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          <MailOutlined style={{ marginRight: 4 }} />
          {lead.email}
        </Text>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tooltip title={lead.assignedRep}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Avatar size={18} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', fontSize: 10 }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {lead.assignedRep}
            </Text>
          </div>
        </Tooltip>
        <Tooltip title={dayjs(lead.createdAt).format('MMM D, YYYY h:mm A')}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <ClockCircleOutlined style={{ marginRight: 3 }} />
            {timeSince}
          </Text>
        </Tooltip>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Kanban Column Component
// ---------------------------------------------------------------------------

function KanbanColumn({
  stage,
  leads,
  onCardClick,
}: {
  stage: string;
  leads: Lead[];
  onCardClick: (leadId: string) => void;
}) {
  const headerColor = getStageHeaderColor(stage);
  const count = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div
      style={{
        minWidth: 280,
        maxWidth: 300,
        flex: '0 0 280px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: '10px 12px',
          borderTop: `3px solid ${headerColor}`,
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong style={{ fontSize: 13 }}>
              {formatStageName(stage)}
            </Text>
            <Badge
              count={count}
              style={{
                backgroundColor: headerColor,
                fontSize: 11,
              }}
            />
          </div>
          {totalValue > 0 && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              ${totalValue.toLocaleString()}
            </Text>
          )}
        </div>
      </div>

      {/* Scrollable Card Area */}
      <div
        style={{
          padding: 8,
          overflowY: 'auto',
          flexGrow: 1,
          maxHeight: 'calc(100vh - 340px)',
          minHeight: 120,
        }}
      >
        {leads.length === 0 ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 80,
              color: '#bfbfbf',
              fontSize: 12,
              border: '2px dashed #e8e8e8',
              borderRadius: 8,
            }}
          >
            No leads
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onCardClick(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function LeadsPipelinePage() {
  const router = useRouter();
  const [activePipeline, setActivePipeline] = useState<PipelineKey>('residential');

  const leads = pipelineLeads[activePipeline];
  const stages = pipelineStages[activePipeline];
  const metrics = useMemo(() => computeMetrics(leads), [leads]);

  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    for (const stage of stages) {
      grouped[stage] = leads.filter((l) => l.stage === stage);
    }
    return grouped;
  }, [leads, stages]);

  const handleCardClick = (leadId: string) => {
    // Placeholder navigation to lead detail
    router.push(`/dashboard/leads/${leadId}`);
  };

  const handleNewLead = () => {
    // Placeholder for new lead creation
    router.push('/dashboard/leads/new');
  };

  const pipelineTabItems = [
    {
      key: 'residential',
      label: 'Residential',
    },
    {
      key: 'commercial',
      label: 'Commercial',
    },
    {
      key: 'holiday_lights',
      label: 'Holiday Lights',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
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
          <FunnelPlotOutlined style={{ marginRight: 10 }} />
          Lead Pipeline
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleNewLead}
        >
          New Lead
        </Button>
      </div>

      {/* Summary Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="Total Leads"
              value={metrics.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="New This Month"
              value={metrics.newThisMonth}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="Conversion Rate"
              value={metrics.conversionRate}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bodyStyle={{ padding: 16 }}>
            <Statistic
              title="Avg Speed-to-Lead"
              value={metrics.avgSpeedToLead}
              suffix="hrs"
              precision={1}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Pipeline Selector */}
      <Tabs
        activeKey={activePipeline}
        onChange={(key) => setActivePipeline(key as PipelineKey)}
        items={pipelineTabItems}
        style={{ marginBottom: 16 }}
        size="large"
      />

      {/* Kanban Board */}
      <div
        style={{
          overflowX: 'auto',
          paddingBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            minWidth: 'max-content',
          }}
        >
          {stages.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={leadsByStage[stage] || []}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
