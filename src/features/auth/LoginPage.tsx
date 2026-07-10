import React from 'react';
import { Form, Input, Button, Card, Typography, Divider, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import type { LoginPayload } from '../../types/auth';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const login = useAuthStore((state) => state.login);
  const [form] = Form.useForm<LoginPayload>();

  const { mutate, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(form.getFieldValue('email'), data.accessToken);
      message.success('Đăng nhập thành công!');
      navigate('/');
    },
    onError: () => {
      // Lỗi đã được xử lý tập trung trong apiClient interceptor
    },
  });

  const onFinish = (values: LoginPayload) => {
    mutate(values);
  };

  return (
    <Card
      style={{ width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      variant="borderless"
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Đăng nhập
        </Title>
        <Text type="secondary">Chào mừng bạn quay trở lại!</Text>
      </div>

      <Form
        form={form}
        name="login"
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="example@email.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={isPending}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Chưa có tài khoản?
        </Text>
      </Divider>

      <Button block onClick={() => navigate('/register')}>
        Tạo tài khoản mới
      </Button>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link to="/register">Đăng ký ngay</Link>
      </div>
    </Card>
  );
};

export default LoginPage;
