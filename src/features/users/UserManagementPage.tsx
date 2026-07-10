import React, { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Dropdown,
  Form,
  Input,
  MenuProps,
  Modal,
  Popconfirm,
  Result,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { roleGroupService } from "../../services/roleGroupService";
import { RoleGroupSelector } from "./RoleGroupSelector";
import { QuotaManagementDrawer } from "./QuotaManagementDrawer";
import type {
  CreateUserPayload,
  SearchUsersResponse,
  UpdateUserPayload,
  UserEntity,
} from "../../types/user";
import {
  MoreOutlined,
  EditOutlined,
  DatabaseOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const MANAGE_PERMISSION_CODE = "access_control.manage";

type UserFormValues = {
  email: string;
  fullName: string;
  isActive?: boolean;
};

type UserFilters = {
  keyword?: string;
  isActive?: boolean;
};

const normalizeSearchResponse = (payload: unknown): SearchUsersResponse => {
  const fallback: SearchUsersResponse = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const direct = payload as Partial<SearchUsersResponse>;
  if (Array.isArray(direct.items) && typeof direct.total === "number") {
    return {
      items: direct.items,
      total: direct.total,
      page: direct.page ?? 1,
      limit: direct.limit ?? 20,
      totalPages: direct.totalPages ?? 0,
    };
  }

  const wrapped = (payload as { data?: Partial<SearchUsersResponse> }).data;
  if (
    wrapped &&
    Array.isArray(wrapped.items) &&
    typeof wrapped.total === "number"
  ) {
    return {
      items: wrapped.items,
      total: wrapped.total,
      page: wrapped.page ?? 1,
      limit: wrapped.limit ?? 20,
      totalPages: wrapped.totalPages ?? 0,
    };
  }

  return fallback;
};

const UserManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterForm] = Form.useForm<UserFilters>();
  const [userForm] = Form.useForm<UserFormValues>();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<UserFilters>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);
  const [selectedRoleGroupIds, setSelectedRoleGroupIds] = useState<string[]>(
    [],
  );

  const [quotaDrawerOpen, setQuotaDrawerOpen] = useState(false);
  const [selectedUserForQuota, setSelectedUserForQuota] =
    useState<UserEntity | null>(null);

  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => userService.getProfile(),
  });

  const hasManagePermission = useMemo(() => {
    const groups = profileQuery.data?.user?.roleGroups ?? [];
    return groups.some((group) =>
      (group.permissions ?? []).some(
        (permission) => permission.code === MANAGE_PERMISSION_CODE,
      ),
    );
  }, [profileQuery.data]);

  const roleGroupsQuery = useQuery({
    queryKey: ["role-groups-for-user-management"],
    queryFn: () => roleGroupService.getRoleGroups(),
    enabled: hasManagePermission,
    staleTime: 60 * 1000,
  });

  const usersQuery = useQuery({
    queryKey: ["users-search", page, limit, filters.keyword, filters.isActive],
    queryFn: () =>
      userService
        .searchUsers({
          page,
          limit,
          keyword: filters.keyword,
          isActive: filters.isActive,
        })
        .then(normalizeSearchResponse),
    enabled: hasManagePermission,
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.createUser(payload),
    onSuccess: () => {
      message.success("Tạo người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["users-search"] });
      closeModal();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userService.updateUser(id, payload),
    onSuccess: () => {
      message.success("Cập nhật người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["users-search"] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      closeModal();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateUserStatus(id, { isActive }),
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: ["users-search"] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      message.success("Xoá người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["users-search"] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setSelectedRoleGroupIds([]);
    userForm.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: UserEntity) => {
    setEditingUser(record);
    const roleGroupIds = (record.roleGroups ?? []).map((group) => group.id);
    setSelectedRoleGroupIds(roleGroupIds);
    userForm.setFieldsValue({
      email: record.email,
      fullName: record.fullName,
      isActive: record.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setSelectedRoleGroupIds([]);
    userForm.resetFields();
  };

  const openQuotaDrawer = (user: UserEntity) => {
    setSelectedUserForQuota(user);
    setQuotaDrawerOpen(true);
  };

  const closeQuotaDrawer = () => {
    setQuotaDrawerOpen(false);
    setSelectedUserForQuota(null);
  };

  const onSubmitUser = async () => {
    try {
      const values = await userForm.validateFields();

      if (editingUser) {
        const payload: UpdateUserPayload = {
          email: values.email,
          fullName: values.fullName,
          roleGroupIds:
            selectedRoleGroupIds.length > 0 ? selectedRoleGroupIds : undefined,
          isActive: values.isActive,
        };
        updateUserMutation.mutate({ id: editingUser.id, payload });
        return;
      }

      const createPayload: CreateUserPayload = {
        email: values.email,
        fullName: values.fullName,
        roleGroupIds:
          selectedRoleGroupIds.length > 0 ? selectedRoleGroupIds : undefined,
      };
      createUserMutation.mutate(createPayload);
    } catch {
      // Form validation error is handled by antd automatically.
    }
  };

  const onSearch = async () => {
    const values = await filterForm.validateFields();
    setPage(1);
    setFilters({
      keyword: values.keyword?.trim() || undefined,
      isActive: values.isActive,
    });
  };

  const onResetFilters = () => {
    filterForm.resetFields();
    setPage(1);
    setFilters({});
  };

  const columns: ColumnsType<UserEntity> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      key: "isActive",
      width: 150,
      render: (_, record) => (
        <Tag color={record.isActive ? "success" : "default"}>
          {record.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Nhóm quyền",
      key: "roleGroups",
      render: (_, record) => {
        const groups = record.roleGroups ?? [];
        if (!groups.length) {
          return <Text type="secondary">Chưa gán</Text>;
        }

        return (
          <Space size={[4, 4]} wrap>
            {groups.slice(0, 2).map((group) => (
              <Tag key={group.id} color="blue">
                {group.code}
              </Tag>
            ))}
            {groups.length > 2 && <Tag>+{groups.length - 2}</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 300,
      render: (_, record) => {
        const items: MenuProps["items"] = [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Sửa",
            onClick: () => openEditModal(record),
          },
          {
            key: "quota",
            icon: <DatabaseOutlined />,
            label: "Quản lý quota",
            onClick: () => openQuotaDrawer(record),
          },
          {
            type: "divider",
          },
          {
            key: "status",
            label: (
              <Popconfirm
                title={
                  record.isActive
                    ? "Khoá người dùng này?"
                    : "Kích hoạt người dùng này?"
                }
                okText="Đồng ý"
                cancelText="Huỷ"
                onConfirm={() =>
                  updateStatusMutation.mutate({
                    id: record.id,
                    isActive: !record.isActive,
                  })
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                  {record.isActive ? "Khoá" : "Kích hoạt"}
                </div>
              </Popconfirm>
            ),
          },
          {
            key: "delete",
            danger: true,
            label: (
              <Popconfirm
                title="Bạn có chắc muốn xoá người dùng này?"
                okText="Xoá"
                cancelText="Huỷ"
                okButtonProps={{ danger: true }}
                onConfirm={() => deleteUserMutation.mutate(record.id)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <DeleteOutlined />
                  Xoá
                </div>
              </Popconfirm>
            ),
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button
              size="small"
              type="text"
              icon={<MoreOutlined style={{ fontSize: 18 }} />}
            />
          </Dropdown>
        );
      },
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
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Quản lý người dùng
            </Title>
            <Text type="secondary">
              Tìm kiếm, tạo mới, cập nhật, đổi trạng thái và xoá người dùng theo
              quyền truy cập.
            </Text>
          </div>

          <Space>
            <Button
              onClick={() => usersQuery.refetch()}
              loading={usersQuery.isFetching}
            >
              Tải lại
            </Button>
            <Button type="primary" onClick={openCreateModal}>
              Tạo người dùng
            </Button>
          </Space>
        </div>
      </Card>

      <Card>
        <Form form={filterForm} layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="Từ khoá">
            <Input
              allowClear
              placeholder="Email hoặc họ tên"
              style={{ width: 240 }}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái">
            <Select
              allowClear
              style={{ width: 180 }}
              placeholder="Tất cả"
              options={[
                { value: true, label: "Đang hoạt động" },
                { value: false, label: "Ngừng hoạt động" },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tìm kiếm
              </Button>
              <Button onClick={onResetFilters}>Đặt lại</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table<UserEntity>
          rowKey="id"
          columns={columns}
          dataSource={usersQuery.data?.items ?? []}
          loading={usersQuery.isFetching}
          pagination={{
            current: page,
            pageSize: limit,
            total: usersQuery.data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setLimit(nextPageSize);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingUser ? "Cập nhật người dùng" : "Tạo người dùng"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={onSubmitUser}
        okText={editingUser ? "Lưu thay đổi" : "Tạo mới"}
        cancelText="Huỷ"
        confirmLoading={
          createUserMutation.isPending || updateUserMutation.isPending
        }
        destroyOnClose
        width={700}
      >
        <Form<UserFormValues>
          form={userForm}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
              { max: 255, message: "Email không vượt quá 255 ký tự" },
            ]}
          >
            <Input placeholder="name@example.com" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ và tên" },
              { max: 120, message: "Họ và tên không vượt quá 120 ký tự" },
            ]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item label="Chọn nhóm vai trò">
            <RoleGroupSelector
              availableRoleGroups={roleGroupsQuery.data ?? []}
              selectedRoleGroupIds={selectedRoleGroupIds}
              onSelectionChange={setSelectedRoleGroupIds}
              loading={roleGroupsQuery.isLoading}
              disabled={roleGroupsQuery.isLoading}
            />
          </Form.Item>

          {editingUser ? (
            <Form.Item
              name="isActive"
              label="Trạng thái hoạt động"
              valuePropName="checked"
            >
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Khoá" />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>

      <QuotaManagementDrawer
        user={selectedUserForQuota}
        open={quotaDrawerOpen}
        onClose={closeQuotaDrawer}
      />
    </Space>
  );
};

export default UserManagementPage;
