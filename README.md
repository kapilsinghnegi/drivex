# DriveX

A Google Drive-like backend built with Node.js, Express, MongoDB, Supabase Storage, and JWT authentication.
This project allows users to register, log in, upload files, and download them securely. It uses Supabase for file storage and MongoDB for user management.
This is a simple implementation of a file storage system similar to Google Drive, focusing on backend functionality.

## Features

- User registration and login
- JWT-based authentication
- File upload (stored in Supabase Storage)
- File download (from Supabase Storage)
- User-specific file access
- Secure file storage and retrieval

## Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)
- Supabase Storage
- Multer (for file uploads)
- JWT (jsonwebtoken)
- EJS (templating)
- TailwindCSS

## Getting Started

1. **Clone the repository:**

   ```sh
   git clone https://github.com/kapilsinghnegi/drivex.git
   cd drivex
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env` and fill in your credentials:
     ```
     MONGO_URI=your_mongo_uri
     JWT_SECRET=your_jwt_secret
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

4. **Start the server:**

   ```sh
   npm start
   ```

5. **Access the app:**
   - Visit `http://localhost:3000` in your browser.

## Folder Structure

```
drivex/
  app.js
  config/
    db.js
    multer.config.js
    supabaseClient.js
  middlewares/
    auth.js
  models/
    files.models.js
    user.model.js
  routes/
    index.routes.js
    user.routes.js
  views/
    home.ejs
    index.ejs
    login.ejs
    register.ejs
  .env
  package.json
  README.md
```

## API Routes

### **Authentication & User**

- `GET /user/register` — Render registration page
- `POST /user/register` — Register a new user
- `GET /user/login` — Render login page
- `POST /user/login` — Login user and issue JWT
- `GET /user/logout` — Logout user

### **Home & Dashboard**

- `GET /` — Render landing page
- `GET /home` — Render user dashboard (requires authentication)

### **File Operations**

- `POST /upload` — Upload a file (authenticated, stores in Supabase Storage)
- `GET /download/:path` — Download a file by its Supabase Storage path (authenticated)
- `GET /files` — List all files for the logged-in user (authenticated)
- `DELETE /file/:id` — Delete a file by its database ID (authenticated)

> **Note:**  
> All file routes require the user to be authenticated via JWT.

**Security Note:**  
Never expose your Supabase service role key on the frontend.  
This project is intended for educational purposes. Always follow best practices for security in production applications.
