import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
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
import type { CheckboxOptionType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { roleGroupService } from '../../services/roleGroupService';
import { permissionService } from '../../services/permissionService';
import type {
  CreateRoleGroupPayload,
  RoleGroupEntity,
  UpdateRoleGroupPayload,
} from '../../types/roleGroup';
import type { PermissionEntity } from '../../types/permission';

const { Title, Text } = Typography;

const MANAGE_PERMISSION_CODE = 'access_control.manage';

type RoleGroupFormValues = {
  code: string;
  name: string;
  description?: string;
  permissionIds?: string[];
};

const normalizeRoleGroupList = (payload: unknown): RoleGroupEntity[] => {
  if (Array.isArray(payload)) {
    return payload as RoleGroupEntity[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const wrapped = (payload as { data?: unknown }).data;
  if (Array.isArray(wrapped)) {
    return wrapped as RoleGroupEntity[];
  }

  return [];
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

const RoleGroupManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [roleGroupForm] = Form.useForm<RoleGroupFormValues>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleGroup, setEditingRoleGroup] = useState<RoleGroupEntity | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  const profileQuery = useQuery({
    queryKey: ['my-profile-rolegroups-page'],
    queryFn: () => userService.getProfile(),
  });

  const hasManagePermission = useMemo(() => {
    const groups = profileQuery.data?.user?.roleGroups ?? [];
    return groups.some((group) =>
      (group.permissions ?? []).some((permission) => permission.code === MANAGE_PERMISSION_CODE)
    );
  }, [profileQuery.data]);

  const roleGroupsQuery = useQuery({
    queryKey: ['role-groups-list'],
    queryFn: () => roleGroupService.getRoleGroups().then(normalizeRoleGroupList),
    enabled: hasManagePermission,
  });

  const permissionsQuery = useQuery({
    queryKey: ['permissions-for-rolegroups'],
    queryFn: () => permissionService.getPermissions().then(normalizePermissionList),
    enabled: hasManagePermission && isModalOpen,
  });

  const createRoleGroupMutation = useMutation({
    mutationFn: (payload: CreateRoleGroupPayload) => roleGroupService.createRoleGroup(payload),
    onSuccess: () => {
      message.success('Tạo nhóm vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['role-groups-list'] });
      closeModal();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi tạo nhóm vai trò';
      message.error(errorMessage);
    },
  });

  const updateRoleGroupMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoleGroupPayload }) =>
      roleGroupService.updateRoleGroup(id, payload),
    onSuccess: () => {
      message.success('Cập nhật nhóm vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['role-groups-list'] });
      closeModal();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi cập nhật nhóm vai trò';
      message.error(errorMessage);
    },
  });

  const deleteRoleGroupMutation = useMutation({
    mutationFn: (id: string) => roleGroupService.deleteRoleGroup(id),
    onSuccess: () => {
      message.success('Xoá nhóm vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['role-groups-list'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Lỗi khi xoá nhóm vai trò';
      message.error(errorMessage);
    },
  });

  const openCreateModal = () => {
    setEditingRoleGroup(null);
    setSelectedPermissionIds([]);
    roleGroupForm.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: RoleGroupEntity) => {
    setEditingRoleGroup(record);
    const permIds = record.permissions?.map((p) => p.id) ?? [];
    setSelectedPermissionIds(permIds);
    roleGroupForm.setFieldsValue({
      code: record.code,
      name: record.name,
      description: record.description ?? undefined,
      permissionIds: permIds,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoleGroup(null);
    setSelectedPermissionIds([]);
    roleGroupForm.resetFields();
  };

  const onSubmitRoleGroup = async () => {
    try {
      const values = await roleGroupForm.validateFields();

      const normalizedPayload : any = {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        permissionIds: selectedPermissionIds.length > 0 ? selectedPermissionIds : undefined,
      };

      if (editingRoleGroup) {
        updateRoleGroupMutation.mutate({
          id: editingRoleGroup.id,
          payload: normalizedPayload,
        });
        return;
      }

      createRoleGroupMutation.mutate(normalizedPayload);
    } catch {
      // Form validation error is handled by antd automatically.
    }
  };

  const permissionOptions: CheckboxOptionType[] = (permissionsQuery.data ?? []).map((perm) => ({
    label: `${perm.code} - ${perm.name}`,
    value: perm.id,
  }));

  const columns: ColumnsType<RoleGroupEntity> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (code: string) => <Tag color="geekblue">{code}</Tag>,
    },
    {
      title: 'Tên nhóm vai trò',
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
      title: 'Số lượng quyền',
      key: 'permissionCount',
      width: 120,
      render: (_, record) => (
        <Tag color="green">{record.permissions?.length ?? 0} quyền</Tag>
      ),
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
            title="Bạn có chắc muốn xoá nhóm vai trò này?"
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteRoleGroupMutation.mutate(record.id)}
          >
            <Button danger loading={deleteRoleGroupMutation.isPending}>
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
              Quản lý nhóm vai trò
            </Title>
            <Text type="secondary">
              Tạo mới, cập nhật và xoá nhóm vai trò để phân quyền truy cập cho người dùng.
            </Text>
          </div>

          <Space>
            <Button onClick={() => roleGroupsQuery.refetch()} loading={roleGroupsQuery.isFetching}>
              Tải lại
            </Button>
            <Button type="primary" onClick={openCreateModal}>
              Tạo nhóm vai trò
            </Button>
          </Space>
        </div>
      </Card>

      <Card loading={roleGroupsQuery.isPending}>
        <Table
          columns={columns}
          dataSource={roleGroupsQuery.data ?? []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={roleGroupsQuery.isFetching && !roleGroupsQuery.data}
        />
      </Card>

      <Modal
        title={editingRoleGroup ? 'Cập nhật nhóm vai trò' : 'Tạo nhóm vai trò mới'}
        open={isModalOpen}
        onOk={onSubmitRoleGroup}
        onCancel={closeModal}
        okButtonProps={{
          loading: createRoleGroupMutation.isPending || updateRoleGroupMutation.isPending,
        }}
        width={600}
      >
        <Form
          form={roleGroupForm}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Code"
            name="code"
            rules={[
              { required: true, message: 'Vui lòng nhập code' },
              { max: 100, message: 'Code tối đa 100 ký tự' },
              {
                pattern: /^[a-zA-Z0-9_.-]+$/,
                message: 'Code chỉ chứa chữ cái, số, dấu gạch dưới, dấu chấm và dấu gạch ngang',
              },
            ]}
          >
            <Input placeholder="Ví dụ: admin, moderator" disabled={!!editingRoleGroup} />
          </Form.Item>

          <Form.Item
            label="Tên nhóm vai trò"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên nhóm vai trò' },
              { max: 120, message: 'Tên tối đa 120 ký tự' },
            ]}
          >
            <Input placeholder="Ví dụ: Administrator" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ max: 255, message: 'Mô tả tối đa 255 ký tự' }]}
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết về nhóm vai trò này"
              rows={3}
            />
          </Form.Item>

          <Form.Item label="Chọn quyền">
            <Card size="small" style={{ backgroundColor: '#fafafa' }}>
              {permissionsQuery.isPending ? (
                <div>Đang tải danh sách quyền...</div>
              ) : permissionsQuery.data && permissionsQuery.data.length > 0 ? (
                <Checkbox.Group
                  options={permissionOptions}
                  value={selectedPermissionIds}
                  onChange={(values) => setSelectedPermissionIds(values as string[])}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                />
              ) : (
                <Text type="secondary">Không có quyền nào để chọn</Text>
              )}
            </Card>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default RoleGroupManagementPage;
