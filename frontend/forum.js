const forumState = {
    posts: [],
    currentPost: null,
    selectedPostId: null,
    searchKeyword: '',
    filterTitle: '',
    sortBy: 'newest',
    editingPostId: null
};

function initForumPage() {
    loadForumData();
    document.getElementById('forumSearch')?.addEventListener('input', handleForumSearch);
    document.getElementById('filterTitle')?.addEventListener('input', handleFilterTitle);
    document.getElementById('sortPosts')?.addEventListener('change', handleSortChange);
    document.getElementById('searchInput')?.addEventListener('keypress', event => {
        if (event.key === 'Enter') performSearch();
    });
}

async function loadForumData() {
    try {
        forumState.posts = await window.API.Forum.getPosts({
            search: forumState.searchKeyword,
            title: forumState.filterTitle,
            sort: forumState.sortBy
        });

        if (!forumState.selectedPostId && forumState.posts.length > 0) {
            await loadPostDetail(forumState.posts[0].id);
        }

        renderForum();
    } catch (error) {
        console.error('Không thể tải dữ liệu diễn đàn:', error);
        showErrorInMain('Không thể tải dữ liệu diễn đàn. Vui lòng thử lại sau.');
    }
}

async function loadPostDetail(postId) {
    try {
        const post = await window.API.Forum.getPost(postId);
        forumState.currentPost = post;
        forumState.selectedPostId = postId;
        renderForum();
    } catch (error) {
        console.error('Không thể tải chi tiết bài viết:', error);
    }
}

function renderForum() {
    renderPostList();
    renderForumStats();
    renderPostDetail();
    renderAdminSection();
}

function renderForumStats() {
    const count = forumState.posts.length;
    document.getElementById('postCount').textContent = count;
}

function applyPostFilters(posts) {
    const keyword = forumState.searchKeyword.trim().toLowerCase();
    const titleFilter = forumState.filterTitle.trim().toLowerCase();

    return posts
        .filter(post => {
            const title = post.title?.toLowerCase() || '';
            const body = post.body?.toLowerCase() || '';
            const author = post.user?.username?.toLowerCase() || '';
            const matchKeyword = !keyword || title.includes(keyword) || body.includes(keyword) || author.includes(keyword);
            const matchTitle = !titleFilter || title.includes(titleFilter);
            return matchKeyword && matchTitle;
        })
        .sort((a, b) => {
            switch (forumState.sortBy) {
                case 'popular':
                    return (b.likes - b.dislikes) - (a.likes - a.dislikes);
                case 'comments':
                    return (b.comments?.length || 0) - (a.comments?.length || 0);
                case 'controversial':
                    return (b.dislikes || 0) - (a.dislikes || 0);
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
}

function renderPostList() {
    const postsElement = document.getElementById('forumPosts');
    if (!postsElement) return;

    const posts = applyPostFilters([...forumState.posts]);

    if (posts.length === 0) {
        postsElement.innerHTML = '<div class="forum-post-card"><p>Không tìm thấy bài viết phù hợp. Hãy thử điều chỉnh bộ lọc.</p></div>';
        return;
    }

    postsElement.innerHTML = posts.map(post => createPostCard(post)).join('');
}

function createPostCard(post) {
    const selectedClass = forumState.selectedPostId === post.id ? 'active-post' : '';
    const author = post.user?.username || 'Người dùng';
    const commentCount = post.comments?.length || 0;

    return `
        <div class="forum-post-card ${selectedClass}">
            <div class="forum-post-meta">
                <span class="badge-tag">${post.category || 'Khác'}</span>
                <span>${formatDate(post.createdAt)}</span>
                <span>Người đăng: ${author}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.body.length > 180 ? post.body.substring(0, 180) + '...' : post.body}</p>
            <div class="forum-post-meta">
                <span>👍 ${post.likes || 0}</span>
                <span>👎 ${post.dislikes || 0}</span>
                <span>💬 ${commentCount} bình luận</span>
                ${post.reported ? '<span class="badge-tag" style="background: rgba(255, 82, 82, 0.15); color: #ff8a80;">Bị báo cáo</span>' : ''}
            </div>
            <div class="forum-post-actions">
                <button onclick="selectPost(${post.id})">Xem chi tiết</button>
                <button onclick="togglePostReaction(${post.id}, true)">Like</button>
                <button onclick="togglePostReaction(${post.id}, false)">Dislike</button>
                <button onclick="reportPost(${post.id})">Báo cáo</button>
                ${canEditPost(post) ? `<button onclick="openPostModal(${post.id})">Sửa</button><button onclick="deletePost(${post.id})">Xoá</button>` : ''}
            </div>
        </div>
    `;
}