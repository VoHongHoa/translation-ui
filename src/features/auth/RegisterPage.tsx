import React from 'react';
import { Form, Input, Button, Card, Typography, Divider, App } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import type { RegisterPayload } from '../../types/auth';

const { Title, Text } = Typography;

interface RegisterFormValues extends RegisterPayload {
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<RegisterFormValues>();

  const { mutate, isPending } = useMutation({
    mutationFn: (values: RegisterPayload) => authService.register(values),
    onSuccess: () => {
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    },
    onError: () => {
      // Lỗi đã được xử lý tập trung trong apiClient interceptor
    },
  });

  const onFinish = ({ confirmPassword: _confirm, ...values }: RegisterFormValues) => {
    mutate(values);
  };

  return (
    <Card
      style={{ width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      variant="borderless"
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Tạo tài khoản
        </Title>
        <Text type="secondary">Điền thông tin để đăng ký</Text>
      </div>

      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên!' },
            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' },
            { max: 120, message: 'Họ tên không được vượt quá 120 ký tự!' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
        </Form.Item>

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
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
            { max: 64, message: 'Mật khẩu không được vượt quá 64 ký tự!' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Ít nhất 8 ký tự" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={isPending}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Đã có tài khoản?
        </Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Link to="/login">Đăng nhập ngay</Link>
      </div>
    </Card>
  );
};

export default RegisterPage;
