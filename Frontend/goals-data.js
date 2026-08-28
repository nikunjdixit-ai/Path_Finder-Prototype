/**
 * goals-data.js
 * ----------------------------------------------------------------------------
 * Adapts window.PathlineData + window.PathlineEngine (the JS port of the
 * Python skill-gap / recommender / path-generator scripts) into the small
 * surface area that the UI code (onboarding.js, dashboard.js, api.js)
 * expects: a list of goals to render, a skill-gap lookup for the dashboard,
 * a resource lookup per skill, and a full learner-profile -> learning-path
 * builder.
 * ---------------------------------------------------------------------------- */

(function () {
  const DATA = window.PathlineData;
  const ENGINE = window.PathlineEngine;

  const WEEKLY_HOURS_MAP = {
    "2-5 hours": 3.5,
    "5-10 hours": 7.5,
    "10-15 hours": 12.5,
    "15+ hours": 17.5,
  };

  function weeklyHoursToNumber(weeklyHours) {
    return WEEKLY_HOURS_MAP[weeklyHours] || 8;
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  /* Public list of goals, built straight from careers.json. */
  const goals = Object.entries(DATA.careers.careers).map(([id, career]) => ({
    id,
    title: career.name,
    description: career.description,
    category: career.category,
    requiredSkills: (career.required_skills || []).map(ENGINE.skillDisplayName),
    requiredSkillIds: career.required_skills || [],
  }));

  /** Accepts either a career id ("data_scientist") or a display title
   *  ("Data Scientist") and returns the matching career id, or null. */
  function resolveGoalId(identifier) {
    if (!identifier) return null;
    if (DATA.careers.careers[identifier]) return identifier;
    const normalized = String(identifier).toLowerCase().trim();
    const match = goals.find((g) => g.title.toLowerCase() === normalized);
    return match ? match.id : null;
  }

  function findGoal(identifier) {
    const id = resolveGoalId(identifier);
    return id ? goals.find((g) => g.id === id) : null;
  }

  /** Used by dashboard.html's "Skill Gaps & Resources" card. */
  function getSkillGap(identifier, skillTags) {
    const goalId = resolveGoalId(identifier);
    const goal = goalId ? findGoal(goalId) : null;
    const skillIds = ENGINE.resolveSkillIds(skillTags);
    const report = ENGINE.analyzeSkillGap(goalId, skillIds);
    const missingSkills = report.missingSkills.map((id) => ({
      id,
      name: ENGINE.skillDisplayName(id),
    }));
    return { goal, missingSkills, report };
  }

  function describeResource(resource) {
    if (resource.type === "course") {
      return `${capitalize(resource.level)} course \u00B7 ${resource.duration_hours} hrs`;
    }
    if (resource.type === "project") {
      return `${capitalize(resource.level)} project \u00B7 ~${resource.estimated_hours} hrs`;
    }
    return `${capitalize(resource.level)} assessment \u00B7 ${resource.question_count} questions`;
  }


  function getResourcesFor(skillIdentifier) {
    const skillId = DATA.skills.skills[skillIdentifier]
      ? skillIdentifier
      : ENGINE.matchSkillId(skillIdentifier);
    if (!skillId) return [];

    const all = [
      ...DATA.courses.courses,
      ...DATA.projects.projects,
      ...DATA.assessments.assessments,
    ].filter((r) => r.skill === skillId);

    const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    all.sort((a, b) => (levelOrder[a.level] ?? 1) - (levelOrder[b.level] ?? 1));

    return all.map((resource) => {
      const missingPrereqs = (resource.prerequisites || []).map(ENGINE.skillDisplayName);
      let tip = describeResource(resource);
      if (missingPrereqs.length) {
        tip += ` \u2014 build first: ${missingPrereqs.join(", ")}`;
      }
      return { name: resource.title, url: "#", tip };
    });
  }


  function buildLearningPath(profile) {
    const goalId = resolveGoalId((profile && (profile.goalId || profile.goal)) || "");
    const goal = goalId ? findGoal(goalId) : null;
    if (!goal) return null;

    const skillIds = ENGINE.resolveSkillIds((profile && profile.skills) || []);
    const skillGapReport = ENGINE.analyzeSkillGap(goalId, skillIds);
    const recommendations = ENGINE.generateRecommendations(skillIds, skillGapReport);
    const milestones = ENGINE.generateLearningPath(skillIds, skillGapReport, recommendations);

    if (!milestones.length) {
      return {
        title: goal.title,
        summary: `You already have every core skill ${goal.title} typically needs. Explore the modules below to go deeper on each one.`,
        estimatedWeeks: 0,
        modules: [],
      };
    }

    const hoursPerWeek = weeklyHoursToNumber(profile && profile.weeklyHours);

    const modules = milestones.map((milestone) => {
      const skillInfo = DATA.skills.skills[milestone.skill] || {};
      const hours = milestone.estimatedTime || 10;
      const weeks = Math.max(1, Math.round(hours / hoursPerWeek));

      const sameSkillResources = recommendations
        .filter((r) => r.skill === milestone.skill)
        .map((r) => r.title);
      const resources = Array.from(new Set([milestone.title, ...sameSkillResources])).slice(0, 3);

      return {
        id: milestone.skill,
        name: skillInfo.name || milestone.skill.replace(/_/g, " "),
        weeks,
        status: "not-started",
        description:
          skillInfo.description ||
          `Build practical ability in ${skillInfo.name || milestone.skill}.`,
        resources,
      };
    });

    const estimatedWeeks = modules.reduce((sum, m) => sum + m.weeks, 0);

    return {
      title: goal.title,
      summary: goal.description,
      estimatedWeeks,
      modules,
    };
  }

  window.PathlineGoals = {
    goals,
    resolveGoalId,
    findGoal,
    getSkillGap,
    getResourcesFor,
    buildLearningPath,
  };
})();
