# 🎬 Overlay Dashboard (Bootstrap)

A full-stack web app that lets you **add, edit, and control text or image overlays** on top of a live video stream (HLS/RTSP).  
You can drag, resize, toggle, or delete overlays directly from a clean dashboard interface.  

Built using **Flask (Python)** for the backend, **React + Bootstrap** for the frontend, and **MongoDB** for data storage.

---

## ✨ Features

- 🧭 Dashboard layout with sidebar + topbar, card-based controls  
- 🎨 Drag & resize overlays directly on the video (using `interact.js`)  
- 👀 Live preview of text/images before saving  
- 👁️ Toggle visibility, edit & delete overlays from the UI table  
- 💎 Modern, responsive Bootstrap styling (via CDN)  

---

## 🧩 Run Backend (Flask + MongoDB)

```bash
cd backend
python -m venv venv
# Activate the environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

🟢 The backend will start at:  
`http://127.0.0.1:5000`

---

## 💻 Run Frontend (React + Bootstrap)

```bash
cd frontend
npm install
npm start
```

🟢 The frontend will open at:  
`http://localhost:3000`

---

## 🎥 Notes on Video Streams

- Use a working **HLS (.m3u8)** URL in the sidebar to play streams.  
  Example:  
  ```
  https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
  ```
- Browsers **cannot play RTSP** directly — convert RTSP to HLS using FFmpeg if needed.
- `interact.js` is loaded via CDN. For offline use:  
  ```bash
  npm install interactjs
  ```

---

## 🧱 Project Overview

The Overlay Dashboard helps users **add overlays on live video streams** in real time.  
Each overlay (text or image) can be:
- Created dynamically through the UI  
- Moved or resized directly on the video player  
- Edited, hidden, or deleted anytime  

All overlays are stored in MongoDB for persistence.

---

## ⚙️ API Documentation (CRUD Endpoints)

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---------|-----------|-------------|
| **GET** | `/overlays` | Get all overlays |
| **POST** | `/overlays` | Create a new overlay |
| **PUT** | `/overlays/<id>` | Update overlay (position, size, visibility, etc.) |
| **DELETE** | `/overlays/<id>` | Delete an overlay |

---

## 🧭 How to Use the App

1. Start the backend and frontend servers.  
2. In the sidebar, paste a working HLS URL and click **Load Stream**.  
3. Create an overlay — choose type (Text or Image), set position/size, and click **Create**.  
4. Drag or resize the overlay directly on the video.  
5. Manage overlays in the table:
   - ✏️ Edit → change overlay text, image, or position  
   - 👁️ Toggle → show/hide  
   - ❌ Delete → remove overlay  

All updates are saved instantly to MongoDB.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React, Bootstrap, interact.js |
| Backend | Flask (Python) |
| Database | MongoDB |
| Video Playback | HLS.js (for `.m3u8` streams) |

---
