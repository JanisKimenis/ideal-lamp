(function () {
    'use strict';

    const API_URL = 'http://localhost:8000/api';

    const state = {
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user') || 'null'),
    };

    const app = document.getElementById('app');
    const authNav = document.getElementById('auth-nav');

    function api(path, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (state.token) {
            headers['Authorization'] = 'Bearer ' + state.token;
        }
        if (options.headers) {
            Object.assign(headers, options.headers);
        }
        return fetch(API_URL + path, {
            ...options,
            headers,
        }).then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const message = extractError(data);
                const error = new Error(message);
                error.status = res.status;
                error.data = data;
                throw error;
            }
            return data;
        });
    }

    function extractError(data) {
        if (data.message) return data.message;
        if (data.errors) {
            const first = Object.values(data.errors)[0];
            if (Array.isArray(first)) return first[0];
            return first;
        }
        return 'Something went wrong';
    }

    function renderAuthNav() {
        if (state.user) {
            authNav.innerHTML = `
                <span class="nav-link">Hi, ${escapeHtml(state.user.name)}</span>
                <button class="btn btn-outline btn-sm" id="btn-logout">Logout</button>
            `;
            document.getElementById('btn-logout').addEventListener('click', logout);
        } else {
            authNav.innerHTML = `
                <a href="#/login" class="nav-link">Login</a>
                <a href="#/register" class="btn btn-primary btn-sm">Register</a>
            `;
        }
    }

    function setAuth(token, user) {
        state.token = token;
        state.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        renderAuthNav();
    }

    function clearAuth() {
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        renderAuthNav();
    }

    function logout(e) {
        if (e) e.preventDefault();
        api('/logout', { method: 'POST' }).finally(() => {
            clearAuth();
            location.hash = '#/';
        });
    }

    function statusClass(name) {
        const map = {
            'published': 'published',
            'draft': 'draft',
            'scheduled': 'scheduled',
            'review': 'review',
            'archived': 'archived',
            'deleted': 'deleted',
        };
        return 'badge badge-' + (map[name] || 'draft');
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function postAuthor(post) {
        return post.user ? escapeHtml(post.user.name) : 'Anonymous';
    }

    function postStatusName(post) {
        return post.post_status ? post.post_status.name : (post.post_status_id ? 'status' : 'draft');
    }

    function canModify(post) {
        return state.user && post.user_id === state.user.id;
    }

    function loading(message) {
        app.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <div>${escapeHtml(message || 'Loading...')}</div>
            </div>
        `;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    // ---------- Router ----------

    const routes = {
        '': homePage,
        '#/': homePage,
        '#/posts': postsPage,
        '#/posts/new': newPostPage,
        '#/login': loginPage,
        '#/register': registerPage,
    };

    function navigate() {
        const hash = location.hash || '#/';
        const route = routes[hash];
        if (route) {
            route();
            return;
        }
        if (hash.startsWith('#/posts/')) {
            const parts = hash.split('/');
            if (parts.length === 3) {
                postDetailPage(parts[2]);
                return;
            }
            if (parts.length === 4 && parts[3] === 'edit') {
                editPostPage(parts[2]);
                return;
            }
        }
        notFoundPage();
    }

    window.addEventListener('hashchange', navigate);

    // ---------- Pages ----------

    function homePage() {
        app.innerHTML = `
            <div class="hero">
                <h1>Laravel Blog API</h1>
                <p>A simple blog built on Laravel REST API with a vanilla JS frontend.</p>
                <div>
                    <a href="#/posts" class="btn btn-primary">Browse Posts</a>
                    ${state.user ? '' : '<span class="mt-20"> <a href="#/register" class="btn btn-outline">Create Account</a></span>'}
                </div>
            </div>
            <h2 class="mb-20">Latest Posts</h2>
            <div id="latest-posts"><div class="loading"><div class="spinner"></div></div></div>
        `;
        api('/posts')
            .then((posts) => renderPosts(posts.filter(p => (p.post_status && p.post_status.name) === 'published' || !p.post_status), 'latest-posts'))
            .catch((err) => {
                document.getElementById('latest-posts').innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
            });
    }

    function postsPage() {
        app.innerHTML = `
            <div class="card-header card-title" style="padding:24px;">
                <div>
                    <h2 style="font-size:1.5rem;">All Posts</h2>
                    <input type="search" id="search-input" placeholder="Search posts..." style="max-width:300px;margin-top:10px;">
                </div>
                ${state.user ? '<a href="#/posts/new" class="btn btn-primary">+ New Post</a>' : ''}
            </div>
            <div id="posts-list"><div class="loading"><div class="spinner"></div></div></div>
        `;

        let allPosts = [];
        const listEl = document.getElementById('posts-list');

        function render(list) {
            if (!list.length) {
                listEl.innerHTML = `<div class="empty-state"><p>No posts found.</p></div>`;
                return;
            }
            listEl.innerHTML = list.map(postCardHTML).join('');
            attachPostActions();
        }

        api('/posts')
            .then((posts) => {
                allPosts = posts;
                render(posts);
            })
            .catch((err) => {
                listEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
            });

        document.getElementById('search-input').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            const filtered = allPosts.filter((p) =>
                p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
            );
            render(filtered);
        });
    }

    function postCardHTML(post) {
        const status = postStatusName(post);
        const actions = canModify(post) ? `
            <div class="post-actions">
                <a href="#/posts/${post.id}" class="btn btn-outline btn-sm">View</a>
                <a href="#/posts/${post.id}/edit" class="btn btn-outline btn-sm">Edit</a>
                <button class="btn btn-danger btn-sm" data-delete="${post.id}">Delete</button>
            </div>
        ` : `<div class="post-actions"><a href="#/posts/${post.id}" class="btn btn-outline btn-sm">View</a></div>`;

        return `
            <div class="card">
                <div class="post">
                    <div class="post-meta">
                        <span>By ${postAuthor(post)}</span>
                        <span>${formatDate(post.created_at)}</span>
                        <span class="${statusClass(status)}">${escapeHtml(status)}</span>
                    </div>
                    <h3 class="post-title"><a href="#/posts/${post.id}">${escapeHtml(post.title)}</a></h3>
                    <p class="post-body">${escapeHtml(truncateBody(post.body, 200))}</p>
                    ${actions}
                </div>
            </div>
        `;
    }

    function truncateBody(text, max) {
        if (!text) return '';
        return text.length > max ? text.substring(0, max) + '...' : text;
    }

    function attachPostActions() {
        document.querySelectorAll('[data-delete]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.delete;
                if (!confirm('Delete this post?')) return;
                try {
                    await api('/posts/' + id, { method: 'DELETE' });
                    alert('Post deleted.');
                    postsPage();
                } catch (err) {
                    alert(err.message);
                }
            });
        });
    }

    function postDetailPage(id) {
        loading('Loading post...');
        api('/posts/' + id)
            .then(async (post) => {
                const comments = await api('/posts/' + id + '/comments').catch(() => []);
                renderPostDetail(post, comments);
            })
            .catch((err) => {
                app.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div><a href="#/posts" class="btn btn-outline">Back</a>`;
            });
    }

    function renderPostDetail(post, comments) {
        const status = postStatusName(post);
        const actions = canModify(post) ? `
            <div class="post-actions">
                <a href="#/posts/${post.id}/edit" class="btn btn-outline btn-sm">Edit</a>
                <button class="btn btn-danger btn-sm" data-delete="${post.id}">Delete</button>
            </div>
        ` : '';

        const commentForm = state.user ? `
            <div class="comment-form">
                <form id="comment-form">
                    <div class="form-group">
                        <textarea name="content" placeholder="Write a comment..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Post Comment</button>
                </form>
            </div>
        ` : `<div class="comment-form"><p class="text-center"><a href="#/login">Log in</a> to comment.</p></div>`;

        const commentsHTML = (comments || []).map((c) => `
            <div class="comment" data-comment-id="${c.id}">
                <p class="comment-body">${escapeHtml(c.content)}</p>
                <p class="comment-meta">${escapeHtml(c.user ? c.user.name : 'Anonymous')} &middot; ${formatDate(c.created_at)}
                    ${state.user && c.user_id === state.user.id ? `
                        <button class="btn btn-outline btn-sm" data-edit-comment="${c.id}">Edit</button>
                        <button class="btn btn-danger btn-sm" data-delete-comment="${c.id}">Delete</button>
                    ` : ''}
                </p>
            </div>
        `).join('') || '<p class="comment" style="color:var(--muted)">No comments yet.</p>';

        app.innerHTML = `
            <div>
                <a href="#/posts" class="mb-20" style="display:inline-block;color:var(--primary);text-decoration:none;margin-bottom:16px;">&larr; Back to posts</a>
                <div class="card">
                    <div class="card-body" style="padding:32px;">
                        <div class="post-meta">
                            <span>By ${postAuthor(post)}</span>
                            <span>${formatDate(post.created_at)}</span>
                            <span class="${statusClass(status)}">${escapeHtml(status)}</span>
                        </div>
                        <h1 style="margin-bottom:16px;">${escapeHtml(post.title)}</h1>
                        <p class="post-body" style="font-size:1.05rem;">${escapeHtml(post.body)}</p>
                        ${actions}
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><div class="card-title">Comments (${(comments || []).length})</div></div>
                    ${commentForm}
                    ${commentsHTML}
                </div>
            </div>
        `;

        if (post && canModify(post)) {
            document.querySelectorAll('[data-delete]').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Delete this post?')) return;
                    try {
                        await api('/posts/' + post.id, { method: 'DELETE' });
                        alert('Post deleted.');
                        location.hash = '#/posts';
                    } catch (err) {
                        alert(err.message);
                    }
                });
            });
        }

        const commentFormEl = document.getElementById('comment-form');
        if (commentFormEl) {
            commentFormEl.addEventListener('submit', async (e) => {
                e.preventDefault();
                const content = commentFormEl.elements.content.value;
                try {
                    const newComment = await api('/posts/' + post.id + '/comments', {
                        method: 'POST',
                        body: JSON.stringify({ content }),
                    });
                    const refreshed = await api('/posts/' + post.id + '/comments');
                    renderPostDetail(post, refreshed);
                } catch (err) {
                    alert(err.message);
                }
            });
        }

        document.querySelectorAll('[data-delete-comment]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const commentId = btn.dataset.deleteComment;
                if (!confirm('Delete this comment?')) return;
                try {
                    await api('/posts/' + post.id + '/comments/' + commentId, { method: 'DELETE' });
                    const refreshed = await api('/posts/' + post.id + '/comments');
                    renderPostDetail(post, refreshed);
                } catch (err) {
                    alert(err.message);
                }
            });
        });

        document.querySelectorAll('[data-edit-comment]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const commentId = btn.dataset.editComment;
                const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`);
                const body = commentEl.querySelector('.comment-body');
                const currentText = body.textContent;
                body.innerHTML = `
                    <form data-edit-form="${commentId}">
                        <textarea name="content" style="min-height:50px;">${escapeHtml(currentText)}</textarea>
                        <div style="margin-top:8px;display:flex;gap:8px;">
                            <button type="submit" class="btn btn-primary btn-sm">Save</button>
                            <button type="button" data-cancel-edit="${commentId}" class="btn btn-outline btn-sm">Cancel</button>
                        </div>
                    </form>
                `;
                const form = body.querySelector(`[data-edit-form="${commentId}"]`);
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    try {
                        await api('/posts/' + post.id + '/comments/' + commentId, {
                            method: 'PUT',
                            body: JSON.stringify({ content: form.elements.content.value }),
                        });
                        const refreshed = await api('/posts/' + post.id + '/comments');
                        renderPostDetail(post, refreshed);
                    } catch (err) {
                        alert(err.message);
                    }
                });
                body.querySelector(`[data-cancel-edit="${commentId}"]`).addEventListener('click', () => {
                    renderPostDetail(post, comments);
                });
            });
        });
    }

    function newPostPage() {
        if (!state.user) {
            location.hash = '#/login';
            return;
        }
        app.innerHTML = `
            <div class="card" style="max-width:640px;margin:0 auto;">
                <div class="card-header"><div class="card-title">Create New Post</div></div>
                <div class="card-body">
                    <form id="post-form">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" required maxlength="255">
                        </div>
                        <div class="form-group">
                            <label for="body">Body</label>
                            <textarea id="body" name="body" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Create Post</button>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('post-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            try {
                const post = await api('/posts', {
                    method: 'POST',
                    body: JSON.stringify({
                        title: form.elements.title.value,
                        body: form.elements.body.value,
                    }),
                });
                alert('Post created successfully!');
                location.hash = '#/posts/' + post.id;
            } catch (err) {
                alert(err.message);
            }
        });
    }

    function editPostPage(id) {
        if (!state.user) {
            location.hash = '#/login';
            return;
        }
        loading('Loading...');
        api('/posts/' + id)
            .then((post) => {
                if (!canModify(post)) {
                    app.innerHTML = `<div class="alert alert-error">You do not have permission to edit this post.</div>`;
                    return;
                }
                app.innerHTML = `
                    <div class="card" style="max-width:640px;margin:0 auto;">
                        <div class="card-header"><div class="card-title">Edit Post</div></div>
                        <div class="card-body">
                            <form id="edit-form">
                                <div class="form-group">
                                    <label for="title">Title</label>
                                    <input type="text" id="title" name="title" value="${escapeHtml(post.title)}" required maxlength="255">
                                </div>
                                <div class="form-group">
                                    <label for="body">Body</label>
                                    <textarea id="body" name="body" required>${escapeHtml(post.body)}</textarea>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">Save Changes</button>
                            </form>
                        </div>
                    </div>
                `;
                document.getElementById('edit-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    try {
                        const updated = await api('/posts/' + id, {
                            method: 'PUT',
                            body: JSON.stringify({
                                title: form.elements.title.value,
                                body: form.elements.body.value,
                            }),
                        });
                        alert('Post updated!');
                        location.hash = '#/posts/' + id;
                    } catch (err) {
                        alert(err.message);
                    }
                });
            })
            .catch((err) => {
                app.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
            });
    }

    function loginPage() {
        app.innerHTML = `
            <div class="auth-form">
                <h2 class="auth-title">Log In</h2>
                <div class="card">
                    <div class="card-body">
                        <form id="login-form">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Log In</button>
                        </form>
                    </div>
                </div>
                <p class="text-center mt-20">Don't have an account? <a href="#/register" style="color:var(--primary);">Register</a></p>
            </div>
        `;
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            try {
                const data = await api('/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: form.elements.email.value,
                        password: form.elements.password.value,
                    }),
                });
                setAuth(data.token, data.user);
                location.hash = '#/posts';
            } catch (err) {
                alert(err.message);
            }
        });
    }

    function registerPage() {
        app.innerHTML = `
            <div class="auth-form">
                <h2 class="auth-title">Create Account</h2>
                <div class="card">
                    <div class="card-body">
                        <form id="register-form">
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" id="name" name="name" required maxlength="255">
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Register</button>
                        </form>
                    </div>
                </div>
                <p class="text-center mt-20">Already have an account? <a href="#/login" style="color:var(--primary);">Log in</a></p>
            </div>
        `;
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            try {
                const data = await api('/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: form.elements.name.value,
                        email: form.elements.email.value,
                        password: form.elements.password.value,
                    }),
                });
                setAuth(data.token, data.user);
                location.hash = '#/posts';
            } catch (err) {
                alert(err.message);
            }
        });
    }

    function notFoundPage() {
        app.innerHTML = `
            <div class="empty-state">
                <h2 style="font-size:2rem;color:var(--text);">404</h2>
                <p>Page not found.</p>
                <a href="#/" class="btn btn-primary mt-20">Go Home</a>
            </div>
        `;
    }

    // ---------- Init ----------

    renderAuthNav();
    navigate();
})();
