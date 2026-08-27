import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

def load_json(filename):


    file_path = DATA_DIR / filename

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

def load_resources():

    courses = load_json("courses.json")["courses"]
    projects = load_json("projects.json")["projects"]
    assessments = load_json("assessments.json")["assessments"]

    return courses, projects, assessments

def prerequisites_satisfied(resource, current_skills):
    prerequisites = set(resource.get("prerequisites", []))

    return prerequisites.issubset(current_skills)

def get_prerequisite_gaps(resource, current_skills):

    prerequisites = set(resource.get("prerequisites", []))

    return sorted(prerequisites - current_skills)


def calculate_score(resource, missing_skills, current_skills):

    score = 0

    skill = resource.get("skill")

    if skill in missing_skills:
        score += 50

    prerequisites = set(resource.get("prerequisites", []))

    if prerequisites:
        satisfied = prerequisites.intersection(current_skills)

        score += len(satisfied) * 10

    if resource.get("level") == "beginner":
        score += 10
    if resource.get("type") == "course":
        score += 5

    return score

def generate_recommendations(profile, skill_gap_report):

    courses, projects, assessments = load_resources()

    current_skills = set(profile.get("skills", []))

    missing_skills = set(
        skill_gap_report.get("missing_skills", [])
    )

    all_resources = []

    for course in courses:
        all_resources.append(course)

    for project in projects:
        all_resources.append(project)

    for assessment in assessments:
        all_resources.append(assessment)

    recommendations = []

    for resource in all_resources:

        skill = resource.get("skill")

        if skill not in missing_skills:
            continue

        missing_prerequisites = get_prerequisite_gaps(
            resource,
            current_skills
        )

        score = calculate_score(
            resource,
            missing_skills,
            current_skills
        )

        recommendation = {
            "id": resource.get("id"),
            "title": resource.get("title"),
            "skill": skill,
            "level": resource.get("level"),
            "type": resource.get("type"),
            "score": score,
            "prerequisites": resource.get(
                "prerequisites", []
            ),
            "missing_prerequisites": missing_prerequisites,
            "ready_to_start": len(
                missing_prerequisites
            ) == 0
        }

        if "duration_hours" in resource:
            recommendation["duration_hours"] = resource[
                "duration_hours"
            ]

        if "estimated_hours" in resource:
            recommendation["estimated_hours"] = resource[
                "estimated_hours"
            ]

        if "question_count" in resource:
            recommendation["question_count"] = resource[
                "question_count"
            ]

        if "passing_score" in resource:
            recommendation["passing_score"] = resource[
                "passing_score"
            ]

        recommendations.append(recommendation)

    recommendations.sort(
        key=lambda x: (
            not x["ready_to_start"],
            -x["score"]
        )
    )

    return recommendations

def print_recommendations(recommendations):

    print("\n" + "=" * 60)
    print("             PERSONALIZED RECOMMENDATIONS")
    print("=" * 60)

    if not recommendations:
        print("\nNo suitable recommendations found.")
        return

    for index, recommendation in enumerate(
        recommendations,
        start=1
    ):

        print(f"\n{index}. {recommendation['title']}")

        print(
            f"   Type: {recommendation['type']}"
        )

        print(
            f"   Skill: {recommendation['skill']}"
        )

        print(
            f"   Level: {recommendation['level']}"
        )

        print(
            f"   Score: {recommendation['score']}"
        )

        if recommendation["ready_to_start"]:

            print("   Status: ✓ Ready to start")

        else:

            print("   Status: ⚠ Prerequisites required")

            print(
                "   Missing prerequisites: "
                + ", ".join(
                    recommendation[
                        "missing_prerequisites"
                    ]
                )
            )

        if "duration_hours" in recommendation:

            print(
                f"   Duration: "
                f"{recommendation['duration_hours']} hours"
            )

        if "estimated_hours" in recommendation:

            print(
                f"   Estimated time: "
                f"{recommendation['estimated_hours']} hours"
            )

        if "question_count" in recommendation:

            print(
                f"   Questions: "
                f"{recommendation['question_count']}"
            )

    print("\n" + "=" * 60)

if __name__ == "__main__":

    print(
        "\nThis module is designed to be called "
        "from main.py."
    )

    print(
        "It requires a learner profile and "
        "skill-gap report."
    )