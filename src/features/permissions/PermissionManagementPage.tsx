import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Result,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { permissionService } from '../../services/permissionService';
import type {
  CreatePermissionPayload,
  PermissionEntity,
  UpdatePermissionPayload,
} from '../../types/permission';

const { Title, Text } = Typography;

const MANAGE_PERMISSION_CODE = 'access_control.manage';

type PermissionFormValues = {
  code: string;
  name: string;
  description?: string;
};

const normalizePermissionList = (payload: unknown): PermissionEntity[] => {
  if (Array.isArray(payload)) {
    return payload as PermissionEntity[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const wrapped = (payload as { data?: unknown }).data;
  if (Array.isArray(wrapped)) {
    return wrapped as PermissionEntity[];
  }

  return [];
};

const PermissionManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [permissionForm] = Form.useForm<PermissionFormValues>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionEntity | null>(null);

  const profileQuery = useQuery({
    queryKey: ['my-profile-permissions-page'],
    queryFn: () => userService.getProfile(),
  });

  const hasManagePermission = useMemo(() => {
    const groups = profileQuery.data?.user?.roleGroups ?? [];
    return groups.some((group) =>
      (group.permissions ?? []).some((permission) => permission.code === MANAGE_PERMISSION_CODE)
    );
  }, [profileQuery.data]);

  const permissionsQuery = useQuery({
    queryKey: ['permissions-list'],
    queryFn: () => permissionService.getPermissions().then(normalizePermissionList),
    enabled: hasManagePermission,
  });

  const createPermissionMutation = useMutation({
    mutationFn: (payload: CreatePermissionPayload) => permissionService.createPermission(payload),
    onSuccess: () => {
      message.success('Tạo quyền thành công');
      queryClient.invalidateQueries({ queryKey: ['permissions-list'] });
      closeModal();
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePermissionPayload }) =>
      permissionService.updatePermission(id, payload),
    onSuccess: () => {
      message.success('Cập nhật quyền thành công');
      queryClient.invalidateQueries({ queryKey: ['permissions-list'] });
      closeModal();
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      message.success('Xoá quyền thành công');
      queryClient.invalidateQueries({ queryKey: ['permissions-list'] });
    },
  });

  const openCreateModal = () => {
    setEditingPermission(null);
    permissionForm.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: PermissionEntity) => {
    setEditingPermission(record);
    permissionForm.setFieldsValue({
      code: record.code,
      name: record.name,
      description: record.description ?? undefined,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPermission(null);
    permissionForm.resetFields();
  };

  const onSubmitPermission = async () => {
    try {
      const values = await permissionForm.validateFields();

      const normalizedPayload = {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      };

      if (editingPermission) {
        updatePermissionMutation.mutate({
          id: editingPermission.id,
          payload: normalizedPayload,
        });
        return;
      }

      createPermissionMutation.mutate(normalizedPayload);
    } catch {
      // Form validation error is handled by antd automatically.
    }
  };

  const columns: ColumnsType<PermissionEntity> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 260,
      render: (code: string) => <Tag color="geekblue">{code}</Tag>,
    },
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (description: string | null) => description || <Text type="secondary">-</Text>,
    },
    {
      title: 'Cập nhật',
      key: 'updatedAt',
      width: 190,
      render: (_, record) => new Date(record.updatedAt).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 210,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc muốn xoá quyền này?"
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={() => deletePermissionMutation.mutate(record.id)}
          >
            <Button danger loading={deletePermissionMutation.isPending}>
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (profileQuery.isPending) {
    return <Card loading />;
  }

  if (profileQuery.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Không thể tải hồ sơ người dùng"
        description="Vui lòng thử tải lại trang hoặc đăng nhập lại."
      />
    );
  }

  if (!hasManagePermission) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền access_control.manage để truy cập chức năng này."
      />
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Quản lý quyền
            </Title>
            <Text type="secondary">
              Tạo mới, cập nhật và xoá quyền hệ thống dùng cho phân quyền truy cập.
            </Text>
          </div>

          <Space>
            <Button onClick={() => permissionsQuery.refetch()} loading={permissionsQuery.isFetching}>
              Tải lại
            </Button>
            <Button type="primary" onClick={openCreateModal}>
              Tạo quyền
            </Button>
          </Space>
        </div>
      </Card>

      <Card>
        <Table<PermissionEntity>
          rowKey="id"
          columns={columns}
          dataSource={permissionsQuery.data ?? []}
          loading={permissionsQuery.isFetching}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 980 }}
        />
      </Card>

      <Modal
        title={editingPermission ? 'Cập nhật quyền' : 'Tạo quyền'}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={onSubmitPermission}
        okText={editingPermission ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Huỷ"
        confirmLoading={createPermissionMutation.isPending || updatePermissionMutation.isPending}
        destroyOnClose
      >
        <Form<PermissionFormValues> form={permissionForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="code"
            label="Code"
            rules={[
              { required: true, message: 'Vui lòng nhập code' },
              { max: 100, message: 'Code không vượt quá 100 ký tự' },
            ]}
          >
            <Input placeholder="access_control.manage" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên quyền"
            rules={[
              { required: true, message: 'Vui lòng nhập tên quyền' },
              { max: 120, message: 'Tên quyền không vượt quá 120 ký tự' },
            ]}
          >
            <Input placeholder="Quản trị phân quyền" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ max: 255, message: 'Mô tả không vượt quá 255 ký tự' }]}
          >
            <Input.TextArea placeholder="Mô tả ngắn về quyền" autoSize={{ minRows: 3, maxRows: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default PermissionManagementPage;
