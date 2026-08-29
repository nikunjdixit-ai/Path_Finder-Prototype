from flask import Blueprint, request, jsonify

from database.db import get_db_connection


# =========================================================
# PROFILE BLUEPRINT
# =========================================================

profile_bp = Blueprint(
    "profile",
    __name__,
    url_prefix="/api/profile"
)


# =========================================================
# CREATE / UPDATE PROFILE
# =========================================================

@profile_bp.route("/<int:user_id>", methods=["POST"])
def create_profile(user_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    education = data.get("education", "")
    skills = data.get("skills", "")
    interests = data.get("interests", "")
    experience = data.get("experience", "")
    career_goal = data.get("career_goal", "")
    learning_preference = data.get("learning_preference", "")

    connection = get_db_connection()

    try:

        # Check whether user exists
        user = connection.execute(
            """
            SELECT id
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        ).fetchone()

        if user is None:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        # Check whether profile already exists
        existing_profile = connection.execute(
            """
            SELECT id
            FROM profiles
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchone()

        # Update existing profile
        if existing_profile:

            connection.execute(
                """
                UPDATE profiles
                SET
                    education = ?,
                    skills = ?,
                    interests = ?,
                    experience = ?,
                    career_goal = ?,
                    learning_preference = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """,
                (
                    education,
                    skills,
                    interests,
                    experience,
                    career_goal,
                    learning_preference,
                    user_id
                )
            )

            message = "Profile updated successfully"

        # Create new profile
        else:

            connection.execute(
                """
                INSERT INTO profiles (
                    user_id,
                    education,
                    skills,
                    interests,
                    experience,
                    career_goal,
                    learning_preference
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    education,
                    skills,
                    interests,
                    experience,
                    career_goal,
                    learning_preference
                )
            )

            message = "Profile created successfully"

        connection.commit()

        return jsonify({
            "status": "success",
            "message": message,
            "user_id": user_id
        }), 201

    finally:
        connection.close()


# =========================================================
# GET PROFILE
# =========================================================

@profile_bp.route("/<int:user_id>", methods=["GET"])
def get_profile(user_id):

    connection = get_db_connection()

    try:

        profile = connection.execute(
            """
            SELECT
                p.id,
                p.user_id,
                u.name,
                u.email,
                p.education,
                p.skills,
                p.interests,
                p.experience,
                p.career_goal,
                p.learning_preference,
                p.created_at,
                p.updated_at
            FROM profiles p
            JOIN users u
                ON p.user_id = u.id
            WHERE p.user_id = ?
            """,
            (user_id,)
        ).fetchone()

        if profile is None:
            return jsonify({
                "status": "error",
                "message": "Profile not found"
            }), 404

        return jsonify({
            "status": "success",
            "profile": dict(profile)
        }), 200

    finally:
        connection.close()