/**
 * dashboard.js
 * ----------------------------------------------------------------------------
 * Behavior for dashboard.html. Reads persisted data through
 * window.PathlineState and falls back to window.PathlineAPI's mock data if
 * the learner hasn't completed onboarding yet, so the page is always
 * demonstrable.
 * ---------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {


  const navMenuToggle = document.getElementById("navMenuToggle");
  const navMobilePanel = document.getElementById("navMobilePanel");
  navMenuToggle.addEventListener("click", () => {
    const isOpen = !navMobilePanel.hidden;
    navMobilePanel.hidden = isOpen;
    navMenuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  const settingsOpenBtn = document.getElementById("settingsOpenBtn");
  const settingsCloseBtn = document.getElementById("settingsCloseBtn");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const resetStateBtn = document.getElementById("resetStateBtn");

  function openSettings() { settingsOverlay.hidden = false; settingsCloseBtn.focus(); }
  function closeSettings() { settingsOverlay.hidden = true; settingsOpenBtn.focus(); }
  settingsOpenBtn.addEventListener("click", openSettings);
  settingsCloseBtn.addEventListener("click", closeSettings);
  settingsOverlay.addEventListener("click", (event) => {
    if (event.target === settingsOverlay) closeSettings();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !settingsOverlay.hidden) closeSettings();
  });
  resetStateBtn.addEventListener("click", () => {
    window.PathlineState.clearLearningState();
    window.location.href = "index.html";
  });

  let profile = window.PathlineState.getLearnerProfile();
  let path = window.PathlineState.getLearningPath();
  let progress = window.PathlineState.getProgress();
  let usingMockData = false;

  if (!profile || !path) {
    const mock = await window.PathlineAPI.getMockExperience();
    profile = profile || mock.learnerProfile;
    path = path || mock.learningPath;
    progress = progress && Object.keys(progress).length ? progress : { completedModules: [] };
    usingMockData = true;
    document.getElementById("dashboardBanner").hidden = false;
  }


  document.getElementById("pathTitle").textContent = path.title;
  document.getElementById("pathSummary").textContent = path.summary || "";
  document.getElementById("metaWeeks").textContent = path.estimatedWeeks
    ? `${path.estimatedWeeks} weeks`
    : "—";
  document.getElementById("metaHours").textContent = profile.weeklyHours || "—";
  document.getElementById("metaPreference").textContent = profile.learningPreference || "—";
  document.getElementById("profileExperience").textContent = profile.experience || "—";
  document.getElementById("profileGoal").textContent = profile.goal || "—";


  const moduleList = document.getElementById("moduleList");
  const completed = new Set(progress.completedModules || []);

  function persistProgress() {
    window.PathlineState.saveProgress({ completedModules: Array.from(completed) });
  }

  function updateProgressSummary() {
    const total = path.modules.length;
    const done = completed.size;
    const pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("progressLabel").textContent = `${done} of ${total} modules`;
    document.getElementById("progressFill").style.width = `${pct}%`;
  }

  function renderModules() {
    moduleList.innerHTML = "";

    path.modules.forEach((module, index) => {
      const details = document.createElement("details");
      details.className = "module";

      const summary = document.createElement("summary");
      summary.className = "module__summary";

      const checkbox = document.createElement("span");
      checkbox.className = "module__checkbox";
      checkbox.setAttribute("role", "checkbox");
      checkbox.setAttribute("tabindex", "0");
      checkbox.setAttribute("aria-checked", String(completed.has(module.id)));
      checkbox.setAttribute("aria-label", `Mark ${module.name} as complete`);
      if (completed.has(module.id)) checkbox.classList.add("is-done");

      function toggleComplete(event) {
        event.preventDefault();
        event.stopPropagation();
        if (completed.has(module.id)) {
          completed.delete(module.id);
        } else {
          completed.add(module.id);
        }
        checkbox.classList.toggle("is-done");
        checkbox.setAttribute("aria-checked", String(completed.has(module.id)));
        persistProgress();
        updateProgressSummary();
      }
      checkbox.addEventListener("click", toggleComplete);
      checkbox.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") toggleComplete(event);
      });

      const indexLabel = document.createElement("span");
      indexLabel.className = "module__index";
      indexLabel.textContent = String(index + 1).padStart(2, "0");

      const name = document.createElement("span");
      name.className = "module__name";
      name.textContent = module.name;

      const weeks = document.createElement("span");
      weeks.className = "module__weeks";
      weeks.textContent = `${module.weeks} wk`;

      const chevron = document.createElement("span");
      chevron.className = "module__chevron";
      chevron.setAttribute("aria-hidden", "true");

      summary.append(checkbox, indexLabel, name, weeks, chevron);

      const body = document.createElement("div");
      body.className = "module__body";

      const description = document.createElement("p");
      description.className = "module__description";
      description.textContent = module.description;

      body.appendChild(description);

      if (module.resources && module.resources.length) {
        const resourcesLabel = document.createElement("p");
        resourcesLabel.className = "module__resources-label";
        resourcesLabel.textContent = "Resources";

        const resourcesList = document.createElement("ul");
        resourcesList.className = "module__resources";
        module.resources.forEach((resource) => {
          const item = document.createElement("li");
          item.textContent = resource;
          resourcesList.appendChild(item);
        });

        body.appendChild(resourcesLabel);
        body.appendChild(resourcesList);
      }

      if (window.PathlineEngine) {
        const feedbackRow = document.createElement("div");
        feedbackRow.className = "module__feedback";

        const feedbackLabel = document.createElement("p");
        feedbackLabel.className = "module__feedback-label";
        feedbackLabel.textContent = "How's this one going?";
        feedbackRow.appendChild(feedbackLabel);

        const feedbackButtons = document.createElement("div");
        feedbackButtons.className = "module__feedback-buttons";

        const feedbackMsg = document.createElement("p");
        feedbackMsg.className = "module__feedback-msg";
        feedbackMsg.hidden = true;

        ["Too easy", "Makes sense", "Too hard"].forEach((label) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "module__feedback-btn";
          btn.textContent = label;
          btn.addEventListener("click", (event) => {
            event.preventDefault();
            const analysis = window.PathlineEngine.analyzeFeedback(label);
            feedbackMsg.textContent = window.PathlineEngine.adaptationMessageFor(analysis.action);
            feedbackMsg.hidden = false;
          });
          feedbackButtons.appendChild(btn);
        });

        feedbackRow.appendChild(feedbackButtons);
        feedbackRow.appendChild(feedbackMsg);
        body.appendChild(feedbackRow);
      }

      details.appendChild(summary);
      details.appendChild(body);
      moduleList.appendChild(details);
    });
  }

  renderModules();
  updateProgressSummary();


  function renderSkillGap() {
    const introEl = document.getElementById("skillGapIntro");
    const listEl = document.getElementById("skillGapList");
    const { goal, missingSkills } = window.PathlineGoals.getSkillGap(
      profile.goalId || profile.goal,
      profile.skills || []
    );

    if (!goal) {
      introEl.textContent = "Pick a goal from the home page to see a personalized skill-gap breakdown here.";
      listEl.innerHTML = "";
      return;
    }

    if (!missingSkills.length) {
      introEl.textContent = `You already have every core skill this path needs for ${goal.title}. Use the modules below to go deeper.`;
      listEl.innerHTML = "";
      return;
    }

    introEl.textContent = `Comparing your skills to what a ${goal.title} typically needs, here's what to focus on next:`;
    listEl.innerHTML = "";

    missingSkills.forEach((skill) => {
      const resources = window.PathlineGoals.getResourcesFor(skill.id);

      const item = document.createElement("div");
      item.className = "skill-gap__item";

      const heading = document.createElement("p");
      heading.className = "skill-gap__skill";
      heading.textContent = skill.name;
      item.appendChild(heading);

      if (resources.length) {
        const resourceList = document.createElement("ul");
        resourceList.className = "skill-gap__resources";
        resources.forEach((resource) => {
          const li = document.createElement("li");

          const link = document.createElement("a");
          link.href = resource.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "skill-gap__resource-link";
          link.textContent = resource.name;
          li.appendChild(link);

          if (resource.tip) {
            const tip = document.createElement("p");
            tip.className = "skill-gap__tip";
            tip.textContent = resource.tip;
            li.appendChild(tip);
          }

          resourceList.appendChild(li);
        });
        item.appendChild(resourceList);
      }

      listEl.appendChild(item);
    });
  }

  renderSkillGap();


  const knownSkills = document.getElementById("knownSkills");
  const gapSkills = document.getElementById("gapSkills");

  (profile.skills || []).forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = skill;
    knownSkills.appendChild(chip);
  });
  if (!(profile.skills || []).length) {
    knownSkills.innerHTML = '<span class="chip">Not specified</span>';
  }

  path.modules.forEach((module) => {
    const chip = document.createElement("span");
    chip.className = "chip chip--gap";
    chip.textContent = module.name;
    gapSkills.appendChild(chip);
  });

});
