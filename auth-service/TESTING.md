# Testing the Authentication Service

## Prerequisites

- Docker and Docker Compose installed
- curl or Postman for API testing
- Or use the provided test commands

## Step 1: Start the Service

Navigate to the deployment directory and start the auth service:

```bash
cd c:\Users\dell\Desktop\FromScratch-Frontend-Test\deployment
docker-compose up auth-service -d
```

To start all services:
```bash
docker-compose up -d
```

Check if the service is running:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f auth-service
```

## Step 2: Test the Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "message": "Auth service is running",
  "timestamp": "2025-12-10T..."
}
```

## Step 3: Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "createdAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token from the response for the next steps!**

## Step 4: Login with the User

```bash
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Step 5: Test Protected Route (Get Current User)

Replace `YOUR_TOKEN_HERE` with the token from step 3 or 4:

```bash
curl -X GET http://localhost:3001/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "..."
  }
}
```

## Step 6: Verify Token

```bash
curl -X POST http://localhost:3001/api/auth/verify ^
  -H "Content-Type: application/json" ^
  -d "{\"token\":\"YOUR_TOKEN_HERE\"}"
```

Expected response:
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

## Step 7: Test Error Cases

### Invalid Login:
```bash
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"wrongpassword\"}"
```

Expected response:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Access Protected Route Without Token:
```bash
curl -X GET http://localhost:3001/api/auth/me
```

Expected response:
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Register Duplicate User:
```bash
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Another User\"}"
```

Expected response:
```json
{
  "success": false,
  "message": "User already exists"
}
```

## Using Postman

### Setup:
1. Open Postman
2. Import the following collection or create requests manually

### Requests:

1. **Health Check**
   - Method: GET
   - URL: `http://localhost:3001/health`

2. **Register**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User"
     }
     ```

3. **Login**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```

4. **Get Current User**
   - Method: GET
   - URL: `http://localhost:3001/api/auth/me`
   - Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

5. **Verify Token**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/verify`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "token": "YOUR_TOKEN_HERE"
     }
     ```

## Stopping the Service

```bash
docker-compose down
```

To remove volumes as well:
```bash
docker-compose down -v
```

## Troubleshooting

### Service not starting:
```bash
docker-compose logs auth-service
```

### Port already in use:
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"  # Change 3001 to another port
```

### Rebuild after code changes:
```bash
docker-compose up --build auth-service
```

## Integration with Other Services

To use the auth service from other services in the Docker network:

```javascript
// Example from another service
const authServiceUrl = 'http://auth-service:3001';

// Verify token
const response = await fetch(`${authServiceUrl}/api/auth/verify`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token: userToken })
});
```

## Next Steps

1. Integrate with your frontend application
2. Add the auth service URL to your environment variables
3. Implement token refresh mechanism
4. Add a real database (PostgreSQL, MongoDB, etc.)
5. Add email verification
6. Implement rate limiting
7. Add logging and monitoring
