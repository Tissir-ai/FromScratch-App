# Authentication Service

A lightweight JWT-based authentication service built with Express.js.

## Features

- User registration with email and password
- User login with JWT token generation
- Token verification
- Protected routes with middleware
- Password hashing with bcryptjs
- Input validation

## API Endpoints

### 1. Health Check
```
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "Auth service is running",
  "timestamp": "2025-12-10T12:00:00.000Z"
}
```

### 2. Register User
```
POST /api/auth/register
Content-Type: application/json
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-12-10T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Login
```
POST /api/auth/login
Content-Type: application/json
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-12-10T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Get Current User (Protected)
```
GET /api/auth/me
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-12-10T12:00:00.000Z"
  }
}
```

### 5. Verify Token
```
POST /api/auth/verify
Content-Type: application/json
```
**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": "1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Environment Variables

Create a `.env` file in the auth-service directory:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

## Running Locally

1. Install dependencies:
```bash
cd auth-service
npm install
```

2. Create `.env` file with your configuration

3. Run the service:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Running with Docker

Build and run the service:
```bash
docker build -t auth-service .
docker run -p 3001:3001 --env-file .env auth-service
```

## Running with Docker Compose

From the deployment directory:
```bash
docker-compose up auth-service
```

Or run all services:
```bash
docker-compose up
```

## Project Structure

```
auth-service/
├── src/
│   ├── config/
│   │   └── index.js           # Configuration management
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT authentication middleware
│   ├── repositories/
│   │   └── userRepository.js  # User data management
│   ├── routes/
│   │   └── authRoutes.js      # API route definitions
│   ├── services/
│   │   └── authService.js     # Business logic
│   └── index.js               # Application entry point
├── .dockerignore
├── .env.example
├── Dockerfile
├── package.json
└── README.md
```

## Testing

The service uses in-memory storage for users. In production, replace the `userRepository` with a proper database implementation (PostgreSQL, MongoDB, etc.).

## Security Notes

- Change the `JWT_SECRET` in production to a strong, random string
- Use HTTPS in production
- Implement rate limiting for auth endpoints
- Add refresh token mechanism for better security
- Consider adding email verification
- Implement proper logging and monitoring
