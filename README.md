# 🏆 OmniMedia - Scalable Multimedia Upload, Search & Real-Time Ranking Platform

> A full-stack, production-grade multimedia application built with **React 18**, **Redux Toolkit**, **TypeScript** (0 `any` types), **Node.js/Express**, **MongoDB Atlas (Mongoose)**, **Cloudinary CDN**, **Socket.io**, and **Swagger OpenAPI 3.0**.

---

## 🌐 Live Demo & Production Links

- **🚀 Live Frontend App (Vercel)**: [https://file-upload-weld.vercel.app](https://file-upload-weld.vercel.app)
- **⚡ Live Backend REST API (Render)**: [https://file-upload-k6li.onrender.com](https://file-upload-k6li.onrender.com)
- **📖 Interactive Swagger OpenAPI Docs**: [https://file-upload-k6li.onrender.com/api-docs](https://file-upload-k6li.onrender.com/api-docs)
- **📦 Public GitHub Repository**: [https://github.com/akashsky270498/File_Upload](https://github.com/akashsky270498/File_Upload)

---

## 🌟 Key Features

### 🔐 1. JWT Authentication & Security
- **Dual-Token Architecture**: Short-lived Access Tokens (`15m`) passed via `Authorization: Bearer <token>` header + HttpOnly SameSite Refresh Cookies (`7d`).
- **Silent Refresh Interceptor**: Automatic 401 interceptor in Axios that silently requests `/api/auth/refresh` and retries pending requests without interrupting the user.
- **Account Settings**: Profile picture update (WhatsApp style with camera edit badge, initials fallback, 2 default preset avatars) + Change Password endpoint (`POST /api/auth/change-password`).

### ☁️ 2. Cloudinary CDN & Asset Pipeline
- Supports **Images (PNG, JPG)**, **Videos (MP4)**, **Audio (MP3)**, and **PDFs** up to 50MB.
- **Extension Preservation**: Uploads use `use_filename: true` and `filename_override` to retain native media extensions for browser playback.
- **Media Previewer**: High-performance modal viewer for high-res images (no scrollbars), video controls, custom spinning vinyl disc audio player, and embedded PDF viewer.

### 🔍 3. Keyword Search & Multi-Criteria Ranking
- **Regex Keyword Search**: Case-insensitive text indexing across `title`, `tags`, `description`, and `originalName`.
- **Category Filters**: Filter media by type (`All`, `Image`, `Video`, `Audio`, `PDF`).
- **Dynamic Relevance Ranking**:
  - **Relevance & View Count**: Sort by popularity (`viewsCount` descending).
  - **Upload Date**: Sort by recency (`createdAt` descending).
  - **Title**: Sort alphabetically (`title` ascending).
- **View Count Tracker**: Automatic view incrementing on media detail requests.

### ⚡ 4. Real-Time Socket.io Notifications (Bonus Goal)
- Real-time WebSocket gateway broadcasting `file:uploaded` events across active sessions.
- Top navigation bar notification bell badge counter (`+1` live update).
- Real-time floating glassmorphism toast popup notifications.

### 🎨 5. Premium UI & Dark/Light Theme (Bonus Goal)
- **Poppins Typography**: Modern typography via Google Fonts Poppins.
- **Dark & Light Mode Toggle**: Instant theme switching persisted in `localStorage`.
- **Responsive Glassmorphism**: Tailored CSS design system with skeleton loaders, smooth micro-animations, and custom dropzones.

---

## 🏗️ Architecture & Project Structure

The project follows a **Symmetric Modular Architecture** with strict separation of concerns and **0 `any` types**.

```
.
├── backend/
│   ├── src/
│   │   ├── config/              # DB (MongoDB Atlas), Cloudinary CDN, Swagger setup
│   │   ├── common/              # Middlewares (AuthGuard, Validate, ErrorHandler), ApiResponse, Errors
│   │   └── modules/
│   │       ├── auth/            # Auth Controller, Service, Routes, Validation, Interfaces, Swagger
│   │       ├── files/           # Files Controller, Service, Repository, Routes, Validation, Interfaces, Swagger
│   │       ├── users/           # Users Controller, Service, Repository, Routes, Validation, Interfaces, Swagger
│   │       └── notifications/   # Notification Controller, Service, Socket.io Gateway, Routes, Interfaces, Swagger
│   ├── tests/                   # Jest & Supertest Integration Test Suite
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, FileCard, FileGrid, UploadModal, MediaPreviewModal, ProfileModal, Toast
│   │   ├── pages/               # DashboardPage, AuthPage
│   │   ├── store/               # Redux Toolkit store & slices (authSlice, filesSlice, uiSlice)
│   │   ├── services/            # Axios API client, authApi, filesApi, usersApi
│   │   ├── hooks/               # useSocket, useDebounce
│   │   ├── styles/              # Glassmorphism CSS design system & Theme Tokens
│   │   └── types/               # TypeScript Interfaces
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🛠️ Tech Stack & Requirements Mapping

| Component | Technology Used | Deliverable Status |
| :--- | :--- | :---: |
| **Frontend** | React 18 (Hooks), Redux Toolkit, Poppins Typography, CSS3 | ✅ Complete |
| **Backend** | Node.js, Express.js (Modular Architecture), TypeScript | ✅ Complete |
| **Database** | MongoDB Atlas (Mongoose ODM) | ✅ Complete |
| **Media CDN** | Cloudinary API & SDK | ✅ Complete |
| **Authentication** | JWT (Access Tokens + HttpOnly Refresh Cookies) | ✅ Complete |
| **Real-Time** | Socket.io WebSocket Gateway | ✅ Complete (Bonus) |
| **Documentation** | Interactive Swagger UI (`/api-docs`) | ✅ Complete |
| **Testing** | Jest + Supertest Integration Test Suite | ✅ Complete |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `>= 18.x`
- **MongoDB**: Local MongoDB or MongoDB Atlas connection string
- **Cloudinary**: Cloudinary Cloud Name, API Key, API Secret

---

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file inside `backend/`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   MONGO_URI=mongodb://127.0.0.1:27017/multimedia_db

   JWT_ACCESS_SECRET=your_super_secret_access_key
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   JWT_REFRESH_EXPIRATION=7d

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Validate TypeScript (0 errors):
   ```bash
   npx tsc --noEmit
   ```

4. Run Automated Test Suite:
   ```bash
   npm test
   ```

5. Start Backend Server:
   ```bash
   npm run dev
   ```
   - **Backend API**: `http://localhost:5000`
   - **Interactive Swagger Docs**: `http://localhost:5000/api-docs`

---

### 3. Frontend Setup
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Validate TypeScript (0 errors):
   ```bash
   npx tsc --noEmit
   ```

3. Start Development Server:
   ```bash
   npm run dev
   ```
   - **Application UI**: `http://localhost:5173`

---

## 📋 API Endpoints Reference

| Method | Endpoint | Protection | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | User Registration |
| `POST` | `/api/auth/login` | Public | User Authentication & JWT issuance |
| `POST` | `/api/auth/refresh` | Public | Refresh Access Token via HttpOnly Cookie |
| `POST` | `/api/auth/logout` | Protected | Logout user & invalidate token |
| `GET` | `/api/auth/me` | Protected | Fetch current user profile |
| `POST` | `/api/auth/change-password` | Protected | Change authenticated user password |
| `POST` | `/api/files/upload` | Protected | Upload multimedia file to Cloudinary & DB |
| `GET` | `/api/files/search` | Protected | Search & rank media by keywords & relevance |
| `GET` | `/api/files/:id` | Protected | Fetch single media details & increment view count |
| `DELETE`| `/api/files/:id` | Protected | Delete media file from Cloudinary & DB |
| `GET` | `/api/notifications/status` | Public | Check Socket.io Gateway status |

---

## 🌐 Deployment Guidelines

### Backend Deployment (Render / Railway)
1. Set Root Directory to `backend`.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Add Environment Variables (`MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

### Frontend Deployment (Vercel / Netlify)
1. Set Framework Preset to **Vite**.
2. Set Root Directory to `frontend`.
3. Deploy!

---

## 🌐 Submission Links Template

- **GitHub Repository**: `https://github.com/<YOUR_GITHUB_USERNAME>/multimedia-upload-search-platform`
- **Live Demo Link**: `https://<YOUR_APP_NAME>.vercel.app`
- **Swagger API Docs**: `https://<YOUR_BACKEND_NAME>.onrender.com/api-docs`
