# 🔐 Auth Module Implementation Steps

Follow these steps to build a robust authentication system with JWT (Access/Refresh Tokens) and OTP-based password recovery.

## 🛠️ Step 1: Install Required Dependencies
You need `bcryptjs` for password hashing and `nodemailer` if you want to send actual OTP emails.

```bash
npm install bcryptjs nodemailer
```

---

## 📂 Step 2: Create the User Model
File: `src/models/User.js`

### Schema Requirements:
- **Email/Username**: Unique identifiers.
- **Password**: Must be stored as a hash.
- **Refresh Token**: To allow users to stay logged in without sending their password every time.
- **OTP Fields**: To handle "Forgot Password".

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  refreshToken: { type: String }, // Store for session management
  otp: {
    code: { type: String },
    expiresAt: { type: Date }
  },
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

---

## ⚡ Step 3: Auth Logic (Controller)
File: `src/controllers/authController.js`

### 1. Register Logic
- Check if user exists.
- Create user (password will be hashed by the model hook).
- Return success.

### 2. Login Logic (The JWT Part)
- Find user by email.
- `comparePassword`.
- Generate **Access Token** (short-lived: e.g., 15m).
- Generate **Refresh Token** (long-lived: e.g., 7d).
- Save Refresh Token in DB.
- Send tokens to client.

### 3. Refresh Token Logic
- Receive Refresh Token from client.
- Verify it.
- Check if it matches the one in DB.
- If valid, issue a **NEW Access Token**.

### 4. Forgot Password (OTP)
- User submits email.
- Generate a 6-digit random code.
- Set `expiresAt` (e.g., current time + 10 mins).
- Save to User record in DB.
- (Optional) Send via Email using `nodemailer`.

### 5. Reset Password
- Verify OTP code and check if it's expired.
- If valid, hash the new password and save it.
- Clear the OTP fields in DB.

---

## 🛣️ Step 4: Define Routes
File: `src/routes/authRoutes.js`

```javascript
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
```

---

## 🛡️ Step 5: Protection Middleware
File: `src/middleware/authMiddleware.js`

Create a middleware that:
1. Checks the `Authorization` header.
2. Verifies the **Access Token**.
3. Attaches `req.user` for use in other routes (like creating posts).

---

## 🎯 Implementation Order
1. **Model**: Set up `User.js`.
2. **Utils**: Create a `generateToken.js` utility.
3. **Controller**: Start with `register` and `login`.
4. **Testing**: Use Postman to verify you can get an Access Token.
5. **OTP**: Implement the forgot password flow last.
