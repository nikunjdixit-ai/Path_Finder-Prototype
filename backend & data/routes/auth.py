from flask import Blueprint, request, jsonify
import hashlib

from database.db import get_db_connection


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


# --------------------------------------------------
# REGISTER
# --------------------------------------------------

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "status": "error",
            "message": "Name, email and password are required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "status": "error",
            "message": "Password must contain at least 6 characters"
        }), 400

    password_hash = hash_password(password)

    connection = get_db_connection()

    try:

        cursor = connection.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
            """,
            (name, email, password_hash)
        )

        connection.commit()

        user_id = cursor.lastrowid

        return jsonify({
            "status": "success",
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "name": name,
                "email": email
            }
        }), 201

    except Exception as error:

        if "UNIQUE constraint failed" in str(error):
            return jsonify({
                "status": "error",
                "message": "Email already registered"
            }), 409

        return jsonify({
            "status": "error",
            "message": "Registration failed"
        }), 500

    finally:
        connection.close()


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    password_hash = hash_password(password)

    connection = get_db_connection()

    try:

        user = connection.execute(
            """
            SELECT id, name, email, password_hash
            FROM users
            WHERE email = ?
            """,
            (email,)
        ).fetchone()

        if user is None:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        if user["password_hash"] != password_hash:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            }
        }), 200

    finally:
        connection.close()