# IPL Ticket Booking Web Application

A full-stack web application that allows users to view, select, and book seats for IPL matches. The application ensures no double-booking and provides a real-time view of available and booked seats.

---

## 🔥 Features

- View all upcoming IPL matches
- Interactive seat map for each match
- Book multiple seats at once
- Prevent double booking (seat already taken)
- View all past bookings
- Responsive and visually appealing UI

---

## 🛠 Technologies Used

| Layer      | Technology |
|------------|------------|
| Backend    | Python, Flask |
| Frontend   | HTML, CSS, JavaScript |
| Database   | MySQL |
| API        | REST endpoints (`/slots`, `/book`, `/bookings`) |
| Others     | Flask-CORS (for frontend-backend communication) |

---




---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/TejasriBailika/ticket-booking-app.git
cd ticket-booking-app


2. Install dependencies
pip install -r requirements.txt

This will install:

Flask

Flask-CORS

mysql-connector-python

3. Setup MySQL Database

Open MySQL Workbench or your terminal.

Create a new database:

CREATE DATABASE slot_booking;
USE slot_booking;

Create the bookings table:

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_name VARCHAR(255),
    seat_number VARCHAR(10),
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
4. Configure Database Connection

Edit db.py and update your MySQL credentials:

import mysql.connector

def get_db():
    return mysql.connector.connect(
        host="localhost",        # MySQL host
        user="YOUR_USERNAME",    # Your MySQL username
        password="YOUR_PASSWORD",# Your MySQL password
        database="slot_booking"  # Database name
    )

Make sure your MySQL server is running.

5. Run the Application
python app.py

Open your browser and go to:

http://127.0.0.1:5000/

