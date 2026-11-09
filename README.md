# StayEase – Airbnb Clone (MERN)

A learning-focused Airbnb-style accommodation booking application built with React, Node.js, Express and MongoDB.

## Features
- User registration and login (JWT + bcrypt)
- Browse and search property listings by location and category
- Create, edit and delete your own listings
- Upload listing images using Multer (stored locally in `server/uploads`)
- Book properties with check-in/check-out dates
- Prevent overlapping bookings for the same property
- View your bookings and host listings
- Responsive layout

## Requirements
- Node.js 18+
- npm
- MongoDB Atlas account or local MongoDB
- VS Code (recommended)

## 1. Configure the backend
```bash
cd server
cp .env.example .env
```
Edit `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.

Install and run:
```bash
npm install
npm run dev
```
The API runs at `http://localhost:5000`.

## 2. Configure the frontend
Open a second terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## MongoDB Atlas quick setup
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Create a database user and password.
3. In Network Access, allow your current IP address.
4. Choose Connect > Drivers and copy the connection string.
5. Replace `<password>` and set the database name to `stayease` in `MONGO_URI`.

## Notes
- This project is an educational clone, not affiliated with Airbnb.
- Payments are intentionally not included.
- Images are uploaded to the backend's local `uploads` folder. For production deployment, use Cloudinary or another object-storage service.
- Never commit `.env` or real credentials to GitHub.
- Before submission, test with two different user accounts and overlapping booking dates.

## Main API routes
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/listings` | Search/list properties |
| GET | `/api/listings/:id` | Listing details |
| POST | `/api/listings` | Create listing (auth) |
| PUT | `/api/listings/:id` | Update own listing (auth) |
| DELETE | `/api/listings/:id` | Delete own listing (auth) |
| POST | `/api/uploads` | Upload image (auth) |
| POST | `/api/bookings` | Create booking (auth) |
| GET | `/api/bookings/mine` | My bookings (auth) |
| GET | `/api/bookings/host` | Bookings for my properties (auth) |
| PATCH | `/api/bookings/:id/cancel` | Cancel own booking (auth) |

## Suggested demo flow
1. Register as a guest.
2. Browse/search listings and open a property.
3. Book a date range.
4. Open My Trips to see the booking.
5. Register/login with another account and create a property.
6. Show the host dashboard and booking management.
