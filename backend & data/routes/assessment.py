from flask import Blueprint, request, jsonify

from database.db import get_db_connection


# =========================================================
# ASSESSMENT BLUEPRINT
# =========================================================

assessment_bp = Blueprint(
    "assessment",
    __name__,
    url_prefix="/api/assessment"
)


# =========================================================
# CREATE / UPDATE ASSESSMENT
# =========================================================

@assessment_bp.route("/<int:user_id>", methods=["POST"])
def save_assessment(user_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    preferred_domain = data.get("preferred_domain", "")
    work_style = data.get("work_style", "")
    preferred_role = data.get("preferred_role", "")
    weekly_learning_hours = data.get("weekly_learning_hours", 0)
    experience_level = data.get("experience_level", "")
    preferred_learning_mode = data.get("preferred_learning_mode", "")

    connection = get_db_connection()

    try:

        # Check user
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

        # Check existing assessment
        existing = connection.execute(
            """
            SELECT id
            FROM assessments
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchone()

        if existing:

            connection.execute(
                """
                UPDATE assessments
                SET
                    preferred_domain = ?,
                    work_style = ?,
                    preferred_role = ?,
                    weekly_learning_hours = ?,
                    experience_level = ?,
                    preferred_learning_mode = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """,
                (
                    preferred_domain,
                    work_style,
                    preferred_role,
                    weekly_learning_hours,
                    experience_level,
                    preferred_learning_mode,
                    user_id
                )
            )

            message = "Assessment updated successfully"

        else:

            connection.execute(
                """
                INSERT INTO assessments (
                    user_id,
                    preferred_domain,
                    work_style,
                    preferred_role,
                    weekly_learning_hours,
                    experience_level,
                    preferred_learning_mode
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    preferred_domain,
                    work_style,
                    preferred_role,
                    weekly_learning_hours,
                    experience_level,
                    preferred_learning_mode
                )
            )

            message = "Assessment saved successfully"

        connection.commit()

        return jsonify({
            "status": "success",
            "message": message,
            "user_id": user_id
        }), 201

    finally:
        connection.close()


# =========================================================
# GET ASSESSMENT
# =========================================================

@assessment_bp.route("/<int:user_id>", methods=["GET"])
def get_assessment(user_id):

    connection = get_db_connection()

    try:

        assessment = connection.execute(
            """
            SELECT
                a.id,
                a.user_id,
                a.preferred_domain,
                a.work_style,
                a.preferred_role,
                a.weekly_learning_hours,
                a.experience_level,
                a.preferred_learning_mode,
                a.created_at,
                a.updated_at
            FROM assessments a
            WHERE a.user_id = ?
            """,
            (user_id,)
        ).fetchone()

        if assessment is None:
            return jsonify({
                "status": "error",
                "message": "Assessment not found"
            }), 404

        return jsonify({
            "status": "success",
            "assessment": dict(assessment)
        }), 200

    finally:
        connection.close()