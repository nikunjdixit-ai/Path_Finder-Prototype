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


def main():

    print("\n" + "=" * 60)
    print("        PATHFINDER - PERSONALIZED LEARNING AI")
    print("=" * 60)

    user_input = input(
        "\nTell me about yourself, your skills, interests and career goal:\n> "
    )

    print("\n[1/4] Analyzing learner profile...")

    learner_profile = analyze_profile(user_input)

    print("\n--- Learner Profile ---")

    print(f"Goal: {learner_profile['goal']}")
    print(f"Experience: {learner_profile['experience_level']}")
    print(f"Skills: {learner_profile['skills']}")
    print(f"Interests: {learner_profile['interests']}")

    print("\n[2/4] Analyzing skill gaps...")

    skill_gap_report = analyze_skill_gap(
        learner_profile
    )

    print_skill_gap_report(
        skill_gap_report
    )
    print("\n[3/4] Generating personalized recommendations...")

    recommendations = generate_recommendations(
        learner_profile,
        skill_gap_report
    )

    print_recommendations(
        recommendations
    )

    print("\n[4/4] Generating personalized learning path...")

    learning_path = generate_learning_path(
        learner_profile,
        skill_gap_report,
        recommendations
    )

    print_learning_path(
        learning_path
    )

if __name__ == "__main__":
    main()