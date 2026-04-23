# 🔗 URL Shortener API

A blazing-fast, production-ready URL shortening microservice. Built with modern Node.js (ESM architecture), Express, and PostgreSQL, this API provides secure link generation, custom aliasing, and atomic click tracking.

## ✨ Features

- **Modern Architecture:** Native ECMAScript Modules (ESM) running on Node.js v24+.
- **Robust Persistence:** PostgreSQL integration using Prisma v7 with type-safe database adapters.
- **Custom Aliases:** Support for user-defined short codes with automatic sanitization and URL slugification.
- **Strict Validation:** Native backend validation using `URL.canParse()` to reject malformed or malicious payloads instantly.
- **API Protection:** Integrated IP-based rate limiting (15 requests per 15 minutes) to prevent spam and database exhaustion.
- **Atomic Operations:** Race-condition-safe click tracking using database-level atomic increments.
- **Centralized Error Handling:** Global middleware to catch unhandled rejections and maintain server stability.

## 🛠️ Tech Stack

- **Runtime:** Node.js (v24 Native ESM)
- **Framework:** Express.js (v5)
- **Database:** PostgreSQL (Hosted on Neon DB)
- **ORM:** Prisma v7 (`@prisma/client`, `@prisma/adapter-pg`)
- **Security:** `express-rate-limit`

## 🚀 Getting Started

### Prerequisites

- Node.js v24 or higher
- A PostgreSQL database URL (e.g., Neon DB)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SirYazoo/url-shortener-api.git
   cd url-shortener-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your PostgreSQL connection string:

   ```env
   DATABASE_URL="postgres://username:password@hostname/database_name?sslmode=verify-full"
   ```

4. Generate the Prisma Client and run migrations:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`.

## 📖 API Documentation

### 1. Create a Short URL

Generates a random short code or accepts a sanitized custom alias.

- **Endpoint:** `POST /api/shorten`
- **Headers:** `Content-type: application/json`
- **Rate Limit:** 15 requests per 15 minutes per IP.

### Request Body (Random Code):

```json
{
  "longUrl": "https://www.postgresql.org/docs/"
}
```

### Request Body (Custom Alias):

```json
{
  "longUrl": "https://www.postgresql.org/docs/",
  "customCode": "PG Web"
}
```

### Success Response (201 Created):

```json
{
  "success": true,
  "message": "URL shortened successfully",
  "url": "http://localhost:3000/pg-web"
}
```

### Error Responses:

- `400 Bad Request`: Invalid URL format or missing `longUrl`.
- `409 Conflict`: Custom alias is already in use.
- `429 Too Many Requests`: Rate limit exceeded.

### 2. Redirect to Original URL

Retrieves the original URL, increments the click counter atomically, and redirects the user.

- **Endpoint:** `GET /:shortCode`

### Behavior:

- If the `shortCode` exists, the server responds with a `302 Redirect` to the original `longUrl`.
- If the `shortCode` does not exist, returns a `404 Not Found` with a JSON error message.
