import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { LoginPayload, RegisterPayload } from '../types/auth';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

// Hook xử lý Đăng nhập
export const useLogin = () => {
  const loginToStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data: any) => {
      // 1. Lưu thông tin user và accessToken vào Zustand Store (đã có persist tự lưu localStorage)
      loginToStore(data.user.name, data.accessToken);
      
      // 2. Nếu NestJS có trả về refreshToken trong body, lưu riêng vào localStorage
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      message.success('Đăng nhập thành công!');
      navigate('/'); // Chuyển hướng về trang chủ hoặc dashboard
    },
    // Lỗi (onError) đã được handle hiển thị bởi Axios Interceptor từ trước
  });
};

// Hook xử lý Đăng ký
export const useRegister = (onRegisterSuccess?: () => void) => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      if (onRegisterSuccess) onRegisterSuccess(); // Callback để chuyển tab hoặc xóa form
    },
  });
};