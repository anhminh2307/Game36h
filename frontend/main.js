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

// Navigate to game detail page
function navigateToGame(gameId) {
    window.location.href = `game.html?id=${gameId}`;
}

// Navigate to category page
function navigateToCategory(categoryId) {
    window.location.href = `category.html?id=${categoryId}`;
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

// ==================== GAMES ====================

// Create game card HTML
function createGameCard(game) {
    const isFavorite = game.is_favorite || false;
    
    return `
        <div class="game-card ${game.featured ? 'featured' : ''}" data-game-id="${game.id}">
            <div class="game-thumb">
                <img src="${game.thumbnail || 'placeholder.jpg'}" alt="${game.title}" class="game-image">
                <div class="game-overlay">
                    <button class="play-btn" onclick="navigateToGame(${game.id})">Chơi ngay</button>
                </div>
                ${game.featured ? '<span class="badge featured-badge">Nổi bật</span>' : ''}
                ${game.is_new ? '<span class="badge new-badge">Mới</span>' : ''}
                ${window.API.Auth.isLoggedIn() ? `
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite(event, ${game.id})"
                            title="${isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}">
                        ❤️
                    </button>
                ` : ''}
            </div>
            <div class="game-info">
                <h3 class="game-title" onclick="navigateToGame(${game.id})">${game.title}</h3>
                <div class="game-meta">
                    <span class="rating">⭐ ${game.rating || '4.5'}</span>
                    <span class="plays">👁 ${formatNumber(game.views || 0)}</span>
                </div>
            </div>
        </div>
    `;
}

// Load games to container
async function loadGames(container, fetchFunction, params = {}) {
    showLoading(container);
    
    try {
        const result = await fetchFunction(params);
        const games = result.data || result.games || result;
        
        if (games.length === 0) {
            container.innerHTML = '<div class="no-games">Không có game nào</div>';
            return;
        }
        
        container.innerHTML = games.map(game => createGameCard(game)).join('');
    } catch (error) {
        showError(container, 'Không thể tải danh sách game');
    }
}

// Toggle favorite
async function toggleFavorite(event, gameId) {
    event.stopPropagation();
    
    if (!window.API.Auth.isLoggedIn()) {
        window.location.href = 'login.html?redirect=' + window.location.pathname.split('/').pop();
        return;
    }
    
    const btn = event.target.closest('.favorite-btn');
    const isFavorite = btn.classList.contains('active');
    
    try {
        if (isFavorite) {
            await window.API.Favorites.removeFavorite(gameId);
            btn.classList.remove('active');
            btn.title = 'Thêm vào yêu thích';
        } else {
            await window.API.Favorites.toggleFavorite(gameId);
            btn.classList.add('active');
            btn.title = 'Xóa khỏi yêu thích';
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }
}

// Load comments
function loadCommentsList(comments) {
    const container = document.getElementById('commentsList');
    if (!container) return;
    
    if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments">Chưa có bình luận nào</div>';
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-avatar">
                <img src="${comment.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.user?.username}" alt="Avatar">
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.user?.username || 'Anonymous'}</span>
                    <span class="comment-time">${formatDate(comment.created_at)}</span>
                </div>
                <p class="comment-text">${comment.content}</p>
            </div>
        </div>
    `).join('');
}

// Submit comment
async function submitComment(gameId) {
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    if (!window.API.Auth.isLoggedIn()) {
        window.location.href = `login.html?redirect=game.html?id=${gameId}`;
        return;
    }
    
    try {
        await window.API.Comments.addComment(gameId, content);
        input.value = '';
        showSuccess('Bình luận đã được gửi!');
        
        // Reload comments
        const result = await window.API.Comments.getComments(gameId);
        loadCommentsList(result.data || result.comments || []);
    } catch (error) {
        alert('Không thể gửi bình luận. Vui lòng thử lại.');
    }
}

// Search games
async function searchGames(query) {
    if (!query.trim()) return;
    
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

// ==================== GAME DETAIL ====================

function getLocalGameById(gameId) {
    if (!window.GAMES_DATA) return null;
    const raw = window.GAMES_DATA[gameId];
    if (!raw) return null;
    return { id: gameId, ...raw };
}

// Load game details
async function loadGameDetail(gameId) {
    const localGame = getLocalGameById(gameId);
    let game = null;
    let comments = [];

    if (localGame && isNaN(Number(gameId))) {
        // Nếu gameId là slug (chuỗi) và có trong data.js, không gọi backend API ID numeric.
        game = localGame;
    }

    try {
        if (!game) {
            const [gameResult, commentsResult] = await Promise.all([
                window.API.Games.getGameById(gameId),
                window.API.Comments.getComments(gameId)
            ]);

            game = gameResult?.data || gameResult;
            comments = commentsResult?.data || commentsResult?.comments || [];
        } else {
            comments = [];
        }

        if (!game) {
            throw new Error('Game not found');
        }

        // Update page title
        document.title = `${game.title} - Y8.COM`;

        const titleElem = document.querySelector('.game-title-area h1');
        const categoryElem = document.querySelector('.category-tag');
        const statsElem = document.querySelector('.stat-value');
        const descElem = document.querySelector('.game-description p');
        const iframe = document.getElementById('gameIframe');
        const placeholder = document.getElementById('gamePlaceholder');

        if (titleElem) titleElem.textContent = game.title || 'Game';
        if (categoryElem) categoryElem.textContent = game.category || 'Game';
        if (statsElem) statsElem.textContent = formatNumber(game.views || 0);
        if (descElem) descElem.textContent = game.description || '';
        if (iframe && game.iframeUrl) iframe.src = game.iframeUrl;
        if (iframe) iframe.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';

        // Update play button
        const bigPlayBtn = document.querySelector('.big-play-btn');
        if (bigPlayBtn) {
            bigPlayBtn.onclick = () => {
                if (iframe) {
                    placeholder.style.display = 'none';
                    iframe.style.display = 'block';
                }
            };
        }

        // Update favorite button
        const favBtn = document.getElementById('favoriteBtn');
        if (favBtn) {
            favBtn.onclick = () => toggleGameFavorite(gameId, favBtn);
            favBtn.innerHTML = window.API.Auth.isLoggedIn() ? '<span>🤍</span> Yêu thích' : '<span>🤍</span> Yêu thích';
        }

        // Load comments list from backend if available
        if (comments.length > 0) {
            loadCommentsList(comments);
        } else {
            loadCommentsList([]);
        }

        // Tăng lượt xem nếu dùng backend numeric id
        if (!isNaN(Number(gameId))) {
            window.API.Games.incrementViews(gameId).catch(() => {});
        }

    } catch (error) {
        console.error('Error loading game:', error);
        const container = document.querySelector('.game-detail-container');
        if (container) {
            container.innerHTML = '<div class="error-message">Không thể tải thông tin game</div>';
        }
    }
}
        
//         // Update page title
//         document.title = `${game.title} - Y8.COM`;
        
//         // Update game info
//         document.querySelector('.game-title-area h1').textContent = game.title;
//         document.querySelector('.category-tag').textContent = game.category?.name || 'Game';
//         document.querySelector('.stat-value').textContent = formatNumber(game.views || 0);
//         document.querySelector('.game-description p').textContent = game.description || '';
        
//         // Update play button
//         document.querySelector('.big-play-btn').onclick = () => playGame(game.game_url);
        
//         // Update favorite button
//         if (window.API.Auth.isLoggedIn()) {
//             // Check if game is in favorites by trying to get user favorites and checking
//             try {
//                 const favoritesResult = await window.API.Favorites.getFavorites();
//                 const favorites = favoritesResult.content || favoritesResult.data || favoritesResult || [];
//                 const isFavorited = favorites.some(fav => (fav.game?.id || fav.gameId) == gameId);
                
//                 const favBtn = document.getElementById('favoriteBtn');
//                 if (isFavorited) {
//                     favBtn.classList.add('active');
//                     favBtn.innerHTML = '<span>❤️</span> Đã thích';
//                 } else {
//                     favBtn.innerHTML = '<span>🤍</span> Yêu thích';
//                 }
//                 favBtn.onclick = () => toggleGameFavorite(gameId, favBtn);
//             } catch (error) {
//                 console.error('Error checking favorite status:', error);
//                 const favBtn = document.getElementById('favoriteBtn');
//                 favBtn.innerHTML = '<span>🤍</span> Yêu thích';
//                 favBtn.onclick = () => toggleGameFavorite(gameId, favBtn);
//             }
//         }
        
//         // Load comments
//         loadCommentsList(comments);
        
//         // Increment views
//         window.API.Games.incrementViews(gameId);
        
//     } catch (error) {
//         console.error('Error loading game:', error);
//         document.querySelector('.game-detail-container').innerHTML = 
//             '<div class="error-message">Không thể tải thông tin game</div>';
//     }
// }

// Play game
function playGame(gameUrl) {
    // In real implementation, load game in iframe or redirect
    console.log('Playing game:', gameUrl);
    // window.open(gameUrl, '_blank');
}

// Toggle favorite on game detail page
async function toggleGameFavorite(gameId, btn) {
    try {
        const isActive = btn.classList.contains('active');
        
        if (isActive) {
            await window.API.Favorites.removeFavorite(gameId);
            btn.classList.remove('active');
            btn.innerHTML = '<span>🤍</span> Yêu thích';
        } else {
            const result = await window.API.Favorites.toggleFavorite(gameId);
            if (result) { // Only add to active if result is not null (not unfavorited)
                btn.classList.add('active');
                btn.innerHTML = '<span>❤️</span> Đã thích';
            }
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }
}

// Submit rating
async function submitRating(gameId, score) {
    if (!window.API.Auth.isLoggedIn()) {
        window.location.href = `login.html?redirect=game.html?id=${gameId}`;
        return;
    }
    
    try {
        await window.API.Ratings.rateGame(gameId, score);
        showSuccess(`Bạn đã đánh giá ${score} sao!`);
    } catch (error) {
        console.error('Error submitting rating:', error);
    }
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

// Load ratings tab
function loadRatingsTab(ratings) {
    const container = document.querySelector('#ratings .ratings-list');
    if (!container) return;
    
    if (ratings.length === 0) {
        container.innerHTML = '<div class="no-data">Chưa có đánh giá nào</div>';
        return;
    }
    
    container.innerHTML = ratings.map(rating => `
        <div class="rating-item">
            <div class="rating-game">
                <div class="rating-thumb">
                    <img src="${rating.game?.thumbnail || 'placeholder.jpg'}" alt="${rating.game?.title}">
                </div>
                <span>${rating.game?.title || 'Unknown Game'}</span>
            </div>
            <div class="rating-stars">${'⭐'.repeat(rating.score)}</div>
            <span class="rating-date">${formatDate(rating.created_at)}</span>
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
