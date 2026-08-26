import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def load_json(filename):
    file_path = DATA_DIR / filename

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def normalize_text(text):
    return re.sub(r"\s+", " ", text.lower().strip())


def detect_goal(user_input, careers):
    text = normalize_text(user_input)
    goal_keywords = {
        "ai_engineer": [
            "ai engineer",
            "artificial intelligence engineer",
            "ai developer"
        ],
        "machine_learning_engineer": [
            "machine learning engineer",
            "ml engineer",
            "machine learning developer"
        ],
        "data_scientist": [
            "data scientist",
            "data science"
        ],
        "data_analyst": [
            "data analyst",
            "data analysis"
        ],
        "full_stack_developer": [
            "full stack developer",
            "full stack",
            "fullstack developer"
        ],
        "frontend_developer": [
            "frontend developer",
            "front end developer",
            "frontend"
        ],
        "backend_developer": [
            "backend developer",
            "back end developer",
            "backend"
        ],
        "cybersecurity_analyst": [
            "cybersecurity analyst",
            "cyber security analyst",
            "cybersecurity"
        ],
        "cloud_engineer": [
            "cloud engineer",
            "cloud computing"
        ],
        "devops_engineer": [
            "devops engineer",
            "devops"
        ]
    }

    for career_id, keywords in goal_keywords.items():
        for keyword in keywords:
            if keyword in text:
                return career_id

    return None

def detect_experience_level(user_input):

    text = normalize_text(user_input)

    beginner_keywords = [
        "beginner",
        "new to",
        "starting",
        "start learning",
        "no experience",
        "don't know",
        "do not know",
        "fresher"
    ]

    advanced_keywords = [
        "advanced",
        "experienced",
        "professional",
        "expert",
        "working as",
        "years of experience"
    ]

    intermediate_keywords = [
        "intermediate",
        "some experience",
        "familiar with",
        "know the basics",
        "comfortable with"
    ]

    if any(keyword in text for keyword in advanced_keywords):
        return "advanced"

    if any(keyword in text for keyword in intermediate_keywords):
        return "intermediate"

    if any(keyword in text for keyword in beginner_keywords):
        return "beginner"
    return "beginner"


def detect_skills(user_input, skills_data):

    text = normalize_text(user_input)

    detected_skills = []

    for skill_id, skill_info in skills_data["skills"].items():

        skill_name = normalize_text(skill_info["name"])

        if skill_name in text:
            detected_skills.append(skill_id)
            continue

        if skill_id.replace("_", " ") in text:
            detected_skills.append(skill_id)

    return detected_skills


def detect_interests(user_input):

    text = normalize_text(user_input)

    interests = []

    interest_keywords = {
        "artificial_intelligence": [
            "ai",
            "artificial intelligence",
            "machine learning",
            "deep learning"
        ],
        "data_science": [
            "data science",
            "data analysis",
            "analytics"
        ],
        "web_development": [
            "web development",
            "frontend",
            "backend",
            "full stack"
        ],
        "cybersecurity": [
            "cybersecurity",
            "cyber security",
            "ethical hacking",
            "network security"
        ],
        "cloud": [
            "cloud",
            "cloud computing"
        ],
        "devops": [
            "devops",
            "deployment",
            "ci/cd"
        ]
    }

    for interest, keywords in interest_keywords.items():
        if any(keyword in text for keyword in keywords):
            interests.append(interest)

    return interests


def analyze_profile(user_input):
    careers_data = load_json("careers.json")
    skills_data = load_json("skills.json")

    profile = {
        "goal": detect_goal(user_input, careers_data),
        "experience_level": detect_experience_level(user_input),
        "skills": detect_skills(user_input, skills_data),
        "interests": detect_interests(user_input)
    }

    return profile
if __name__ == "__main__":

    user_input = input(
        "\nTell me about your learning goal, experience and skills:\n> "
    )

    profile = analyze_profile(user_input)

    print("\n--- Learner Profile ---")
    print(json.dumps(profile, indent=4))