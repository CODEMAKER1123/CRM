'use client';

import { ConfigProvider, App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import './globals.css';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 6,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={theme}>
            <AntApp>{children}</AntApp>
          </ConfigProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
