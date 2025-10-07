# EduKeys v3 — Streamlit Loader (v2)
This package wraps your existing `index.html`, `styles.css`, and `app.js` into a single Streamlit app.

## Run locally
pip install -r requirements.txt
streamlit run app.py

## Deploy (Streamlit Community Cloud)
1) Push these files to a **public** GitHub repo (root level).
2) On Streamlit Cloud → **New app**
   - Repository: <your-user>/<your-repo>
   - Branch: main
   - Main file path: app.py
3) Deploy → you will get a URL like https://<your-app>.streamlit.app
