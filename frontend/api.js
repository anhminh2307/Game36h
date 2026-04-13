// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        // Handle empty response (204 No Content or empty body)
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTH API ====================

const AuthAPI = {
    // Đăng ký
    async register(userData) {
        // userData: { username, email, password, avatar }
        return apiCall('/auth/register', 'POST', userData);
    },

    // Đăng nhập
    async login(credentials) {
        // credentials: { username, password }
        const result = await apiCall('/auth/login', 'POST', credentials);
        if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
        }
        return result;
    },

    // Đăng xuất
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    // Kiểm tra đã đăng nhập
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    // Lấy thông tin user hiện tại
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Lấy token
    getToken() {
        return localStorage.getItem('token');
    },

    // Cập nhật profile
    async updateProfile(userData) {
        const token = this.getToken();
        return apiCall('/users/me', 'PUT', userData, token);
    },

    // Đổi mật khẩu
    async changePassword(passwords) {
        // passwords: { currentPassword, newPassword }
        const token = this.getToken();
        return apiCall('/auth/change-password', 'PUT', passwords, token);
    },

    // Quên mật khẩu - gửi email đặt lại
    async forgotPassword(email) {
        return apiCall('/auth/forgot-password', 'POST', { email });
    },

    // Kiểm tra token đặt lại mật khẩu có hợp lệ không
    async validateResetToken(token) {
        return apiCall(`/auth/validate-reset-token?token=${token}`);
    },

    // Đặt lại mật khẩu với token
    async resetPassword(token, newPassword) {
        return apiCall('/auth/reset-password', 'POST', { token, newPassword });
    },

    // Lấy thông tin user hiện tại từ server
    async getCurrentUserProfile() {
        const token = this.getToken();
        return apiCall('/users/me', 'GET', null, token);
    }
};

// ==================== CATEGORIES API ====================

const CategoriesAPI = {
    // Lấy danh sách categories
    async getCategories() {
        return apiCall('/categories');
    },

    // Lấy chi tiết category
    async getCategoryById(categoryId) {
        return apiCall(`/categories/${categoryId}`);
    }
};

const AdminAPI = {
    // DASHBOARD
    getDashboard() {
        return apiCall('/admin/dashboard', 'GET', null, AuthAPI.getToken());
    },
    // USERS MANAGEMENT
    getUsers(page = 0, size = 10) {
        return apiCall(`/admin/users?page=${page}&size=${size}`, 'GET', null, AuthAPI.getToken());
    },

    searchUsers(keyword) {
        return apiCall(`/admin/users/search?keyword=${keyword}`, 'GET', null, AuthAPI.getToken());
    },

    updateUser(id, data) {
        return apiCall(`/admin/users/${id}`, 'PUT', data, AuthAPI.getToken());
    },

    changeUserRole(id, role) {
        return apiCall(`/admin/users/${id}/role?role=${role}`, 'PUT', null, AuthAPI.getToken());
    },

    banUser(id) {
        return apiCall(`/admin/users/${id}/ban`, 'PUT', null, AuthAPI.getToken());
    },

    deleteUser(id) {
        return apiCall(`/admin/users/${id}`, 'DELETE', null, AuthAPI.getToken());
    }
};

// Export các API modules
window.API = {
    Auth: AuthAPI,
    Admin: AdminAPI,
    baseUrl: API_BASE_URL,
    Categories: CategoriesAPI,
};

console.log('API loaded', window.API);
