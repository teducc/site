from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI()

# Tarayıcının güvenli bir şekilde bağlanmasını sağlayan CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_users = {}       
db_friendships = {} 

class UserCreate(BaseModel):
    username: str

class FriendAdd(BaseModel):
    user_id: str
    friend_id: str

@app.post("/api/register")
def register_user(data: UserCreate):
    username = data.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Kullanıcı adı boş olamaz.")
    
    while True:
        random_id = str(random.randint(1000, 9999))
        full_id = f"{username}#{random_id}"
        if full_id not in db_users:
            break
            
    user_data = {"id": full_id, "username": username}
    db_users[full_id] = user_data
    db_friendships[full_id] = []
    return user_data

@app.post("/api/add-friend")
def add_friend(data: FriendAdd):
    # Gelen ID'lerdeki olası boşlukları veya uyuşmazlıkları temizleyelim
    user_id = data.user_id.strip()
    friend_id = data.friend_id.strip()

    if friend_id not in db_users:
        raise HTTPException(status_code=404, detail="Bu ID'ye sahip bir kullanıcı bulunamadı.")
    if friend_id == user_id:
        raise HTTPException(status_code=400, detail="Kendini arkadaş olarak ekleyemezsin.")
    if friend_id in db_friendships.get(user_id, []):
        raise HTTPException(status_code=400, detail="Bu kullanıcı zaten arkadaşınız.")

    if user_id not in db_friendships:
        db_friendships[user_id] = []
    if friend_id not in db_friendships:
        db_friendships[friend_id] = []

    db_friendships[user_id].append(friend_id)
    db_friendships[friend_id].append(user_id)
    return {"message": "Arkadaş başarıyla eklendi!"}

@app.get("/api/friends/{user_id}")
def get_friends(user_id: str):
    user_id = user_id.strip()
    if user_id not in db_friendships:
        return []
    friend_ids = db_friendships[user_id]
    return [db_users[f_id] for f_id in friend_ids if f_id in db_users]