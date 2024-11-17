document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');
    const postsContainer = document.getElementById('posts');

  window.db = db;
  window.dbRef = ref;
  window.dbSet = set;
  window.dbOnValue = onValue;
  window.dbGet = get;
  window.dbChild = child;
  window.dbPush = push;
  window.login = login;
  window.register = register;
  window.showRegisterForm = showRegisterForm;
  window.showLoginForm = showLoginForm;
  window.editUsername = editUsername;
  window.showProfile = showProfile;
  window.showMainContent = showMainContent;
  window.showFileMenu = showFileMenu;
  window.showUsersList = showUsersList;
  window.showHelpMenu = showHelpMenu;
  window.changeTheme = changeTheme;
  window.showStats = showStats;
  window.showSettings = showSettings;
  window.viewUserProfile = viewUserProfile;
  window.toggleFollow = toggleFollow;
  window.handleLike = handleLike;      
  window.handleRetweet = handleRetweet; 
  window.toggleReplyInput = toggleReplyInput;
  window.submitReply = submitReply;

  const tweets = [];
  let currentUsername = "User95";
  let blockedUsers = new Set();
  let selectedMedia = null;
  let selectedAudio = null;
  let following = new Set();
  const messages = {};
  let currentUser = null;

  function updateUserPresence() {
    const userStatusRef = dbRef(db, `users/${currentUser.username}/status`);

    dbSet(userStatusRef, 'online');

    dbOnValue(dbRef(db, '.info/connected'), (snapshot) => {
      if (!snapshot.val()) return;
      
      const userStatusRefDisconnected = dbRef(db, `users/${currentUser.username}/status`);
      dbSet(userStatusRefDisconnected, 'offline');
    });
  }

  window.postTweet = function() {
    if (!currentUser) {
      alert('Please login to post!');
      return;
    }

    const input = document.getElementById('mainTweetInput');
    const content = input.value.trim();
    
    if (!content) {
      alert('Please enter some content for your post!');
      return;
    }

    const newTweet = {
      id: Date.now().toString(),
      username: currentUser.username,
      content: content,
      timestamp: new Date().toLocaleTimeString() + " - " + new Date().toLocaleDateString(),
      likes: 0,
      retweets: 0,
      replies: [],
      likedBy: [],
      retweetedBy: [],
      profilePicture: currentUser.profilePicture || null
    };
    
    if (selectedMedia) {
      newTweet.media = selectedMedia;
    }
    
    if (selectedAudio) {
      newTweet.audio = selectedAudio;
    }
    
    tweets.unshift(newTweet);
    saveTweets();
    
    input.value = '';
    selectedMedia = null;
    selectedAudio = null;
    document.getElementById('imagePreview').innerHTML = '';
    
    renderTweets();
  };

  function loadSavedTweets() {
    const tweetsRef = dbRef(db, 'tweets');
    dbOnValue(tweetsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tweetsArray = Object.values(data).sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        tweets.splice(0, tweets.length, ...tweetsArray);
      } else {
        tweets.length = 0;
      }
      renderTweets();
    });
  }

  function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      currentUsername = currentUser.username;
      document.getElementById('authWindow').style.display = 'none';
      document.getElementById('mainWindow').style.display = 'block';
      document.getElementById('currentUsername').textContent = currentUsername;
      
      if (currentUser.profilePicture) {
        document.querySelector('.profile-picture').style.backgroundImage = `url(${currentUser.profilePicture})`;
        document.querySelector('.profile-picture').style.backgroundSize = 'cover';
      }
      
      updateUserPresence(); 
      loadSavedTweets(); 
    } else {
      document.getElementById('authWindow').style.display = 'block';
      document.getElementById('mainWindow').style.display = 'none';
    }
  }

  window.login = login;
  window.register = register;
  window.showRegisterForm = showRegisterForm;
  window.showLoginForm = showLoginForm;
  window.editUsername = editUsername;
  window.showProfile = showProfile;
  window.showMainContent = showMainContent;
  window.showFileMenu = showFileMenu;
  window.showUsersList = showUsersList;
  window.showHelpMenu = showHelpMenu;
  window.changeTheme = changeTheme;
  window.showStats = showStats;
  window.showSettings = showSettings;
  window.viewUserProfile = viewUserProfile;
  window.toggleFollow = toggleFollow;

  function saveTweets() {
    try {
      const recentTweets = tweets.slice(0, 100);
      dbSet(dbRef(db, 'tweets'), recentTweets)
        .catch(error => {
          console.error('Error saving tweets:', error);
          alert('There was an error saving your post. Please try again.');
        });
    } catch (e) {
      console.error('Error saving tweets:', e);
      alert('There was an error saving your post. Please try again.');
    }
  }

  function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  }

  function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
  }

  function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    dbGet(dbRef(db, 'users')).then((snapshot) => {
      const users = snapshot.val() || {};
      if (Object.values(users).some(u => u.username === username)) {
        alert('Username already taken!');
        return;
      }
      
      const user = {
        username,
        password: btoa(password),
        following: [],
        blocked: []
      };
      
      dbPush(dbRef(db, 'users'), user);
      login(username, password);
    });
  }

  function login(username = null, password = null) {
    username = username || document.getElementById('loginUsername').value;
    password = password || document.getElementById('loginPassword').value;
    
    dbGet(dbRef(db, 'users')).then((snapshot) => {
      const users = snapshot.val() || {};
      const user = Object.values(users).find(u => 
        u.username === username && u.password === btoa(password)
      );
      
      if (user) {
        currentUser = user;
        currentUsername = user.username;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        if (user.profilePicture) {
          document.querySelector('.profile-picture').style.backgroundImage = 
            `url(${user.profilePicture})`;
          document.querySelector('.profile-picture').style.backgroundSize = 'cover';
        }
        
        document.getElementById('authWindow').style.display = 'none';
        document.getElementById('mainWindow').style.display = 'block';
        document.getElementById('currentUsername').textContent = currentUsername;
        
        updateUserPresence(); 
        loadSavedTweets();
      } else {
        alert('Invalid username or password!');
      }
    });
  }

  function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    currentUsername = null;
    document.getElementById('authWindow').style.display = 'block';
    document.getElementById('mainWindow').style.display = 'none';
  }

  function editUsername() {
    if (!currentUser) {
      alert('Please login to edit username!');
      return;
    }

    const newUsername = prompt("Enter new username:", currentUsername);
    if (newUsername && newUsername.trim()) {
      const usersRef = dbRef(db, 'users');
      dbGet(usersRef).then((snapshot) => {
        const users = snapshot.val() || {};
        if (Object.values(users).some(u => u.username === newUsername && u.username !== currentUsername)) {
          alert('Username already taken!');
          return;
        }

        tweets.forEach(tweet => {
          if (tweet.username === currentUsername) {
            tweet.username = newUsername;
          }
          if (tweet.replies) {
            tweet.replies.forEach(reply => {
              if (reply.username === currentUsername) {
                reply.username = newUsername;
              }
            });
          }
        });

        currentUsername = newUsername;
        currentUser.username = newUsername;

        const userIndex = Object.values(users).findIndex(u => u.username === currentUsername);
        if (userIndex !== -1) {
          const userKey = Object.keys(users)[userIndex];
          usersRef.child(userKey).update({ username: newUsername });
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        saveTweets();
        document.getElementById('currentUsername').textContent = newUsername;
        renderTweets();
      });
    }
  }

  function viewUserProfile(username) {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('profileView').style.display = 'block';

    const userTweets = tweets.filter(t => t.username === username);
    
    const usersRef = dbRef(db, 'users');
    dbGet(usersRef).then((snapshot) => {
      const users = snapshot.val() || {};
      const user = Object.values(users).find(u => u.username === username);
      
      const profileTweetsContainer = document.querySelector('.profile-tweets');
      
      const profileHTML = `
        <div class="profile-view">
          <h3>@${username}'s Profile</h3>
          <div class="profile-stats">
            <div class="stat">
              <div>Posts</div>
              <div>${userTweets.length}</div>
            </div>
            <div class="stat">
              <div>Following</div>
              <div>${user?.following?.length || 0}</div>
            </div>
            <div class="stat">
              <div>Followers</div>
              <div>0</div>
            </div>
          </div>
          ${username !== currentUser?.username ? `
            <button class="button" onclick="toggleFollow('${username}')">
              ${following.has(username) ? 'Unfollow' : 'Follow'}
            </button>
          ` : ''}
          <div class="profile-tweets">
            <h4>Posts</h4>
            ${userTweets.map(createTweetElement).join('')}
          </div>
          <button class="button" onclick="showMainContent()">Back</button>
        </div>
      `;
      
      profileTweetsContainer.innerHTML = profileHTML;
    });
  }

  function toggleFollow(username) {
    if (!following.has(username)) {
      following.add(username);
    } else {
      following.delete(username);
    }
    viewUserProfile(username);
  }

  document.getElementById('mediaUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedMedia = {
          type: file.type.startsWith('video') ? 'video' : 'image',
          data: e.target.result
        };
        
        const previewContainer = document.getElementById('imagePreview');
        if (selectedMedia.type === 'video') {
          previewContainer.innerHTML = `
            <div class="video-preview-container">
              <video src="${selectedMedia.data}" controls class="attached-video"></video>
            </div>
          `;
        } else {
          previewContainer.innerHTML = `
            <img src="${selectedMedia.data}" class="attached-image" alt="Preview">
          `;
        }
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('audioUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedAudio = {
          type: 'audio',
          data: e.target.result
        };
        
        const previewContainer = document.getElementById('imagePreview');
        previewContainer.innerHTML += `
          <div class="audio-preview">
            <audio src="${selectedAudio.data}" controls></audio>
          </div>
        `;
      };
      reader.readAsDataURL(file);
    }
  });

  function createTweetElement(tweet) {
    if (blockedUsers.has(tweet.username)) {
      return '';
    }

    if (!tweet.replies) {
      tweet.replies = [];
    }
    
    const deleteButton = tweet.username === currentUsername ? 
      `<button class="action-button" onclick="deleteTweet('${tweet.id}')">🗑️ Delete</button>` : '';
    
    const actionButtons = `
      <div class="action-buttons">
        <button class="action-button" onclick="toggleReplyInput('${tweet.id}')">
          💬 ${tweet.replies.length || 0}
        </button>
        <button class="action-button" onclick="handleRetweet(this)">
          🔄 ${tweet.retweets || 0}
        </button>
        <button class="action-button" onclick="handleLike(this)">
          ❤️ ${tweet.likes || 0}
        </button>
        ${deleteButton}
      </div>
    `;
    
    if (tweet.isRetweet) {
      return `
        <div class="tweet" data-tweet-id="${tweet.id}">
          <div class="retweet-header">
            <span>🔄 @${tweet.username} reposted</span>
          </div>
          ${createTweetElement(tweet.originalTweet)}
        </div>
      `;
    }
    
    const processedContent = processContent(tweet.content);
    const profilePicture = tweet.profilePicture || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23808080"/><text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dy=".3em">?</text></svg>';
    const mediaElement = tweet.media ? 
      (tweet.media.type === 'video' ? 
        `<video src="${tweet.media.data}" controls class="attached-video"></video>` :
        `<img src="${tweet.media.data}" class="attached-image" alt="User uploaded image">`) 
      : '';
    
    const audioElement = tweet.audio ?
      `<div class="audio-preview">
        <audio src="${tweet.audio.data}" controls></audio>
      </div>` : '';
      
    return `
      <div class="tweet" data-tweet-id="${tweet.id}">
        <div class="tweet-header">
          <div class="tweet-profile-picture" style="background-image: url(${profilePicture})"></div>
          <div>
            <div class="username" onclick="viewUserProfile('${tweet.username}')">@${tweet.username}</div>
            <div class="timestamp">${tweet.timestamp}</div>
          </div>
        </div>
        <div class="content">${processedContent}</div>
        ${mediaElement}
        ${audioElement}
        ${actionButtons}
        <div class="reply-input-container" id="reply-input-${tweet.id}" style="display: none;">
          <textarea class="tweet-input" placeholder="Write a reply..."></textarea>
          <button class="button" onclick="submitReply('${tweet.id}')">Reply</button>
        </div>
        <div class="replies-container">
          ${(tweet.replies || []).map(reply => createReplyElement(reply)).join('')}
        </div>
      </div>
    `;
  }

  function createReplyElement(reply) {
    if (!reply.id) reply.id = Date.now().toString();
    return `
      <div class="tweet" data-tweet-id="${reply.id}">
        <div class="username">@${reply.username}</div>
        <div class="content">${processContent(reply.content)}</div>
        <div class="timestamp">${reply.timestamp}</div>
        <div class="action-buttons">
          <button class="action-button" onclick="toggleReplyInput('${reply.id}')">
            💬 ${reply.replies ? reply.replies.length : 0}
          </button>
          <button class="action-button" onclick="handleRetweet(this)">
            🔄 ${reply.retweets || 0}
          </button>
          <button class="action-button" onclick="handleLike(this)">
            ❤️ ${reply.likes || 0}
          </button>
          ${reply.username === currentUsername ? 
            `<button class="action-button" onclick="deleteTweet('${reply.id}')">🗑️ Delete</button>` : 
            ''
          }
        </div>
        <div class="reply-input-container" id="reply-input-${reply.id}" style="display: none;">
          <textarea class="tweet-input" placeholder="Write a reply..."></textarea>
          <button class="button" onclick="submitReply('${reply.id}')">Reply</button>
        </div>
        <div class="replies-container">
          ${(reply.replies || []).map(r => createReplyElement(r)).join('')}
        </div>
      </div>
    `;
  }

  function deleteTweet(tweetId) {
    if (confirm('Are you sure you want to delete this post?')) {
      const index = tweets.findIndex(t => t.id === tweetId);
      if (index !== -1) {
        tweets.splice(index, 1);
        saveTweets();
        renderTweets();
      }
    }
  }

  function toggleReplyInput(tweetId) {
    const replyContainer = document.getElementById(`reply-input-${tweetId}`);
    if (replyContainer) {
      replyContainer.style.display = replyContainer.style.display === 'none' ? 'block' : 'none';
    }
  }

  function submitReply(tweetId) {
    const replyContainer = document.getElementById(`reply-input-${tweetId}`);
    const replyContent = replyContainer.querySelector('.tweet-input').value;
    
    if (!replyContent.trim()) return;

    const newReply = {
      id: Date.now().toString(),
      username: currentUsername,
      content: replyContent,
      timestamp: new Date().toLocaleTimeString() + " - " + new Date().toLocaleDateString(),
      replies: [],
      likes: 0,
      retweets: 0,
      profilePicture: currentUser?.profilePicture
    };

    const findAndAddReply = (items) => {
      for (let item of items) {
        if (item.id === tweetId) {
          if (!item.replies) item.replies = [];
          item.replies.push(newReply);
          return true;
        }
        if (item.replies && findAndAddReply(item.replies)) {
          return true;
        }
      }
      return false;
    };

    findAndAddReply(tweets);
    saveTweets();
    renderTweets();
    replyContainer.querySelector('.tweet-input').value = '';
    replyContainer.style.display = 'none';
  }

  function editTweet(tweetId) {
    const tweet = tweets.find(t => t.id === tweetId);
    if (tweet && tweet.username === currentUsername) {
      const newContent = prompt("Edit your post:", tweet.content);
      if (newContent !== null) {
        tweet.content = newContent;
        tweet.edited = true;
        saveTweets();
        renderTweets();
      }
    }
  }

  function processContent(content) {
    content = content.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
    content = content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    return content;
  }

  document.getElementById('profileUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const profilePicUrl = e.target.result;
        document.querySelector('.profile-picture').style.backgroundImage = `url(${profilePicUrl})`;
        document.querySelector('.profile-picture').style.backgroundSize = 'cover';
        
        if (currentUser) {
          currentUser.profilePicture = profilePicUrl;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          
          tweets.forEach(tweet => {
            if (tweet.username === currentUser.username) {
              tweet.profilePicture = profilePicUrl;
            }
          });
          saveTweets();
          renderTweets();
        }
      };
      reader.readAsDataURL(file);
    }
  });

  function renderTweets() {
    const container = document.getElementById('tweet-container');
    const sortedTweets = [...tweets].sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    container.innerHTML = sortedTweets.map(createTweetElement).join('');
  }

  function showProfile() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('profileView').style.display = 'block';
    updateProfileStats();
    renderProfileTweets();
  }

  function showMainContent() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('profileView').style.display = 'none';
  }

  function updateProfileStats() {
    const userTweets = tweets.filter(t => t.username === currentUsername);
    document.getElementById('tweetCount').textContent = userTweets.length;
  }

  function renderProfileTweets() {
    const userTweets = tweets.filter(t => t.username === currentUsername);
    const profileTweetsContainer = document.querySelector('.profile-tweets');
    profileTweetsContainer.innerHTML = `
      <h4>Your Posts</h4>
      ${userTweets.map(createTweetElement).join('')}
    `;
  }

  function showFileMenu() {
    const menu = document.createElement('div');
    menu.style = `
      position: absolute;
      background: var(--window-bg);
      border: 2px solid;
      border-color: var(--border-light) var(--border-dark) var(--border-dark) var(--border-light);
      padding: 5px 0;
      z-index: 1000;
      left: 5px;
      top: 25px;
    `;
    
    menu.innerHTML = `
      <div class="menu-item" onclick="showStats()">Profile Stats</div>
      <div class="menu-item" onclick="showSettings()">Settings</div>
      <div class="menu-item" onclick="logout()">Sign Out</div>
      <div class="menu-item" onclick="this.closest('.file-menu').remove()">Exit Menu</div>
    `;
    
    const oldMenu = document.querySelector('.file-menu');
    if (oldMenu) oldMenu.remove();
    
    menu.className = 'file-menu';
    document.querySelector('.menu-bar').appendChild(menu);
  }

  function showUsersList() {
    const usersRef = dbRef(db, 'users');
    dbOnValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};

      const existingWindow = document.querySelector('.users-window');
      if (existingWindow) existingWindow.remove();
      
      const usersWindow = document.createElement('div');
      usersWindow.className = 'window users-window';
      usersWindow.style = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        z-index: 1001;
      `;
      
      const usersList = Object.values(users).map(user => `
        <div class="blocked-user">
          <span class="username" onclick="viewUserProfile('${user.username}')">
            @${user.username}
            ${user.profilePicture ? `
              <div class="tweet-profile-picture" style="width: 20px; height: 20px; display: inline-block; vertical-align: middle; background-image: url(${user.profilePicture})"></div>
            ` : ''}
          </span>
          <button class="button" onclick="viewUserProfile('${user.username}')">View Profile</button>
        </div>
      `).join('');
      
      usersWindow.innerHTML = `
        <div class="title-bar">
          <div class="title-bar-text">Connected Users</div>
          <div class="title-bar-controls">
            <button class="title-bar-button" onclick="this.closest('.window').remove()">×</button>
          </div>
        </div>
        <div class="window-body">
          <h3>Currently Connected Users</h3>
          <div class="blocked-users">
            ${usersList || '<p>No users connected</p>'}
          </div>
          <button class="button" onclick="this.closest('.window').remove()" style="margin-top: 10px;">Close</button>
        </div>
      `;
      
      document.body.appendChild(usersWindow);
    });
  }

  function showStats() {
    const userTweets = tweets.filter(t => t.username === currentUsername);
    alert(`Profile Overview:
      Posts: ${userTweets.length}
      Following: ${following.size}
      Blocked Users: ${blockedUsers.size}
    `);
  }

  function showSettings() {
    const settingsWindow = document.createElement('div');
    settingsWindow.className = 'window';
    settingsWindow.style = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      z-index: 1001;
    `;
    
    settingsWindow.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text">Settings</div>
        <div class="title-bar-controls">
          <button class="title-bar-button" onclick="this.closest('.window').remove()">×</button>
        </div>
      </div>
      <div class="window-body">
        <h3>Theme</h3>
        <select id="themeSelect" class="tweet-input" onchange="changeTheme(this.value)">
          <option value="light">Windows 95</option>
          <option value="dark">Dark Mode</option>
          <option value="blue">Blue Theme</option>
          <option value="modern">Modern Theme</option>
        </select>
        <button class="button" onclick="this.closest('.window').remove()">Close</button>
      </div>
    `;
    
    document.body.appendChild(settingsWindow);
  }

  function changeTheme(theme) {
    const root = document.documentElement;
    
    const themes = {
      light: {
        '--bg-color': '#c0c0c0',
        '--window-bg': '#c0c0c0',
        '--text-color': '#000000',
        '--border-light': '#ffffff',
        '--border-dark': '#808080',
        '--title-bar-bg': 'linear-gradient(90deg, #000080, #1084d0)',
        '--title-text': 'white',
        '--tweet-bg': 'white'
      },
      dark: {
        '--bg-color': '#2b2b2b',
        '--window-bg': '#3b3b3b',
        '--text-color': '#ffffff',
        '--border-light': '#555555',
        '--border-dark': '#222222',
        '--title-bar-bg': 'linear-gradient(90deg, #000000, #333333)',
        '--title-text': '#ffffff',
        '--tweet-bg': '#2b2b2b'
      },
      blue: {
        '--bg-color': '#1e90ff',
        '--window-bg': '#4169e1',
        '--text-color': '#ffffff',
        '--border-light': '#87ceeb',
        '--border-dark': '#00008b',
        '--title-bar-bg': 'linear-gradient(90deg, #00008b, #0000cd)',
        '--title-text': '#ffffff',
        '--tweet-bg': '#4169e1'
      },
      modern: {
        '--bg-color': '#ffffff',
        '--window-bg': '#f8f9fa',
        '--text-color': '#212529',
        '--border-light': '#dee2e6',
        '--border-dark': '#adb5bd',
        '--title-bar-bg': 'linear-gradient(90deg, #6c757d, #495057)',
        '--title-text': '#ffffff',
        '--tweet-bg': '#ffffff'
      }
    };
    
    const selectedTheme = themes[theme];
    Object.entries(selectedTheme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    if (currentUser) {
      currentUser.theme = theme;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }

  function handleLike(button) {
    if (!currentUser) {
      alert('Please login to like posts!');
      return;
    }

    const tweetElement = button.closest('.tweet');
    const tweetId = tweetElement.dataset.tweetId;
    const tweet = tweets.find(t => t.id === tweetId);
    
    if (tweet) {
      if (!Array.isArray(tweet.likedBy)) {
        tweet.likedBy = [];
      }
      
      const likeIndex = tweet.likedBy.indexOf(currentUser.username);
      if (likeIndex !== -1) {
        tweet.likedBy.splice(likeIndex, 1);
        tweet.likes = Math.max(0, (tweet.likes || 0) - 1);
      } else {
        tweet.likedBy.push(currentUser.username);
        tweet.likes = (tweet.likes || 0) + 1;
      }
      
      saveTweets();
      renderTweets();
    }
  }

  function handleRetweet(button) {
    if (!currentUser) {
      alert('Please login to retweet!');
      return;
    }

    const tweetElement = button.closest('.tweet');
    const tweetId = tweetElement.dataset.tweetId;
    const originalTweet = tweets.find(t => t.id === tweetId);
    
    if (originalTweet) {
      if (!Array.isArray(originalTweet.retweetedBy)) {
        originalTweet.retweetedBy = [];
      }
      
      const retweetIndex = originalTweet.retweetedBy.indexOf(currentUser.username);
      const hasRetweeted = retweetIndex !== -1;
      
      if (hasRetweeted) {
        originalTweet.retweetedBy.splice(retweetIndex, 1);
        originalTweet.retweets = Math.max(0, (originalTweet.retweets || 0) - 1);

        const retweetTimelineIndex = tweets.findIndex(t => 
          t.isRetweet && t.originalTweetId === tweetId && t.username === currentUser.username
        );
        if (retweetTimelineIndex !== -1) {
          tweets.splice(retweetTimelineIndex, 1);
        }
      } else {
        originalTweet.retweetedBy.push(currentUser.username);
        originalTweet.retweets = (originalTweet.retweets || 0) + 1;
        
        const retweet = {
          id: Date.now().toString(),
          isRetweet: true,
          originalTweetId: tweetId,
          username: currentUser.username,
          originalTweet: {...originalTweet},
          timestamp: new Date().toLocaleTimeString() + " - " + new Date().toLocaleDateString(),
          profilePicture: currentUser.profilePicture || null
        };
        
        tweets.unshift(retweet);
      }
      
      saveTweets();
      renderTweets();
    }
  }

  document.addEventListener('DOMContentLoaded', checkAuth);

  function showHelpMenu() {
    const helpWindow = document.createElement('div');
    helpWindow.className = 'window';
    helpWindow.style = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      z-index: 1001;
    `;
    
    helpWindow.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text">Help</div>
        <div class="title-bar-controls">
          <button class="title-bar-button" onclick="this.closest('.window').remove()">×</button>
        </div>
      </div>
      <div class="window-body">
        <h3>Iffold Help</h3>
        <div style="margin: 10px 0;">
          <p><strong>Posting:</strong></p>
          <ul>
            <li>Type your message in the text box</li>
            <li>Add media using the Attach Media button</li>
            <li>Add audio using the Audio button</li>
            <li>Click Post to share</li>
          </ul>
          
          <p><strong>Interactions:</strong></p>
          <ul>
            <li>Click usernames to view profiles</li>
            <li>Use reply button to respond to posts</li>
            <li>Like and retweet posts you enjoy</li>
          </ul>
          
          <p><strong>Profile:</strong></p>
          <ul>
            <li>Change your username using Edit Username</li>
            <li>Update profile picture by clicking Change Profile Picture</li>
            <li>View your stats in Profile section</li>
          </ul>
        </div>
        <button class="button" onclick="this.closest('.window').remove()">Close</button>
      </div>
    `;
    
    document.body.appendChild(helpWindow);

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
