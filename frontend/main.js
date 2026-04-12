// ==================== UTILITY FUNCTIONS ====================

// Format numbers (e.g., 5200000 -> 5.2M)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Show loading spinner
function showLoading(element) {
    element.innerHTML = '<div class="loading-spinner">Đang tải...</div>';
}

// Show error message
function showError(element, message) {
    element.innerHTML = `<div class="error-message">❌ ${message}</div>`;
}

// Show success message
function showSuccess(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `✅ ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==================== NAVIGATION ====================

// Update header based on auth status
function updateHeader() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    const user = window.API.Auth.getCurrentUser();
    
    if (user) {
        // User is logged in
        headerActions.innerHTML = `
            <a href="profile.html" class="user-avatar-link">
                <img src="${user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username}" 
                     alt="Avatar" class="header-avatar">
            </a>
            <div class="user-dropdown">
                <span class="username">${user.username}</span>
                <div class="dropdown-menu">
                    <a href="profile.html">Hồ sơ</a>
                    <a href="profile.html#favorites">Game yêu thích</a>
                    <a href="profile.html#history">Lịch sử</a>
                    <hr>
                    <a href="#" class="logout" onclick="handleLogout(event)">Đăng xuất</a>
                </div>
            </div>
        `;
    } else {
        // User is not logged in
        headerActions.innerHTML = `
            <a href="login.html" class="btn-login">Đăng nhập</a>
            <a href="register.html" class="btn-register">Đăng ký</a>
        `;
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    window.API.Auth.logout();
}

// ==================== AUTHENTICATION ====================

// Handle login form
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('.btn-auth');
    
    submitBtn.textContent = 'Đang đăng nhập...';
    submitBtn.disabled = true;
    
    try {
        const result = await window.API.Auth.login({ username, password });
        showSuccess('Đăng nhập thành công!');
        
        // Redirect after successful login
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'index.html';
        window.location.href = redirect;
    } catch (error) {
        alert(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        submitBtn.textContent = 'Đăng Nhập';
        submitBtn.disabled = false;
    }
}

// Handle register form
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
    }
    
    const submitBtn = e.target.querySelector('.btn-auth');
    submitBtn.textContent = 'Đang đăng ký...';
    submitBtn.disabled = true;
    
    // Get avatar file if exists
    const avatarFile = document.getElementById('avatar').files[0];
    let avatarUrl = null;
    
    if (avatarFile) {
        // In real implementation, upload to server and get URL
        avatarUrl = URL.createObjectURL(avatarFile);
    }
    
    try {
        const result = await window.API.Auth.register({
            username,
            email,
            password,
            avatar: avatarUrl
        });
        
        showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        submitBtn.textContent = 'Đăng Ký';
        submitBtn.disabled = false;
    }
}

// Protect route - redirect to login if not authenticated
function requireAuth() {
    if (!window.API.Auth.isLoggedIn()) {
        const currentPage = window.location.pathname.split('/').pop();
        window.location.href = `login.html?redirect=${currentPage}`;
        return false;
    }
    return true;
}

// ==================== PROFILE ====================

// Load profile data
async function loadProfile() {
    if (!requireAuth()) return;
    
    const user = window.API.Auth.getCurrentUser();
    if (!user) return;
    
    // Update profile header
    document.querySelector('.profile-name').textContent = user.username;
    document.querySelector('.profile-email').textContent = user.email;
    document.querySelector('.profile-avatar img').src = user.avatar || 
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    document.querySelector('.profile-joined').textContent = 
        `Tham gia: ${formatDate(user.created_at)}`;
    
    // Load stats
    try {
        const [favorites, history, ratings] = await Promise.all([
            window.API.Favorites.getFavorites(),
            window.API.History.getHistory(),
            window.API.Ratings.getMyRatings()
        ]);
        
        document.querySelectorAll('.stat-number')[0].textContent = 
            (history.data || history).length;
        document.querySelectorAll('.stat-number')[1].textContent = 
            (favorites.data || favorites).length;
        document.querySelectorAll('.stat-number')[2].textContent = 
            (ratings.data || ratings).length;
        
        // Load favorites tab
        loadFavoritesTab(favorites.data || favorites);
        
        // Load history tab
        loadHistoryTab(history.data || history);
        
        // Load ratings tab
        loadRatingsTab(ratings.data || ratings);
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load favorites tab
function loadFavoritesTab(favorites) {
    const container = document.querySelector('#favorites .games-grid');
    if (!container) return;
    
    if (favorites.length === 0) {
        container.innerHTML = '<div class="no-data">Chưa có game yêu thích nào</div>';
        return;
    }
    
    container.innerHTML = favorites.map(fav => createGameCard(fav.game || fav)).join('');
}

// Load history tab
function loadHistoryTab(history) {
    const container = document.querySelector('#history .history-list');
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = '<div class="no-data">Chưa có lịch sử chơi game</div>';
        return;
    }
    
    container.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-thumb">
                <img src="${item.game?.thumbnail || 'placeholder.jpg'}" alt="${item.game?.title}">
            </div>
            <div class="history-info">
                <h4>${item.game?.title || 'Unknown Game'}</h4>
                <p>Chơi lần cuối: ${formatDate(item.played_at)}</p>
            </div>
            <button class="btn-play-again" onclick="navigateToGame(${item.game?.id})">Chơi lại</button>
        </div>
    `).join('');
}

// Update profile settings
async function updateProfileSettings(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    const currentPassword = e.target.querySelector('input[placeholder*="hiện tại"]').value;
    const newPassword = e.target.querySelector('input[placeholder*="mới"]').value;
    const confirmPassword = e.target.querySelector('input[placeholder*="lại"]').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('Mật khẩu mới không khớp!');
        return;
    }
    
    try {
        // Update email
        if (email) {
            await window.API.Auth.updateProfile({ email });
        }
        
        // Change password
        if (newPassword && currentPassword) {
            await window.API.Auth.changePassword({
                currentPassword,
                newPassword
            });
        }
        
        showSuccess('Cài đặt đã được cập nhật!');
    } catch (error) {
        alert(error.message || 'Không thể cập nhật. Vui lòng thử lại.');
    }
}

// ==================== INITIALIZATION ====================

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Update header for all pages
    updateHeader();
    renderGames();
    
    // Page-specific initialization
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'login.html':
            initLoginPage();
            break;
        case 'register.html':
            initRegisterPage();
            break;
        case 'game.html':
            initGamePage();
            break;
        case 'profile.html':
            initProfilePage();
            break;
    }
});

function initHomePage() {
    // Load featured games
    const featuredContainer = document.querySelector('.game-section:first-of-type .games-grid');
    if (featuredContainer) {
        loadGames(featuredContainer, window.API.Games.getFeaturedGames);
    }
    
    // Load new games
    const newGamesContainer = document.querySelectorAll('.game-section')[1]?.querySelector('.games-grid');
    if (newGamesContainer) {
        loadGames(newGamesContainer, window.API.Games.getNewGames);
    }
    
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', () => searchGames(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchGames(searchInput.value);
        });
    }
}

function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}

function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }
}

function initGamePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    if (gameId) {
        loadGameDetail(gameId);
    }
}

function initProfilePage() {
    loadProfile();
    
    // Settings form
    const settingsForm = document.querySelector('.settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', updateProfileSettings);
    }
}

// Make functions globally accessible
window.navigateToGame = navigateToGame;
window.navigateToCategory = navigateToCategory;
window.toggleFavorite = toggleFavorite;
window.handleLogout = handleLogout;
window.submitComment = submitComment;
window.submitRating = submitRating;
