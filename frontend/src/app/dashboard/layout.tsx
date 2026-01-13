'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ProLayout,
  ProSettings,
  PageContainer,
} from '@ant-design/pro-components';
import {
  DashboardOutlined,
  TeamOutlined,
  ToolOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  CarOutlined,
  SettingOutlined,
  UserOutlined,
  ShopOutlined,
  MailOutlined,
  ApiOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Badge, Button } from 'antd';
import type { MenuDataItem } from '@ant-design/pro-components';

const menuData: MenuDataItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <DashboardOutlined />,
  },
  {
    path: '/dashboard/customers',
    name: 'Customers',
    icon: <TeamOutlined />,
  },
  {
    path: '/dashboard/jobs',
    name: 'Jobs',
    icon: <ToolOutlined />,
    children: [
      { path: '/dashboard/jobs', name: 'All Jobs' },
      { path: '/dashboard/jobs/pipeline', name: 'Pipeline' },
      { path: '/dashboard/jobs/calendar', name: 'Calendar' },
    ],
  },
  {
    path: '/dashboard/estimates',
    name: 'Estimates',
    icon: <FileTextOutlined />,
  },
  {
    path: '/dashboard/invoices',
    name: 'Invoices',
    icon: <DollarOutlined />,
  },
  {
    path: '/dashboard/schedule',
    name: 'Schedule',
    icon: <CalendarOutlined />,
    children: [
      { path: '/dashboard/schedule', name: 'Calendar View' },
      { path: '/dashboard/schedule/dispatch', name: 'Dispatch Board' },
    ],
  },
  {
    path: '/dashboard/crews',
    name: 'Crews',
    icon: <CarOutlined />,
    children: [
      { path: '/dashboard/crews', name: 'Crews' },
      { path: '/dashboard/crews/members', name: 'Team Members' },
      { path: '/dashboard/crews/time', name: 'Time Tracking' },
    ],
  },
  {
    path: '/dashboard/routes',
    name: 'Routes',
    icon: <CarOutlined />,
  },
  {
    path: '/dashboard/price-book',
    name: 'Price Book',
    icon: <ShopOutlined />,
  },
  {
    path: '/dashboard/marketing',
    name: 'Marketing',
    icon: <MailOutlined />,
    children: [
      { path: '/dashboard/marketing/campaigns', name: 'Campaigns' },
      { path: '/dashboard/marketing/automations', name: 'Automations' },
      { path: '/dashboard/marketing/templates', name: 'Templates' },
    ],
  },
  {
    path: '/dashboard/integrations',
    name: 'Integrations',
    icon: <ApiOutlined />,
  },
  {
    path: '/dashboard/settings',
    name: 'Settings',
    icon: <SettingOutlined />,
  },
];

const settings: Partial<ProSettings> = {
  fixSiderbar: true,
  layout: 'mix',
  splitMenus: false,
  navTheme: 'light',
  contentWidth: 'Fluid',
  colorPrimary: '#1890ff',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const userMenuItems = [
    { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
    { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
    { type: 'divider' as const },
    { key: 'logout', label: 'Sign Out', danger: true },
  ];

  return (
    <ProLayout
      title="Field Service CRM"
      logo="/logo.png"
      layout="mix"
      navTheme="light"
      fixSiderbar
      collapsed={collapsed}
      onCollapse={setCollapsed}
      location={{ pathname }}
      menuDataRender={() => menuData}
      menuItemRender={(item, dom) => (
        <div onClick={() => router.push(item.path || '/')}>{dom}</div>
      )}
      headerContentRender={() => (
        <div className="flex items-center gap-4">
          <Button type="primary" size="small">
            + New Job
          </Button>
        </div>
      )}
      actionsRender={() => [
        <Badge key="notifications" count={3} size="small">
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>,
        <Dropdown key="user" menu={{ items: userMenuItems }} trigger={['click']}>
          <Avatar
            style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
            icon={<UserOutlined />}
          />
        </Dropdown>,
      ]}
      {...settings}
    >
      {children}
    </ProLayout>
  );
}
