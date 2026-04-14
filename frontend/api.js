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

// ==================== GAMES API ====================

const GamesAPI = {
    // Lấy danh sách game
    async getGames(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/games?${queryString}` : '/games';
        return apiCall(endpoint);
    },

    // Lấy chi tiết game
    async getGameById(gameId) {
        return apiCall(`/games/${gameId}`);
    },

    // Lấy game theo category
    async getGamesByCategory(categoryId) {
        return apiCall(`/games?category=${categoryId}`);
    },

    // Tìm kiếm game
    async searchGames(query, category = null, sort = null, page = 1, limit = 12) {
        const params = { q: query };
        if (category) params.category = category;
        if (sort) params.sort = sort;
        params.page = page - 1; // Spring page starts at 0
        params.limit = limit;
        return this.getGames(params);
    },

    // Lấy game mới nhất
    async getNewGames(limit = 8) {
        return apiCall(`/games/new?limit=${limit}`);
    },

    // Lấy game được chơi nhiều nhất
    async getPopularGames(limit = 8) {
        return apiCall(`/games/popular?limit=${limit}`);
    },

    // Lấy game nổi bật
    async getFeaturedGames(limit = 4) {
        return apiCall(`/games/featured?limit=${limit}`);
    },

    // Tăng lượt xem game
    async incrementViews(gameId) {
        return apiCall(`/games/${gameId}/play`, 'POST');
    }
};

// ==================== FAVORITES API ====================

const FavoritesAPI = {

    // Thêm vào yêu thích / Toggle favorite
    async toggleFavorite(gameId) {
        const token = AuthAPI.getToken();
        return apiCall(`/favorites/${gameId}`, 'POST', null, token);
    },

    // Xóa khỏi yêu thích
    async removeFavorite(gameId) {
        const token = AuthAPI.getToken();
        return apiCall(`/favorites/${gameId}`, 'DELETE', null, token);
    },

    // Xóa favorite theo ID
    async removeFavoriteById(favoriteId) {
        const token = AuthAPI.getToken();
        return apiCall(`/favorites/by-id/${favoriteId}`, 'DELETE', null, token);
    },

    // Lấy favorite theo ID
    async getFavoriteById(favoriteId) {
        const token = AuthAPI.getToken();
        return apiCall(`/favorites/by-id/${favoriteId}`, 'GET', null, token);
    },

    // Lấy danh sách yêu thích của user hiện tại
    async getFavorites(page = 0, size = 100) {
        const token = AuthAPI.getToken();
        const user = AuthAPI.getCurrentUser();
        if (!user) return [];
        return apiCall(`/favorites/user/${user.id}?page=${page}&size=${size}`, 'GET', null, token);
    },

    // Lấy danh sách yêu thích của user theo userId
    async getUserFavorites(userId, page = 0, size = 10) {
        const token = AuthAPI.getToken();
        return apiCall(`/favorites/user/${userId}?page=${page}&size=${size}`, 'GET', null, token);
    }
};

// ==================== HISTORY API ====================

const HistoryAPI = {
    // Lấy lịch sử chơi của user hiện tại

    // Thêm vào lịch sử
    async addToHistory(gameId) {
        const token = AuthAPI.getToken();
        return apiCall(`/history/${gameId}`, 'POST', null, token);
    },

    // Lấy lịch sử theo ID
    async getHistoryById(historyId) {
        const token = AuthAPI.getToken();
        return apiCall(`/history/by-id/${historyId}`, 'GET', null, token);
    },

    // Xóa khỏi lịch sử theo ID
    async removeFromHistory(historyId) {
        const token = AuthAPI.getToken();
        return apiCall(`/history/by-id/${historyId}`, 'DELETE', null, token);
    },

    // Lấy lịch sử của user theo userId
    async getUserHistory(userId, page = 0, size = 10) {
        const token = AuthAPI.getToken();
        return apiCall(`/history/user/${userId}?page=${page}&size=${size}`, 'GET', null, token);
    }
};

// ==================== USER GAMES API (Game Management) ====================

const UserGamesAPI = {
    // Lấy danh sách game của user hiện tại
    async getMyGames() {
        const token = AuthAPI.getToken();
        const user = AuthAPI.getCurrentUser();
        return apiCall(`/games/user/${user.id}`, 'GET', null, token);
    },

    // Upload game mới
    async uploadGame(gameData) {
        // gameData: { title, description, categoryId, gameUrl, thumbnail }
        // Convert snake_case to camelCase for backend
        const data = {
            title: gameData.title,
            description: gameData.description,
            categoryId: gameData.category_id,
            gameUrl: gameData.game_url,
            thumbnail: gameData.thumbnail
        };
        const token = AuthAPI.getToken();
        return apiCall('/games', 'POST', data, token);
    },

    
    // Upload file game (multipart/form-data)
    async uploadGameFile(formData) {
        const token = AuthAPI.getToken();
        const url = `${API_BASE_URL}/games/upload`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }
        return result;
    },

    // Cập nhật thông tin game
    async updateGame(gameId, gameData) {
        const token = AuthAPI.getToken();
        return apiCall(`/games/${gameId}`, 'PUT', gameData, token);
    },

    // Xóa game
    async deleteGame(gameId) {
        const token = AuthAPI.getToken();
        return apiCall(`/games/${gameId}`, 'DELETE', null, token);
    },

    // Đổi trạng thái game (active/inactive)
    async toggleGameStatus(gameId, isActive) {
        const token = AuthAPI.getToken();
        return apiCall(`/games/${gameId}/status`, 'PUT', { is_active: isActive }, token);
    },

    // Lấy trạng thái chơi game
    async getPlayStatus() {
        const token = AuthAPI.getToken();
        return apiCall('/users/me/play-status', 'GET', null, token);
    },

    // Bắt đầu chơi game
    async startPlay(gameId) {
        const token = AuthAPI.getToken();
        return apiCall(`/games/${gameId}/play`, 'POST', null, token);
    },

    // Cập nhật thời gian chơi
    async updatePlayTime(minutesPlayed) {
        const token = AuthAPI.getToken();
        return apiCall(`/users/me/update-play-time?minutesPlayed=${minutesPlayed}`, 'POST', null, token);
    }
};

const AdminAPI = {
    // DASHBOARD
    getDashboard() {
        return apiCall('/admin/dashboard', 'GET', null, AuthAPI.getToken());
    },

    // CATEGORIES CRUD  
    getCategories() {
        return apiCall('/categories', 'GET', null, AuthAPI.getToken());
    },

    createCategory(data) {
        return apiCall('/categories', 'POST', data, AuthAPI.getToken());
    },

    updateCategory(id, data) {
        return apiCall(`/categories/${id}`, 'PUT', data, AuthAPI.getToken());
    },

    deleteCategory(id) {
        return apiCall(`/categories/${id}`, 'DELETE', null, AuthAPI.getToken());
    },

    // GAMES MANAGEMENT
    getAllGames(page = 0, size = 10) {
        return apiCall(`/admin/games?page=${page}&size=${size}`, 'GET', null, AuthAPI.getToken());
    },

    createGame(data) {
        return apiCall('/games', 'POST', data, AuthAPI.getToken());
    },

    updateGame(id, data) {
        return apiCall(`/games/${id}`, 'PUT', data, AuthAPI.getToken());
    },

    deleteGame(id) {
        return apiCall(`/games/${id}`, 'DELETE', null, AuthAPI.getToken());
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
    },

    // GAMES MANAGEMENT
    getAllGames(page = 0, size = 10) {
        return apiCall(`/admin/games?page=${page}&size=${size}`, 'GET', null, AuthAPI.getToken());
    },

    createGame(data) {
        return apiCall('/games', 'POST', data, AuthAPI.getToken());
    },

    updateGame(id, data) {
        return apiCall(`/games/${id}`, 'PUT', data, AuthAPI.getToken());
    },

    deleteGame(id) {
        return apiCall(`/games/${id}`, 'DELETE', null, AuthAPI.getToken());
    },

    // GAMES APPROVAL
    getPendingGames(page = 0, size = 10) {
        return apiCall(`/admin/games/pending?page=${page}&size=${size}`, 'GET', null, AuthAPI.getToken());
    },

    approveGame(id) {
        return apiCall(`/admin/games/${id}/approve`, 'PUT', null, AuthAPI.getToken());
    },

    rejectGame(id) {
        return apiCall(`/admin/games/${id}/reject`, 'PUT', null, AuthAPI.getToken());
    },

    updateGameStatus(id, status) {
        return apiCall(`/admin/games/${id}/status?status=${status}`, 'PUT', null, AuthAPI.getToken());
    },
};

const ForumAPI = {
    getPosts({ search = '', title = '', sort = 'newest' } = {}) {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (title) query.set('title', title);
        if (sort) query.set('sort', sort);
        return apiCall(`/forum/posts?${query.toString()}`, 'GET', null, AuthAPI.getToken());
    },
    getPost(id) {
        return apiCall(`/forum/posts/${id}`, 'GET', null, AuthAPI.getToken());
    },
    createPost(data) {
        return apiCall('/forum/posts', 'POST', data, AuthAPI.getToken());
    },
    updatePost(id, data) {
        return apiCall(`/forum/posts/${id}`, 'PUT', data, AuthAPI.getToken());
    },
    deletePost(id) {
        return apiCall(`/forum/posts/${id}`, 'DELETE', null, AuthAPI.getToken());
    },
};

// Export các API modules
window.API = {
    Auth: AuthAPI,
    Admin: AdminAPI,
    baseUrl: API_BASE_URL,
    Categories: CategoriesAPI,
    Games: GamesAPI,
    Favorites: FavoritesAPI,
    History: HistoryAPI,
    UserGames: UserGamesAPI
};

console.log('API loaded', window.API);
