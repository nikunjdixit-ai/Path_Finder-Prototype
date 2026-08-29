from flask import Blueprint, request, jsonify

from database.db import get_db_connection


# =========================================================
# PROGRESS BLUEPRINT
# =========================================================

progress_bp = Blueprint(
    "progress",
    __name__,
    url_prefix="/api/progress"
)


# =========================================================
# GET USER PROGRESS
# =========================================================

@progress_bp.route("/<int:user_id>", methods=["GET"])
def get_progress(user_id):

    connection = get_db_connection()

    try:

        progress = connection.execute(
            """
            SELECT
                id,
                user_id,
                skill,
                status,
                progress_percent,
                created_at,
                updated_at
            FROM progress
            WHERE user_id = ?
            ORDER BY id
            """,
            (user_id,)
        ).fetchall()

        return jsonify({
            "status": "success",
            "user_id": user_id,
            "progress": [dict(item) for item in progress]
        }), 200

    finally:
        connection.close()


# =========================================================
# ADD / UPDATE SKILL PROGRESS
# =========================================================

@progress_bp.route("/<int:user_id>", methods=["POST"])
def update_progress(user_id):

    data = request.get_json()

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    skill = data.get("skill")
    status = data.get("status", "not_started")
    progress_percent = data.get("progress_percent", 0)

    if not skill:

        return jsonify({
            "status": "error",
            "message": "Skill is required"
        }), 400

    # Validate percentage

    try:
        progress_percent = int(progress_percent)
    except (TypeError, ValueError):

        return jsonify({
            "status": "error",
            "message": "Progress must be a number"
        }), 400

    if progress_percent < 0 or progress_percent > 100:

        return jsonify({
            "status": "error",
            "message": "Progress must be between 0 and 100"
        }), 400

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

        # Check existing skill

        existing = connection.execute(
            """
            SELECT id
            FROM progress
            WHERE user_id = ?
            AND skill = ?
            """,
            (user_id, skill)
        ).fetchone()

        if existing:

            connection.execute(
                """
                UPDATE progress
                SET
                    status = ?,
                    progress_percent = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                AND skill = ?
                """,
                (
                    status,
                    progress_percent,
                    user_id,
                    skill
                )
            )

            message = "Progress updated successfully"

        else:

            connection.execute(
                """
                INSERT INTO progress (
                    user_id,
                    skill,
                    status,
                    progress_percent
                )
                VALUES (?, ?, ?, ?)
                """,
                (
                    user_id,
                    skill,
                    status,
                    progress_percent
                )
            )

            message = "Progress added successfully"

        connection.commit()

        return jsonify({
            "status": "success",
            "message": message,
            "user_id": user_id,
            "skill": skill,
            "progress_percent": progress_percent
        }), 200

    finally:
        connection.close()