import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Định nghĩa lại Interface đầy đủ các thuộc tính xác thực
interface AuthState {
  user: string | null;
  accessToken: string | null; // Thêm thuộc tính này
  isAuthenticated: boolean;
  login: (email: string, token: string) => void; // Lưu email + accessToken sau khi login
  setAccessToken: (token: string) => void;          // Thêm hàm cập nhật token lẻ (cho refresh token)
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null, // Giá trị khởi tạo mặc định
      isAuthenticated: false,
      
      // Khi login, lưu email (hiển thị) và accessToken vào store
      login: (email, token) => set({ 
        user: email, 
        accessToken: token, 
        isAuthenticated: true 
      }),
      
      // Hàm này dùng riêng cho Axios Interceptor cập nhật token mới khi refresh thành công
      setAccessToken: (token) => set({ accessToken: token }),
      
      // Khi logout, xóa sạch toàn bộ dữ liệu về null
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
      // Tùy chọn: Nếu bạn chỉ muốn lưu user và token xuống localStorage
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);