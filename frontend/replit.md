# ASTU Lost & Found App

A React + Vite single-page application for the ASTU Student Union Lost & Found
office. Students report found items online; the Student Union confirms physical
receipt before anything is published. There is no lost-item report and no student
accounts.

## Tech Stack

- **Frontend**: React 18, React Router DOM v7
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS (utility classes on components; no per-component CSS files)
- **Language**: JavaScript (JSX)

## Project Structure

```
src/
  components/       # Navbar, ItemCard, AdminRoute, AdminLayout
  components/ui/    # Shared primitives: Button, Input/Textarea/Select, StatusBadge,
                     # Card, PageHeader, EmptyState, LoadingState, ErrorState, Modal,
                     # ToastProvider
  pages/            # Home, ReportFoundItem, FoundedItems, ItemDetail, HowItWorks,
                     # AdminLogin, AdminDashboard, AdminRegisterFoundItem,
                     # AdminPendingFoundReports, AdminItemsList, AdminItemDetail
  services/         # api.js (axios instance), adminAuth.js
  index.css         # Tailwind entry point — the only CSS file in the project
  App.jsx           # Root component with routing
  main.jsx          # Entry point
index.html          # Vite HTML shell
tailwind.config.js  # Tailwind theme (primary color scale, animations)
postcss.config.js   # Required for Tailwind's build step
vite.config.js      # Vite config
```

## Development

```bash
npm install
npm run dev
```

## Deployment

Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `dist`
