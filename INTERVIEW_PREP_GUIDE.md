# 🎓 OmniMedia Platform - Comprehensive Interview Q&A Guide
> **Tailored for Santa Browser Backend Developer (Node.js) Interview Preparation**

---

## 🎯 PART 1: 30-Second Project Elevator Pitch
> **Interviewer Question**: *"Can you walk me through your recent OmniMedia project?"*

**Your Simple Answer**:
> *"OmniMedia is an enterprise-grade full-stack multimedia upload, search, and real-time ranking platform built with React 18, TypeScript, Node.js/Express, MongoDB Atlas, Cloudinary CDN, and Socket.io.*
>
> *I designed a **symmetric modular backend** with 0 `any` TypeScript types, dual-token JWT security (Access Tokens + HttpOnly SameSite cookies), regex keyword search with MongoDB B-Tree indexing, async non-blocking media streaming for files up to 50MB, real-time WebSocket notifications, and an automated Jest integration test suite."*

---

## ⚙️ PART 2: BACKEND, NODE.JS & EXPRESS SCENARIO QUESTIONS

### **Q1: How is your Node.js & Express backend structured?**
* **Simple Answer**:
  I used a **Modular Domain Architecture**. Instead of putting all controllers or routes in one huge folder, I separated the project by business features:
  - `auth/` -> Controllers, services, routes, Joi schemas, Swagger docs
  - `files/` -> File metadata, Cloudinary CDN upload, search, sorting
  - `users/` -> User profile, avatar management, change password
  - `notifications/` -> Real-time Socket.io gateway & activity streams

* **Why this is better**:
  If a new developer joins the team, they can work on `files/` without touching `auth/`. It is clean, scalable, and easy to maintain.

---

### **Q2: How did you handle file uploads without blocking the Node.js Event Loop?**
* **Simple Answer**:
  Node.js runs on a single main thread. If we load a 30MB file completely into CPU memory synchronously, the server freezes.
  To prevent blocking:
  1. I used **Multer MemoryStorage** to handle incoming multipart file chunks.
  2. I used **Node.js Streams (`streamifier`)** to pipe data directly to **Cloudinary CDN via `upload_stream`**.
  3. Network I/O is handled asynchronously by Node.js libuv thread pool, so the event loop remains 100% non-blocking for other users.

---

### **Q3: How does your Dual-Token JWT Security work?**
* **Simple Answer**:
  Storing JWT tokens in browser `localStorage` makes them vulnerable to XSS attacks. To solve this, I built a **Dual-Token System**:
  - **Access Token (Short-lived, 15 mins)**: Sent in `Authorization: Bearer <token>` header for API authorization.
  - **Refresh Token (Long-lived, 7 days)**: Stored in an **HttpOnly, SameSite=None, Secure Cookie** (invisible to JavaScript, protected against XSS).
  - When the 15-minute access token expires, Axios interceptor automatically calls `POST /api/auth/refresh` behind the scenes, gets a new access token, and retries the failed request seamlessly.

---

### **Q4: How did you implement central Error Handling and Input Validation in Express?**
* **Simple Answer**:
  - **Input Validation**: I used **Joi schemas** in a reusable middleware (`validate()`). If a user sends invalid email format or password < 6 characters, Joi rejects the request early before reaching the controller.
  - **Global Error Middleware**: I created custom error classes (`AppError`, `NotFoundError`, `UnauthorizedError`). Any error thrown in async functions is caught by `next(error)` and processed by a central `errorHandler` middleware returning uniform JSON responses:
    ```json
    { "success": false, "message": "Error details", "statusCode": 400 }
    ```

---

## 🍃 PART 3: DATABASE (MONGODB / MONGOOSE) & QUERY OPTIMIZATION

### **Q5: What is Mongoose `.populate()`? Why did you use it and what happens under the hood?**
* **Simple Answer**:
  In MongoDB, documents reference other documents using `ObjectId`. For example, a File document stores `uploadedBy: ObjectId("65f1234...")`.
  When we query a file, we want to know the uploader's `name`, `email`, and `avatarUrl`.
  `.populate('uploadedBy', 'name email avatarUrl')` tells Mongoose to automatically fetch and attach the User details.

* **What happens under the hood?**:
  MongoDB is a non-relational database (no native SQL JOINs). Under the hood, Mongoose actually runs **2 separate queries**:
  1. `File.find({ _id: fileId })` -> Returns file document.
  2. `User.find({ _id: { $in: [uploaderIds] } })` -> Returns matching users and replaces the `ObjectId` in memory.

* **When to use `.populate()` vs Aggregation (`$lookup`)**:
  - Use `.populate()` for simple 1-to-1 or 1-to-Few document relationships.
  - Use Aggregation (`$lookup`) for high-volume joins, complex data filtering, or multi-stage pipelines because `$lookup` executes inside the MongoDB engine in a single database round-trip.

---

### **Q6: Why did you use Database Indexing? How does it improve performance?**
* **Simple Answer**:
  Without an index, whenever a user searches for `"laptop"` across 1,000,000 files, MongoDB performs a **Collection Scan (`COLLSCAN`)** — scanning every single document one by one ($O(N)$ time complexity). This causes massive CPU lag.

  By creating an **Index**, MongoDB builds a balanced B-Tree structure ($O(\log N)$ lookup time).

* **Indexes created in OmniMedia**:
  1. **Text Search Index**:
     ```typescript
     fileSchema.index({ title: 'text', description: 'text', tags: 'text' });
     ```
     Allows instant keyword matching across titles, tags, and descriptions.
  2. **Compound Index for Category & Ranking**:
     ```typescript
     fileSchema.index({ category: 1, viewsCount: -1, createdAt: -1 });
     ```
     Fast filtering by media type (`Image`, `Video`, `Audio`, `PDF`) combined with popularity sorting (`viewsCount`).

---

### **Q7: How did you fix unit tests deleting real MongoDB data?**
* **Simple Answer**:
  Originally, integration tests had `afterEach(async () => await User.deleteMany({}))` which wiped all users in the database upon running `npm test`.
  I fixed this by **scoping test cleanups** strictly to test-generated email addresses:
  ```typescript
  await User.deleteMany({ email: 'testuser@example.com' });
  ```
  Real users are never deleted during testing.

---

## ⚛️ PART 4: FRONTEND & INTEGRATION QUESTIONS

### **Q8: How is state managed in the React 18 Frontend?**
* **Simple Answer**:
  I used **Redux Toolkit (RTK)** divided into clean slices:
  - `authSlice`: Stores current user session, access token, login/logout state.
  - `filesSlice`: Handles file catalog, category filters, active search query, pagination, and notification history.
  - `uiSlice`: Manages Light/Dark theme mode (`localStorage` persistence), global toasts, and upload modal visibility.

---

### **Q9: What are Custom React Hooks and how did you use `useSocket`?**
* **Simple Answer**:
  A custom hook is a reusable TypeScript function that encapsulates React hooks (`useEffect`, `useState`, `useDispatch`).
  I built `useSocket()` to encapsulate Socket.io WebSocket connections:
  - Listens for `file:uploaded` events emitted by the server.
  - Automatically dispatches Redux actions to increment the bell notification counter and show floating glassmorphism toasts.
  - Cleans up event listeners on unmount (`socket.off('file:uploaded')`) to prevent memory leaks.

---

## 🚀 PART 5: SYSTEM DESIGN & SCALABILITY (SANTA BROWSER JD SPECIFICS)

### **Q10: What if a user uploads a 500MB or 2GB video file? How would you scale your system?**
* **Simple Answer**:
  For huge files, sending file payload bytes through the Node.js server causes HTTP timeouts and consumes high bandwidth. I would upgrade the architecture to **Direct Signed Client-to-CDN Uploads**:

  1. **Direct Signed Upload**:
     - Client calls `POST /api/files/get-presigned-url`.
     - Node.js API generates a short-lived secure signature from Cloudinary/AWS S3 and returns it in ~50ms.
     - Frontend uploads the 500MB file **directly to S3/Cloudinary**, completely bypassing the Node.js server.

  2. **Background Jobs (BullMQ + Redis)**:
     - Cloudinary/S3 sends a **Webhook** to Node.js when upload finishes.
     - Node.js pushes a background job to **BullMQ (Redis worker queue)** to process video transcoding, thumbnail generation, and metadata extraction asynchronously.
     - Socket.io notifies the frontend when processing finishes.

---

### **Q11: How do you solve CORS & SameSite Cookie issues in Production?**
* **Simple Answer**:
  When frontend is on Vercel (`*.vercel.app`) and backend is on Render (`*.onrender.com`), browsers treat requests as **cross-site (third-party)**.
  - **CORS Fix**: Dynamically match origin in Express `cors()` middleware with `credentials: true`.
  - **Cookie Fix**: Set `sameSite: 'none'` and `secure: true` on production response cookies so browsers allow cross-domain cookie storage over HTTPS.

---

## 📌 Summary Quick Cheat Sheet for Interview

| Concept | What It Does in Simple Words |
| :--- | :--- |
| **Node.js Event Loop** | Single-threaded non-blocking I/O handler using libuv. |
| **Multer + Streamifier** | Pipes incoming upload chunks to Cloudinary without memory bloat. |
| **Mongoose `.populate()`** | Replaces ObjectIDs with referenced document data (runs 2nd internal query). |
| **Database Indexing** | B-Tree index speeds up search from $O(N)$ full scan to $O(\log N)$. |
| **Dual-Token Auth** | Short-lived Access Token (header) + Long-lived Refresh Token (HttpOnly cookie). |
| **Axios Interceptor** | Intercepts `401 Unauthorized`, calls `/auth/refresh`, and retries request. |
| **Socket.io** | Full-duplex WebSocket connection broadcasting real-time activity events. |
| **BullMQ + Redis** | Background job queue for long-running async tasks (video encoding, emails). |
