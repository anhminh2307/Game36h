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

function renderPostDetail() {
    const detailElement = document.getElementById('forumDetailPanel');
    if (!detailElement) return;

    const post = forumState.currentPost;
    if (!post) {
        detailElement.innerHTML = '<div class="forum-detail-empty"><h2>Chọn bài viết để xem chi tiết</h2><p>Nhấn vào một bài viết bên trái để thấy nội dung chi tiết và bình luận.</p></div>';
        return;
    }

    const author = post.user?.username || 'Người dùng';
    const commentHtml = post.comments?.length
        ? post.comments.map(comment => renderComment(comment, post.id)).join('')
        : '<p>Chưa có bình luận nào. Hãy là người đầu tiên tham gia trao đổi.</p>';

    detailElement.innerHTML = `
        <div class="forum-card">
            <div class="forum-detail-topbar">
                <div>
                    <h2>${post.title}</h2>
                    <div class="forum-post-meta">
                        <span class="badge-tag">${post.category || 'Khác'}</span>
                        <span>Đăng bởi ${author}</span>
                        <span>${formatDate(post.createdAt)}</span>
                    </div>
                </div>
                <div class="forum-post-actions">
                    <button onclick="togglePostReaction(${post.id}, true)">👍 ${post.likes || 0}</button>
                    <button onclick="togglePostReaction(${post.id}, false)">👎 ${post.dislikes || 0}</button>
                    <button onclick="reportPost(${post.id})">Báo cáo</button>
                </div>
            </div>
            <p style="white-space: pre-line; line-height: 1.75;">${post.body}</p>
        </div>
        <div class="forum-card">
            <h3>Bình luận</h3>
            <div id="forumComments">${commentHtml}</div>
            <div class="forum-field">
                <label for="newComment">Viết bình luận</label>
                <textarea id="newComment" placeholder="Nhập bình luận của bạn..."></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn-register" onclick="submitComment(${post.id})">Gửi bình luận</button>
            </div>
        </div>
    `;
}

async function selectPost(postId) {
    await loadPostDetail(postId);
}

async function refreshData(selectedId) {
    await loadForumData();
    if (selectedId) {
        await loadPostDetail(selectedId);
    }
}

function handleForumSearch() {
    forumState.searchKeyword = document.getElementById('forumSearch')?.value || '';
    renderPostList();
}

function handleFilterTitle() {
    forumState.filterTitle = document.getElementById('filterTitle')?.value || '';
    renderPostList();
}

function handleSortChange() {
    forumState.sortBy = document.getElementById('sortPosts')?.value || 'newest';
    renderPostList();
}

function resetForumFilters() {
    forumState.searchKeyword = '';
    forumState.filterTitle = '';
    forumState.sortBy = 'newest';
    document.getElementById('forumSearch').value = '';
    document.getElementById('filterTitle').value = '';
    document.getElementById('sortPosts').value = 'newest';
    renderPostList();
}

function resetForumFilters() {
    forumState.searchKeyword = '';
    forumState.filterTitle = '';
    forumState.sortBy = 'newest';
    document.getElementById('forumSearch').value = '';
    document.getElementById('filterTitle').value = '';
    document.getElementById('sortPosts').value = 'newest';
    renderPostList();
}

async function submitComment(postId) {
    const textarea = document.getElementById('newComment');
    if (!textarea) return;
    const content = textarea.value.trim();
    if (!content) {
        alert('Vui lòng nhập nội dung bình luận.');
        return;
    }

    try {
        await window.API.Forum.addComment(postId, { content });
        textarea.value = '';
        showSuccess('Bình luận đã được gửi.');
        await refreshData(postId);
    } catch (error) {
        showError('Không thể gửi bình luận.');
    }
}

function renderComment(comment, postId) {
    const authorLabel = comment.user?.role === 'ADMIN' ? `${comment.user.username} (Admin)` : comment.user?.username || 'Người dùng';
    const repliesHtml = comment.replies?.length
        ? comment.replies.map(reply => renderReply(reply, postId)).join('')
        : '';

    return `
        <div class="comment-card">
            <div class="comment-meta">
                <span><strong>${authorLabel}</strong></span>
                <span>${formatDate(comment.createdAt)}</span>
                ${comment.reported ? '<span class="badge-tag" style="background: rgba(255, 82, 82, 0.15); color: #ff8a80;">Báo cáo</span>' : ''}
            </div>
            <p>${comment.content}</p>
            <div class="comment-actions">
                <button onclick="toggleCommentReaction(${postId}, ${comment.id}, true)">👍 ${comment.likes || 0}</button>
                <button onclick="toggleCommentReaction(${postId}, ${comment.id}, false)">👎 ${comment.dislikes || 0}</button>
                <button onclick="replyToComment(${postId}, ${comment.id})">Trả lời</button>
                <button onclick="reportComment(${postId}, ${comment.id})">Báo cáo</button>
                ${canEditComment(comment) ? `<button onclick="editComment(${postId}, ${comment.id})">Sửa</button><button onclick="deleteComment(${postId}, ${comment.id})">Xoá</button>` : ''}
            </div>
            ${repliesHtml}
        </div>
    `;
}

async function replyToComment(postId, commentId) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html?redirect=forum.html';
        return;
    }

    const replyContent = prompt('Nhập trả lời của bạn:');
    if (!replyContent || !replyContent.trim()) return;

    try {
        await window.API.Forum.replyComment(postId, commentId, { content: replyContent.trim() });
        showSuccess('Đã gửi trả lời.');
        await refreshData(postId);
    } catch (error) {
        showError('Không thể gửi trả lời.');
    }
}

async function editComment(postId, commentId) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html?redirect=forum.html';
        return;
    }

    const comment = findCommentById(forumState.currentPost?.comments || [], commentId);
    if (!comment) return;

    const content = prompt('Chỉnh sửa bình luận:', comment.content);
    if (!content || !content.trim()) return;

    try {
        await window.API.Forum.updateComment(postId, commentId, { content: content.trim() });
        showSuccess('Bình luận đã được cập nhật.');
        await refreshData(postId);
    } catch (error) {
        showError('Không thể cập nhật bình luận.');
    }
}

async function deleteComment(postId, commentId) {
    if (!confirm('Bạn có chắc muốn xoá bình luận này không?')) return;
    try {
        await window.API.Forum.deleteComment(postId, commentId);
        showSuccess('Bình luận đã được xoá.');
        await refreshData(postId);
    } catch (error) {
        showError('Không thể xoá bình luận.');
    }
}

async function toggleCommentReaction(postId, commentId, isLike) {
    try {
        if (isLike) await window.API.Forum.likeComment(postId, commentId);
        else await window.API.Forum.dislikeComment(postId, commentId);
        await refreshData(postId);
    } catch (error) {
        showError('Không thể cập nhật tương tác bình luận.');
    }
}