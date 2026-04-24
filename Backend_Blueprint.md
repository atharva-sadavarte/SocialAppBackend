# 🚀 Backend Blueprint (Node.js + Express + MongoDB)

## 🧱 1. Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT (Auth)
- Cloudinary (image uploads)
- Multer (file handling)
- Socket.IO (later for realtime)

## 🗂️ 2. Backend Folder Structure (Clean & Scalable)
```text
src/
 ├── controllers/    → request/response
 ├── models/         → DB schema
 ├── routes/
 ├── middleware/
 ├── services/       → business logic
 ├── utils/
 ├── config/
 └── app.js
```

## 🧠 3. Database Schema Design (VERY IMPORTANT)

**👤 User Model**
```json
{
  "username": "String",
  "email": "String",
  "password": "String",
  "avatar": "String",
  "bio": "String",
  "followers": ["ObjectId"],
  "following": ["ObjectId"],
  "createdAt": "Date"
}
```

**📸 Post Model**
```json
{
  "user": "ObjectId",
  "image": "String",
  "caption": "String",
  "likes": ["ObjectId"],
  "createdAt": "Date"
}
```

**💬 Comment Model**
```json
{
  "user": "ObjectId",
  "post": "ObjectId",
  "text": "String",
  "createdAt": "Date"
}
```

**🔔 Notification Model (optional but 🔥)**
```json
{
  "recipient": "ObjectId",
  "sender": "ObjectId",
  "type": "like | comment | follow",
  "post": "ObjectId",
  "read": "Boolean",
  "createdAt": "Date"
}
```

## 🔌 4. API Design (Core Endpoints)

**🔐 Auth Routes**
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET  `/api/auth/me`

**👤 User Routes**
- GET  `/api/users/:id`
- PUT  `/api/users/:id`
- POST `/api/users/follow/:id`
- POST `/api/users/unfollow/:id`

**📸 Post Routes**
- POST   `/api/posts`
- GET    `/api/posts/feed`
- GET    `/api/posts/:id`
- DELETE `/api/posts/:id`
- POST   `/api/posts/like/:id`
- POST   `/api/posts/unlike/:id`

**💬 Comment Routes**
- POST `/api/comments/:postId`
- GET  `/api/comments/:postId`

## 🔐 5. Authentication Flow (JWT)
**Flow:**
1. User logs in
2. Server returns token
3. Client stores token
4. Send token in headers: `Authorization: Bearer <token>`

**Middleware Example**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded.id;
  next();
};
```

## 🖼️ 6. Image Upload Flow (Cloudinary)
**Flow:**
1. React Native → send image via FormData
2. Backend → Multer handles file
3. Upload to Cloudinary
4. Save URL in DB

## ⚡ 7. Feed Algorithm (Simple Version)
**Start simple:**
Get posts from:
- Users you follow
- Yourself
- Sort by `createdAt DESC`

**👉 Later upgrade:**
- Ranking algorithm
- Engagement-based feed

## 🔥 8. Pro-Level Features (Add Later)
Once MVP is done:
- 🚀 **Real-time (Socket.IO)**: Live likes, Live comments
- 🚀 **Pagination**: `/api/posts/feed?page=1&limit=10`
- 🚀 **Search**: Users by username
- 🚀 **Rate Limiting**: Prevent spam

## 🧪 9. Testing (Optional but Powerful)
- Jest + Supertest
- Test auth routes & post creation

## 🛠️ 10. Dev Tips (From Experience)
- Don’t over-engineer at start
- Build MVP → then refactor
- Use Postman to test APIs
- Log everything while debugging

## 🎯 Your Immediate Next Steps
- **Step 1:** Setup Express server, Connect MongoDB
- **Step 2:** Build Auth (register/login)
- **Step 3:** Create User & Post models
