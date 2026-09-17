# Lost and Found App

A React + Vite single-page application for reporting and browsing lost and found items.

## Tech Stack

- **Frontend**: React 18, React Router DOM v7
- **Build Tool**: Vite 7
- **Styling**: Plain CSS (per-component)
- **Language**: JavaScript (JSX)

## Project Structure

```
src/
  components/     # Reusable components (Navbar, ItemCard)
  pages/          # Route-level page components (Home, Login, Register, Dashboard, FoundedItems, ReportLost)
  data/           # Static mock data (data.js)
  assets/         # Images and SVGs
  App.jsx         # Root component with routing
  main.jsx        # Entry point
index.html        # Vite HTML shell
vite.config.js    # Vite config (port 5000, allowedHosts: true)
```

## Development

```bash
npm install
npm run dev       # Starts on http://0.0.0.0:5000
```

## Deployment

Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `dist`

## Replit Workflow

- **Start application**: `npm run dev` (webview on port 5000)
