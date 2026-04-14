// ========== ADMIN INIT ==========

let gamesPage = 0, usersPage = 0;
const itemsPerPage = 10;
let allGames = [], allUsers = [], allCategories = [];
let gameStatusChart = null, userRoleChart = null;

function requireAdmin() {
    if (!window.API) {
        console.error("API chưa load");
        return;
    }

    const user = window.API.Auth?.getCurrentUser();

    if (!user) {
        alert("Bạn chưa đăng nhập");
        window.location.href = '../index.html';
        return;
    }

    if (user.role !== 'ADMIN') {
        alert('Không có quyền truy cập');
        window.location.href = '../index.html';
    }
}

// ========== NAVIGATION ==========

function showSection(sectionId) {
    // Remove active class từ sidebar items
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    
    // Add active class to correct sidebar item
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && event && event.target) {
        event.target.classList.add('active');
    } else {
        // If called programmatically, find the correct li
        const liItems = document.querySelectorAll('.sidebar li');
        liItems.forEach(li => {
            if (li.getAttribute('onclick') && li.getAttribute('onclick').includes(`'${sectionId}'`)) {
                li.classList.add('active');
            }
        });
        // Default to first item if none found
        if (liItems.length > 0 && !document.querySelector('.sidebar li.active')) {
            liItems[0].classList.add('active');
        }
    }

    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    // Show target section
    document.getElementById(sectionId).classList.add('active');

    // Load data cho section
    if (window.API && window.API.Admin) {
        switch(sectionId) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'approval':
                loadPendingGames();
                break;
            case 'games':
                loadAllGames();
                break;
            case 'categories':
                loadCategories();
                break;
            case 'users':
                loadUsers();
                break;
        }
    } else {
        console.warn("API not ready yet");
    }
}

// ========== DASHBOARD ==========

async function loadDashboard() {
    try {
        const data = await window.API.Admin.getDashboard();

        document.getElementById('totalUsers').innerText = data.totalUsers;
        document.getElementById('totalGames').innerText = data.totalGames;
        document.getElementById('pendingGames').innerText = data.pendingGames;
        document.getElementById('approvedGames').innerText = data.approvedGames || 0;

        // Load data for charts
        loadDashboardCharts();
    } catch (e) {
        console.error("Dashboard lỗi:", e);
    }
}

async function loadDashboardCharts() {
    try {
        const gamesData = await window.API.Admin.getAllGames(0, 1000);
        const usersData = await window.API.Admin.getUsers(0, 1000);

        drawGameStatusChart(gamesData);
        drawUserRoleChart(usersData);
    } catch (e) {
        console.error("Chart error:", e);
    }
}

function drawGameStatusChart(gamesData) {
    const games = gamesData.content || [];
    const statusCounts = {
        'PENDING': 0,
        'APPROVED': 0,
        'REJECTED': 0
    };

    games.forEach(game => {
        const status = game.status || 'PENDING';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const ctx = document.getElementById('gameStatusChart')?.getContext('2d');
    if (!ctx) return;

    if (gameStatusChart) gameStatusChart.destroy();

    gameStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chờ Duyệt', 'Đã Duyệt', 'Từ Chối'],
            datasets: [{
                data: [statusCounts.PENDING, statusCounts.APPROVED, statusCounts.REJECTED],
                backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function drawUserRoleChart(usersData) {
    const users = usersData.content || [];
    const roleCounts = { 'ADMIN': 0, 'USER': 0 };
    const banCounts = { 'Normal': 0, 'Banned': 0 };

    users.forEach(user => {
        const role = user.role || 'USER';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
        
        if (user.isBanned) {
            banCounts['Banned']++;
        } else {
            banCounts['Normal']++;
        }
    });

    const ctx = document.getElementById('userRoleChart')?.getContext('2d');
    if (!ctx) return;

    if (userRoleChart) userRoleChart.destroy();

    userRoleChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Admin', 'User', 'Normal', 'Banned'],
            datasets: [{
                label: 'Số Lượng',
                data: [roleCounts.ADMIN, roleCounts.USER, banCounts.Normal, banCounts.Banned],
                backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ========== GAME APPROVAL ==========

async function loadPendingGames() {
    try {
        const data = await window.API.Admin.getAllGames(0, 100);
        const games = data.content || [];

        const html = games.map(g => `
            <tr>
                <td>${g.id}</td>
                <td>${g.title}</td>
                <td>${g.user?.username || 'N/A'}</td>
                <td>
                    <select onchange="updateGameStatus(${g.id}, this.value)" class="btn-small">
                        <option value="PENDING" ${g.status === 'PENDING' ? 'selected' : ''}>Chờ Duyệt</option>
                        <option value="APPROVED" ${g.status === 'APPROVED' ? 'selected' : ''}>Duyệt</option>
                        <option value="REJECTED" ${g.status === 'REJECTED' ? 'selected' : ''}>Từ Chối</option>
                    </select>
                </td>
                <td>${new Date(g.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteGameConfirm(${g.id})">🗑️ Xóa</button>
                </td>
            </tr>
        `).join('');

        document.getElementById('pendingGamesTable').innerHTML = html || '<tr><td colspan="6" style="text-align:center">Không có game</td></tr>';
    } catch (e) {
        console.error("Error loading pending games:", e);
    }
}

async function approveGame(gameId) {
    if (!confirm('Bạn chắc chắn muốn duyệt game này?')) return;

    try {
        await window.API.Admin.approveGame(gameId);
        alert('Game đã được duyệt');
        loadPendingGames();
        loadDashboard();
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

async function rejectGame(gameId) {
    if (!confirm('Bạn chắc chắn muốn từ chối game này?')) return;

    try {
        await window.API.Admin.rejectGame(gameId);
        alert('Game đã bị từ chối');
        loadPendingGames();
        loadDashboard();
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

async function updateGameStatus(gameId, status) {
    try {
        await window.API.Admin.updateGameStatus(gameId, status);
        alert('Cập nhật trạng thái thành công');
        loadPendingGames();
        loadDashboard();
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

// ========== GAMES MANAGEMENT ==========

async function loadAllGames(page = 0) {
    try {
        gamesPage = page;
        const data = await window.API.Admin.getAllGames(page, itemsPerPage);
        allGames = data.content || [];

        renderGamesTable(allGames);
        updateGamePagination(data);
    } catch (e) {
        console.error("Error loading games:", e);
    }
}

function renderGamesTable(games) {
    const html = games.map(g => `
        <tr>
            <td>${g.id}</td>
            <td>${g.title}</td>
            <td>${g.category?.name || 'N/A'}</td>
            <td>${g.user?.username || 'N/A'}</td>
            <td><span class="badge badge-${g.status === 'APPROVED' ? 'success' : 'warning'}">${g.status}</span></td>
            <td>${g.views || 0}</td>
            <td>
                <button class="btn btn-primary btn-small" onclick="editGame(${g.id})">✏️ Sửa</button>
                <button class="btn btn-danger btn-small" onclick="deleteGameConfirm(${g.id})">🗑️ Xóa</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('gamesTable').innerHTML = html || '<tr><td colspan="7" style="text-align:center">Không có game</td></tr>';
}

function updateGamePagination(data) {
    const totalPages = data.totalPages || 1;
    document.getElementById('gamePageInfo').innerText = `${gamesPage + 1} / ${totalPages}`;
}

function nextGamesPage() {
    loadAllGames(gamesPage + 1);
}

function prevGamesPage() {
    if (gamesPage > 0) loadAllGames(gamesPage - 1);
}

function searchGames() {
    const keyword = document.getElementById('gameSearch').value;
    if (!keyword) {
        loadAllGames(0);
        return;
    }

    const filtered = allGames.filter(g =>
        g.title.toLowerCase().includes(keyword.toLowerCase()) ||
        g.description?.toLowerCase().includes(keyword.toLowerCase())
    );

    renderGamesTable(filtered);
}

// ========== GAME CRUD ==========

function openCreateGameModal() {
    document.getElementById('gameId').value = '';
    document.getElementById('gameModalTitle').innerText = 'Tạo Game Mới';
    document.getElementById('gameTitle').value = '';
    document.getElementById('gameDescription').value = '';
    document.getElementById('gameUrl').value = '';
    document.getElementById('gameThumbnail').value = '';

    loadCategoryOptions();
    showModal('gameModal');
}

async function editGame(gameId) {
    try {
        const game = await window.API.Games.getGameById(gameId);
        
        document.getElementById('gameId').value = game.id;
        document.getElementById('gameModalTitle').innerText = 'Sửa Game';
        document.getElementById('gameTitle').value = game.title;
        document.getElementById('gameDescription').value = game.description;
        document.getElementById('gameUrl').value = game.gameUrl;
        document.getElementById('gameThumbnail').value = game.thumbnail;

        loadCategoryOptions(game.category?.id);
        showModal('gameModal');
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

async function saveGame(e) {
    e.preventDefault();

    const gameId = document.getElementById('gameId').value;
    const data = {
        title: document.getElementById('gameTitle').value,
        description: document.getElementById('gameDescription').value,
        categoryId: document.getElementById('gameCategory').value,
        gameUrl: document.getElementById('gameUrl').value,
        thumbnail: document.getElementById('gameThumbnail').value
    };

    try {
        if (gameId) {
            await window.API.Admin.updateGame(gameId, data);
            alert('Game đã được cập nhật');
        } else {
            await window.API.Admin.createGame(data);
            alert('Game đã được tạo');
        }
        closeGameModal();
        loadAllGames(0);
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

function deleteGameConfirm(gameId) {
    showConfirmDialog('Xóa Game', 'Bạn chắc chắn muốn xóa game này?', () => deleteGame(gameId));
}

async function deleteGame(gameId) {
    try {
        await window.API.Admin.deleteGame(gameId);
        alert('Game đã được xóa');
        loadAllGames(0);
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

// ========== CATEGORIES MANAGEMENT ==========

async function loadCategories() {
    try {
        const data = await window.API.Admin.getCategories();
        allCategories = data || [];

        const html = allCategories.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>-</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editCategory(${c.id})">✏️ Sửa</button>
                    <button class="btn btn-danger btn-small" onclick="deleteCategoryConfirm(${c.id})">🗑️ Xóa</button>
                </td>
            </tr>
        `).join('');

        document.getElementById('categoriesTable').innerHTML = html || '<tr><td colspan="4" style="text-align:center">Không có category</td></tr>';
    } catch (e) {
        console.error("Error loading categories:", e);
    }
}

function openCreateCategoryModal() {
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryModalTitle').innerText = 'Tạo Category Mới';
    document.getElementById('categoryName').value = '';

    showModal('categoryModal');
}

function editCategory(categoryId) {
    const category = allCategories.find(c => c.id === categoryId);
    if (!category) return;

    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryModalTitle').innerText = 'Sửa Category';
    document.getElementById('categoryName').value = category.name;

    showModal('categoryModal');
}

async function saveCategory(e) {
    e.preventDefault();

    const categoryId = document.getElementById('categoryId').value;
    const data = {
        name: document.getElementById('categoryName').value
    };

    try {
        if (categoryId) {
            await window.API.Admin.updateCategory(categoryId, data);
            alert('Category đã được cập nhật');
        } else {
            await window.API.Admin.createCategory(data);
            alert('Category đã được tạo');
        }
        closeCategoryModal();
        loadCategories();
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

function deleteCategoryConfirm(categoryId) {
    showConfirmDialog('Xóa Category', 'Bạn chắc chắn muốn xóa category này?', () => deleteCategory(categoryId));
}

async function deleteCategory(categoryId) {
    try {
        await window.API.Admin.deleteCategory(categoryId);
        alert('Category đã được xóa');
        loadCategories();
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

async function loadCategoryOptions(selectedId = null) {
    try {
        const data = await window.API.Admin.getCategories();
        const categories = data || [];

        const select = document.getElementById('gameCategory');
        select.innerHTML = categories.map(c =>
            `<option value="${c.id}" ${c.id == selectedId ? 'selected' : ''}>${c.name}</option>`
        ).join('');
    } catch (e) {
        console.error("Error loading categories:", e);
    }
}

// ========== USERS MANAGEMENT ==========

async function loadUsers(page = 0) {
    try {
        usersPage = page;
        const data = await window.API.Admin.getUsers(page, itemsPerPage);
        allUsers = data.content || [];

        renderUsersTable(allUsers);
        updateUserPagination(data);
    } catch (e) {
        console.error("Error loading users:", e);
    }
}

function renderUsersTable(users) {
    const html = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>
                <select onchange="changeUserRole(${u.id}, this.value)" class="btn-small">
                    <option value="USER" ${u.role === 'USER' ? 'selected' : ''}>User</option>
                    <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td>
                <span class="badge ${u.isBanned ? 'badge-danger' : 'badge-success'}">
                    ${u.isBanned ? 'Bị Ban' : 'Bình Thường'}
                </span>
            </td>
            <td>
                <button class="btn ${u.isBanned ? 'btn-warning' : 'btn-danger'} btn-small" 
                    onclick="toggleBanUser(${u.id})">
                    ${u.isBanned ? '🔓 Bỏ Ban' : '🚫 Ban'}
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteUserConfirm(${u.id})">🗑️ Xóa</button>
            </td>
        </tr>
    `).join('');

    document.getElementById('usersTable').innerHTML = html || '<tr><td colspan="6" style="text-align:center">Không có user</td></tr>';
}

function updateUserPagination(data) {
    const totalPages = data.totalPages || 1;
    document.getElementById('userPageInfo').innerText = `${usersPage + 1} / ${totalPages}`;
}

function nextUsersPage() {
    loadUsers(usersPage + 1);
}

function prevUsersPage() {
    if (usersPage > 0) loadUsers(usersPage - 1);
}

function searchUsers() {
    const keyword = document.getElementById('userSearch').value;
    if (!keyword) {
        loadUsers(0);
        return;
    }

    const filtered = allUsers.filter(u =>
        u.username.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email.toLowerCase().includes(keyword.toLowerCase())
    );

    renderUsersTable(filtered);
}

async function changeUserRole(userId, role) {
    try {
        await window.API.Admin.changeUserRole(userId, role);
        alert('Vai trò đã được thay đổi');
        loadUsers(usersPage);
    } catch (e) {
        alert('Lỗi: ' + e.message);
        loadUsers(usersPage);
    }
}

async function toggleBanUser(userId) {
    try {
        await window.API.Admin.banUser(userId);
        alert('Trạng thái ban đã được thay đổi');
        loadUsers(usersPage);
    } catch (e) {
        alert('Lỗi: bạn không thể ban bản thân được :)');
        loadUsers(usersPage);
    }
}

function deleteUserConfirm(userId) {
    showConfirmDialog('Xóa User', 'Bạn chắc chắn muốn xóa user này?', () => deleteUser(userId));
}

async function deleteUser(userId) {
    try {
        await window.API.Admin.deleteUser(userId);
        alert('User đã được xóa');
        loadUsers(0);
    } catch (e) {
        alert('Lỗi: ' + e.message);
    }
}

// ========== MODAL HELPERS ==========

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeGameModal() {
    document.getElementById('gameModal').classList.remove('show');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('show');
}

function closeConfirmDialog() {
    document.getElementById('confirmDialog').classList.remove('show');
}

function showConfirmDialog(title, message, onConfirm) {
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMessage').innerText = message;
    document.getElementById('confirmBtn').onclick = () => {
        onConfirm();
        closeConfirmDialog();
    };
    showModal('confirmDialog');
}

// Click outside modal to close
window.onclick = function(event) {
    const modal = event.target;
    if (modal.classList.contains('modal')) {
        modal.classList.remove('show');
    }
};

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
    requireAdmin();

    // Set first tab active
    document.querySelector('.sidebar li').classList.add('active');

    // Wait for API to be ready before loading dashboard
    setTimeout(() => {
        if (window.API && window.API.Admin) {
            showSection('dashboard');
        } else {
            console.warn("API not ready, retrying...");
            setTimeout(() => showSection('dashboard'), 500);
        }
    }, 100);
});