# NestFinder Setup Guide

Follow these steps to set up NestFinder on your local machine for development or production.

## Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## Backend Setup (Server)

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    - Copy `.env.example` to `.env`.
    - Fill in your MySQL credentials, JWT secret, Gemini API key, and Stripe secret key.
    ```bash
    cp .env.example .env
    ```
4.  **Database Migration:**
    - Ensure your MySQL server is running.
    - Run the migration script to create the necessary tables and update the schema.
    ```bash
    node migrate.js
    ```
5.  **Start the server:**
    - Development: `npm run dev`
    - Production: `npm start`

The server will be running at `http://localhost:5000`.

## Frontend Setup (Client)

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    - Copy `.env.example` to `.env`.
    - Adjust the `VITE_API_BASE_URL` if your server is running on a different port.
    ```bash
    cp .env.example .env
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
5.  **Build for production:**
    ```bash
    npm run build
    ```

The client will be running at `http://localhost:5173`.

## Admin Access

To access the Admin Dashboard:
1. Register a new account.
2. Manually change the `role` of your user in the `users` table to `'admin'` using a MySQL client.
3. Navigate to `/admin` in the browser.

## Troubleshooting

- **Database Connection Refused:** Ensure MySQL is running on port 3306 and your `.env` credentials are correct.
- **AI Chat not working:** Verify your `GEMINI_API_KEY` is valid and has sufficient quota.
- **Images not loading:** Ensure the server is running and the `uploads` directory exists in `server/public`.
