# Blog Frontend (React)

A simple React frontend for the Laravel Blog API. It lives in the `frontend/` folder of the same repo, but is a separate app that runs on its own port.

## Requirements

- Node.js 18+
- The Laravel API running on `http://localhost:8000`

## Setup

```bash
npm install
```

## Run (dev)

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Build (production)

```bash
npm run build     # outputs to dist/
npm run preview   # serve the built files
```

## API Base URL

The app calls the API at `http://localhost:8000/api`. This is defined in `src/api.js` (`API_URL`).

## Structure

```
src/
├── main.jsx          # entry
├── App.jsx           # navbar + hash router
├── api.js            # API client + auth storage
├── utils.js          # helpers (date formatting, status, truncate)
├── Home.jsx          # homepage / latest posts
├── Posts.jsx         # all posts + search
├── PostDetail.jsx    # post view + comments
├── PostForm.jsx      # create / edit post
├── AuthForm.jsx      # login / register
└── components/
    └── PostCard.jsx  # reusable post card
```

## Features

- Browse and search posts
- View posts with comments
- Create, edit, delete posts (owner only)
- Add, edit, delete comments (owner only)
- Register / login / logout (token stored in localStorage)
- Simple hash-based routing (no router library)