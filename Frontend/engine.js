/**
 * engine.js
 * ----------------------------------------------------------------------------
 * Client-side port of the Python reference engine (profile_analyzer.py,
 * skill_gap_analyzer.py, recommender.py, path_generator.py,
 * explanation_engine.py). Runs entirely in the browser against the data
 * embedded in data.js, so the same rules the Python scripts implement also
 * drive index.html / dashboard.html.
 * ---------------------------------------------------------------------------- */

(function () {
  const DATA = window.PathlineData;



  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }


  const SKILL_ALIASES = {
    python: ["python programming", "python language", "python"],
    sql: ["sql", "sql programming", "sql database"],
    machine_learning: ["machine learning", "ml", "ai/ml", "ai ml"],
    deep_learning: ["deep learning", "dl"],
    pandas: ["pandas"],
    numpy: ["numpy"],
    statistics: ["statistics", "statistical analysis", "mathematics", "maths", "math"],
    linear_algebra: ["linear algebra"],
    data_visualization: ["data visualization", "data visualisation", "visualization"],
    data_analysis: ["data analysis", "data analytics", "analytics", "data analyst"],
    docker: ["docker", "containerization", "containers"],
    linux: ["linux"],
    git: ["git", "github"],
    javascript: ["javascript", "js"],
    html: ["html"],
    css: ["css"],
    react: ["react", "reactjs", "react.js"],
    nodejs: ["node", "nodejs", "node.js"],
    rest_api: ["rest api", "rest apis", "apis", "api"],
    cloud_computing: ["cloud", "cloud computing"],
    kubernetes: ["kubernetes", "k8s"],
    ci_cd: ["ci/cd", "cicd", "ci cd"],
    cybersecurity_fundamentals: ["cybersecurity", "cyber security"],
    network_security: ["network security"],
    ethical_hacking: ["ethical hacking", "pen testing", "penetration testing"],
  };

  /** Matches one free-text tag (e.g. "Python", "Machine Learning") to a
   *  skill id in skills.json, the same way detect_skills() in
   *  profile_analyzer.py matches substrings inside a longer sentence. */
  function matchSkillId(tag) {
    const text = normalizeText(tag);
    if (!text) return null;

    for (const [skillId, info] of Object.entries(DATA.skills.skills)) {
      if (normalizeText(info.name) === text) return skillId;
      if (skillId.replace(/_/g, " ") === text) return skillId;
    }
    for (const [skillId, aliases] of Object.entries(SKILL_ALIASES)) {
      if (aliases.some((alias) => alias === text)) return skillId;
    }
    // Fall back to substring containment, same spirit as the Python version.
    for (const [skillId, info] of Object.entries(DATA.skills.skills)) {
      const skillName = normalizeText(info.name);
      if (text.includes(skillName) || skillName.includes(text)) return skillId;
    }
    for (const [skillId, aliases] of Object.entries(SKILL_ALIASES)) {
      if (aliases.some((alias) => text.includes(alias) || alias.includes(text))) {
        return skillId;
      }
    }
    return null;
  }

  /** Converts an array of free-text tags into sorted, deduped skill ids. */
  function resolveSkillIds(tags) {
    const ids = new Set();
    (tags || []).forEach((tag) => {
      const id = matchSkillId(tag);
      if (id) ids.add(id);
    });
    return Array.from(ids).sort();
  }

  function skillDisplayName(skillId) {
    const info = DATA.skills.skills[skillId];
    return info ? info.name : skillId.replace(/_/g, " ");
  }



  function getRequiredSkills(goalId) {
    const career = DATA.careers.careers[goalId];
    return career ? career.required_skills || [] : [];
  }

  function getPrerequisites(skillId) {
    const prerequisites = new Set();
    function collect(id) {
      const info = DATA.skills.skills[id];
      if (!info) return;
      (info.prerequisites || []).forEach((prereq) => {
        if (!prerequisites.has(prereq)) {
          prerequisites.add(prereq);
          collect(prereq);
        }
      });
    }
    collect(skillId);
    return prerequisites;
  }

  function analyzeSkillGap(goalId, currentSkillIds) {
    const currentSkills = new Set(currentSkillIds || []);

    if (!goalId || !DATA.careers.careers[goalId]) {
      return {
        goal: null,
        currentSkills: Array.from(currentSkills).sort(),
        requiredSkills: [],
        knownSkills: [],
        missingSkills: [],
        prerequisiteGaps: [],
        missingByLevel: { beginner: [], intermediate: [], advanced: [] },
        skillGapCount: 0,
      };
    }

    const requiredSkillSet = new Set(getRequiredSkills(goalId));
    const knownSkills = new Set([...currentSkills].filter((s) => requiredSkillSet.has(s)));
    const missingSkills = new Set([...requiredSkillSet].filter((s) => !currentSkills.has(s)));

    const prerequisiteGaps = new Set();
    missingSkills.forEach((skill) => {
      getPrerequisites(skill).forEach((prereq) => {
        if (!currentSkills.has(prereq)) prerequisiteGaps.add(prereq);
      });
    });

    const missingByLevel = { beginner: [], intermediate: [], advanced: [] };
    missingSkills.forEach((skill) => {
      const info = DATA.skills.skills[skill];
      if (!info) return;
      if (missingByLevel[info.difficulty]) missingByLevel[info.difficulty].push(skill);
    });
    Object.keys(missingByLevel).forEach((level) => missingByLevel[level].sort());

    return {
      goal: goalId,
      currentSkills: Array.from(currentSkills).sort(),
      requiredSkills: Array.from(requiredSkillSet).sort(),
      knownSkills: Array.from(knownSkills).sort(),
      missingSkills: Array.from(missingSkills).sort(),
      prerequisiteGaps: Array.from(prerequisiteGaps).sort(),
      missingByLevel,
      skillGapCount: missingSkills.size,
    };
  }

  /* ------------------------------------------------------------------ */
  /* recommender.py                                                       */
  /* ------------------------------------------------------------------ */

  function loadAllResources() {
    return [
      ...DATA.courses.courses,
      ...DATA.projects.projects,
      ...DATA.assessments.assessments,
    ];
  }

  function prerequisiteGapsFor(resource, currentSkills) {
    const prerequisites = new Set(resource.prerequisites || []);
    return Array.from(prerequisites).filter((p) => !currentSkills.has(p)).sort();
  }

  function calculateScore(resource, missingSkills, currentSkills) {
    let score = 0;
    if (missingSkills.has(resource.skill)) score += 50;

    const prerequisites = resource.prerequisites || [];
    const satisfied = prerequisites.filter((p) => currentSkills.has(p));
    score += satisfied.length * 10;

    if (resource.level === "beginner") score += 10;
    if (resource.type === "course") score += 5;

    return score;
  }

  function generateRecommendations(currentSkillIds, skillGapReport) {
    const currentSkills = new Set(currentSkillIds || []);
    const missingSkills = new Set(skillGapReport.missingSkills || []);

    const recommendations = [];
    loadAllResources().forEach((resource) => {
      if (!missingSkills.has(resource.skill)) return;

      const missingPrerequisites = prerequisiteGapsFor(resource, currentSkills);
      const score = calculateScore(resource, missingSkills, currentSkills);

      const rec = {
        id: resource.id,
        title: resource.title,
        skill: resource.skill,
        level: resource.level,
        type: resource.type,
        score,
        prerequisites: resource.prerequisites || [],
        missingPrerequisites,
        readyToStart: missingPrerequisites.length === 0,
      };
      if ("duration_hours" in resource) rec.durationHours = resource.duration_hours;
      if ("estimated_hours" in resource) rec.estimatedHours = resource.estimated_hours;
      if ("question_count" in resource) rec.questionCount = resource.question_count;
      if ("passing_score" in resource) rec.passingScore = resource.passing_score;

      recommendations.push(rec);
    });

    recommendations.sort((a, b) => {
      if (a.readyToStart !== b.readyToStart) return a.readyToStart ? -1 : 1;
      return b.score - a.score;
    });

    return recommendations;
  }



  function generateLearningPath(currentSkillIds, skillGapReport, recommendations) {
    const currentSkills = new Set(currentSkillIds || []);
    const remainingSkills = new Set(skillGapReport.missingSkills || []);

    const learningPath = [];
    let milestoneNumber = 1;
    let guard = 0; 

    while (remainingSkills.size && guard < 500) {
      guard += 1;

      let available = recommendations.filter((r) => {
        if (!remainingSkills.has(r.skill)) return false;
        const prereqs = r.prerequisites || [];
        return prereqs.every((p) => currentSkills.has(p));
      });

      if (!available.length) {
        const fallback = recommendations
          .filter((r) => remainingSkills.has(r.skill))
          .sort((a, b) => (a.prerequisites || []).length - (b.prerequisites || []).length);
        if (!fallback.length) break;
        available = [fallback[0]];
      }

      available = [...available].sort((a, b) => b.score - a.score);
      const selected = available[0];
      const skill = selected.skill;

      learningPath.push({
        milestone: milestoneNumber,
        title: selected.title,
        skill,
        type: selected.type,
        level: selected.level,
        prerequisites: selected.prerequisites || [],
        estimatedTime: selected.durationHours || selected.estimatedHours || null,
      });

      currentSkills.add(skill);
      remainingSkills.delete(skill);
      milestoneNumber += 1;
    }

    return learningPath;
  }



  function generateExplanation(goalId, currentSkillIds, recommendation) {
    const currentSkills = new Set(currentSkillIds || []);
    const reasons = [];

    const career = DATA.careers.careers[goalId];
    const goalName = career ? career.name : "your career goal";
    reasons.push(`Builds a skill needed for ${goalName}.`);

    if (recommendation.missingPrerequisites && recommendation.missingPrerequisites.length) {
      const names = recommendation.missingPrerequisites.map(skillDisplayName).join(", ");
      reasons.push(`Before starting, build: ${names}.`);
    } else if (recommendation.prerequisites && recommendation.prerequisites.length) {
      reasons.push("You already have the prerequisites needed to start.");
    } else {
      reasons.push("No prerequisites — ready to start right away.");
    }

    if (currentSkills.size) {
      reasons.push("Chosen with your existing skills already factored in.");
    }

    return reasons.join(" ");
  }



  const POSITIVE_KEYWORDS = [
    "easy", "good", "simple", "understand", "understood",
    "comfortable", "confident", "interesting", "helpful", "makes sense",
  ];
  const NEGATIVE_KEYWORDS = [
    "hard", "difficult", "confusing", "confused", "struggle", "struggling",
    "don't understand", "do not understand", "too difficult",
  ];
  const TOO_EASY_KEYWORDS = ["too easy", "very easy", "too simple", "boring"];
  const TOO_HARD_KEYWORDS = [
    "too hard", "very difficult", "extremely difficult",
    "can't understand", "cannot understand",
  ];

  function analyzeFeedback(feedback) {
    const text = normalizeText(feedback);
    const result = { feedback, sentiment: "neutral", difficulty: "normal", action: "continue" };

    if (POSITIVE_KEYWORDS.some((k) => text.includes(k))) result.sentiment = "positive";
    else if (NEGATIVE_KEYWORDS.some((k) => text.includes(k))) result.sentiment = "negative";

    if (TOO_EASY_KEYWORDS.some((k) => text.includes(k))) {
      result.difficulty = "too_easy";
      result.action = "increase_difficulty";
    } else if (TOO_HARD_KEYWORDS.some((k) => text.includes(k))) {
      result.difficulty = "too_hard";
      result.action = "decrease_difficulty";
    } else if (result.sentiment === "negative") {
      result.difficulty = "challenging";
      result.action = "provide_support";
    } else if (result.sentiment === "positive") {
      result.action = "continue";
    }

    return result;
  }

  function adaptationMessageFor(action) {
    switch (action) {
      case "increase_difficulty":
        return "Sounds like this is comfortable — try a more advanced resource or a harder project next.";
      case "decrease_difficulty":
        return "This one's tough right now — it helps to revisit the prerequisite skills or an easier resource first.";
      case "provide_support":
        return "This is a common sticking point — extra practice or a beginner-level resource on this skill should help.";
      default:
        return "Good to hear — keep going with the current plan.";
    }
  }



  window.PathlineEngine = {
    normalizeText,
    matchSkillId,
    resolveSkillIds,
    skillDisplayName,
    getRequiredSkills,
    getPrerequisites,
    analyzeSkillGap,
    generateRecommendations,
    generateLearningPath,
    generateExplanation,
    analyzeFeedback,
    adaptationMessageFor,
  };
})();
