import React, { useMemo, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Breadcrumb,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  BellOutlined,
  GlobalOutlined,
  TeamOutlined,
  SafetyOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { userService } from "../services/userService";

const { Header, Sider, Content } = Layout;

const SIDER_WIDTH = 300;
const SIDER_WIDTH_COLLAPSED = 80;

type AppMenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  requiredPermissions?: string[];
  requiredRoleGroupCodes?: string[];
};

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const profileQuery = useQuery({
    queryKey: ["my-profile-menu"],
    queryFn: () => userService.getProfile(),
    enabled: Boolean(user),
    staleTime: 60 * 1000,
  });

  const userPermissionCodes = useMemo(() => {
    const groups = profileQuery.data?.user?.roleGroups ?? [];
    return new Set(
      groups.flatMap((group) =>
        (group.permissions ?? []).map((permission) => permission.code),
      ),
    );
  }, [profileQuery.data]);

  const userRoleGroupCodes = useMemo(() => {
    const groups = profileQuery.data?.user?.roleGroups ?? [];
    return new Set(groups.map((group) => group.code));
  }, [profileQuery.data]);

  // Tên & email hiển thị: ưu tiên dữ liệu profile, fallback về store
  const displayName =
    profileQuery.data?.user?.fullName ??
    (typeof user === "string" ? user : "Người dùng");

  const displayEmail =
    profileQuery.data?.user?.email ?? (typeof user === "string" ? user : "");

  const menuItems: AppMenuItem[] = [
    { key: "/", icon: <HomeOutlined />, label: "Trang chủ" },
    { key: "/translate", icon: <GlobalOutlined />, label: "Dịch" },
    {
      key: "/users",
      icon: <TeamOutlined />,
      label: "Quản lý người dùng",
      requiredPermissions: ["access_control.manage"],
      requiredRoleGroupCodes: ["admin"],
    },
    {
      key: "/permissions",
      icon: <SafetyOutlined />,
      label: "Quản lý quyền",
      requiredPermissions: ["access_control.manage"],
      requiredRoleGroupCodes: ["admin"],
    },
    {
      key: "/role-groups",
      icon: <SafetyOutlined />,
      label: "Quản lý nhóm vai trò",
      requiredPermissions: ["access_control.manage"],
      requiredRoleGroupCodes: ["admin"],
    },
  ];

  const canViewMenuItem = (item: AppMenuItem) => {
    const hasPermissionRules = (item.requiredPermissions?.length ?? 0) > 0;
    const hasRoleRules = (item.requiredRoleGroupCodes?.length ?? 0) > 0;

    if (!hasPermissionRules && !hasRoleRules) {
      return true;
    }

    const permissionMatched =
      item.requiredPermissions?.some((permissionCode) =>
        userPermissionCodes.has(permissionCode),
      ) ?? false;

    const roleMatched =
      item.requiredRoleGroupCodes?.some((roleCode) =>
        userRoleGroupCodes.has(roleCode),
      ) ?? false;

    // Theo yêu cầu: nếu quyền HOẶC role thỏa điều kiện thì hiển thị menu.
    return permissionMatched || roleMatched;
  };

  const visibleMenuItems: MenuProps["items"] = menuItems
    .filter(canViewMenuItem)
    .map(({ key, icon, label }) => ({ key, icon, label }));

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ của tôi",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: logout,
    },
  ];

  const routeLabels: Record<string, string> = {
    "/": "Trang chủ",
    "/translate": "Dịch",
    "/users": "Quản lý người dùng",
    "/permissions": "Quản lý quyền",
    "/role-groups": "Quản lý nhóm vai trò",
    "/profile": "Hồ sơ của tôi",
  };

  const currentLabel = routeLabels[location.pathname] ?? "Trang chủ";
  const siderWidth = collapsed ? SIDER_WIDTH_COLLAPSED : SIDER_WIDTH;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDER: cố định vị trí, tự cuộn nếu tràn */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={SIDER_WIDTH}
        collapsedWidth={SIDER_WIDTH_COLLAPSED}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          background: "linear-gradient(180deg, #141726 0%, #1B1F33 100%)",
          boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            margin: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#fff",
            fontWeight: 700,
            fontSize: collapsed ? 18 : 20,
            justifyContent: collapsed ? "center" : "flex-start",
            overflow: "hidden",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              minWidth: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366F1,#22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
            }}
          >
            ⚡
          </div>
          {!collapsed && <span>Original Translation</span>}
        </div>

        {/* Menu: phần duy nhất được cuộn khi tràn */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={visibleMenuItems}
            style={{
              background: "transparent",
              borderRight: 0,
              padding: "4px 8px",
            }}
          />
        </div>
      </Sider>

      {/* Layout nội dung: đẩy sang phải bằng đúng chiều rộng Sider */}
      <Layout
        style={{ marginLeft: siderWidth, transition: "margin-left 0.2s" }}
      >
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,21,41,0.06)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 40, height: 40, borderRadius: 10 }}
            />
            <Breadcrumb
              items={[{ title: "Original Translation" }, { title: currentLabel }]}
              style={{ fontSize: 14 }}
            />
          </div>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Button type="text" shape="circle" icon={<BellOutlined />} />

              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    padding: "6px 10px",
                    borderRadius: 10,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,0,0,0.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Avatar
                    style={{ backgroundColor: "#6366F1", flexShrink: 0 }}
                    icon={<UserOutlined />}
                  />

                  <div
                    style={{ minWidth: 0, maxWidth: 160, textAlign: "left" }}
                  >
                    <div
                      style={{
                        color: "rgba(0,0,0,0.85)",
                        fontWeight: 600,
                        fontSize: 13,
                        lineHeight: "18px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {displayName}
                    </div>
                    <div
                      style={{
                        color: "rgba(0,0,0,0.45)",
                        fontSize: 12,
                        lineHeight: "16px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {displayEmail}
                    </div>
                  </div>

                  <DownOutlined
                    style={{ color: "rgba(0,0,0,0.35)", fontSize: 11 }}
                  />
                </div>
              </Dropdown>
            </div>
          ) : (
            <Button type="primary" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          )}
        </Header>

        <Content style={{ margin: "20px" }}>
          <div
            style={{
              padding: 24,
              minHeight: "calc(100vh - 112px)",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: "0 1px 4px rgba(0,21,41,0.04)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
