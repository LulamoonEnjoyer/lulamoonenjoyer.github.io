document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');
    const postsContainer = document.getElementById('posts');

    // Fetch and display posts
    const fetchPosts = async () => {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        postsContainer.innerHTML = posts
            .map(
                post => `
                <div class="post">
                    <h3>${post.username}</h3>
                    <p>${post.content}</p>
                    ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
                    <small>${new Date(post.timestamp).toLocaleString()}</small>
                </div>`
            )
            .join('');
    };

    postForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(postForm);
        await fetch('/api/posts', {
            method: 'POST',
            body: formData,
        });
        postForm.reset();
        fetchPosts();
    });

    fetchPosts();
});
