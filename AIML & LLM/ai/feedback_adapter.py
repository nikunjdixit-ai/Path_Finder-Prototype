
def analyze_feedback(feedback):

    text = feedback.lower().strip()

    result = {
        "feedback": feedback,
        "sentiment": "neutral",
        "difficulty": "normal",
        "action": "continue"
    }

    positive_keywords = [
        "easy",
        "good",
        "simple",
        "understand",
        "understood",
        "comfortable",
        "confident",
        "interesting",
        "helpful"
    ]

    negative_keywords = [
        "hard",
        "difficult",
        "confusing",
        "confused",
        "struggle",
        "struggling",
        "don't understand",
        "do not understand",
        "too difficult"
    ]


    if any(
        keyword in text
        for keyword in positive_keywords
    ):
        result["sentiment"] = "positive"

    elif any(
        keyword in text
        for keyword in negative_keywords
    ):
        result["sentiment"] = "negative"

    if any(
        keyword in text
        for keyword in [
            "too easy",
            "very easy",
            "too simple",
            "boring"
        ]
    ):
        result["difficulty"] = "too_easy"
        result["action"] = "increase_difficulty"

    elif any(
        keyword in text
        for keyword in [
            "too hard",
            "very difficult",
            "extremely difficult",
            "can't understand",
            "cannot understand"
        ]
    ):
        result["difficulty"] = "too_hard"
        result["action"] = "decrease_difficulty"

    elif result["sentiment"] == "negative":
        result["difficulty"] = "challenging"
        result["action"] = "provide_support"

    elif result["sentiment"] == "positive":
        result["action"] = "continue"

    return result

def adapt_learning_path(
    learning_path,
    feedback_analysis
):

    action = feedback_analysis.get(
        "action",
        "continue"
    )

    adapted_path = list(learning_path)

    if action == "increase_difficulty":

        adaptation_message = (
            "The learner is finding the current "
            "content easy. More advanced resources "
            "and challenging projects are recommended."
        )

        adjustment = "increase_difficulty"

    elif action == "decrease_difficulty":

        adaptation_message = (
            "The learner is finding the current "
            "content difficult. Beginner-level "
            "resources, prerequisites and additional "
            "practice are recommended."
        )

        adjustment = "decrease_difficulty"

    elif action == "provide_support":

        adaptation_message = (
            "The learner is facing difficulty. "
            "Additional explanations, practice "
            "resources and prerequisite learning "
            "should be provided."
        )

        adjustment = "provide_support"

    else:

        adaptation_message = (
            "The learner is comfortable with the "
            "current learning path. The existing "
            "path can continue."
        )

        adjustment = "continue"

    return {
        "learning_path": adapted_path,
        "adaptation": adaptation_message,
        "recommended_adjustment": adjustment
    }

def update_progress(
    completed_skills,
    current_skills,
    feedback_analysis
):

    updated_skills = set(
        current_skills
    )

    for skill in completed_skills:

        updated_skills.add(
            skill
        )

    return sorted(
        updated_skills
    )

def process_feedback(
    feedback,
    learning_path,
    current_skills=None,
    completed_skills=None
):

    if current_skills is None:
        current_skills = []

    if completed_skills is None:
        completed_skills = []

    feedback_analysis = analyze_feedback(
        feedback
    )
    adapted_path = adapt_learning_path(
        learning_path,
        feedback_analysis
    )

    updated_skills = update_progress(
        completed_skills,
        current_skills,
        feedback_analysis
    )

    return {
        "feedback_analysis": feedback_analysis,
        "updated_skills": updated_skills,
        "adapted_learning_path": adapted_path
    }


def print_feedback_adaptation(result):

    print(
        "\n" + "=" * 55
    )

    print(
        "              FEEDBACK ADAPTATION"
    )

    print(
        "=" * 55
    )

    analysis = result[
        "feedback_analysis"
    ]

    print(
        f"\nFeedback: "
        f"{analysis['feedback']}"
    )

    print(
        f"Sentiment: "
        f"{analysis['sentiment']}"
    )

    print(
        f"Difficulty: "
        f"{analysis['difficulty']}"
    )

    print(
        f"Action: "
        f"{analysis['action']}"
    )

    print(
        "\nUpdated Skills:"
    )

    if result["updated_skills"]:

        for skill in result[
            "updated_skills"
        ]:

            print(
                f"  ✓ {skill}"
            )

    else:

        print(
            "  None"
        )

    adaptation = result[
        "adapted_learning_path"
    ]

    print(
        "\nLearning Path Adaptation:"
    )

    print(
        adaptation.get(
            "adaptation",
            "No changes."
        )
    )

    print(
        "\nRecommended Adjustment: "
        + adaptation.get(
            "recommended_adjustment",
            "continue"
        )
    )

    print(
        "\n" + "=" * 55
    )

if __name__ == "__main__":

    print(
        "\nPATHFINDER FEEDBACK ADAPTER"
    )

    feedback = input(
        "\nHow are you finding your learning path?\n> "
    )

    sample_learning_path = [
        {
            "milestone": 1,
            "title": "Python Fundamentals",
            "skill": "python"
        },
        {
            "milestone": 2,
            "title": "Machine Learning",
            "skill": "machine_learning"
        }
    ]

    result = process_feedback(
        feedback=feedback,
        learning_path=sample_learning_path,
        current_skills=["sql"],
        completed_skills=[]
    )

    print_feedback_adaptation(
        result
    )