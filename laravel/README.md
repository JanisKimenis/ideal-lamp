# Laravel Blog API

The Laravel REST API backend. The React frontend is a sibling folder `../frontend` in the same repo.

## Structure

- **backend (this repo root)** — Laravel JSON REST API
- **`frontend/`** — React (Vite) frontend

Both run independently on their own ports:
- API: `http://localhost:8000/api`
- Frontend: `http://localhost:3000`

## Requirements

- PHP 8.2+
- Composer

## Setup

```bash
# Install dependencies
composer install

# Create .env if it doesn't exist
cp .env.example .env

# Configure the database (SQLite is default in .env)
touch database/database.sqlite

# Generate app key
php artisan key:generate

# Run migrations and seeders
php artisan migrate:fresh --seed
```

## Start the API server

```bash
php artisan serve --port=8000
```

The API runs at `http://localhost:8000/api`.

## Frontend

The React frontend is the sibling `../frontend` folder:

```bash
cd ../frontend
npm install
npm run dev        # runs on http://localhost:3000
```

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