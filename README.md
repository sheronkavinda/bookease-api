# BookEase API

BookEase is a RESTful service-booking platform API developed using NestJS, TypeScript, PostgreSQL, and TypeORM.

The API allows authenticated users to manage services and customer bookings. Customers can create bookings without authentication, while administrative booking operations and service management are protected using JWT authentication.

## Features

### Authentication

- User registration
- User login
- JWT access-token authentication
- Password hashing using bcrypt
- Protected API endpoints
- Duplicate-email prevention

### Service Management

- Create a service
- Retrieve all services
- Retrieve a service by ID
- Update a service
- Delete a service
- Activate or deactivate a service

### Booking Management

- Public booking creation
- Retrieve all bookings
- Retrieve a booking by ID
- Update booking status
- Cancel a booking
- Booking status enum
- Pagination
- Customer search
- Status filtering

### Business Rules

- A booking must belong to an existing service.
- A booking cannot be created for an inactive service.
- Booking dates cannot be in the past.
- Duplicate bookings for the same service, date, and time are prevented.
- Cancelled bookings cannot be marked as completed.
- Completed bookings cannot be cancelled.
- Only authenticated users can manage services.
- Customers can create bookings without authentication.

### Additional Features

- Swagger API documentation
- DTO validation using `class-validator`
- Global validation pipe
- Global exception handling
- PostgreSQL database migrations
- Unit tests
- Consistent error responses

## Technology Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- Passport
- bcrypt
- Swagger/OpenAPI
- Jest

## Project Structure

```text
src/
├── auth/
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── bookings/
│   ├── dto/
│   ├── entities/
│   ├── enums/
│   ├── bookings.controller.ts
│   ├── bookings.module.ts
│   └── bookings.service.ts
├── common/
│   └── filters/
├── database/
│   └── migrations/
├── services/
│   ├── dto/
│   ├── entities/
│   ├── services.controller.ts
│   ├── services.module.ts
│   └── services.service.ts
├── users/
│   ├── entities/
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── app.module.ts
└── main.ts
```

## Prerequisites

Install the following software before running the project:

- Node.js 20 or later
- npm
- PostgreSQL
- Git

## Installation

Clone the repository:

```bash
git clone https://github.com/sheronkavinda/bookease-api.git
```

Navigate into the project:

```bash
cd bookease-api
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root by copying `.env.example`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux or macOS:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
DB_NAME=bookease_db

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
```

Do not commit the real `.env` file or sensitive credentials.

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE bookease_db;
```

Ensure that the database details in `.env` match your PostgreSQL configuration.

## Database Migrations

Run all pending migrations:

```bash
npm run migration:run
```

Show migration status:

```bash
npm run migration:show
```

Revert the most recently applied migration:

```bash
npm run migration:revert
```

Generate a new migration after changing an entity:

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

The application uses migrations for schema management. TypeORM automatic synchronization is disabled.

## Running the Application

Start in development mode:

```bash
npm run start:dev
```

Start normally:

```bash
npm run start
```

Create a production build:

```bash
npm run build
```

Run the production build:

```bash
npm run start:prod
```

The API will be available at:

```text
http://localhost:3000/api
```

## API Documentation

After starting the application, Swagger documentation is available at:

```text
http://localhost:3000/api/docs
```

The OpenAPI JSON document is available at:

```text
http://localhost:3000/api/docs-json
```

To test a protected endpoint:

1. Register a user.
2. Log in using the registered email and password.
3. Copy the `accessToken` from the login response.
4. Click the Swagger **Authorize** button.
5. Paste the token and authorize the request.

## API Endpoints

### Authentication

| Method | Endpoint | Authentication | Description |
|---|---|---:|---|
| POST | `/api/auth/register` | No | Register a user |
| POST | `/api/auth/login` | No | Log in and receive a JWT token |

### Services

| Method | Endpoint | Authentication | Description |
|---|---|---:|---|
| POST | `/api/services` | Yes | Create a service |
| GET | `/api/services` | No | Retrieve all services |
| GET | `/api/services/:id` | No | Retrieve a service by ID |
| PATCH | `/api/services/:id` | Yes | Update a service |
| DELETE | `/api/services/:id` | Yes | Delete a service |

### Bookings

| Method | Endpoint | Authentication | Description |
|---|---|---:|---|
| POST | `/api/bookings` | No | Create a booking |
| GET | `/api/bookings` | Yes | Retrieve paginated bookings |
| GET | `/api/bookings/:id` | Yes | Retrieve a booking by ID |
| PATCH | `/api/bookings/:id/status` | Yes | Update booking status |
| PATCH | `/api/bookings/:id/cancel` | Yes | Cancel a booking |

## Booking Query Parameters

The following optional query parameters are supported by `GET /api/bookings`:

| Parameter | Example | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `10` | Number of records per page, maximum 100 |
| `search` | `kamal` | Search by customer name, email, or phone |
| `status` | `PENDING` | Filter by booking status |

Example:

```text
GET /api/bookings?page=1&limit=10&search=kamal&status=PENDING
```

## Booking Statuses

The supported booking statuses are:

```text
PENDING
CONFIRMED
CANCELLED
COMPLETED
```

## Request Examples

### Register

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

### Login

```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

### Create Service

```json
{
  "title": "Hair Cutting",
  "description": "Professional hair cutting service",
  "duration": 60,
  "price": 2500,
  "isActive": true
}
```

### Create Booking

Replace `serviceId` with the UUID of an existing active service.

```json
{
  "customerName": "Kamal Perera",
  "customerEmail": "kamal@example.com",
  "customerPhone": "0771234567",
  "serviceId": "00000000-0000-0000-0000-000000000000",
  "bookingDate": "2030-01-20",
  "bookingTime": "10:30",
  "notes": "Please call before the appointment"
}
```

### Update Booking Status

```json
{
  "status": "CONFIRMED"
}
```

## Error Response Format

API errors use a consistent response structure:

```json
{
  "statusCode": 400,
  "timestamp": "2026-07-12T12:00:00.000Z",
  "path": "/api/bookings",
  "method": "POST",
  "error": "Bad Request",
  "message": "Booking date cannot be in the past"
}
```

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate a coverage report:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## Assumptions

- Registered users act as administrative users.
- Customers do not require an account to create a booking.
- Service duration is stored in minutes.
- Service prices use a decimal database type.
- Public users can retrieve services so that they can select a service before creating a booking.
- Booking management endpoints require authentication.
- A cancelled time slot may be booked again.
- The application uses the server's local date when validating past booking dates.
- Role-based access control is outside the current assignment scope.

## Future Improvements

- Role-based authorization
- Refresh-token authentication
- Email booking confirmations
- Booking reminders
- Service availability schedules
- Rate limiting
- Audit logging
- Integration and end-to-end test expansion
- Docker and Docker Compose support
- Cloud deployment
- CI/CD pipeline

## Repository

GitHub:

```text
https://github.com/sheronkavinda/bookease-api
```

## License

This project was developed as a backend engineering internship technical assessment.