# Slot Booking System

A full-stack Slot Booking System featuring:
- React (Vite) + Tailwind CSS + React DatePicker + Axios
- Node + Express + MongoDB (Mongoose)
- Custom transactional block booking logic with atomic rollbacks

---

## Directory Structure

- **Backend**: Contains Express server, database schemas, middleware, controllers, routes, and services.
- **Frontend**: Contains Vite React UI components, page layouts, Tailwind styles, and Axios API configurations.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Connection String (configured in `.env`)

### Setup Backend

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Dependencies are already configured. Ensure you have a `.env` file in the `Backend` directory containing:
   ```env
   PORT = 3000
   MONGO_URI = mongodb+srv://...
   ```

3. Start the server:
   ```bash
   npm start
   ```
   The backend runs on `http://localhost:3000`.

---

### Setup Frontend

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5174` (or `http://localhost:5173`).

---

## Features Built

- **Dynamic Slot Generation**: Automatically splits Morning (09:00 AM - 12:00 PM) and Evening (06:00 PM - 09:00 PM) slots into 30-minute intervals.
- **2-Month Calendar Window**: React DatePicker restricts viewing/booking to the next 2 months.
- **Interactive Slot States**: Green (Available), Red/N/A (Booked), Blue (Selected).
- **Block Booking (Recurring)**: Creates bookings for a range of dates.
- **MongoDB Transactions**: Database transactions commit or roll back block bookings atomically if a collision occurs.
- **Active Booking List**: Displays booked slots with options to view full booking details or delete individual slots.
- **Custom Input Validation**: Simple if-statement validations for booking references, descriptions, dates, and slot availability on both the client and server.