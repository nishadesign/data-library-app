# Data Library App

A React + Vite prototype for creating and managing data libraries, uploading files, and tracking processing status through a simulated pipeline.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS 4, Radix UI
- Backend: Node.js, Express, Multer
- Data: Local JSON/file-backed store (prototype-friendly)

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Run frontend and API in separate terminals:

```bash
npm run server
```

```bash
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`

## Available Scripts

- `npm run dev` - start Vite dev server
- `npm run server` - start Express API server
- `npm run dev:all` - start API + frontend together
- `npm run build` - production build
- `npm run preview` - preview built frontend
- `npm run start` - start server (same as `server`)

## Project Structure

- `src/` - frontend app code
  - `components/` - UI components and screens
  - `lib/api.js` - frontend API client
- `server/` - Express backend
  - `routes/libraries.js` - library and file routes
- `uploads/` - local uploaded files (development)
- `data.json` - local persisted prototype data

## How the Flow Works

1. Create a library from the **New Library** screen.
2. Upload PDF/HTML/TXT files.
3. Save triggers file upload and processing status updates.
4. View a library in **Library View** to monitor pipeline progress and file states.

## Save Button Behavior (Current UX)

- Save is disabled on initial entry.
- Save enables only after adding unsaved files.
- Save is disabled while saving/processing.
- In Library View, Save remains visible in the footer during file-selection mode, but disabled while `Remove Files` is available.

## API Endpoints (Prototype)

- `GET /api/libraries`
- `GET /api/libraries/:id`
- `POST /api/libraries`
- `PUT /api/libraries/:id`
- `DELETE /api/libraries/:id`
- `POST /api/libraries/:id/files`
- `POST /api/libraries/:id/register-files`
- `DELETE /api/libraries/:id/files/:fileId`
- `GET /api/libraries/:id/status` (Server-Sent Events)

## Notes

- This project is currently a prototype and is optimized for UX iteration.
- File storage and data persistence are local and intended for development/testing workflows.
