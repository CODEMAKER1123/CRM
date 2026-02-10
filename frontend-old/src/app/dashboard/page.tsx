'use client';

import { Card, Row, Col, Statistic, Table, Tag, Progress, List, Avatar } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  TeamOutlined,
  ToolOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
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
} from 'recharts';

// Mock data - replace with API calls
const revenueData = [
  { month: 'Jan', revenue: 45000, jobs: 32 },
  { month: 'Feb', revenue: 52000, jobs: 38 },
  { month: 'Mar', revenue: 48000, jobs: 35 },
  { month: 'Apr', revenue: 61000, jobs: 42 },
  { month: 'May', revenue: 55000, jobs: 40 },
  { month: 'Jun', revenue: 67000, jobs: 48 },
  { month: 'Jul', revenue: 72000, jobs: 52 },
];

const jobsByType = [
  { name: 'Power Washing', value: 45, color: '#1890ff' },
  { name: 'Christmas Lights', value: 30, color: '#52c41a' },
  { name: 'Gutter Cleaning', value: 15, color: '#faad14' },
  { name: 'Other', value: 10, color: '#722ed1' },
];

const todaysJobs = [
  {
    id: '1',
    customer: 'John Smith',
    address: '123 Main St',
    type: 'Power Washing',
    time: '9:00 AM',
    status: 'in_progress',
    crew: 'Team Alpha',
  },
  {
    id: '2',
    customer: 'Sarah Johnson',
    address: '456 Oak Ave',
    type: 'Gutter Cleaning',
    time: '11:00 AM',
    status: 'scheduled',
    crew: 'Team Beta',
  },
  {
    id: '3',
    customer: 'Mike Wilson',
    address: '789 Pine Rd',
    type: 'Power Washing',
    time: '2:00 PM',
    status: 'scheduled',
    crew: 'Team Alpha',
  },
  {
    id: '4',
    customer: 'Emily Brown',
    address: '321 Elm St',
    type: 'Christmas Lights',
    time: '4:00 PM',
    status: 'scheduled',
    crew: 'Team Gamma',
  },
];

const recentActivity = [
  { title: 'New estimate sent', description: 'Estimate #EST-2024-0042 sent to Johnson Residence', time: '5 min ago' },
  { title: 'Invoice paid', description: 'Invoice #INV-2024-0156 paid - $1,250.00', time: '15 min ago' },
  { title: 'Job completed', description: 'Power washing at 456 Oak Ave completed', time: '1 hour ago' },
  { title: 'New lead', description: 'Website inquiry from Robert Davis', time: '2 hours ago' },
];

const statusColors: Record<string, string> = {
  scheduled: 'blue',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'red',
};

export default function DashboardPage() {
  const columns = [
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Service',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Crew',
      dataIndex: 'crew',
      key: 'crew',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue This Month"
              value={72000}
              precision={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span className="text-sm text-green-500">
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jobs Completed"
              value={52}
              prefix={<ToolOutlined />}
              suffix={
                <span className="text-sm text-green-500">
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New Customers"
              value={18}
              prefix={<TeamOutlined />}
              suffix={
                <span className="text-sm text-red-500">
                  <ArrowDownOutlined /> 3%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Estimates"
              value={12}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Revenue Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Jobs by Type">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
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
      </Row>

      {/* Today's Jobs and Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Today's Jobs" extra={<a href="/dashboard/jobs">View All</a>}>
            <Table
              dataSource={todaysJobs}
              columns={columns}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Recent Activity">
            <List
              itemLayout="horizontal"
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<ClockCircleOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    }
                    title={item.title}
                    description={
                      <>
                        <div className="text-sm">{item.description}</div>
                        <div className="text-xs text-gray-400">{item.time}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Conversion Rate</span>
              <span className="text-green-500">+5%</span>
            </div>
            <Progress percent={68} status="active" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">On-Time Arrival</span>
              <span className="text-green-500">+2%</span>
            </div>
            <Progress percent={92} status="success" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Customer Satisfaction</span>
              <span className="text-green-500">+3%</span>
            </div>
            <Progress percent={95} status="success" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Outstanding AR</span>
              <span className="text-red-500">$12,450</span>
            </div>
            <Progress percent={35} status="exception" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
