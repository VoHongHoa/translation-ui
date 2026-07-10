import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const AuthLayout: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: token.colorBgLayout,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          width: '100%',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AuthLayout;
