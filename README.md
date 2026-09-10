# Murph Detail
A full stack application detailing booking platform built for a real detailing business. Customers can browse services, view vehicle-specific pricing, select available appointment times, and book detailing services online.
The application also includes a protected admin dashboard for managing appointments and viewing customer booking information.

## Live Website 

https://murph-detail-app.vercel.app

## Features 

### Customer Booking 
- Browse available detailing services
- Vehicle-specific pricing for Sedan, SUV, and Truck
- Service-specific appointment durations
- Real-Time appointment availability
- Prevents overlapping appointments
- Prevents booking past dates and times
- Automatically respects business hours
- Cancelled appointments automatically reopen their time slots
- Responsive booking experience for desktop and mobile

### Admin Dashboard
- Password-protected admin login
- View upcoming and previous appointments
- View customer contact information
- View vehicle, services, price, date, and time information
- Update appointment status to Pending, Completed, or Cancelled
- Protected admin API endpoints
- Responsive admin interface

## Tech Stack 

### Frontend 
- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend 
- Python
- FastAPI
- SqlAlchemy
- Uvicorn

### Database
- PostgreSQL

### Deployment
- Vercel - frontend hosting
- Render - FastAPI backend and PostSQL databse

### Development Tools 
- Git
- Github
- Visual Studio Code
- FastAPI Swagger UI

## How It Works

Murph Detail uses a three-tier full-stack architecture:

1.) React frontend - Customers interact with the React application to select their vehicle type, service, appointment date, and available time.
2.) FastAPI backend - The frontend communicates with a REST API built with FastAPI. The backend handles customer creation, vehicles, services, pricing, appointment validation, business hours, overlap detection, and admin operations.
3.) PostgreSQL database - PostgreSQL stores customers, vehicles, services, vehicle-specific service pricing, and appointments.

### Booking Flow

Customer selects a service and time
- React sends the booking request to FastAPI
- FastAPI validates the request and checks for appointment conflicts
- The appointment is stored in PostgreSQL
- The booking appears in the protected admin dashboard

### Admin flow 
- FastAPI validates the credentials
- Admin receives authorization to access protected endpoints
- Dashboard loads appointment, customer, and vehicle data
- Admin can update appointment statuses
  
## Database Structure

The application uses PostgreSQL with SQLAlchemy ORM models to manage relational data.

### Customers
Stores customer information used for bookings:
- Customer ID
- First name
- Last name
- Email
- Phone number

### Vehicles
Stores vehicles associated with customers:
- Vehicle ID
- Customer ID
- Vehicle type: Sedan, SUV, or Truck

### Services
Stores the detailing services offered by the business:
- Service ID
- Service name
- Description
- Base duration information

### Service Prices
Connects services with vehicle-specific pricing and duration:
- Service ID
- Vehicle type
- Price
- Duration

This allows the same detailing service to have different prices and appointment lengths depending on the customer's vehicle type.

### Appointments
Stores customer bookings:
- Appointment ID
- Customer ID
- Vehicle ID
- Service ID
- Appointment date
- Appointment time
- Booking price
- Status
- Notes
- Creation timestamp

Appointments are connected to customers, vehicles, and services through relational database keys.

## Technical Highlights

Some of the main technical challenges addressed in this project include:

- Designing a relational PostgreSQL database for customers, vehicles, services, pricing, and appointments
- Building REST API endpoints with FastAPI and SQLAlchemy
- Implementing vehicle-specific service pricing and durations
- Preventing overlapping appointments based on service duration
- Enforcing business hours and preventing bookings in the past
- Reopening appointment availability when bookings are cancelled
- Building a responsive React booking interface
- Creating a protected admin dashboard for managing appointments
- Securing sensitive admin API operations
- Deploying the frontend, backend, and PostgreSQL database as a production application
