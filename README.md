# Laravel API + Vanilla JS Frontend

A Laravel REST API with a standalone vanilla JavaScript frontend.

## Structure

- **Laravel API** — `/` (backend, JSON REST API)
- **Vanilla JS Frontend** — `/frontend` (standalone static SPA)

## Requirements

- PHP 8.2+
- Composer
- Node.js (for the frontend dev server)

## Setup

### 1. Backend (Laravel API)

```bash
# Install dependencies
composer install

# Create .env if it doesn't exist
cp .env.example .env

# Configure the database (SQLite is default in .env)
# Make sure database/database.sqlite exists
touch database/database.sqlite

# Generate app key
php artisan key:generate

# Run migrations and seeders
php artisan migrate:fresh --seed
```

### 2. Start the API server

```bash
php artisan serve --port=8000
```

The API runs at `http://localhost:8000/api`.

### 3. Frontend (Vanilla JS)

```bash
cd frontend

# Option A: Python static server (recommended for WSL)
python3 server.py

# Option B: Node.js static server
node server.js
```

Open `http://localhost:3000` in your browser.

The frontend calls the API at `http://localhost:8000/api` (configurable via `API_URL` in `frontend/js/app.js`).

## Default Seeded User

| Email | Password |
|-------|----------|
| test@example.com | password |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user` | Bearer token | Get authenticated user |
| POST | `/api/register` | No | Register a new user |
| POST | `/api/login` | No | Login and get a token |
| POST | `/api/logout` | Bearer token | Logout (revokes tokens) |
| GET | `/api/posts` | No | List all posts |
| POST | `/api/posts` | Bearer token | Create a post |
| GET | `/api/posts/{post}` | No | Show a post |
| PUT | `/api/posts/{post}` | Bearer token | Update a post |
| DELETE | `/api/posts/{post}` | Bearer token | Delete a post |
| PATCH | `/api/posts/{post}/status` | Bearer token | Update post status |
| GET | `/api/posts/{post}/comments` | No | List comments for a post |
| POST | `/api/posts/{post}/comments` | Bearer token | Add a comment |
| GET | `/api/posts/{post}/comments/{comment}` | No | Show a comment |
| PUT | `/api/posts/{post}/comments/{comment}` | Bearer token | Update a comment |
| DELETE | `/api/posts/{post}/comments/{comment}` | Bearer token | Delete a comment |

## Running Tests

```bash
php artisan test
```
