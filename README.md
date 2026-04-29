# 🎬 YouTube Backend Clone (Node.js + Express)

This repository contains a **production-style backend** for a YouTube-like video platform.
It demonstrates scalable backend architecture, authentication, and real-world API design.

---

## 🚀 Features

- 🔐 User Authentication (JWT-based)
- 👤 User Profiles & Channel Management  
- 📹 Video Upload & Management  
- 👍 Like / Dislike System  
- 💬 Comments & Replies  
- 🔔 Subscriptions (Follow Channels)  
- 📊 Video Views Tracking  
- 🗂️ Scalable MVC Architecture  
- ⚡ RESTful API Design  

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **ODM:** Mongoose  
- **Authentication:** JWT (JSON Web Tokens)  
- **File Uploads:** Multer / Cloudinary  
- **Environment Config:** dotenv  

---

## 📂 Project Structure

```
Backend/
│── src/
│   ├── controllers/       # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   ├── middlewares/       # Auth & error handling
│   ├── utils/             # Helper functions
│   ├── config/            # DB & cloud config
│   └── app.js             # Express app setup
│
│── public/                # Static files
│── .env
│── package.json
│── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```
PORT=8000
MONGODB_URI=your_mongodb_connection
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ▶️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/venkatesh58285/Backend.git
cd Backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the server

```bash
npm run dev
```

Server will start at:

```
http://localhost:8000
```

---

## 📡 API Modules

### 🔐 Auth & Users
- Register user  
- Login user  
- Logout  
- Update profile  
- Get user channel  

### 📹 Videos
- Upload video  
- Get all videos  
- Get single video  
- Update video  
- Delete video  

### 👍 Likes
- Like / Unlike videos  
- Like comments  

### 💬 Comments
- Add comment  
- Reply to comment  
- Delete comment  

### 🔔 Subscriptions
- Subscribe / Unsubscribe  
- Get subscribed channels  

---

## 🏗️ System Architecture

<img width="800" height="533" alt="image" src="https://github.com/user-attachments/assets/07b84e0b-365c-4261-965b-8a37fde1cb01" />


---

## 🗄️ Database Architecture

View full database design:  
👉 https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj  

<img width="800" height="533" alt="image" src="https://github.com/user-attachments/assets/126f10d8-b955-4f0a-8288-9a5ccba32054" /> 

---
## 🔄 Authentication Flow

- Access Token (short-lived)  
- Refresh Token (long-lived)  
- Secure session handling  

---

## 🧪 Testing

```bash
npm test
```

---


## 📄 License

This project is for learning purposes.

---

## 👨‍💻 Author

**Venkatesh Rachamadugu**  
GitHub: https://github.com/venkatesh58285
