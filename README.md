# SkillForge 🧠

### AI-Driven Career Readiness & Skill Proof Platform

> *Prove. Bridge. Succeed.*

Built for Prodemic Technologies Hackathon — combining both challenge briefs into one industrial-grade platform.

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: **http://localhost:8000**

### 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Paste it in the app on first launch

---

## 📁 Project Structure

```
skillforge/
├── backend/
│   ├── main.py              # FastAPI app with all endpoints
│   └── requirements.txt
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js            # Routing
        ├── index.css         # Global design system
        ├── context/
        │   └── AppContext.js  # Global state
        ├── utils/
        │   └── api.js         # API calls
        ├── components/
        │   └── Layout.js      # Sidebar nav
        └── pages/
            ├── Landing.js     # Home page
            ├── Setup.js       # API key entry
            ├── Profile.js     # Student skill input
            ├── Challenges.js  # Live skill proof
            ├── GapAnalysis.js # Skills vs industry
            ├── Roadmap.js     # AI learning roadmap
            └── Dashboard.js   # Full overview
```

---

## 🎯 Features

- ✅ Student skill profiling with tag inputs
- ✅ Live AI-generated skill challenges (coding, MCQ, conceptual)
- ✅ Behavioral scoring (correctness, speed, efficiency)
- ✅ Industry gap analysis with radar + bar charts
- ✅ Personalized AI roadmap generation
- ✅ Full dashboard with skill certificate card
- ✅ 6 industry roles supported

## 🛠 Tech Stack

- **Frontend**: React 18, React Router, Recharts, Lucide Icons
- **Backend**: FastAPI (Python), Google Gemini 1.5 Flash
- **Design**: Custom CSS design system (Syne + DM Sans fonts)
