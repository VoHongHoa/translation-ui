import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Spin,
  Statistic,
  Typography,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';
import type { ProfileResponse } from '../../types/auth';

const { Title, Text } = Typography;

const normalizeProfileResponse = (payload: unknown): ProfileResponse | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const direct = payload as Partial<ProfileResponse>;
  if (direct.user || direct.quota || direct.usage) {
    return direct as ProfileResponse;
  }

  const wrapped = (payload as { data?: Partial<ProfileResponse> }).data;
  if (wrapped && (wrapped.user || wrapped.quota || wrapped.usage)) {
    return wrapped as ProfileResponse;
  }

  return null;
};

const ProfilePage: React.FC = () => {
  const {
    data: profile,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userService.getProfile(),
    select: (response) => normalizeProfileResponse(response),
    staleTime: 60 * 1000,
  });

  if (isPending) {
    return (
      <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin tip="Đang tải hồ sơ người dùng..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Không thể tải thông tin hồ sơ"
        description={(error as Error).message}
        action={
          <Button onClick={() => refetch()} loading={isRefetching}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (!profile) {
    return <Empty description="Không có dữ liệu hồ sơ" />;
  }

  const user = profile.user;
  const quota = profile.quota;
  const usage = profile.usage;

  if (!user) {
    return <Empty description="Không có thông tin người dùng" />;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Hồ sơ của tôi
            </Title>
            <Text type="secondary">Thông tin tài khoản và hạn mức sử dụng trong ngày</Text>
          </div>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isRefetching}>
            Tải lại
          </Button>
        </div>
      </Card>

      <Card title="Thông tin người dùng">
        <Descriptions column={1} size="middle" bordered>
          <Descriptions.Item label="ID">{user.id || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Họ và tên">{user.fullName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {user.updatedAt ? new Date(user.updatedAt).toLocaleString('vi-VN') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Hạn mức (Quota)">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Statistic title="Giới hạn request/ngày" value={quota?.dailyRequestLimit ?? 0} />
              <Statistic title="Giới hạn ký tự/ngày" value={quota?.dailyCharacterLimit ?? 0} />
              <Statistic title="Giới hạn ký tự/request" value={quota?.maxCharacterPerRequest ?? 0} />
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={`Sử dụng trong ngày (${usage?.usageDate ?? '-'})`}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Statistic title="Số lần gọi" value={usage?.googleRequestCount ?? 0} />
              <Statistic title="Số ký tự đã dùng" value={usage?.characterCount ?? 0} />
              <Statistic title="Số lần dùng cache" value={usage?.cacheHitCount ?? 0} />
              <Statistic title="Request còn lại" value={usage?.remainingDailyRequest ?? 0} />
              <Statistic title="Ký tự còn lại" value={usage?.remainingDailyCharacter ?? 0} />
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default ProfilePage;
