-- Kullanıcılar Tablosu
CREATE TABLE users (
    id VARCHAR(10) PRIMARY KEY, -- Rastgele ve benzersiz ID (Örn: USR-8492)
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Arkadaşlık İlişkileri Tablosu
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(10) REFERENCES users(id),
    friend_id VARCHAR(10) REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' (beklemede) veya 'accepted' (onaylandı)
    UNIQUE(user_id, friend_id)
);