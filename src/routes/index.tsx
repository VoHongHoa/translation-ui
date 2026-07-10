import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ProfilePage from '../features/profile/ProfilePage';
import TranslationPage from '../features/translation/TranslationPage';
import UserManagementPage from '../features/users/UserManagementPage';
import PermissionManagementPage from '../features/permissions/PermissionManagementPage';
import RoleGroupManagementPage from '../features/roleGroups/RoleGroupManagementPage';
import Homepage from '../features/home/Homepage';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { path: '/', element: <Homepage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/translate', element: <TranslationPage /> },
          { path: '/users', element: <UserManagementPage /> },
          { path: '/permissions', element: <PermissionManagementPage /> },
          { path: '/role-groups', element: <RoleGroupManagementPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
]);