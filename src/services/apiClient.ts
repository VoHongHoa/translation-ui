import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd'; // Sử dụng thông báo trực quan của AntD
import { useAuthStore } from '../store/useAuthStore';

// Tạo cấu hình chung cho Axios
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com/v1',
  timeout: 10000, // 10 giây nếu không phản hồi thì ngắt connection
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Đính kèm Token trước khi gửi request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// 2. Response Interceptor: Xử lý dữ liệu trả về và Gom lỗi tập trung
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về thẳng dữ liệu bên trong (data) để phía sau không phải .data nữa
    return response.data;
  },
  (error: AxiosError<{ message?: string }>) => {
    let errorMessage = 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại!';

    if (error.response) {
      // Lỗi phản hồi từ phía Server (Phổ biến nhất)
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      switch (status) {
        case 400:
          errorMessage = serverMessage || 'Dữ liệu gửi lên không hợp lệ (Bad Request).';
          break;
        case 401:
          errorMessage = serverMessage || 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
          // Xử lý logout hoặc refresh token tại đây (như bài trước)
          useAuthStore.getState().logout();
          break;
        case 403:
          errorMessage = 'Bạn không có quyền truy cập tài nguyên này (Forbidden).';
          break;
        case 404:
          errorMessage = 'Không tìm thấy tài nguyên yêu cầu (Not Found).';
          break;
        case 500:
          errorMessage = 'Lỗi hệ thống phía Server (Internal Server Error).';
          break;
        default:
          errorMessage = serverMessage || errorMessage;
      }
    } else if (error.request) {
      // Lỗi mạng hoặc Server không phản hồi
      errorMessage = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra đường truyền!';
    }

    // Hiển thị thông báo lỗi lên UI cho người dùng thấy ngay lập tức
    message.error(errorMessage);

    return Promise.reject(error);
  }
);