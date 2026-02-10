/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/pro-components',
    '@ant-design/pro-layout',
    'rc-util',
    'rc-pagination',
    'rc-picker',
  ],
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'],
  },
};

module.exports = nextConfig;
