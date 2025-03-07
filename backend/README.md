# Express API

A modern Express.js API with best practices implementation.

## Features

- Express.js framework
- Security middleware (helmet)
- CORS support
- Request logging (morgan)
- Environment variables
- Error handling middleware
- JSON body parsing

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=3000
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /`: Welcome message
- `GET /api/health`: Health check endpoint

## Error Handling

The API includes centralized error handling middleware that catches all errors and returns appropriate JSON responses.