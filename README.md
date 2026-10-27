# ASTU Lost & Found

This repository contains the production-ready deployment baseline for the ASTU Student Union Lost & Found application.

## Stack

- Backend: Node.js + Express + Mongoose + MongoDB
- Frontend: React + Vite + Tailwind

## Local development

1. Copy `backend/.env.example` to `backend/.env` and fill in your values.
2. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.
3. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Production checklist

- Set `NODE_ENV=production` on the backend.
- Use a strong `JWT_SECRET` and a managed MongoDB connection string.
- Set `FRONTEND_URL` to the deployed frontend origin.
- Set `VITE_API_URL` to the deployed backend API base URL.
- Configure HTTPS and a trusted reverse proxy or hosting platform.
- Enable audit logging and keep backups of MongoDB data.
- Keep secrets out of source control.

## Notes

The app expects a real MongoDB deployment in production. Local in-memory MongoDB testing is useful for CI only and is not a replacement for a managed database environment.
