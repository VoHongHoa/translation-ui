import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  InputNumber,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { quotaService } from '../../services/quotaService';
import type { UserEntity } from '../../types/user';
import type { UserQuotaUsageEntity } from '../../types/quota';


interface QuotaManagementDrawerProps {
  user: UserEntity | null;
  open: boolean;
  onClose: () => void;
}

type QuotaFormValues = {
  dailyRequestLimit?: number;
  dailyCharacterLimit?: number;
  maxCharacterPerRequest?: number;
};

export const QuotaManagementDrawer: React.FC<QuotaManagementDrawerProps> = ({
  user,
  open,
  onClose,
}) => {
  const [quotaForm] = Form.useForm<QuotaFormValues>();
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);

  const quotaQuery = useQuery({
    queryKey: ['user-quota', user?.id],
    queryFn: () => quotaService.getUserQuota(user!.id),
    enabled: open && !!user?.id,
    staleTime: 30 * 1000,
  });

  const usageQuery = useQuery({
    queryKey: ['user-quota-usage', user?.id, dateRange[0], dateRange[1]],
    queryFn: () =>
      quotaService.getUserQuotaUsage(user!.id, dateRange[0] || undefined, dateRange[1] || undefined),
    enabled: open && !!user?.id,
    staleTime: 30 * 1000,
  });

  const updateQuotaMutation = useMutation({
    mutationFn: (payload: QuotaFormValues) => quotaService.updateUserQuota(user!.id, payload),
    onSuccess: () => {
      message.success('Cập nhật quota thành công');
      quotaQuery.refetch();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi cập nhật quota';
      message.error(errorMessage);
    },
  });

  const resetUsageMutation = useMutation({
    mutationFn: (date: string) => quotaService.resetUserQuotaUsageByDate(user!.id, date),
    onSuccess: () => {
      message.success('Đặt lại sử dụng thành công');
      usageQuery.refetch();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi đặt lại sử dụng';
      message.error(errorMessage);
    },
  });

  const handleUpdateQuota = async () => {
    try {
      const values = await quotaForm.validateFields();
      updateQuotaMutation.mutate(values);
    } catch {
      // Form validation error is handled by antd automatically
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD'),
      ]);
    } else {
      setDateRange([null, null]);
    }
  };

  // Reset form and dateRange when drawer opens or user changes
  useEffect(() => {
    if (open && user?.id) {
      quotaForm.resetFields();
      setDateRange([null, null]);
    }
  }, [open, user?.id, quotaForm]);

  // Update form values when quota data is loaded
  useEffect(() => {
    if (quotaQuery.data && !quotaQuery.isPending) {
      quotaForm.setFieldsValue({
        dailyRequestLimit: quotaQuery.data.dailyRequestLimit,
        dailyCharacterLimit: quotaQuery.data.dailyCharacterLimit,
        maxCharacterPerRequest: quotaQuery.data.maxCharacterPerRequest,
      });
    }
  }, [quotaQuery.data, quotaQuery.isPending, quotaForm]);

  const usageColumns: ColumnsType<UserQuotaUsageEntity> = [
    {
      title: 'Ngày',
      dataIndex: 'usageDate',
      key: 'usageDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số lượng request',
      dataIndex: 'googleRequestCount',
      key: 'googleRequestCount',
      width: 150,
      render: (count: number) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>{count} requests</Tag>
      ),
    },
    {
      title: 'Ký tự dịch',
      dataIndex: 'characterCount',
      key: 'characterCount',
      width: 150,
      render: (count: number) => (
        <Tag color={count > 0 ? 'cyan' : 'default'}>{count} ký tự</Tag>
      ),
    },
    {
      title: 'Cache hit',
      dataIndex: 'cacheHitCount',
      key: 'cacheHitCount',
      width: 120,
      render: (count: number) => (
        <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Button
          danger
          size="small"
          loading={resetUsageMutation.isPending}
          onClick={() => resetUsageMutation.mutate(record.usageDate)}
        >
          Đặt lại
        </Button>
      ),
    },
  ];

  return (
    <Drawer
      title={`Quản lý Quota - ${user?.fullName} (${user?.email})`}
      placement="right"
      onClose={onClose}
      open={open}
      width={800}
    >
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        {/* Quota Settings Section */}
        <Card title="Cài đặt Quota" loading={quotaQuery.isPending}>
          {quotaQuery.data && (
            <Form
              form={quotaForm}
              layout="vertical"
              onFinish={handleUpdateQuota}
            >
              <Form.Item
                label="Giới hạn request/ngày"
                name="dailyRequestLimit"
                rules={[
                  { type: 'number', min: 1, max: 100000, message: 'Giá trị từ 1 đến 100000' },
                ]}
              >
                <InputNumber min={1} max={100000} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="Giới hạn ký tự/ngày"
                name="dailyCharacterLimit"
                rules={[
                  { type: 'number', min: 1, max: 10000000, message: 'Giá trị từ 1 đến 10000000' },
                ]}
              >
                <InputNumber min={1} max={10000000} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="Giới hạn ký tự/request"
                name="maxCharacterPerRequest"
                rules={[
                  { type: 'number', min: 1, max: 1000000, message: 'Giá trị từ 1 đến 1000000' },
                ]}
              >
                <InputNumber min={1} max={1000000} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateQuotaMutation.isPending}
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>

        {/* Usage History Section */}
        <Card
          title="Lịch sử sử dụng"
          extra={
            <DatePicker.RangePicker
              format="DD/MM/YYYY"
              onChange={handleDateRangeChange}
              style={{ width: 300 }}
            />
          }
          loading={usageQuery.isPending}
        >
          <Table<UserQuotaUsageEntity>
            columns={usageColumns}
            dataSource={usageQuery.data ?? []}
            rowKey="usageDate"
            pagination={false}
            locale={{
              emptyText: 'Không có dữ liệu sử dụng',
            }}
          />
        </Card>
      </Space>
    </Drawer>
  );
};
