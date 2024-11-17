const GITHUB_API_URL = "https://api.github.com";
const GITHUB_REPO = "lulamoonenjoyer.github.io"; // REPO NAME
const GITHUB_TOKEN = "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"; // GPAT

// Toggle Dark Mode
document.getElementById("toggle-theme").addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
});
document.body.setAttribute("data-theme", localStorage.getItem("theme") || "light");

// Login System
const loginSection = document.getElementById("login-section");
const postSection = document.getElementById("post-section");
const currentUserSpan = document.getElementById("current-user");
document.getElementById("login-btn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    if (username) {
        localStorage.setItem("user", username);
        loginSection.style.display = "none";
        postSection.style.display = "block";
        currentUserSpan.textContent = username;
    } else {
        alert("Please enter a valid username.");
    }
});

const savedUser = localStorage.getItem("user");
if (savedUser) {
    loginSection.style.display = "none";
    postSection.style.display = "block";
    currentUserSpan.textContent = savedUser;
}

// Fetch and Render Posts
async function fetchPosts() {
    const res = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/data/posts.json`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await res.json();
    const posts = JSON.parse(atob(data.content));
    renderPosts(posts);
}

function renderPosts(posts) {
    const postsContainer = document.getElementById("posts-container");
    postsContainer.innerHTML = posts
        .map(post => `
            <div class="post">
                <h4>${post.user}</h4>
                <p>${linkifyHashtags(post.content)}</p>
                ${post.imagePath ? `<img src="https://raw.githubusercontent.com/${GITHUB_REPO}/main/${post.imagePath}" alt="Post image">` : ""}
                <span>${new Date(post.time).toLocaleString()}</span>
            </div>
        `)
        .join("");
}

function linkifyHashtags(text) {
    return text.replace(/#(\w+)/g, '<a href="#">#$1</a>');
}

// Add New Post
document.getElementById("post-btn").addEventListener("click", async () => {
    const content = document.getElementById("post-content").value.trim();
    const file = document.getElementById("image-upload").files[0];
    if (!content) {
        return alert("Post content cannot be empty!");
    }
    const imagePath = file ? await uploadImage(file) : null;
    await addPost(content, imagePath);
});

async function uploadImage(file) {
    const base64 = await fileToBase64(file);
    const fileName = `data/images/${Date.now()}_${file.name}`;
    await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${fileName}`, {
        method: "PUT",
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Upload image",
            content: base64.split(",")[1]
        })
    });
    return fileName;
}

async function addPost(content, imagePath) {
    const res = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/data/posts.json`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const data = await res.json();
    const posts = JSON.parse(atob(data.content));
    const newPost = { user: savedUser, content, imagePath, time: new Date().toISOString() };
    posts.unshift(newPost);
    await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/data/posts.json`, {
        method: "PUT",
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Add new post",
            content: btoa(JSON.stringify(posts)),
            sha: data.sha
        })
    });
    fetchPosts(); // Refresh posts
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Initial Fetch
fetchPosts();
