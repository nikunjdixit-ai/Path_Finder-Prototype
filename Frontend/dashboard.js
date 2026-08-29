/**
 * dashboard.js
 * ============================================================================
 * PATHLINE DASHBOARD
 *
 * Connects dashboard.html with Flask backend.
 *
 * Backend:
 *   GET  /api/profile/<user_id>
 *   GET  /api/recommendations/<user_id>
 *   GET  /api/progress/<user_id>
 *   POST /api/progress/<user_id>
 * ============================================================================
 */


/* ============================================================================
   PREVENT MULTIPLE INITIALIZATION
   ============================================================================ */

if (window.__PATHLINE_DASHBOARD_INITIALIZED__) {

  console.warn(
    "Pathline dashboard.js already initialized. Skipping duplicate load."
  );

} else {

  window.__PATHLINE_DASHBOARD_INITIALIZED__ = true;

  document.addEventListener(
    "DOMContentLoaded",
    initDashboard,
    {
      once: true
    }
  );

}


/* ============================================================================
   MAIN DASHBOARD
   ============================================================================ */

async function initDashboard() {

  console.log("====================================");
  console.log("PATHLINE DASHBOARD");
  console.log("====================================");


  /* ==========================================================================
     1. USER ID
     ========================================================================== */

  let userId =
    localStorage.getItem("pathline_user_id") ||
    localStorage.getItem("userId");


  if (!userId) {

    const possibleKeys = [
      "pathline_user",
      "user"
    ];


    for (const key of possibleKeys) {

      try {

        const rawUser =
          localStorage.getItem(key);


        if (!rawUser) {
          continue;
        }


        const storedUser =
          JSON.parse(rawUser);


        if (
          storedUser &&
          storedUser.id
        ) {

          userId =
            storedUser.id;

          break;

        }

      } catch (error) {

        console.warn(
          `Could not read ${key} from localStorage`,
          error
        );

      }

    }

  }


  /* ==========================================================================
     DEMO USER FALLBACK
     ========================================================================== */

  if (!userId) {

    userId = "1";

    console.warn(
      "No logged-in user found. Using demo user ID:",
      userId
    );

  }


  userId =
    String(userId);


  console.log(
    "User ID:",
    userId
  );


  /* ==========================================================================
     2. BACKEND
     ========================================================================== */

  const API_BASE_URL =
    "http://127.0.0.1:5000";


  const ENDPOINTS = {

    profile:
      `${API_BASE_URL}/api/profile/${userId}`,

    recommendations:
      `${API_BASE_URL}/api/recommendations/${userId}`,

    savedRecommendation:
      `${API_BASE_URL}/api/recommendations/${userId}/saved`,

    progress:
      `${API_BASE_URL}/api/progress/${userId}`

  };


  /* ==========================================================================
     3. GENERIC API REQUEST
     ========================================================================== */

  async function apiRequest(
    url,
    options = {}
  ) {

    const config = {

      method:
        options.method || "GET",

      headers: {

        "Content-Type":
          "application/json",

        ...(options.headers || {})

      }

    };


    if (
      options.body !== undefined
    ) {

      config.body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);

    }


    console.log(
      `${config.method} ${url}`
    );


    const response =
      await fetch(
        url,
        config
      );


    let data = null;


    try {

      data =
        await response.json();

    } catch {

      data = null;

    }


    if (!response.ok) {

      const message =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`;


      throw new Error(
        message
      );

    }


    return data;

  }


  /* ==========================================================================
     4. GET PROFILE
     ========================================================================== */

  async function getProfile() {

    console.log(
      "Fetching profile..."
    );


    try {

      const response =
        await apiRequest(
          ENDPOINTS.profile
        );


      console.log(
        "Profile response:",
        response
      );


      if (response?.profile) {

        return response.profile;

      }


      if (response?.user) {

        return response.user;

      }


      return response;

    } catch (error) {

      console.error(
        "Profile request failed:",
        error.message
      );


      return null;

    }

  }


  /* ==========================================================================
     5. GET RECOMMENDATIONS
     ========================================================================== */

  async function getRecommendations() {

    console.log(
      "Fetching recommendations..."
    );


    try {

      const response =
        await apiRequest(
          ENDPOINTS.recommendations
        );


      console.log(
        "Recommendation response:",
        response
      );


      if (
        response?.recommendation
      ) {

        return normalizeRecommendation(
          response.recommendation
        );

      }


      if (
        response?.recommendations
      ) {

        return normalizeRecommendation(
          response.recommendations
        );

      }


      if (
        response?.learningPath
      ) {

        return normalizeRecommendation(
          response.learningPath
        );

      }


      return normalizeRecommendation(
        response
      );

    } catch (error) {

      console.error(
        "Recommendation request failed:",
        error.message
      );


      return null;

    }

  }


  /* ==========================================================================
     6. NORMALIZE RECOMMENDATION
     ========================================================================== */

  function normalizeRecommendation(
    recommendation
  ) {

    if (!recommendation) {
      return null;
    }


    if (
      Array.isArray(
        recommendation.modules
      )
    ) {

      return {

        title:
          recommendation.title ||
          recommendation.career ||
          "Personalized Learning Path",

        summary:
          recommendation.summary ||
          recommendation.reason ||
          "A personalized learning path based on your goals and skills.",

        estimatedWeeks:
          recommendation.estimatedWeeks ||
          recommendation.estimated_weeks ||
          20,

        modules:
          normalizeModules(
            recommendation.modules
          ),

        requiredSkills:
          recommendation.requiredSkills ||
          recommendation.required_skills ||
          []

      };

    }


    const roadmap =
      Array.isArray(
        recommendation.roadmap
      )
        ? recommendation.roadmap
        : [];


    const requiredSkills =
      Array.isArray(
        recommendation.required_skills
      )
        ? recommendation.required_skills
        : Array.isArray(
            recommendation.requiredSkills
          )
          ? recommendation.requiredSkills
          : [];


    const modules =
      roadmap.map(
        (stage, index) => {

          const focus =
            Array.isArray(stage.focus)
              ? stage.focus
              : [];


          return {

            id:
              `stage-${stage.stage || index + 1}`,

            name:
              stage.title ||
              `Stage ${index + 1}`,

            weeks:
              extractWeeks(
                stage.duration
              ),

            description:
              createStageDescription(
                stage.title,
                focus
              ),

            resources:
              focus,

            focus:
              focus,

            status:
              "not-started"

          };

        }
      );


    if (!modules.length) {

      requiredSkills.forEach(
        (skill, index) => {

          modules.push({

            id:
              `skill-${index + 1}`,

            name:
              skill,

            weeks:
              2,

            description:
              `Build practical skills in ${skill}.`,

            resources:
              [skill],

            focus:
              [skill],

            status:
              "not-started"

          });

        }
      );

    }


    const calculatedWeeks =
      modules.reduce(
        (
          total,
          module
        ) =>
          total +
          Number(
            module.weeks || 0
          ),
        0
      );


    return {

      title:
        recommendation.career ||
        recommendation.title ||
        "Personalized Learning Path",

      summary:
        recommendation.reason ||
        recommendation.summary ||
        "A personalized learning path based on your goals, skills and preferences.",

      estimatedWeeks:
        calculatedWeeks || 20,

      modules,

      requiredSkills

    };

  }


  /* ==========================================================================
     7. EXTRACT WEEKS
     ========================================================================== */

  function extractWeeks(
    duration
  ) {

    if (
      typeof duration === "number"
    ) {

      return duration;

    }


    if (
      typeof duration !== "string"
    ) {

      return 2;

    }


    const numbers =
      duration.match(
        /\d+/g
      );


    if (
      !numbers ||
      !numbers.length
    ) {

      return 2;

    }


    const parsed =
      numbers.map(Number);


    if (
      parsed.length >= 2
    ) {

      return Math.round(
        (
          parsed[0] +
          parsed[1]
        ) / 2
      );

    }


    return parsed[0];

  }


  /* ==========================================================================
     8. STAGE DESCRIPTION
     ========================================================================== */

  function createStageDescription(
    title,
    focus
  ) {

    const skillText =
      focus.length
        ? focus.join(", ")
        : "the core concepts";


    const stage =
      title ||
      "this stage";


    return `
      Build ${stage.toLowerCase()}
      through ${skillText}.
    `
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  }


  /* ==========================================================================
     9. NORMALIZE MODULES
     ========================================================================== */

  function normalizeModules(
    modules
  ) {

    if (
      !Array.isArray(modules)
    ) {

      return [];

    }


    return modules.map(
      (
        module,
        index
      ) => {

        const rawWeeks =
          module.weeks ??
          module.duration_weeks ??
          module.duration ??
          1;


        return {

          ...module,

          id:
            module.id ||
            `module-${index + 1}`,

          name:
            module.name ||
            module.title ||
            `Module ${index + 1}`,

          weeks:
            extractWeeks(
              rawWeeks
            ),

          description:
            module.description ||
            "Learn the concepts and skills required for this stage.",

          resources:
            Array.isArray(
              module.resources
            )
              ? module.resources
              : Array.isArray(
                  module.focus
                )
                ? module.focus
                : []

        };

      }
    );

  }


  /* ==========================================================================
     10. GET PROGRESS
     ========================================================================== */

  async function getProgress() {

    console.log(
      "Fetching progress..."
    );


    try {

      const response =
        await apiRequest(
          ENDPOINTS.progress
        );


      console.log(
        "Progress response:",
        response
      );


      /*
       * Flask returns:
       *
       * {
       *   status: "success",
       *   user_id: 1,
       *   progress: [
       *     {
       *       skill: "Foundation",
       *       status: "completed",
       *       progress_percent: 100
       *     }
       *   ]
       * }
       *
       * Convert this into the format
       * the dashboard uses.
       */

      if (
        Array.isArray(
          response?.progress
        )
      ) {

        return {

          backendRecords:
            response.progress,

          completedModules:
            response.progress
              .filter(
                item =>
                  item.status === "completed" ||
                  Number(
                    item.progress_percent
                  ) >= 100
              )
              .map(
                item =>
                  item.skill
              )

        };

      }


      /*
       * Compatibility with old/local format.
       */

      if (
        Array.isArray(
          response?.completedModules
        )
      ) {

        return {

          completedModules:
            response.completedModules

        };

      }


      return {

        completedModules: []

      };

    } catch (error) {

      console.warn(
        "Progress request failed:",
        error.message
      );


      return {

        completedModules: []

      };

    }

  }


  /* ============================================================================
   11. SAVE PROGRESS — FIXED
   ============================================================================ */

async function saveProgress(completedModules) {

  console.log("Saving completed modules:", completedModules);

  /*
   * Backend progress.py expects ONE skill at a time:
   *
   * {
   *   skill: "...",
   *   status: "completed",
   *   progress_percent: 100
   * }
   *
   * So we send each completed module separately.
   */

  try {

    const modulesToSave = path.modules || [];

    for (const module of modulesToSave) {

      const moduleId = String(module.id);

      const isCompleted =
        completedModules.some(
          id => String(id) === moduleId
        );

      const progressPercent =
        isCompleted ? 100 : 0;

      const status =
        isCompleted
          ? "completed"
          : "not_started";

      const skill =
        module.name ||
        module.title ||
        moduleId;

      console.log(
        "Saving progress:",
        {
          skill,
          status,
          progress_percent: progressPercent
        }
      );

      await apiRequest(
        ENDPOINTS.progress,
        {
          method: "POST",

          body: {
            skill: skill,
            status: status,
            progress_percent: progressPercent
          }
        }
      );
    }

    console.log(
      "Progress successfully saved to backend."
    );

    return true;

  } catch (error) {

    console.error(
      "Backend progress save failed:",
      error.message
    );

    return false;
  }
}

  /* ==========================================================================
     12. MOBILE NAVIGATION
     ========================================================================== */

  const navMenuToggle =
    document.getElementById(
      "navMenuToggle"
    );


  const navMobilePanel =
    document.getElementById(
      "navMobilePanel"
    );


  if (
    navMenuToggle &&
    navMobilePanel
  ) {

    navMenuToggle.addEventListener(
      "click",
      () => {

        const isOpen =
          !navMobilePanel.hidden;


        navMobilePanel.hidden =
          isOpen;


        navMenuToggle.setAttribute(
          "aria-expanded",
          String(
            !isOpen
          )
        );

      }
    );

  }


  /* ==========================================================================
     13. SETTINGS
     ========================================================================== */

  const settingsOpenBtn =
    document.getElementById(
      "settingsOpenBtn"
    );


  const settingsCloseBtn =
    document.getElementById(
      "settingsCloseBtn"
    );


  const settingsOverlay =
    document.getElementById(
      "settingsOverlay"
    );


  const resetStateBtn =
    document.getElementById(
      "resetStateBtn"
    );


  function openSettings() {

    if (
      !settingsOverlay
    ) {

      return;

    }


    settingsOverlay.hidden =
      false;


    if (
      settingsCloseBtn
    ) {

      settingsCloseBtn.focus();

    }

  }


  function closeSettings() {

    if (
      !settingsOverlay
    ) {

      return;

    }


    settingsOverlay.hidden =
      true;


    if (
      settingsOpenBtn
    ) {

      settingsOpenBtn.focus();

    }

  }


  if (
    settingsOpenBtn
  ) {

    settingsOpenBtn.addEventListener(
      "click",
      openSettings
    );

  }


  if (
    settingsCloseBtn
  ) {

    settingsCloseBtn.addEventListener(
      "click",
      closeSettings
    );

  }


  if (
    settingsOverlay
  ) {

    settingsOverlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          settingsOverlay
        ) {

          closeSettings();

        }

      }
    );

  }


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        settingsOverlay &&
        !settingsOverlay.hidden
      ) {

        closeSettings();

      }

    }
  );


  if (
    resetStateBtn
  ) {

    resetStateBtn.addEventListener(
      "click",
      () => {

        if (
          window.PathlineState
        ) {

          window.PathlineState
            .clearLearningState();

        }


        localStorage.removeItem(
          "learningPath"
        );


        localStorage.removeItem(
          "learnerProfile"
        );


        window.location.href =
          "index.html";

      }
    );

  }


  /* ==========================================================================
     14. LOAD BACKEND DATA
     ========================================================================== */

  let profile = null;
  let path = null;
  let progress = null;

  let backendConnected =
    false;


  try {

    const [
      profileResult,
      recommendationResult,
      progressResult
    ] =
      await Promise.allSettled([

        getProfile(),

        getRecommendations(),

        getProgress()

      ]);


    profile =
      profileResult.status === "fulfilled"
        ? profileResult.value
        : null;


    path =
      recommendationResult.status === "fulfilled"
        ? recommendationResult.value
        : null;


    progress =
      progressResult.status === "fulfilled"
        ? progressResult.value
        : null;


    if (
      profile ||
      path
    ) {

      backendConnected =
        true;

    }

  } catch (error) {

    console.error(
      "Backend loading failed:",
      error
    );

  }


  console.log(
    "Backend:",
    backendConnected
      ? "CONNECTED"
      : "NOT CONNECTED"
  );


  /* ==========================================================================
     15. LOCAL FALLBACK
     ========================================================================== */

  if (
    !profile &&
    window.PathlineState
  ) {

    try {

      profile =
        window.PathlineState
          .getLearnerProfile();

    } catch (error) {

      console.warn(
        "Could not load local profile:",
        error
      );

    }

  }


  if (
    !path &&
    window.PathlineState
  ) {

    try {

      path =
        window.PathlineState
          .getLearningPath();

    } catch (error) {

      console.warn(
        "Could not load local learning path:",
        error
      );

    }

  }


  if (
    !progress &&
    window.PathlineState
  ) {

    try {

      progress =
        window.PathlineState
          .getProgress();

    } catch (error) {

      console.warn(
        "Could not load local progress:",
        error
      );

    }

  }


  /* ==========================================================================
     16. MOCK FALLBACK
     ========================================================================== */

  if (
    !profile ||
    !path
  ) {

    console.warn(
      "Backend/local data unavailable. Loading demo data."
    );


    if (
      window.PathlineAPI &&
      typeof window.PathlineAPI
        .getMockExperience ===
        "function"
    ) {

      try {

        const mock =
          await window.PathlineAPI
            .getMockExperience();


        profile =
          profile ||
          mock.learnerProfile;


        path =
          path ||
          mock.learningPath;

      } catch (error) {

        console.error(
          "Mock data failed:",
          error
        );

      }

    }

  }


  /* ==========================================================================
     17. DEFAULT PROGRESS
     ========================================================================== */

  if (
    !progress
  ) {

    progress = {

      completedModules: []

    };

  }


  /* ==========================================================================
     18. NORMALIZE PROFILE
     ========================================================================== */

  profile =
    profile || {};


  profile = {

    ...profile,

    goal:
      profile.goal ||
      profile.career_goal ||
      profile.target_role ||
      "Personalized Learning",

    experience:
      profile.experience ||
      profile.experience_level ||
      "—",

    skills:
      Array.isArray(
        profile.skills
      )
        ? profile.skills
        : [],

    weeklyHours:
      profile.weeklyHours ||
      profile.weekly_hours ||
      "—",

    learningPreference:
      profile.learningPreference ||
      profile.learning_preference ||
      "—",

    goalId:
      profile.goalId ||
      profile.goal_id ||
      profile.career_goal ||
      profile.goal

  };


  /* ==========================================================================
     19. NORMALIZE PATH
     ========================================================================== */

  if (
    path?.path
  ) {

    path =
      path.path;

  }


  path =
    path || {};


  if (
    !Array.isArray(
      path.modules
    ) &&
    (
      Array.isArray(
        path.roadmap
      ) ||
      Array.isArray(
        path.required_skills
      ) ||
      path.career
    )
  ) {

    path =
      normalizeRecommendation(
        path
      );

  }


  path =
    path || {};


  path = {

    ...path,

    title:
      path.title ||
      path.career ||
      profile.goal ||
      "Personalized Learning Path",

    summary:
      path.summary ||
      path.reason ||
      path.description ||
      "A personalized learning path based on your goals and existing skills.",

    estimatedWeeks:
      path.estimatedWeeks ||
      path.estimated_weeks ||
      path.duration_weeks ||
      20,

    modules:
      Array.isArray(
        path.modules
      )
        ? normalizeModules(
            path.modules
          )
        : [],

    requiredSkills:
      Array.isArray(
        path.requiredSkills
      )
        ? path.requiredSkills
        : Array.isArray(
            path.required_skills
          )
          ? path.required_skills
          : []

  };


  /* ==========================================================================
     20. NORMALIZE PROGRESS
     ========================================================================== */

  /*
   * Backend now returns:
   *
   * completedModules:
   * [
   *   "Foundation"
   * ]
   *
   * But the dashboard uses:
   *
   * stage-1
   *
   * So convert the backend skill names back
   * into the dashboard module IDs.
   */

  let completedModules =
    Array.isArray(
      progress?.completedModules
    )
      ? progress.completedModules
      : Array.isArray(
          progress?.completed_modules
        )
        ? progress.completed_modules
        : [];


  const completed =
    new Set();


  /*
   * Match backend skill names
   * against module names.
   */

  completedModules.forEach(
    completedValue => {

      const value =
        String(
          completedValue
        )
        .trim()
        .toLowerCase();


      const matchingModule =
        path.modules.find(
          module =>
            String(
              module.name
            )
              .trim()
              .toLowerCase() ===
            value
        );


      if (
        matchingModule
      ) {

        completed.add(
          String(
            matchingModule.id
          )
        );

      } else {

        /*
         * Also allow old format
         * where backend/local storage
         * already contains module IDs.
         */

        completed.add(
          String(
            completedValue
          )
        );

      }

    }
  );


  /* ==========================================================================
     21. DISPLAY ELEMENTS
     ========================================================================== */

  const pathTitle =
    document.getElementById(
      "pathTitle"
    );


  const pathSummary =
    document.getElementById(
      "pathSummary"
    );


  const metaWeeks =
    document.getElementById(
      "metaWeeks"
    );


  const metaHours =
    document.getElementById(
      "metaHours"
    );


  const metaPreference =
    document.getElementById(
      "metaPreference"
    );


  const profileExperience =
    document.getElementById(
      "profileExperience"
    );


  const profileGoal =
    document.getElementById(
      "profileGoal"
    );


  if (
    pathTitle
  ) {

    pathTitle.textContent =
      path.title;

  }


  if (
    pathSummary
  ) {

    pathSummary.textContent =
      path.summary;

  }


  if (
    metaWeeks
  ) {

    metaWeeks.textContent =
      `${path.estimatedWeeks} weeks`;

  }


  if (
    metaHours
  ) {

    metaHours.textContent =
      profile.weeklyHours;

  }


  if (
    metaPreference
  ) {

    metaPreference.textContent =
      profile.learningPreference;

  }


  if (
    profileExperience
  ) {

    profileExperience.textContent =
      profile.experience;

  }


  if (
    profileGoal
  ) {

    profileGoal.textContent =
      profile.goal;

  }


  /* ==========================================================================
     22. PROGRESS
     ========================================================================== */

  async function persistProgress() {

    const completedArray =
      Array.from(
        completed
      );


    await saveProgress(
      completedArray
    );

  }


  function updateProgressSummary() {

    const total =
      path.modules.length;


    const validIds =
      new Set(
        path.modules.map(
          module =>
            String(
              module.id
            )
        )
      );


    let done = 0;


    completed.forEach(
      id => {

        if (
          validIds.has(
            String(id)
          )
        ) {

          done++;

        }

      }
    );


    const pct =
      total
        ? Math.round(
            (
              done /
              total
            ) *
            100
          )
        : 0;


    const progressLabel =
      document.getElementById(
        "progressLabel"
      );


    const progressFill =
      document.getElementById(
        "progressFill"
      );


    if (
      progressLabel
    ) {

      progressLabel.textContent =
        `${done} of ${total} modules`;

    }


    if (
      progressFill
    ) {

      progressFill.style.width =
        `${pct}%`;

    }

  }


  /* ==========================================================================
     23. RENDER MODULES
     ========================================================================== */

  const moduleList =
    document.getElementById(
      "moduleList"
    );


  function renderModules() {

    if (
      !moduleList
    ) {

      return;

    }


    moduleList.innerHTML =
      "";


    if (
      !path.modules.length
    ) {

      moduleList.innerHTML = `
        <div class="empty-state">
          <p>No learning modules are available yet.</p>
        </div>
      `;

      return;

    }


    path.modules.forEach(
      (
        module,
        index
      ) => {

        const details =
          document.createElement(
            "details"
          );


        details.className =
          "module";


        const summary =
          document.createElement(
            "summary"
          );


        summary.className =
          "module__summary";


        /* --------------------------------------------------------------------
           CHECKBOX
           -------------------------------------------------------------------- */

        const checkbox =
          document.createElement(
            "span"
          );


        checkbox.className =
          "module__checkbox";


        checkbox.setAttribute(
          "role",
          "checkbox"
        );


        checkbox.setAttribute(
          "tabindex",
          "0"
        );


        const moduleId =
          String(
            module.id
          );


        const isComplete =
          completed.has(
            moduleId
          );


        checkbox.setAttribute(
          "aria-checked",
          String(
            isComplete
          )
        );


        checkbox.setAttribute(
          "aria-label",
          `Mark ${module.name} as complete`
        );


        if (
          isComplete
        ) {

          checkbox.classList.add(
            "is-done"
          );

        }


        async function toggleComplete(
          event
        ) {

          event.preventDefault();
          event.stopPropagation();


          if (
            completed.has(
              moduleId
            )
          ) {

            completed.delete(
              moduleId
            );

          } else {

            completed.add(
              moduleId
            );

          }


          const nowComplete =
            completed.has(
              moduleId
            );


          checkbox.classList.toggle(
            "is-done",
            nowComplete
          );


          checkbox.setAttribute(
            "aria-checked",
            String(
              nowComplete
            )
          );


          updateProgressSummary();


          /*
           * IMPORTANT:
           * Save to Flask using the corrected format.
           */

          await persistProgress();

        }


        checkbox.addEventListener(
          "click",
          toggleComplete
        );


        checkbox.addEventListener(
          "keydown",
          event => {

            if (
              event.key === "Enter" ||
              event.key === " "
            ) {

              toggleComplete(
                event
              );

            }

          }
        );


        /* --------------------------------------------------------------------
           INDEX
           -------------------------------------------------------------------- */

        const indexLabel =
          document.createElement(
            "span"
          );


        indexLabel.className =
          "module__index";


        indexLabel.textContent =
          String(
            index + 1
          ).padStart(
            2,
            "0"
          );


        /* --------------------------------------------------------------------
           NAME
           -------------------------------------------------------------------- */

        const name =
          document.createElement(
            "span"
          );


        name.className =
          "module__name";


        name.textContent =
          module.name;


        /* --------------------------------------------------------------------
           WEEKS
           -------------------------------------------------------------------- */

        const weeks =
          document.createElement(
            "span"
          );


        weeks.className =
          "module__weeks";


        weeks.textContent =
          `${module.weeks} wk`;


        /* --------------------------------------------------------------------
           CHEVRON
           -------------------------------------------------------------------- */

        const chevron =
          document.createElement(
            "span"
          );


        chevron.className =
          "module__chevron";


        chevron.setAttribute(
          "aria-hidden",
          "true"
        );


        summary.append(
          checkbox,
          indexLabel,
          name,
          weeks,
          chevron
        );


        /* --------------------------------------------------------------------
           BODY
           -------------------------------------------------------------------- */

        const body =
          document.createElement(
            "div"
          );


        body.className =
          "module__body";


        /* --------------------------------------------------------------------
           DESCRIPTION
           -------------------------------------------------------------------- */

        const description =
          document.createElement(
            "p"
          );


        description.className =
          "module__description";


        description.textContent =
          module.description;


        body.appendChild(
          description
        );


        /* --------------------------------------------------------------------
           RESOURCES / FOCUS
           -------------------------------------------------------------------- */

        const resources =
          Array.isArray(
            module.resources
          )
            ? module.resources
            : [];


        if (
          resources.length
        ) {

          const resourcesLabel =
            document.createElement(
              "p"
            );


          resourcesLabel.className =
            "module__resources-label";


          resourcesLabel.textContent =
            "Focus areas";


          const resourcesList =
            document.createElement(
              "ul"
            );


          resourcesList.className =
            "module__resources";


          resources.forEach(
            resource => {

              const item =
                document.createElement(
                  "li"
                );


              if (
                typeof resource ===
                  "object" &&
                resource !== null
              ) {

                if (
                  resource.url
                ) {

                  const link =
                    document.createElement(
                      "a"
                    );


                  link.href =
                    resource.url;


                  link.target =
                    "_blank";


                  link.rel =
                    "noopener noreferrer";


                  link.textContent =
                    resource.name ||
                    resource.title ||
                    "Open resource";


                  item.appendChild(
                    link
                  );

                } else {

                  item.textContent =
                    resource.name ||
                    resource.title ||
                    "Resource";

                }

              } else {

                item.textContent =
                  String(
                    resource
                  );

              }


              resourcesList.appendChild(
                item
              );

            }
          );


          body.appendChild(
            resourcesLabel
          );


          body.appendChild(
            resourcesList
          );

        }


        /* --------------------------------------------------------------------
           FEEDBACK
           -------------------------------------------------------------------- */

        if (
          window.PathlineEngine
        ) {

          const feedbackRow =
            document.createElement(
              "div"
            );


          feedbackRow.className =
            "module__feedback";


          const feedbackLabel =
            document.createElement(
              "p"
            );


          feedbackLabel.className =
            "module__feedback-label";


          feedbackLabel.textContent =
            "How's this one going?";


          feedbackRow.appendChild(
            feedbackLabel
          );


          const feedbackButtons =
            document.createElement(
              "div"
            );


          feedbackButtons.className =
            "module__feedback-buttons";


          const feedbackMsg =
            document.createElement(
              "p"
            );


          feedbackMsg.className =
            "module__feedback-msg";


          feedbackMsg.hidden =
            true;


          [
            "Too easy",
            "Makes sense",
            "Too hard"
          ].forEach(
            label => {

              const button =
                document.createElement(
                  "button"
                );


              button.type =
                "button";


              button.className =
                "module__feedback-btn";


              button.textContent =
                label;


              button.addEventListener(
                "click",
                event => {

                  event.preventDefault();


                  try {

                    const analysis =
                      window.PathlineEngine
                        .analyzeFeedback(
                          label
                        );


                    feedbackMsg.textContent =
                      window.PathlineEngine
                        .adaptationMessageFor(
                          analysis.action
                        );


                    feedbackMsg.hidden =
                      false;

                  } catch (error) {

                    console.warn(
                      "Feedback analysis failed:",
                      error
                    );

                  }

                }
              );


              feedbackButtons.appendChild(
                button
              );

            }
          );


          feedbackRow.appendChild(
            feedbackButtons
          );


          feedbackRow.appendChild(
            feedbackMsg
          );


          body.appendChild(
            feedbackRow
          );

        }


        details.appendChild(
          summary
        );


        details.appendChild(
          body
        );


        moduleList.appendChild(
          details
        );

      }
    );

  }


  /* ==========================================================================
     24. SKILL GAP
     ========================================================================== */

  function renderSkillGap() {

    const introEl =
      document.getElementById(
        "skillGapIntro"
      );


    const listEl =
      document.getElementById(
        "skillGapList"
      );


    if (
      !introEl ||
      !listEl
    ) {

      return;

    }


    const requiredSkills =
      Array.isArray(
        path.requiredSkills
      )
        ? path.requiredSkills
        : [];


    const knownSkills =
      Array.isArray(
        profile.skills
      )
        ? profile.skills
        : [];


    const normalizedKnown =
      knownSkills.map(
        skill =>
          String(
            skill
          )
            .trim()
            .toLowerCase()
      );


    const missingSkills =
      requiredSkills.filter(
        skill => {

          return !normalizedKnown.includes(
            String(
              skill
            )
              .trim()
              .toLowerCase()
          );

        }
      );


    if (
      !requiredSkills.length
    ) {

      introEl.textContent =
        "Your learning path will guide you through the skills needed for your selected career.";


      listEl.innerHTML =
        "";


      return;

    }


    if (
      !missingSkills.length
    ) {

      introEl.textContent =
        "You already have the core skills required for this career path.";


      listEl.innerHTML =
        "";


      return;

    }


    introEl.textContent =
      "Based on your existing skills, these are the areas to focus on next:";


    listEl.innerHTML =
      "";


    missingSkills.forEach(
      skill => {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "skill-gap__item";


        const heading =
          document.createElement(
            "p"
          );


        heading.className =
          "skill-gap__skill";


        heading.textContent =
          skill;


        item.appendChild(
          heading
        );


        listEl.appendChild(
          item
        );

      }
    );

  }


  /* ==========================================================================
     25. KNOWN SKILLS
     ========================================================================== */

  const knownSkills =
    document.getElementById(
      "knownSkills"
    );


  if (
    knownSkills
  ) {

    knownSkills.innerHTML =
      "";


    if (
      profile.skills.length
    ) {

      profile.skills.forEach(
        skill => {

          const chip =
            document.createElement(
              "span"
            );


          chip.className =
            "chip";


          chip.textContent =
            skill;


          knownSkills.appendChild(
            chip
          );

        }
      );

    } else {

      knownSkills.innerHTML =
        `<span class="chip">Not specified</span>`;

    }

  }


  /* ==========================================================================
     26. PATH SKILLS
     ========================================================================== */

  const gapSkills =
    document.getElementById(
      "gapSkills"
    );


  if (
    gapSkills
  ) {

    gapSkills.innerHTML =
      "";


    const skills =
      Array.isArray(
        path.requiredSkills
      )
        ? path.requiredSkills
        : [];


    skills.forEach(
      skill => {

        const chip =
          document.createElement(
            "span"
          );


        chip.className =
          "chip chip--gap";


        chip.textContent =
          skill;


        gapSkills.appendChild(
          chip
        );

      }
    );

  }


  /* ==========================================================================
     27. BACKEND STATUS
     ========================================================================== */

  const dashboardBanner =
    document.getElementById(
      "dashboardBanner"
    );


  if (
    dashboardBanner
  ) {

    dashboardBanner.hidden =
      backendConnected;

  }


  /* ==========================================================================
     28. FINAL RENDER
     ========================================================================== */

  renderModules();

  updateProgressSummary();

  renderSkillGap();


  /* ==========================================================================
     29. DEBUG INFORMATION
     ========================================================================== */

  console.log(
    "------------------------------------"
  );


  console.log(
    "Profile:",
    profile
  );


  console.log(
    "Learning Path:",
    path
  );


  console.log(
    "Progress:",
    progress
  );


  console.log(
    "Completed Module IDs:",
    Array.from(
      completed
    )
  );


  console.log(
    "Required Skills:",
    path.requiredSkills
  );


  console.log(
    "Modules:",
    path.modules
  );


  console.log(
    "------------------------------------"
  );


  console.log(
    "Dashboard loaded successfully from backend."
  );

}