from flask import Flask, jsonify
from flask_cors import CORS

from database.db import get_db_connection, DATABASE_PATH

from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.assessment import assessment_bp
from routes.recommendation import recommendation_bp
from routes.progress import progress_bp


# =========================================================
# CREATE FLASK APPLICATION
# =========================================================

app = Flask(__name__)

# Allow React frontend to communicate with Flask
CORS(app)


# =========================================================
# REGISTER API BLUEPRINTS
# =========================================================

app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(assessment_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(progress_bp)


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return jsonify({
        "message": "PathFinder Backend is running!",
        "status": "success"
    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "PathFinder Backend"
    })


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

@app.route("/api/database", methods=["GET"])
def database_test():

    connection = get_db_connection()

    try:

        # =================================================
        # USERS TABLE
        # =================================================

        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # =================================================
        # PROFILES TABLE
        # =================================================

        connection.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                user_id INTEGER NOT NULL UNIQUE,

                education TEXT,
                skills TEXT,
                interests TEXT,
                experience TEXT,
                career_goal TEXT,
                learning_preference TEXT,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        # =================================================
        # ASSESSMENTS TABLE
        # =================================================

        connection.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                user_id INTEGER NOT NULL UNIQUE,

                preferred_domain TEXT,
                work_style TEXT,
                preferred_role TEXT,
                weekly_learning_hours INTEGER,
                experience_level TEXT,
                preferred_learning_mode TEXT,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        # =================================================
        # RECOMMENDATIONS TABLE
        # =================================================

        connection.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                user_id INTEGER NOT NULL UNIQUE,

                career TEXT NOT NULL,
                reason TEXT,
                required_skills TEXT,
                roadmap TEXT,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        # =================================================
        # PROGRESS TABLE
        # =================================================

        connection.execute("""
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                user_id INTEGER NOT NULL,

                skill TEXT NOT NULL,
                status TEXT DEFAULT 'not_started',
                progress_percent INTEGER DEFAULT 0,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                UNIQUE(user_id, skill),

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Database initialized successfully!",
            "tables": [
                "users",
                "profiles",
                "assessments",
                "recommendations",
                "progress"
            ],
            "database": str(DATABASE_PATH)
        }), 200

    except Exception as error:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Database initialization failed",
            "error": str(error)
        }), 500

    finally:
        connection.close()


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )