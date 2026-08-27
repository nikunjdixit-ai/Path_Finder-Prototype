
def generate_explanation(
    learner_profile,
    skill_gap_report,
    recommendation
):

    goal = learner_profile.get(
        "goal",
        "your career goal"
    )

    current_skills = set(
        learner_profile.get("skills", [])
    )

    missing_skills = set(
        skill_gap_report.get("missing_skills", [])
    )

    resource_title = recommendation.get(
        "title",
        "this resource"
    )

    resource_skill = recommendation.get(
        "skill"
    )

    resource_type = recommendation.get(
        "type",
        "resource"
    )

    prerequisites = recommendation.get(
        "prerequisites",
        []
    )

    missing_prerequisites = recommendation.get(
        "missing_prerequisites",
        []
    )

    reasons = []

    reasons.append(
        f"You want to become a {goal.replace('_', ' ')}."
    )


    if resource_skill in missing_skills:

        reasons.append(
            f"{resource_skill.replace('_', ' ').title()} "
        )

    if missing_prerequisites:

        missing_text = ", ".join(
            skill.replace("_", " ")
            for skill in missing_prerequisites
        )

        reasons.append(
            f"Before starting this {resource_type}, "
            f"you should build: {missing_text}."
        )

    elif prerequisites:

        reasons.append(
            "You already have the prerequisites "
            "needed to start this resource."
        )

    if current_skills:

        skills_text = ", ".join(
            skill.replace("_", " ")
            for skill in sorted(current_skills)
        )

        reasons.append(
            f"Your current skills include {skills_text}, "
            "which were considered while generating "
            "your recommendations."
        )

    explanation = (
        f"{resource_title} was recommended because:\n"
        + "\n".join(
            f"  • {reason}"
            for reason in reasons
        )
    )

    return explanation

def explain_recommendations(
    learner_profile,
    skill_gap_report,
    recommendations
):

    explained_recommendations = []

    for recommendation in recommendations:

        explanation = generate_explanation(
            learner_profile,
            skill_gap_report,
            recommendation
        )

        updated_recommendation = recommendation.copy()

        updated_recommendation[
            "explanation"
        ] = explanation

        explained_recommendations.append(
            updated_recommendation
        )

    return explained_recommendations

def print_explanations(recommendations):

    print("\n" + "=" * 60)
    print("              WHY THESE WERE RECOMMENDED")
    print("=" * 60)

    if not recommendations:

        print("\nNo explanations available.")
        return

    for index, recommendation in enumerate(
        recommendations,
        start=1
    ):

        print(
            f"\n{index}. "
            f"{recommendation.get('title')}"
        )

        print(
            recommendation.get(
                "explanation",
                "No explanation available."
            )
        )

    print("\n" + "=" * 60)