# ============================================================================
# profile.py
# ============================================================================
# PATHLINE PROFILE ROUTES
#
# GET  /api/profile/<user_id>
# POST /api/profile/<user_id>
#
# SQLite stores skills/interests as JSON strings.
# The API returns them back as normal JSON arrays.
# ============================================================================

from flask import Blueprint, jsonify, request
import json

from database.db import get_db_connection


# ============================================================================
# BLUEPRINT
# ============================================================================

profile_bp = Blueprint(
    "profile",
    __name__,
    url_prefix="/api/profile"
)


# ============================================================================
# HELPERS
# ============================================================================

def to_json_string(value):
    """
    Convert a Python list/dict into a JSON string for SQLite.

    Example:
        ["Python", "C", "SQL"]
    becomes:
        '["Python", "C", "SQL"]'
    """

    if value is None:
        return json.dumps([])

    if isinstance(value, (list, dict)):
        return json.dumps(value)

    # If frontend somehow sends a JSON string,
    # keep it valid if possible.
    if isinstance(value, str):
        value = value.strip()

        if not value:
            return json.dumps([])

        try:
            parsed = json.loads(value)

            if isinstance(parsed, (list, dict)):
                return json.dumps(parsed)

        except (json.JSONDecodeError, TypeError):
            pass

        # Allow comma-separated skills:
        # "Python, C, SQL"
        if "," in value:
            items = [
                item.strip()
                for item in value.split(",")
                if item.strip()
            ]

            return json.dumps(items)

        return json.dumps([value])

    return json.dumps([str(value)])


def from_json_string(value):
    """
    Convert SQLite JSON text back into a Python list.
    """

    if value is None:
        return []

    if isinstance(value, list):
        return value

    if isinstance(value, str):

        value = value.strip()

        if not value:
            return []

        try:
            parsed = json.loads(value)

            if isinstance(parsed, list):
                return parsed

            if isinstance(parsed, dict):
                return parsed

        except (json.JSONDecodeError, TypeError):
            pass

        # Fallback for old records stored as comma-separated text.
        if "," in value:

            return [
                item.strip()
                for item in value.split(",")
                if item.strip()
            ]

        return [value]

    return []


# ============================================================================
# GET PROFILE
# ============================================================================
#
# GET /api/profile/<user_id>
#
# Returns:
#
# {
#     "status": "success",
#     "profile": {
#         "id": 1,
#         "user_id": 1,
#         "education": "...",
#         "skills": ["Python", "C"],
#         "interests": ["AI"],
#         "experience": "Beginner",
#         "career_goal": "AI Engineer",
#         "learning_preference": "Mixed"
#     }
# }
# ============================================================================

@profile_bp.route("/<int:user_id>", methods=["GET"])
def get_profile(user_id):

    connection = get_db_connection()

    try:

        # ------------------------------------------------------------
        # Check user
        # ------------------------------------------------------------

        user = connection.execute(
            """
            SELECT
                id,
                name
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

        # ------------------------------------------------------------
        # Get profile
        # ------------------------------------------------------------

        profile = connection.execute(
            """
            SELECT
                id,
                user_id,
                education,
                skills,
                interests,
                experience,
                career_goal,
                learning_preference
            FROM profiles
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchone()

        # ------------------------------------------------------------
        # No profile yet
        # ------------------------------------------------------------

        if profile is None:

            return jsonify({
                "status": "success",
                "profile": {
                    "id": None,
                    "user_id": user_id,
                    "education": "",
                    "skills": [],
                    "interests": [],
                    "experience": "",
                    "career_goal": "",
                    "learning_preference": ""
                }
            }), 200

        # ------------------------------------------------------------
        # Convert sqlite row to dictionary
        # ------------------------------------------------------------

        profile = dict(profile)

        # ------------------------------------------------------------
        # Convert JSON strings back to arrays
        # ------------------------------------------------------------

        profile["skills"] = from_json_string(
            profile.get("skills")
        )

        profile["interests"] = from_json_string(
            profile.get("interests")
        )

        # ------------------------------------------------------------
        # Response
        # ------------------------------------------------------------

        return jsonify({
            "status": "success",
            "profile": profile
        }), 200

    except Exception as error:

        print("GET PROFILE ERROR:", error)

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:

        connection.close()


# ============================================================================
# CREATE / UPDATE PROFILE
# ============================================================================
#
# POST /api/profile/<user_id>
#
# Frontend can send:
#
# {
#     "education": "B.Tech CSE",
#     "skills": ["Python", "C", "SQL"],
#     "interests": ["AI", "Web Development"],
#     "experience": "Beginner",
#     "career_goal": "AI Engineer",
#     "learning_preference": "Mixed"
# }
#
# ============================================================================

@profile_bp.route("/<int:user_id>", methods=["POST"])
def create_profile(user_id):

    connection = get_db_connection()

    try:

        # ------------------------------------------------------------
        # Check user
        # ------------------------------------------------------------

        user = connection.execute(
            """
            SELECT
                id,
                name
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

        # ------------------------------------------------------------
        # Read JSON body
        # ------------------------------------------------------------

        data = request.get_json(silent=True)

        if data is None:
            data = {}

        if not isinstance(data, dict):

            return jsonify({
                "status": "error",
                "message": "Request body must be a JSON object"
            }), 400

        print("------------------------------------")
        print("PROFILE POST")
        print("User ID:", user_id)
        print("Received data:", data)
        print("------------------------------------")

        # ------------------------------------------------------------
        # Read fields
        # ------------------------------------------------------------

        education = (
            data.get("education")
            or ""
        )

        experience = (
            data.get("experience")
            or data.get("experience_level")
            or ""
        )

        career_goal = (
            data.get("career_goal")
            or data.get("goal")
            or data.get("target_role")
            or ""
        )

        learning_preference = (
            data.get("learning_preference")
            or data.get("learningPreference")
            or data.get("learning_style")
            or ""
        )

        # ------------------------------------------------------------
        # Skills
        # ------------------------------------------------------------

        skills = (
            data.get("skills")
            or []
        )

        # ------------------------------------------------------------
        # Interests
        # ------------------------------------------------------------

        interests = (
            data.get("interests")
            or []
        )

        # ------------------------------------------------------------
        # Convert lists to JSON strings
        #
        # THIS FIXES:
        #
        # sqlite3.ProgrammingError:
        # Error binding parameter:
        # type 'list' is not supported
        # ------------------------------------------------------------

        skills_json = to_json_string(skills)

        interests_json = to_json_string(interests)

        # ------------------------------------------------------------
        # Check whether profile already exists
        # ------------------------------------------------------------

        existing_profile = connection.execute(
            """
            SELECT
                id
            FROM profiles
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchone()

        # ============================================================
        # UPDATE EXISTING PROFILE
        # ============================================================

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
                    learning_preference = ?
                WHERE user_id = ?
                """,
                (
                    education,
                    skills_json,
                    interests_json,
                    experience,
                    career_goal,
                    learning_preference,
                    user_id
                )
            )

            action = "updated"

        # ============================================================
        # CREATE NEW PROFILE
        # ============================================================

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
                    skills_json,
                    interests_json,
                    experience,
                    career_goal,
                    learning_preference
                )
            )

            action = "created"

        # ------------------------------------------------------------
        # Save database
        # ------------------------------------------------------------

        connection.commit()

        # ------------------------------------------------------------
        # Get saved profile
        # ------------------------------------------------------------

        saved_profile = connection.execute(
            """
            SELECT
                id,
                user_id,
                education,
                skills,
                interests,
                experience,
                career_goal,
                learning_preference
            FROM profiles
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchone()

        saved_profile = dict(saved_profile)

        # ------------------------------------------------------------
        # Convert JSON strings back to arrays
        # ------------------------------------------------------------

        saved_profile["skills"] = from_json_string(
            saved_profile.get("skills")
        )

        saved_profile["interests"] = from_json_string(
            saved_profile.get("interests")
        )

        # ------------------------------------------------------------
        # Debug
        # ------------------------------------------------------------

        print("Profile successfully", action)
        print("Saved profile:", saved_profile)

        # ------------------------------------------------------------
        # Response
        # ------------------------------------------------------------

        return jsonify({
            "status": "success",
            "message": f"Profile {action} successfully",
            "profile": saved_profile
        }), 200

    except Exception as error:

        connection.rollback()

        print("------------------------------------")
        print("PROFILE POST ERROR")
        print(error)
        print("------------------------------------")

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500

    finally:

        connection.close()