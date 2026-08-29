from flask import Blueprint, jsonify
import json

from database.db import get_db_connection


# =========================================================
# RECOMMENDATION BLUEPRINT
# =========================================================

recommendation_bp = Blueprint(
    "recommendation",
    __name__,
    url_prefix="/api/recommendations"
)


# =========================================================
# GENERATE AND SAVE RECOMMENDATION
# =========================================================

@recommendation_bp.route("/<int:user_id>", methods=["GET"])
def get_recommendation(user_id):

    connection = get_db_connection()

    try:

        # -------------------------------------------------
        # Get profile + assessment
        # -------------------------------------------------

        data = connection.execute(
            """
            SELECT
                u.id,
                u.name,
                p.education,
                p.skills,
                p.interests,
                p.experience,
                p.career_goal,
                p.learning_preference,

                a.preferred_domain,
                a.work_style,
                a.preferred_role,
                a.weekly_learning_hours,
                a.experience_level,
                a.preferred_learning_mode

            FROM users u

            LEFT JOIN profiles p
                ON u.id = p.user_id

            LEFT JOIN assessments a
                ON u.id = a.user_id

            WHERE u.id = ?
            """,
            (user_id,)
        ).fetchone()

        if data is None:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        data = dict(data)

        # -------------------------------------------------
        # Check profile
        # -------------------------------------------------

        if not data.get("skills") and not data.get("interests"):
            return jsonify({
                "status": "error",
                "message": "Please complete your profile first"
            }), 400

        # -------------------------------------------------
        # Prepare information
        # -------------------------------------------------

        domain = data.get("preferred_domain") or ""
        goal = data.get("career_goal") or ""
        role = data.get("preferred_role") or ""

        combined = (
            domain + " " +
            goal + " " +
            role + " " +
            (data.get("skills") or "") + " " +
            (data.get("interests") or "")
        ).lower()

        # -------------------------------------------------
        # Recommendation
        # -------------------------------------------------

        if (
            "artificial intelligence" in combined
            or "machine learning" in combined
            or "ai engineer" in combined
            or "ml engineer" in combined
        ):

            career = "AI / Machine Learning Engineer"

            required_skills = [
                "Python",
                "Statistics",
                "Machine Learning",
                "Data Structures",
                "Deep Learning",
                "SQL"
            ]

        elif (
            "web development" in combined
            or "frontend" in combined
            or "backend" in combined
            or "react" in combined
        ):

            career = "Full Stack Developer"

            required_skills = [
                "HTML",
                "CSS",
                "JavaScript",
                "React",
                "Node.js",
                "SQL"
            ]

        elif (
            "data science" in combined
            or "data analyst" in combined
            or "analytics" in combined
        ):

            career = "Data Scientist / Data Analyst"

            required_skills = [
                "Python",
                "Statistics",
                "SQL",
                "Pandas",
                "Data Visualization",
                "Machine Learning"
            ]

        elif (
            "cyber security" in combined
            or "cybersecurity" in combined
            or "security" in combined
        ):

            career = "Cybersecurity Analyst"

            required_skills = [
                "Networking",
                "Linux",
                "Python",
                "Cybersecurity Fundamentals",
                "Cloud Security"
            ]

        else:

            career = role or goal or "Software Engineer"

            required_skills = [
                "Programming Fundamentals",
                "Data Structures",
                "Algorithms",
                "Git",
                "Problem Solving",
                "Database Fundamentals"
            ]

        # -------------------------------------------------
        # Roadmap
        # -------------------------------------------------

        roadmap = [
            {
                "stage": 1,
                "title": "Foundation",
                "duration": "4-6 weeks",
                "focus": required_skills[:2]
            },
            {
                "stage": 2,
                "title": "Core Skills",
                "duration": "6-8 weeks",
                "focus": required_skills[2:4]
            },
            {
                "stage": 3,
                "title": "Advanced Skills",
                "duration": "6-8 weeks",
                "focus": required_skills[4:]
            },
            {
                "stage": 4,
                "title": "Projects & Portfolio",
                "duration": "4-6 weeks",
                "focus": [
                    "Build projects",
                    "Create GitHub portfolio",
                    "Practice interviews"
                ]
            }
        ]

        reason = (
            "Recommendation generated using your skills, "
            "interests, career goal and assessment preferences."
        )

        # -------------------------------------------------
        # Convert lists to JSON strings for SQLite
        # -------------------------------------------------

        skills_json = json.dumps(required_skills)
        roadmap_json = json.dumps(roadmap)

        # -------------------------------------------------
        # Check existing recommendation
        # -------------------------------------------------

        existing = connection.execute(
            """
            SELECT id
            FROM recommendations
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchone()

        if existing:

            connection.execute(
                """
                UPDATE recommendations
                SET
                    career = ?,
                    reason = ?,
                    required_skills = ?,
                    roadmap = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """,
                (
                    career,
                    reason,
                    skills_json,
                    roadmap_json,
                    user_id
                )
            )

        else:

            connection.execute(
                """
                INSERT INTO recommendations (
                    user_id,
                    career,
                    reason,
                    required_skills,
                    roadmap
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    career,
                    reason,
                    skills_json,
                    roadmap_json
                )
            )

        connection.commit()

        # -------------------------------------------------
        # Return response
        # -------------------------------------------------

        return jsonify({
            "status": "success",

            "user": {
                "id": data["id"],
                "name": data["name"]
            },

            "recommendation": {
                "career": career,
                "reason": reason,
                "required_skills": required_skills,
                "roadmap": roadmap
            },

            "saved": True

        }), 200

    finally:
        connection.close()


# =========================================================
# GET SAVED RECOMMENDATION
# =========================================================

@recommendation_bp.route("/<int:user_id>/saved", methods=["GET"])
def get_saved_recommendation(user_id):

    connection = get_db_connection()

    try:

        recommendation = connection.execute(
            """
            SELECT
                id,
                user_id,
                career,
                reason,
                required_skills,
                roadmap,
                created_at,
                updated_at
            FROM recommendations
            WHERE user_id = ?
            """,
            (user_id,)
        ).fetchone()

        if recommendation is None:
            return jsonify({
                "status": "error",
                "message": "No recommendation found"
            }), 404

        recommendation = dict(recommendation)

        return jsonify({
            "status": "success",
            "recommendation": {
                "id": recommendation["id"],
                "user_id": recommendation["user_id"],
                "career": recommendation["career"],
                "reason": recommendation["reason"],
                "required_skills": json.loads(
                    recommendation["required_skills"]
                ),
                "roadmap": json.loads(
                    recommendation["roadmap"]
                ),
                "created_at": recommendation["created_at"],
                "updated_at": recommendation["updated_at"]
            }
        }), 200

    finally:
        connection.close()