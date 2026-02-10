'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Checkbox, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Image from 'next/image';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    console.log('Received values of form: ', values);
    
    // Simulate API call
    setTimeout(() => {
      // Mock successful login
      if (values.username === 'demo' && values.password === 'demo') {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        message.success('Login successful!');
        router.push('/dashboard');
      } else {
        message.error('Invalid username or password (use demo/demo)');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-xl overflow-hidden border-0">
        <div className="text-center mb-8 pt-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              FS
            </div>
          </div>
          <Title level={3} className="m-0">Field Service CRM</Title>
          <Text type="secondary">Sign in to manage your business</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Username (demo)" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Password (demo)" 
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a className="text-blue-600 hover:text-blue-800 text-sm" href="#">
              Forgot password?
            </a>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-medium"
              loading={loading}
            >
              Log in
            </Button>
          </Form.Item>
          
          <div className="text-center text-gray-500 text-sm">
            Don't have an account? <a href="#" className="text-blue-600">Sign up</a>
          </div>
        </Form>
      </Card>
      
      <div className="fixed bottom-4 text-center text-gray-400 text-xs w-full">
        &copy; {new Date().getFullYear()} Field Service CRM. All rights reserved.
      </div>
    </div>
  );
}
