'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Badge,
  Tooltip,
  message,
  Drawer,
  Timeline,
  Avatar,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  FireOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  SwapOutlined,
  TeamOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  leadsApi,
  Lead,
  LeadType,
  LeadTemperature,
  LeadSource,
  LeadStats,
  PipelineStageView,
  CreateLeadInput,
} from '@/lib/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const temperatureColors: Record<LeadTemperature, string> = {
  cold: 'blue',
  warm: 'orange',
  hot: 'red',
};

const sourceLabels: Record<LeadSource, string> = {
  website: 'Website',
  google_ads: 'Google Ads',
  facebook_ads: 'Facebook Ads',
  referral: 'Referral',
  door_to_door: 'Door to Door',
  yard_sign: 'Yard Sign',
  direct_mail: 'Direct Mail',
  phone_call: 'Phone Call',
  email_campaign: 'Email Campaign',
  trade_show: 'Trade Show',
  partner: 'Partner',
  other: 'Other',
};

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<LeadType>('residential');
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [pipelineData, setPipelineData] = useState<PipelineStageView[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, pipelineRes, leadsRes] = await Promise.all([
        leadsApi.getStats(),
        leadsApi.getPipelineView(activeTab),
        leadsApi.getAll({ leadType: activeTab, limit: 100 }),
      ]);
      setStats(statsRes);
      setPipelineData(pipelineRes);
      setLeads(leadsRes.data);
    } catch (error) {
      message.error('Failed to load leads data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (values: CreateLeadInput) => {
    try {
      await leadsApi.create({
        ...values,
        leadType: activeTab,
      });
      message.success('Lead created successfully');
      setIsModalOpen(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('Failed to create lead');
    }
  };

  const handleMoveStage = async (leadId: string, newStage: string) => {
    try {
      await leadsApi.moveStage(leadId, { newStage });
      message.success('Lead moved successfully');
      loadData();
    } catch (error) {
      message.error('Failed to move lead');
    }
  };

  const openLeadDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const getLeadActions = (lead: Lead): MenuProps['items'] => [
    {
      key: 'call',
      label: 'Log Call',
      icon: <PhoneOutlined />,
      onClick: () => handleLogContact(lead.id, 'call'),
    },
    {
      key: 'email',
      label: 'Send Email',
      icon: <MailOutlined />,
      onClick: () => handleLogContact(lead.id, 'email'),
    },
    {
      key: 'followup',
      label: 'Schedule Follow-up',
      icon: <CalendarOutlined />,
    },
    { type: 'divider' },
    {
      key: 'convert',
      label: 'Convert to Customer',
      icon: <CheckCircleOutlined />,
      onClick: () => handleConvert(lead.id),
    },
    {
      key: 'lost',
      label: 'Mark as Lost',
      icon: <CloseCircleOutlined />,
      danger: true,
    },
  ];

  const handleLogContact = async (leadId: string, method: string) => {
    try {
      await leadsApi.logContact(leadId, method, 'outbound');
      message.success('Contact logged');
      loadData();
    } catch (error) {
      message.error('Failed to log contact');
    }
  };

  const handleConvert = async (leadId: string) => {
    Modal.confirm({
      title: 'Convert Lead to Customer',
      content: 'This will create a new customer account from this lead. Continue?',
      onOk: async () => {
        try {
          await leadsApi.convert(leadId, { createAccount: true });
          message.success('Lead converted successfully');
          loadData();
        } catch (error) {
          message.error('Failed to convert lead');
        }
      },
    });
  };

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card
      size="small"
      className="lead-card"
      style={{ marginBottom: 8, cursor: 'pointer' }}
      onClick={() => openLeadDrawer(lead)}
      extra={
        <Dropdown menu={{ items: getLeadActions(lead) }} trigger={['click']}>
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      }
    >
      <div style={{ marginBottom: 8 }}>
        <strong>{lead.firstName} {lead.lastName}</strong>
        {lead.companyName && (
          <div style={{ color: '#666', fontSize: 12 }}>{lead.companyName}</div>
        )}
      </div>

      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        {lead.email && (
          <span style={{ fontSize: 12, color: '#666' }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {lead.email}
          </span>
        )}
        {lead.phone && (
          <span style={{ fontSize: 12, color: '#666' }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {lead.phone}
          </span>
        )}
      </Space>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tag color={temperatureColors[lead.temperature]}>
          <FireOutlined /> {lead.temperature}
        </Tag>
        {lead.estimatedValue && (
          <span style={{ color: '#52c41a' }}>
            ${lead.estimatedValue.toLocaleString()}
          </span>
        )}
      </div>

      {lead.nextFollowUpAt && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <Tooltip title={dayjs(lead.nextFollowUpAt).format('MMM D, YYYY h:mm A')}>
            <Badge
              status={dayjs(lead.nextFollowUpAt).isBefore(dayjs()) ? 'error' : 'processing'}
              text={
                <span style={{ color: dayjs(lead.nextFollowUpAt).isBefore(dayjs()) ? '#ff4d4f' : '#666' }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {dayjs(lead.nextFollowUpAt).fromNow()}
                </span>
              }
            />
          </Tooltip>
        </div>
      )}
    </Card>
  );

  const PipelineColumn = ({ stage }: { stage: PipelineStageView }) => (
    <div
      style={{
        width: 280,
        minHeight: 500,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 8,
        marginRight: 16,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: `3px solid ${stage.color}`,
          marginBottom: 12,
          backgroundColor: '#fff',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{stage.displayName}</strong>
          <Badge count={stage.count} style={{ backgroundColor: stage.color }} />
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          ${stage.totalValue.toLocaleString()} total
        </div>
      </div>

      <div style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
        {stage.leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, record: Lead) => (
        <a onClick={() => openLeadDrawer(record)}>
          {record.firstName} {record.lastName}
          {record.companyName && (
            <div style={{ fontSize: 12, color: '#666' }}>{record.companyName}</div>
          )}
        </a>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: unknown, record: Lead) => (
        <Space direction="vertical" size={0}>
          {record.email && <span><MailOutlined /> {record.email}</span>}
          {record.phone && <span><PhoneOutlined /> {record.phone}</span>}
        </Space>
      ),
    },
    {
      title: 'Stage',
      dataIndex: 'pipelineStage',
      key: 'stage',
      render: (stage: string) => <Tag>{stage.replace(/_/g, ' ')}</Tag>,
    },
    {
      title: 'Temperature',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp: LeadTemperature) => (
        <Tag color={temperatureColors[temp]}>
          <FireOutlined /> {temp}
        </Tag>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: LeadSource) => sourceLabels[source],
    },
    {
      title: 'Value',
      dataIndex: 'estimatedValue',
      key: 'value',
      render: (value: number) => value ? `$${value.toLocaleString()}` : '-',
    },
    {
      title: 'Score',
      dataIndex: 'leadScore',
      key: 'score',
      render: (score: number) => (
        <Tag color={score >= 70 ? 'red' : score >= 40 ? 'orange' : 'blue'}>
          {score}
        </Tag>
      ),
    },
    {
      title: 'Follow-up',
      dataIndex: 'nextFollowUpAt',
      key: 'followUp',
      render: (date: string) => date ? (
        <Tooltip title={dayjs(date).format('MMM D, YYYY')}>
          <span style={{ color: dayjs(date).isBefore(dayjs()) ? '#ff4d4f' : undefined }}>
            {dayjs(date).fromNow()}
          </span>
        </Tooltip>
      ) : '-',
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, record: Lead) => (
        <Dropdown menu={{ items: getLeadActions(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Active Leads"
              value={stats?.total || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Converted This Month"
              value={stats?.convertedThisMonth || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Follow-ups Due"
              value={stats?.followUpsDue || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: stats?.followUpsDue ? '#ff4d4f' : undefined }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Time to Conversion"
              value={stats?.avgTimeToConversion || 0}
              suffix="days"
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as LeadType)}
            items={[
              { key: 'residential', label: 'Residential Pipeline' },
              { key: 'commercial', label: 'Commercial Pipeline' },
            ]}
          />
        }
        extra={
          <Space>
            <Button.Group>
              <Button
                type={viewMode === 'pipeline' ? 'primary' : 'default'}
                onClick={() => setViewMode('pipeline')}
              >
                Pipeline
              </Button>
              <Button
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </Button.Group>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Lead
            </Button>
          </Space>
        }
      >
        {viewMode === 'pipeline' ? (
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              padding: '8px 0',
            }}
          >
            {pipelineData.map((stage) => (
              <PipelineColumn key={stage.stage} stage={stage} />
            ))}
          </div>
        ) : (
          <Table
            dataSource={leads}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20 }}
          />
        )}
      </Card>

      {/* Create Lead Modal */}
      <Modal
        title={`Add ${activeTab === 'residential' ? 'Residential' : 'Commercial'} Lead`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateLead}
          initialValues={{ source: 'website', temperature: 'warm' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {activeTab === 'commercial' && (
            <Form.Item name="companyName" label="Company Name">
              <Input />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source"
                label="Lead Source"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.entries(sourceLabels).map(([key, label]) => (
                    <Select.Option key={key} value={key}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="temperature" label="Temperature">
                <Select>
                  <Select.Option value="cold">Cold</Select.Option>
                  <Select.Option value="warm">Warm</Select.Option>
                  <Select.Option value="hot">Hot</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="estimatedValue" label="Estimated Value">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nextFollowUpAt" label="Next Follow-up">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="streetAddress" label="Address">
            <Input placeholder="Street Address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city">
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state">
                <Input placeholder="State" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="postalCode">
                <Input placeholder="ZIP Code" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="What are they looking for?">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Lead Detail Drawer */}
      <Drawer
        title={selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : 'Lead Details'}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLead(null);
        }}
        width={500}
        extra={
          <Space>
            <Button onClick={() => handleConvert(selectedLead!.id)}>
              Convert to Customer
            </Button>
          </Space>
        }
      >
        {selectedLead && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Tag color={temperatureColors[selectedLead.temperature]}>
                    <FireOutlined /> {selectedLead.temperature}
                  </Tag>
                  <span style={{ fontWeight: 'bold' }}>
                    Score: {selectedLead.leadScore}
                  </span>
                </div>

                {selectedLead.companyName && (
                  <div>
                    <strong>Company:</strong> {selectedLead.companyName}
                  </div>
                )}

                {selectedLead.email && (
                  <div>
                    <MailOutlined style={{ marginRight: 8 }} />
                    <a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a>
                  </div>
                )}

                {selectedLead.phone && (
                  <div>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    <a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a>
                  </div>
                )}

                {selectedLead.streetAddress && (
                  <div>
                    {selectedLead.streetAddress}
                    {selectedLead.city && `, ${selectedLead.city}`}
                    {selectedLead.state && `, ${selectedLead.state}`}
                    {selectedLead.postalCode && ` ${selectedLead.postalCode}`}
                  </div>
                )}
              </Space>
            </Card>

            <Card size="small" title="Pipeline Stage" style={{ marginBottom: 16 }}>
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {selectedLead.pipelineStage.replace(/_/g, ' ')}
              </Tag>
              <Button
                type="link"
                icon={<SwapOutlined />}
                onClick={() => {
                  // Open stage change modal
                }}
              >
                Change Stage
              </Button>
            </Card>

            <Card size="small" title="Details" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <div style={{ color: '#666', fontSize: 12 }}>Source</div>
                  <div>{sourceLabels[selectedLead.source]}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#666', fontSize: 12 }}>Estimated Value</div>
                  <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    {selectedLead.estimatedValue
                      ? `$${selectedLead.estimatedValue.toLocaleString()}`
                      : '-'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#666', fontSize: 12 }}>Created</div>
                  <div>{dayjs(selectedLead.createdAt).format('MMM D, YYYY')}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#666', fontSize: 12 }}>Last Contact</div>
                  <div>
                    {selectedLead.lastContactedAt
                      ? dayjs(selectedLead.lastContactedAt).fromNow()
                      : 'Never'}
                  </div>
                </Col>
              </Row>
            </Card>

            {selectedLead.description && (
              <Card size="small" title="What they're looking for" style={{ marginBottom: 16 }}>
                <p>{selectedLead.description}</p>
              </Card>
            )}

            {selectedLead.notes && (
              <Card size="small" title="Notes" style={{ marginBottom: 16 }}>
                <p>{selectedLead.notes}</p>
              </Card>
            )}

            <Card size="small" title="Quick Actions">
              <Space wrap>
                <Button
                  icon={<PhoneOutlined />}
                  onClick={() => handleLogContact(selectedLead.id, 'call')}
                >
                  Log Call
                </Button>
                <Button
                  icon={<MailOutlined />}
                  onClick={() => handleLogContact(selectedLead.id, 'email')}
                >
                  Send Email
                </Button>
                <Button icon={<CalendarOutlined />}>
                  Schedule Follow-up
                </Button>
              </Space>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
