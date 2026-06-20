const API_URL = "http://192.168.1.11:8000";
let currentUser = null;

// HTML Elementlerini Seçelim
const authContainer = document.getElementById('auth-container');
const discordApp = document.getElementById('discord-app');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username-input');

const userDisplayName = document.getElementById('user-display-name');
const userDisplayId = document.getElementById('user-display-id');

const tabOnline = document.getElementById('tab-online');
const tabAdd = document.getElementById('tab-add');
const viewOnline = document.getElementById('view-online');
const viewAdd = document.getElementById('view-add');

const addFriendForm = document.getElementById('add-friend-form');
const friendIdInput = document.getElementById('friend-id-input');
const friendsListContainer = document.getElementById('friends-list-container');
const dmFriendsList = document.getElementById('dm-friends-list');
const friendsCountTitle = document.getElementById('friends-count-title');

// Giriş Başarılı Olduğunda Ekran Değişimi
function loginSuccess() {
    if (!currentUser) return;
    
    if (authContainer) authContainer.style.display = 'none';
    if (discordApp) {
        discordApp.style.removeProperty('display');
        discordApp.style.display = 'flex';
    }
    
    if (userDisplayName) userDisplayName.textContent = currentUser.username;
    if (userDisplayId) {
        const parts = currentUser.id.split('#');
        userDisplayId.textContent = parts.length > 1 ? `#${parts[1]}` : '#0000';
    }
    
    fetchFriends();
}

// 1. Hesap Oluşturma / Giriş Yapma
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput ? usernameInput.value.trim() : "";
        if (!username) return;

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username })
            });

            if (!response.ok) throw new Error("Kayıt olunamadı.");

            currentUser = await response.json();
            localStorage.setItem('discord_user', JSON.stringify(currentUser));
            loginSuccess();
        } catch (err) {
            alert("Python backend sunucusuna bağlanılamadı! Lütfen terminalde uvicorn'un çalıştığından emin olun.");
        }
    });
}

// 2. Arkadaş Ekleme
if (addFriendForm) {
    addFriendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const friendId = friendIdInput ? friendIdInput.value.trim() : "";
        if (!friendId || !currentUser) return;

        try {
            const response = await fetch(`${API_URL}/api/add-friend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, friend_id: friendId })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.detail || "Bir hata oluştu.");
                return;
            }

            alert(result.message);
            if (friendIdInput) friendIdInput.value = '';
            switchTab('online');
        } catch (err) {
            alert("İstek gönderilirken hata oluştu.");
        }
    });
}

// 3. Arkadaş Listesini Sunucudan Çekme
async function fetchFriends() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/api/friends/${encodeURIComponent(currentUser.id)}`);
        if (!response.ok) return;
        
        const friends = await response.json();
        renderFriends(friends);
    } catch (err) {
        console.error("Arkadaş listesi güncellenemedi.");
    }
}

function renderFriends(friends) {
    if (friendsCountTitle) friendsCountTitle.textContent = `TÜM ARKADAŞLAR — ${friends.length}`;
    
    if (!friendsListContainer || !dmFriendsList) return;

    if (friends.length === 0) {
        friendsListContainer.innerHTML = `<p class="empty-state">Burada kimse yok... ID paylaşıp arkadaş eklemeyi dene!</p>`;
        dmFriendsList.innerHTML = '';
        return;
    }

    friendsListContainer.innerHTML = '';
    dmFriendsList.innerHTML = '';

    friends.forEach(friend => {
        const row = document.createElement('div');
        row.className = 'friend-row';
        row.innerHTML = `
            <div class="friend-meta">
                <span class="friend-name">${friend.username}</span>
                <span class="friend-tag">${friend.id}</span>
            </div>
        `;
        friendsListContainer.appendChild(row);

        const dmItem = document.createElement('div');
        dmItem.className = 'dm-item';
        dmItem.textContent = friend.username;
        dmFriendsList.appendChild(dmItem);
    });
}

// 4. Sekme Değiştirme (Çevrimiçi / Arkadaş Ekle)
function switchTab(tab) {
    if (tab === 'online') {
        if (tabOnline) tabOnline.classList.add('active');
        if (tabAdd) tabAdd.classList.remove('active');
        if (viewOnline) viewOnline.style.display = 'block';
        if (viewAdd) viewAdd.style.display = 'none';
        fetchFriends();
    } else {
        if (tabAdd) tabAdd.classList.add('active');
        if (tabOnline) tabOnline.classList.remove('active');
        if (viewOnline) viewOnline.style.display = 'none';
        if (viewAdd) viewAdd.style.display = 'block';
    }
}

if (tabOnline) tabOnline.addEventListener('click', () => switchTab('online'));
if (tabAdd) tabAdd.addEventListener('click', () => switchTab('add'));

// Hafızada Kayıtlı Kullanıcı Kontrolü
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loginSuccess();
    }
});