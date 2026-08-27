from ai.profile_analyzer import analyze_profile

from ai.skill_gap_analyzer import (
    analyze_skill_gap,
    print_skill_gap_report
)

from ai.recommender import (
    generate_recommendations,
    print_recommendations
)

from ai.path_generator import (
    generate_learning_path,
    print_learning_path
)

from ai.explanation_engine import (
    explain_recommendations,
    print_explanations
)

from ai.feedback_adapter import (
    process_feedback,
    print_feedback_adaptation
)


def main():

    print("\n" + "=" * 60)
    print("        PATHFINDER - PERSONALIZED LEARNING AI")
    print("=" * 60)

    user_input = input(
        "\nTell me about yourself, "
        "your skills, interests and career goal:\n> "
    )

    print("\n[1/6] Analyzing learner profile...")

    learner_profile = analyze_profile(
        user_input
    )

    print("\n--- Learner Profile ---")

    print(
        f"Goal: "
        f"{learner_profile['goal']}"
    )

    print(
        f"Experience: "
        f"{learner_profile['experience_level']}"
    )

    print(
        f"Skills: "
        f"{learner_profile['skills']}"
    )

    print(
        f"Interests: "
        f"{learner_profile['interests']}"
    )

    print("\n[2/6] Analyzing skill gaps...")

    skill_gap_report = analyze_skill_gap(
        learner_profile
    )

    print_skill_gap_report(
        skill_gap_report
    )

    print(
        "\n[3/6] Generating personalized recommendations..."
    )

    recommendations = generate_recommendations(
        learner_profile,
        skill_gap_report
    )

    print_recommendations(
        recommendations
    )

    print(
        "\n[4/6] Generating personalized learning path..."
    )

    learning_path = generate_learning_path(
        learner_profile,
        skill_gap_report,
        recommendations
    )

    print_learning_path(
        learning_path
    )

    print(
        "\n[5/6] Explaining recommendations..."
    )

    explained_recommendations = (
        explain_recommendations(
            learner_profile,
            skill_gap_report,
            recommendations
        )
    )

    print_explanations(
        explained_recommendations
    )

    print(
        "\n[6/6] Learner Feedback & Adaptation"
    )

    feedback = input(
        "\nHow are you finding your learning path?\n> "
    )

    feedback_result = process_feedback(
        feedback=feedback,
        learning_path=learning_path,
        current_skills=learner_profile["skills"],
        completed_skills=[]
    )

    print_feedback_adaptation(
        feedback_result
    )


if __name__ == "__main__":

    main()