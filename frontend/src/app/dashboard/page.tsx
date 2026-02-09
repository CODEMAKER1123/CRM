'use client';

import { Card, Row, Col, Statistic, Table, Tag, Progress, List, Avatar, Tabs, DatePicker } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  TeamOutlined,
  ToolOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FunnelPlotOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
  CarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Mock data aligned with spec Section 3.8 KPIs
const revenueTrend = [
  { month: 'Aug', revenue: 58000, target: 60000 },
  { month: 'Sep', revenue: 62000, target: 60000 },
  { month: 'Oct', revenue: 67000, target: 65000 },
  { month: 'Nov', revenue: 71000, target: 65000 },
  { month: 'Dec', revenue: 85000, target: 80000 },
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 72000, target: 70000 },
];

const pipelineByStage = [
  { stage: 'New', residential: 12, commercial: 4, holiday: 3 },
  { stage: 'Contacted', residential: 8, commercial: 3, holiday: 2 },
  { stage: 'Estimate Sent', residential: 6, commercial: 2, holiday: 5 },
  { stage: 'Follow Up', residential: 4, commercial: 2, holiday: 0 },
  { stage: 'Won', residential: 18, commercial: 6, holiday: 8 },
  { stage: 'Lost', residential: 5, commercial: 2, holiday: 1 },
];

const jobsByType = [
  { name: 'House Wash', value: 35, color: '#1890ff' },
  { name: 'Concrete', value: 20, color: '#52c41a' },
  { name: 'Roof Wash', value: 12, color: '#faad14' },
  { name: 'Gutter Clean', value: 10, color: '#722ed1' },
  { name: 'Holiday Lights', value: 15, color: '#eb2f96' },
  { name: 'Other', value: 8, color: '#8c8c8c' },
];

const todaysJobs = [
  { id: '1', customer: 'John Smith', address: '123 Main St, Springfield', type: 'House Wash', time: '8:00 AM', status: 'complete', crew: 'Team Alpha' },
  { id: '2', customer: 'Sarah Johnson', address: '456 Oak Ave, Riverside', type: 'Concrete Cleaning', time: '10:30 AM', status: 'in_progress', crew: 'Team Alpha' },
  { id: '3', customer: 'ABC Property Mgmt', address: '789 Pine Rd, Lakeview', type: 'Building Wash', time: '1:00 PM', status: 'scheduled', crew: 'Team Beta' },
  { id: '4', customer: 'Mike Wilson', address: '321 Elm St, Oakdale', type: 'Roof Wash', time: '2:30 PM', status: 'scheduled', crew: 'Team Beta' },
  { id: '5', customer: 'Emily Brown', address: '654 Maple Dr, Fairview', type: 'Holiday Lights Install', time: '4:00 PM', status: 'scheduled', crew: 'Team Gamma' },
];

const recentActivity = [
  { title: 'Lead converted to job', description: 'Sarah Johnson – House Wash approved, Job #JOB-2026-0284', time: '5 min ago', icon: <CheckCircleOutlined /> },
  { title: 'Invoice paid', description: 'Invoice #INV-2026-0156 paid – $1,250.00 (ACH)', time: '15 min ago', icon: <DollarOutlined /> },
  { title: 'New lead from Google LSA', description: 'Robert Davis – Power wash inquiry, Springfield area', time: '32 min ago', icon: <FunnelPlotOutlined /> },
  { title: 'Estimate sent', description: 'EST-2026-0042 sent to Johnson Residence ($2,400)', time: '1 hour ago', icon: <CalendarOutlined /> },
  { title: 'Automation fired', description: 'Follow-up SMS sent to Mike Wilson (no response 48h)', time: '1.5 hours ago', icon: <ThunderboltOutlined /> },
  { title: 'Job completed', description: 'House wash at 456 Oak Ave completed – Team Alpha', time: '2 hours ago', icon: <ToolOutlined /> },
];

const statusColors: Record<string, string> = {
  scheduled: 'blue',
  en_route: 'cyan',
  on_site: 'geekblue',
  in_progress: 'orange',
  complete: 'green',
  callback: 'red',
  cancelled: 'default',
};

export default function DashboardPage() {
  const columns = [
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Service', dataIndex: 'type', key: 'type' },
    { title: 'Time', dataIndex: 'time', key: 'time' },
    { title: 'Crew', dataIndex: 'crew', key: 'crew' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Owner Dashboard</h1>
        <DatePicker.RangePicker />
      </div>

      {/* Spec Section 3.8 – Owner Dashboard KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Revenue MTD"
              value={72450}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
              suffix={<span style={{ fontSize: 12, color: '#52c41a' }}><ArrowUpOutlined /> 12%</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Revenue YTD"
              value={461200}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Pipeline Value"
              value={128500}
              precision={0}
              prefix="$"
              suffix={<span style={{ fontSize: 12 }}>42 leads</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Close Rate"
              value={68}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Speed to Lead"
              value={14}
              suffix="min"
              prefix={<PhoneOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small">
            <Statistic
              title="Callback Rate"
              value={3.2}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: More KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Save Offer Recovery"
              value={42}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              8 of 19 declined estimates recovered
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Crew Utilization"
              value={87}
              suffix="%"
              prefix={<CarOutlined />}
            />
            <Progress percent={87} showInfo={false} strokeColor="#52c41a" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Jobs Completed (MTD)"
              value={52}
              prefix={<ToolOutlined />}
              suffix={<span style={{ fontSize: 12, color: '#52c41a' }}><ArrowUpOutlined /> 8%</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Outstanding AR"
              value={12450}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              5 invoices overdue
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Revenue vs Target">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#1890ff" name="Revenue" />
                <Bar dataKey="target" fill="#d9d9d9" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Pipeline by Stage">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineByStage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="stage" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="residential" stackId="a" fill="#1890ff" name="Residential" />
                <Bar dataKey="commercial" stackId="a" fill="#52c41a" name="Commercial" />
                <Bar dataKey="holiday" stackId="a" fill="#eb2f96" name="Holiday Lights" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Jobs by Service Type">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={jobsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {jobsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Today's Schedule" extra={<a href="/dashboard/schedule">View Full Schedule</a>}>
            <Table
              dataSource={todaysJobs}
              columns={columns}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Stats + Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Performance Metrics">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Conversion Rate</span>
                <span style={{ color: '#52c41a' }}>68%</span>
              </div>
              <Progress percent={68} showInfo={false} strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>On-Time Arrival</span>
                <span style={{ color: '#52c41a' }}>92%</span>
              </div>
              <Progress percent={92} showInfo={false} strokeColor="#1890ff" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Customer Satisfaction</span>
                <span style={{ color: '#52c41a' }}>95%</span>
              </div>
              <Progress percent={95} showInfo={false} strokeColor="#52c41a" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Estimate Approval Rate</span>
                <span style={{ color: '#faad14' }}>72%</span>
              </div>
              <Progress percent={72} showInfo={false} strokeColor="#faad14" />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Recent Activity">
            <List
              itemLayout="horizontal"
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={item.icon}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    }
                    title={item.title}
                    description={
                      <>
                        <div style={{ fontSize: 13 }}>{item.description}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{item.time}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
