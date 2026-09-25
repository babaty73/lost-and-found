# ASTU Lost & Found

A web application for the ASTU Student Union Lost & Found office: students report items
they've found, the Student Union physically receives and verifies them, and other
students can search and submit claims. Built with **React**, **Vite**, and **Tailwind
CSS**.

There is no lost-item report and no student accounts — see "How it works" below.

---

## 🚀 Features

- **Report Found Item**: Students report something they found online — no account
  needed. This only creates a private, pending record.
- **Physical handover, then publication**: A report only becomes a public listing once
  a Student Union admin confirms the physical item has actually been received.
- **Browse & search found items**: Server-side filtering and pagination.
- **Claims**: Any number of students can submit a claim on the same item (self, or on
  behalf of someone else); the same student can't submit two claims on one item.
- **Admin dashboard**: Real operational counts, a pending-reports intake queue, claim
  review (verify/reject), and recording a physical return.
- **Responsive, accessible UI**: Built with Tailwind CSS and a small set of shared
  components (buttons, inputs, status badges, empty/loading/error states, modals,
  toasts) rather than page-by-page custom CSS.

## 🔑 How it works

1. A student reports something they found online.
2. They bring the physical item to the ASTU Student Union Lost & Found office.
3. An admin accepts the handover, which publishes the item.
4. Another student searches, recognizes it, and submits a claim.
5. The Student Union reviews all claims, verifies identity in person, and records the
   return.

## 🛠️ Technologies used

- ⚛️ **React** – component-based UI
- ⚡ **Vite** – dev server and build tool
- 🎨 **Tailwind CSS** – utility-first styling (see `tailwind.config.js`)
- **Axios** – API client

## 💻 Installation & usage

```bash
git clone https://github.com/babaty73/lost-and-found.git
cd lost-and-found/frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend
npm run dev
```

Visit `http://localhost:5173` (or the port shown in the terminal). The backend must be
running separately — see `../backend/README` / `.env.example` there.

## 🌟 Possible future improvements

- Retention policy for unclaimed items (an institutional decision, not a technical one)
- Email/notification when a claim is verified or an item is registered
- A real ASTU institutional identity API integration (see `backend/services/identityProvider.js`)
