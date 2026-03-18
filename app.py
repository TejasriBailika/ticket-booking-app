from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db import get_db

app = Flask(__name__)
CORS(app)


# 🔥 GET BOOKED SEATS
@app.route('/slots', methods=['GET'])
def get_slots():
    match = request.args.get('match')

    if not match:
        return jsonify({"error": "Match is required"}), 400

    db = get_db()
    if not db:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    try:
        cursor.execute("SELECT seat_number FROM bookings WHERE match_name=%s", (match,))
        rows = cursor.fetchall()
        booked_seats = [r[0] for r in rows]

        return jsonify({"booked_seats": booked_seats})

    finally:
        cursor.close()
        db.close()


# 🔥 BOOK SEATS
@app.route('/book', methods=['POST'])
def book_slot():
    data = request.json

    match = data.get('match')
    seats = data.get('seats')
    name = data.get('user_name')
    email = data.get('user_email')

    if not match or not seats or not name or not email:
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db()
    if not db:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    try:
        for seat in seats:
            cursor.execute(
                "INSERT INTO bookings (match_name, seat_number, user_name, user_email) VALUES (%s,%s,%s,%s)",
                (match, seat, name, email)
            )

        db.commit()
        return jsonify({"message": "Booking successful"})

    except Exception as e:
        db.rollback()
        print("Booking error:", e)  # 🔥 debug log
        return jsonify({"error": "Some seats already booked"}), 400

    finally:
        cursor.close()
        db.close()


# 🔥 GET ALL BOOKINGS
@app.route('/bookings', methods=['GET'])
def get_bookings():
    db = get_db()
    if not db:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM bookings ORDER BY booked_at DESC")
        rows = cursor.fetchall()

        result = {}

        for row in rows:
            key = (row['match_name'], row['user_name'], row['booked_at'])

            if key not in result:
                result[key] = {
                    "match": row['match_name'],
                    "user_name": row['user_name'],
                    "seats": [],
                    "time": str(row['booked_at'])
                }

            result[key]["seats"].append(row['seat_number'])

        return jsonify(list(result.values()))

    finally:
        cursor.close()
        db.close()


# 🔥 SERVE FRONTEND
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)


if __name__ == '__main__':
    app.run(debug=True)