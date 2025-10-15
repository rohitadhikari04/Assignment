# Overlay Dashboard (Bootstrap)

This upgraded version includes:
- Dashboard layout: sidebar + topbar, card-based controls
- Drag & resize overlays directly on the video (uses interact.js)
- Live preview of text/images before saving
- Toggle visibility, edit & delete overlays from UI table
- Bootstrap for styling (via CDN)

## Run Backend
1. cd backend
2. python -m venv venv
3. source venv/bin/activate   (Windows: venv\Scripts\activate)
4. pip install -r requirements.txt
5. python app.py

## Run Frontend
1. cd frontend
2. npm install
3. npm start

Notes:
- Provide a working HLS (.m3u8) URL in the sidebar to play streams. Browsers cannot play RTSP directly.
- interact.js is loaded via CDN. If you need offline install, run `npm install interactjs` and import it in React.