
def generate_learning_path(
    learner_profile,
    skill_gap_report,
    recommendations
):

    current_skills = set(
        learner_profile.get("skills", [])
    )

    missing_skills = set(
        skill_gap_report.get("missing_skills", [])
    )

    remaining_skills = set(missing_skills)

    learning_path = []

    milestone_number = 1

    while remaining_skills:

        available_resources = []

        for resource in recommendations:

            skill = resource.get("skill")

            if skill not in remaining_skills:
                continue

            prerequisites = set(
                resource.get("prerequisites", [])
            )
            if prerequisites.issubset(current_skills):
                available_resources.append(resource)
        if not available_resources:

            fallback_resources = [
                resource
                for resource in recommendations
                if resource.get("skill") in remaining_skills
            ]

            if not fallback_resources:
                break

            fallback_resources.sort(
                key=lambda resource: len(
                    resource.get("prerequisites", [])
                )
            )

            available_resources = [
                fallback_resources[0]
            ]

        available_resources.sort(
            key=lambda resource: resource.get(
                "score", 0
            ),
            reverse=True
        )

        selected = available_resources[0]

        skill = selected.get("skill")

        milestone = {
            "milestone": milestone_number,
            "title": selected.get("title"),
            "skill": skill,
            "type": selected.get("type"),
            "level": selected.get("level"),
            "prerequisites": selected.get(
                "prerequisites", []
            ),
            "estimated_time": (
                selected.get("duration_hours")
                or selected.get("estimated_hours")
            )
        }

        learning_path.append(milestone)
        current_skills.add(skill)

        remaining_skills.discard(skill)

        milestone_number += 1

    return learning_path

def print_learning_path(learning_path):

    print("\n" + "=" * 60)
    print("             PERSONALIZED LEARNING PATH")
    print("=" * 60)

    if not learning_path:
        print("\nNo learning path could be generated.")
        return

    for milestone in learning_path:

        print(
            f"\nMilestone {milestone['milestone']}"
        )

        print(
            f"  → {milestone['title']}"
        )

        print(
            f"    Skill: {milestone['skill']}"
        )

        print(
            f"    Type: {milestone['type']}"
        )

        print(
            f"    Level: {milestone['level']}"
        )

        if milestone["prerequisites"]:

            print(
                "    Prerequisites: "
                + ", ".join(
                    milestone["prerequisites"]
                )
            )

        if milestone["estimated_time"]:

            print(
                f"    Estimated Time: "
                f"{milestone['estimated_time']} hours"
            )

        print("    ✓ Recommended next step")

    print("\n" + "=" * 60)