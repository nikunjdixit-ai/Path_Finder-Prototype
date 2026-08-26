import json
from pathlib import Path
from .profile_analyzer import analyze_profile

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def load_json(filename):

    file_path = DATA_DIR / filename

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

def get_required_skills(goal):

    careers_data = load_json("careers.json")

    career = careers_data["careers"].get(goal)

    if not career:
        return []

    return career["required_skills"]

def get_prerequisites(skill_id, skills_data):

    prerequisites = set()

    def collect(skill):

        skill_info = skills_data["skills"].get(skill)

        if not skill_info:
            return

        for prerequisite in skill_info.get("prerequisites", []):

            if prerequisite not in prerequisites:
                prerequisites.add(prerequisite)
                collect(prerequisite)

    collect(skill_id)

    return prerequisites

def analyze_skill_gap(profile):

    skills_data = load_json("skills.json")

    goal = profile.get("goal")
    current_skills = set(profile.get("skills", []))

    if not goal:
        return {
            "goal": None,
            "message": "No career goal detected.",
            "current_skills": sorted(current_skills),
            "required_skills": [],
            "missing_skills": [],
            "known_skills": [],
            "prerequisite_gaps": []
        }

    required_skills = get_required_skills(goal)

    required_skill_set = set(required_skills)
    known_skills = current_skills.intersection(required_skill_set)
    missing_skills = required_skill_set - current_skills

    prerequisite_gaps = set()

    for skill in missing_skills:

        prerequisites = get_prerequisites(
            skill,
            skills_data
        )

        for prerequisite in prerequisites:

            if prerequisite not in current_skills:
                prerequisite_gaps.add(prerequisite)

    beginner_skills = []
    intermediate_skills = []
    advanced_skills = []

    for skill in missing_skills:

        skill_info = skills_data["skills"].get(skill)

        if not skill_info:
            continue

        difficulty = skill_info.get("difficulty")

        if difficulty == "beginner":
            beginner_skills.append(skill)

        elif difficulty == "intermediate":
            intermediate_skills.append(skill)

        elif difficulty == "advanced":
            advanced_skills.append(skill)

    return {
        "goal": goal,
        "current_skills": sorted(current_skills),
        "required_skills": sorted(required_skill_set),
        "known_skills": sorted(known_skills),
        "missing_skills": sorted(missing_skills),
        "prerequisite_gaps": sorted(prerequisite_gaps),
        "missing_by_level": {
            "beginner": sorted(beginner_skills),
            "intermediate": sorted(intermediate_skills),
            "advanced": sorted(advanced_skills)
        },
        "skill_gap_count": len(missing_skills)
    }

def print_skill_gap_report(report):

    print("\n" + "=" * 55)
    print("              SKILL GAP ANALYSIS")
    print("=" * 55)

    print(f"\nCareer Goal: {report['goal']}")

    print("\nCurrent Skills:")

    if report["current_skills"]:

        for skill in report["current_skills"]:
            print(f"  ✓ {skill}")

    else:
        print("  None detected")

    print("\nRequired Skills:")

    for skill in report["required_skills"]:
        print(f"  • {skill}")

    print("\nKnown Required Skills:")

    if report["known_skills"]:

        for skill in report["known_skills"]:
            print(f"  ✓ {skill}")

    else:
        print("  None")

    print("\nMissing Skills:")

    if report["missing_skills"]:

        for skill in report["missing_skills"]:
            print(f"  ✗ {skill}")

    else:
        print("  No skill gaps!")

    print("\nPrerequisite Gaps:")

    if report["prerequisite_gaps"]:

        for skill in report["prerequisite_gaps"]:
            print(f"  → {skill}")

    else:
        print("  None")

    print("\nMissing Skills by Difficulty:")

    for level, skills in report["missing_by_level"].items():

        print(f"\n  {level.capitalize()}:")

        if skills:

            for skill in skills:
                print(f"    • {skill}")

        else:
            print("    None")

    print(f"\nTotal Skill Gaps: {report['skill_gap_count']}")

    print("\n" + "=" * 55)

