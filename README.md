# TeachZen — AI UI Generator

A minimal hackathon-ready implementation for PS7:
- React + Vite frontend
- FastAPI backend
- Gemini via `google-genai`
- JSON document store
- Redux Toolkit runtime content binding
- Prompt + existing code + wireframe inputs
- Stable 10-digit section/field IDs
- Live CMS preview/editor
- React component + metadata + element JSON export
- Premium scroll-driven TeachZen landing page

> Important: the supplied PS7 sample says Node.js is mandatory. This build intentionally uses FastAPI because that is the requested stack. If your judges enforce the Node.js line literally, keep the frontend and contract exactly the same and swap only the API layer to Node/Express.

## 1. Run locally

Open this folder in VS Code.

### Terminal 1 — backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

Put your Gemini key in `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash
```

The app still works without the key using the deterministic fallback generator.

### Terminal 2 — frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

## 2. What to demo

1. Enter a prompt such as:
   `Create a premium AI learning hero for university students. Use dark glass cards, cyan and peach accents, 3 stats and a strong CTA.`
2. Optionally paste existing React/HTML code.
3. Optionally upload a wireframe image.
4. Click **Generate section**.
5. Scroll through the premium TeachZen home page.
6. Edit CMS values in the right panel and show that the preview changes without editing React.
7. Show the metadata/elements/code export buttons.
8. Open `/docs` on the FastAPI server to show the API contract.

## 3. PS7 mapping

| Requirement | TeachZen implementation |
|---|---|
| React generator UI | Vite + React |
| FastAPI API | `backend/main.py` |
| Prompt input | Yes |
| Code input | Yes |
| Wireframe input | Yes, sent to Gemini vision |
| Combined inputs | Yes |
| Structured IR | `section + elements` JSON |
| Unique editable IDs | 10-digit `sectionId`, `elementId`, `fieldId` |
| Default fallbacks | Every editable element has `defaultValue` |
| Redux/equivalent | Redux Toolkit store in `App.jsx` |
| JSON document store | `backend/data/sections.json` |
| Live preview | Generic CMS renderer |
| Repeatable cards | `cards` element with `items` |
| Variations | `variations` metadata |
| Regeneration | Previous section can be supplied; matching keys preserve IDs |
| Export | JSON + generated JSX |
| Premium scroll UI | Custom CSS, IntersectionObserver, parallax accents |

## 4. Free deployment

The simplest approach is:
- Deploy `backend` as a Render Free Web Service.
- Deploy `frontend` as a Render Free Static Site.
- Put the backend URL into the frontend environment variable `VITE_API_URL`.

Backend:
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment: `GEMINI_API_KEY`, optional `GEMINI_MODEL`

Frontend:
- Root directory: `frontend`
- Build: `npm install && npm run build`
- Publish directory: `dist`
- Environment: `VITE_API_URL=https://YOUR-BACKEND.onrender.com`

Render provides free web services/static sites, but free web services sleep after inactivity and their local filesystem is ephemeral. That means the JSON store is excellent for the hackathon demo, but not a durable production database. For a real production deployment, replace `sections.json` with Postgres/MongoDB/object storage.

## 5. Security

Never put `GEMINI_API_KEY` in the React frontend. It belongs only in the FastAPI service environment.
