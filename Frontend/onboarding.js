/**
 * onboarding.js
 * ----------------------------------------------------------------------------
 * Behavior for index.html. Reads/writes persisted data only through
 * window.PathlineState, and talks to the backend only through
 * window.PathlineAPI. No fetch() calls or localStorage access happen here
 * directly.
 * ---------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {


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

  function openSettings() {
    settingsOverlay.hidden = false;
    settingsCloseBtn.focus();
  }
  function closeSettings() {
    settingsOverlay.hidden = true;
    settingsOpenBtn.focus();
  }
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
    closeSettings();
  });

  const profile = {
    goal: "",
    experience: "",
    skills: [],
    weeklyHours: "",
    learningPreference: "",
  };


  const goalGrid = document.getElementById("goalGrid");
  const goalError = document.getElementById("goalError");
  const goalRequirements = document.getElementById("goalRequirements");
  const goalRequirementsChips = document.getElementById("goalRequirementsChips");

  function renderGoalGrid() {
    goalGrid.innerHTML = "";
    window.PathlineGoals.goals.forEach((goal) => {
      const wrapper = document.createElement("span");
      wrapper.className = "option option--goal";

      const input = document.createElement("input");
      input.type = "radio";
      input.className = "option__input";
      input.name = "goal";
      input.id = `goal-${goal.id}`;
      input.value = goal.title;

      const label = document.createElement("label");
      label.className = "option__label option__label--goal";
      label.setAttribute("for", `goal-${goal.id}`);
      label.innerHTML = `
        <span class="option__check" aria-hidden="true"></span>
        <span class="option__label-text">
          <strong>${goal.title}</strong>
          <small>${goal.description}</small>
        </span>`;

      wrapper.appendChild(input);
      wrapper.appendChild(label);
      goalGrid.appendChild(wrapper);
    });
  }
  renderGoalGrid();

  function updateGoalRequirementsPreview(goalTitle) {
    const goal = window.PathlineGoals.findGoal(goalTitle);
    if (!goal) {
      goalRequirements.hidden = true;
      return;
    }
    goalRequirementsChips.innerHTML = "";
    goal.requiredSkills.forEach((skill) => {
      const chip = document.createElement("span");
      chip.className = "goal-chip";
      chip.textContent = skill;
      goalRequirementsChips.appendChild(chip);
    });
    goalRequirements.hidden = false;
  }

  goalGrid.addEventListener("change", (event) => {
    if (event.target.matches(".option__input")) {
      updateGoalRequirementsPreview(event.target.value);
      if (event.target.value) clearGoalError();
    }
  });

  function showGoalError() {
    goalError.hidden = false;
  }
  function clearGoalError() {
    goalError.hidden = true;
  }


  document.querySelectorAll(".option-group").forEach((group) => {
    const field = group.getAttribute("data-field");
    group.addEventListener("change", (event) => {
      if (event.target.matches(".option__input")) {
        profile[field] = event.target.value;
      }
    });
  });


  const skillInput = document.getElementById("skillInput");
  const skillAddBtn = document.getElementById("skillAddBtn");
  const skillTagList = document.getElementById("skillTagList");

  function renderSkillTags() {
    skillTagList.innerHTML = "";
    profile.skills.forEach((skill) => {
      const item = document.createElement("li");
      item.className = "tag";
      item.textContent = skill;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "tag__remove";
      removeBtn.setAttribute("aria-label", `Remove ${skill}`);
      removeBtn.textContent = "\u00D7";
      removeBtn.addEventListener("click", () => {
        profile.skills = profile.skills.filter((s) => s !== skill);
        renderSkillTags();
        skillInput.focus();
      });

      item.appendChild(removeBtn);
      skillTagList.appendChild(item);
    });
  }

  function addSkillFromInput() {
    const value = skillInput.value.trim();
    if (!value) return;
    if (!profile.skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      profile.skills.push(value);
      renderSkillTags();
    }
    skillInput.value = "";
  }

  skillAddBtn.addEventListener("click", addSkillFromInput);
  skillInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkillFromInput();
    }
  });


  const conversation = document.getElementById("conversation");
  const conversationLog = document.getElementById("conversationLog");
  const conversationResponse = document.getElementById("conversationResponse");

  let chatBusy = false;
  let pendingField = null;

  function appendMessage(author, text) {
    const wrapper = document.createElement("div");
    wrapper.className = `message message--${author}`;

    const bubble = document.createElement("div");
    bubble.className = "message__bubble";

    const label = document.createElement("span");
    label.className = "message__author";
    label.textContent = author === "assistant" ? "Assistant" : "You";

    bubble.appendChild(label);
    bubble.appendChild(document.createTextNode(text));
    wrapper.appendChild(bubble);
    conversationLog.appendChild(wrapper);

    requestAnimationFrame(() => wrapper.classList.add("is-visible"));
    conversationLog.scrollTop = conversationLog.scrollHeight;
  }

  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.className = "message message--assistant conversation__typing is-visible";
    wrapper.id = "typingIndicator";
    wrapper.innerHTML = `
      <div class="message__bubble">
        <span class="typing-dots"><span></span><span></span><span></span></span>
      </div>`;
    conversationLog.appendChild(wrapper);
    conversationLog.scrollTop = conversationLog.scrollHeight;
  }
  function hideTyping() {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
  }

  function renderResponseControl(step) {
    conversationResponse.innerHTML = "";

    if (step.options && step.options.length) {
      step.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-secondary";
        btn.textContent = option;
        btn.addEventListener("click", () => handleConversationAnswer(option));
        conversationResponse.appendChild(btn);
      });
      return;
    }

    const row = document.createElement("div");
    row.className = "conversation__response-input";

    const input = document.createElement("input");
    input.type = "text";
    input.setAttribute("aria-label", step.question || "Your answer");

    const sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.className = "btn-secondary";
    sendBtn.textContent = "Send";

    const submit = () => {
      const value = input.value.trim();
      if (value) handleConversationAnswer(value);
    };
    sendBtn.addEventListener("click", submit);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    });

    row.appendChild(input);
    row.appendChild(sendBtn);
    conversationResponse.appendChild(row);
    input.focus();
  }

  async function advanceConversation() {
    chatBusy = true;
    showTyping();
    let step;
    try {
      step = await window.PathlineAPI.sendOnboardingMessage(profile);
    } finally {
      hideTyping();
      chatBusy = false;
    }

    if (step.completed) {
      appendMessage("assistant", "Thanks — that's everything I need.");
      conversationResponse.innerHTML = "";
      pendingField = null;
      runGenerationFlow();
      return;
    }

    appendMessage("assistant", step.question);
    pendingField = step;
    renderResponseControl(step);
  }

  function handleConversationAnswer(value) {
    if (!pendingField || chatBusy) return;
    profile[pendingField.field] = value;
    appendMessage("user", value);
    conversationResponse.innerHTML = "";
    pendingField = null;
    advanceConversation();
  }


  const loadingPanel = document.getElementById("loadingPanel");
  const loadingFill = document.getElementById("loadingFill");
  const loadingStepEls = Array.from(document.querySelectorAll(".loading-step"));
  let loadingTimer = null;

  function startLoadingAnimation() {
    let index = 0;
    loadingStepEls.forEach((el) => el.classList.remove("is-active", "is-done"));
    loadingFill.style.width = "0%";

    function activateStep(i) {
      loadingStepEls.forEach((el, idx) => {
        el.classList.toggle("is-active", idx === i);
        el.classList.toggle("is-done", idx < i);
      });
      loadingFill.style.width = `${((i + 1) / loadingStepEls.length) * 100}%`;
    }

    activateStep(0);
    loadingTimer = setInterval(() => {
      index += 1;
      if (index >= loadingStepEls.length) {
        clearInterval(loadingTimer);
        return;
      }
      activateStep(index);
    }, 500);
  }
  function stopLoadingAnimation() {
    if (loadingTimer) clearInterval(loadingTimer);
  }


  const onboardingForm = document.getElementById("onboardingForm");
  const errorPanel = document.getElementById("errorPanel");
  const submitBtn = document.getElementById("submitBtn");
  const submitBtnLabel = document.getElementById("submitBtnLabel");

  function showForm() {
    onboardingForm.hidden = false;
    loadingPanel.hidden = true;
    errorPanel.hidden = true;
  }
  function showLoading() {
    onboardingForm.hidden = true;
    loadingPanel.hidden = false;
    errorPanel.hidden = true;
  }
  function showError() {
    onboardingForm.hidden = true;
    loadingPanel.hidden = true;
    errorPanel.hidden = false;
  }

  function setSubmitBusy(isBusy) {
    submitBtn.disabled = isBusy;
    submitBtn.setAttribute("aria-busy", String(isBusy));
    submitBtnLabel.innerHTML = isBusy
      ? 'Building <span class="spinner-dots"><span></span><span></span><span></span></span>'
      : "Build my learning path";
  }


  async function runGenerationFlow() {
    showLoading();
    startLoadingAnimation();

    try {
      await window.PathlineAPI.createLearnerProfile(profile);
      const path = await window.PathlineAPI.generateLearningPath(profile);

      stopLoadingAnimation();
      window.PathlineState.saveLearnerProfile(profile);
      window.PathlineState.saveLearningPath(path);
      window.PathlineState.saveProgress({ completedModules: [] });

      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("onboarding.js: path generation failed", err);
      stopLoadingAnimation();
      showError();
    }
  }


  onboardingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!profile.goal) {
      showGoalError();
      goalGrid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    clearGoalError();

    setSubmitBusy(true);
    await window.PathlineAPI.createLearnerProfile(profile);
    setSubmitBusy(false);

    const missingFields = ["experience", "weeklyHours", "learningPreference"].filter(
      (field) => !profile[field]
    );

    if (missingFields.length > 0) {
      conversation.hidden = false;
      conversationLog.innerHTML = "";
      await advanceConversation();
      conversation.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    runGenerationFlow();
  });

  document.getElementById("retryBtn").addEventListener("click", () => {
    showForm();
  });

});
