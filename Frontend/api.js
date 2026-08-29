/**
 * Pathline API
 * ------------------------------------------------------------
 * All frontend -> backend communication is handled here.
 *
 * Backend:
 * http://127.0.0.1:5000
 *
 * This file converts backend responses into the format expected
 * by onboarding.js and dashboard.js.
 */

const API_BASE_URL = "http://127.0.0.1:5000";


// ============================================================
// ENDPOINTS
// ============================================================

const ENDPOINTS = {

  profile: (userId) =>
    `/api/profile/${userId}`,

  recommendation: (userId) =>
    `/api/recommendations/${userId}`,

  savedRecommendation: (userId) =>
    `/api/recommendations/${userId}/saved`,

  progress: (userId) =>
    `/api/progress/${userId}`,

  database:
    "/api/database",

  register:
    "/api/auth/register",

  login:
    "/api/auth/login",
};


// ============================================================
// USER ID
// ============================================================

function getCurrentUserId() {

  const storedId =
    localStorage.getItem("pathline_user_id");

  if (storedId) {
    return Number(storedId);
  }

  return 1;
}


// ============================================================
// GENERIC REQUEST
// ============================================================

async function request(path, options = {}) {

  const config = {

    method:
      options.method || "GET",

    headers: {

      "Content-Type":
        "application/json",

      ...(options.headers || {}),
    },

    ...options,
  };


  try {

    const response =
      await fetch(
        `${API_BASE_URL}${path}`,
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

      throw new Error(message);
    }


    return data;

  } catch (error) {

    console.error(
      `Pathline API Error [${path}]`,
      error
    );

    throw error;
  }
}


// ============================================================
// AUTH
// ============================================================

async function registerUser(
  name,
  email,
  password
) {

  return request(
    ENDPOINTS.register,
    {

      method: "POST",

      body: JSON.stringify({

        name,
        email,
        password,
      }),
    }
  );
}


async function loginUser(
  email,
  password
) {

  const result =
    await request(
      ENDPOINTS.login,
      {

        method: "POST",

        body: JSON.stringify({

          email,
          password,
        }),
      }
    );


  if (result?.user) {

    localStorage.setItem(
      "pathline_user",
      JSON.stringify(result.user)
    );

    localStorage.setItem(
      "pathline_user_id",
      String(result.user.id)
    );
  }


  return result;
}


// ============================================================
// PROFILE
// ============================================================

async function createLearnerProfile(
  profile,
  userId = getCurrentUserId()
) {

  const payload = {

    goal:
      profile?.goal || "",

    goalId:
      profile?.goalId || "",

    experience:
      profile?.experience || "",

    skills:
      Array.isArray(profile?.skills)
        ? profile.skills
        : [],

    weeklyHours:
      profile?.weeklyHours || "",

    learningPreference:
      profile?.learningPreference || "",
  };


  console.log(
    "Sending profile to backend:",
    payload
  );


  const result =
    await request(
      ENDPOINTS.profile(userId),
      {

        method: "POST",

        body: JSON.stringify(payload),
      }
    );


  console.log(
    "Profile response:",
    result
  );


  return result;
}


async function getLearnerProfile(
  userId = getCurrentUserId()
) {

  const result =
    await request(
      ENDPOINTS.profile(userId),
      {

        method: "GET",
      }
    );


  console.log(
    "Profile GET response:",
    result
  );


  return result;
}


// ============================================================
// PROFILE NORMALIZER
// ============================================================

function normalizeProfileResponse(
  response
) {

  if (!response) {
    return null;
  }


  const profile =
    response.profile ||
    response.user ||
    response;


  return {

    id:
      profile.id ||
      profile.user_id ||
      getCurrentUserId(),

    name:
      profile.name || "",

    email:
      profile.email || "",

    goal:
      profile.goal ||
      profile.career_goal ||
      "",

    goalId:
      profile.goalId ||
      profile.goal_id ||
      "",

    experience:
      profile.experience ||
      profile.experience_level ||
      "",

    skills:
      Array.isArray(profile.skills)
        ? profile.skills
        : parseSkills(profile.skills),

    weeklyHours:
      profile.weeklyHours ||
      profile.weekly_learning_hours ||
      "",

    learningPreference:
      profile.learningPreference ||
      profile.preferred_learning_mode ||
      "",
  };
}


// ============================================================
// SKILLS PARSER
// ============================================================

function parseSkills(value) {

  if (!value) {
    return [];
  }


  if (Array.isArray(value)) {
    return value;
  }


  if (typeof value !== "string") {
    return [];
  }


  try {

    const parsed =
      JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }

  } catch {

    // Not JSON.
  }


  return value
    .split(",")
    .map(
      skill => skill.trim()
    )
    .filter(Boolean);
}


// ============================================================
// RECOMMENDATION
// ============================================================

async function getRecommendation(
  userId = getCurrentUserId()
) {

  const result =
    await request(
      ENDPOINTS.recommendation(userId),
      {

        method: "GET",
      }
    );


  console.log(
    "Recommendation response:",
    result
  );


  return result;
}


// ============================================================
// CONVERT BACKEND ROADMAP TO DASHBOARD MODULES
// ============================================================

function convertRoadmapToModules(
  roadmap,
  requiredSkills = []
) {

  if (
    !Array.isArray(roadmap) ||
    roadmap.length === 0
  ) {

    return requiredSkills.map(
      (skill, index) => ({

        id:
          `skill-${index + 1}`,

        name:
          skill,

        weeks:
          2,

        status:
          "not-started",

        description:
          `Build your ${skill} skills for this career path.`,

        resources:
          [],
      })
    );
  }


  return roadmap.map(
    (stage, index) => {

      const focus =
        Array.isArray(stage.focus)
          ? stage.focus
          : [];


      const duration =
        stage.duration || "";


      return {

        id:
          `stage-${stage.stage || index + 1}`,

        name:
          stage.title ||
          `Stage ${index + 1}`,

        weeks:
          parseDurationToWeeks(
            duration
          ),

        status:
          "not-started",

        description:
          focus.length
            ? `Focus on ${focus.join(", ")}.`
            : "Build the skills required for your selected career path.",

        resources:
          focus,

      };
    }
  );
}


// ============================================================
// CONVERT "4-6 weeks" -> 5
// ============================================================

function parseDurationToWeeks(
  duration
) {

  if (!duration) {
    return 2;
  }


  const numbers =
    String(duration).match(
      /\d+/g
    );


  if (!numbers || !numbers.length) {
    return 2;
  }


  const values =
    numbers.map(Number);


  if (values.length === 1) {
    return values[0];
  }


  return Math.round(
    (values[0] + values[1]) / 2
  );
}


// ============================================================
// NORMALIZE BACKEND RECOMMENDATION
// ============================================================

function normalizeRecommendation(
  response
) {

  if (!response) {
    return null;
  }


  const recommendation =
    response.recommendation ||
    response;


  const career =
    recommendation.career ||
    recommendation.title ||
    "Software Engineer";


  const reason =
    recommendation.reason ||
    recommendation.summary ||
    "Personalized learning path generated from your profile.";


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


  const roadmap =
    Array.isArray(
      recommendation.roadmap
    )
      ? recommendation.roadmap
      : [];


  const modules =
    Array.isArray(
      recommendation.modules
    )
      ? recommendation.modules
      : convertRoadmapToModules(
          roadmap,
          requiredSkills
        );


  const estimatedWeeks =
    modules.reduce(
      (total, module) => {

        return total +
          Number(module.weeks || 0);

      },
      0
    );


  return {

    title:
      career,

    summary:
      reason,

    estimatedWeeks:
      estimatedWeeks || 20,

    modules,

    requiredSkills,

    roadmap,

    career,

    reason,
  };
}


// ============================================================
// GENERATE LEARNING PATH
// ============================================================

async function generateLearningPath(
  profile,
  userId = getCurrentUserId()
) {

  console.log(
    "Generating learning path for:",
    profile
  );


  // ----------------------------------------------------------
  // STEP 1: SAVE PROFILE
  // ----------------------------------------------------------

  await createLearnerProfile(
    profile,
    userId
  );


  // ----------------------------------------------------------
  // STEP 2: ASK BACKEND FOR RECOMMENDATION
  // ----------------------------------------------------------

  const response =
    await request(
      ENDPOINTS.recommendation(userId),
      {

        method: "GET",
      }
    );


  console.log(
    "Raw backend recommendation:",
    response
  );


  // ----------------------------------------------------------
  // STEP 3: CONVERT BACKEND DATA
  // ----------------------------------------------------------

  const learningPath =
    normalizeRecommendation(
      response
    );


  console.log(
    "Normalized learning path:",
    learningPath
  );


  if (!learningPath) {

    throw new Error(
      "Backend returned an invalid recommendation."
    );
  }


  return learningPath;
}


// ============================================================
// SAVED RECOMMENDATION
// ============================================================

async function getSavedRecommendation(
  userId = getCurrentUserId()
) {

  const response =
    await request(
      ENDPOINTS.savedRecommendation(userId),
      {

        method: "GET",
      }
    );


  console.log(
    "Saved recommendation:",
    response
  );


  return response;
}


// ============================================================
// PROGRESS
// ============================================================

async function getProgress(
  userId = getCurrentUserId()
) {

  const response =
    await request(
      ENDPOINTS.progress(userId),
      {

        method: "GET",
      }
    );


  console.log(
    "Progress response:",
    response
  );


  return response;
}


async function saveProgress(
  progress,
  userId = getCurrentUserId()
) {

  const response =
    await request(
      ENDPOINTS.progress(userId),
      {

        method: "POST",

        body: JSON.stringify(
          progress
        ),
      }
    );


  console.log(
    "Progress saved:",
    response
  );


  return response;
}


// ============================================================
// DATABASE CHECK
// ============================================================

async function checkDatabase() {

  return request(
    ENDPOINTS.database,
    {

      method: "GET",
    }
  );
}


// ============================================================
// ONBOARDING
// ============================================================

async function sendOnboardingMessage(
  profile
) {

  const missingFields = [

    "experience",

    "weeklyHours",

    "learningPreference",

  ].filter(
    field =>
      !profile?.[field]
  );


  if (
    missingFields.length === 0
  ) {

    return {

      question: null,

      field: null,

      options: [],

      completed: true,
    };
  }


  const field =
    missingFields[0];


  const questions = {

    experience: {

      question:
        "Before I build your path, how comfortable are you with this subject overall?",

      options: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
    },


    weeklyHours: {

      question:
        "How much time can you realistically study each week?",

      options: [
        "2-5 hours",
        "5-10 hours",
        "10-15 hours",
        "15+ hours",
      ],
    },


    learningPreference: {

      question:
        "How do you prefer to learn?",

      options: [
        "Projects",
        "Courses",
        "Practice",
        "Mixed",
      ],
    },
  };


  return {

    question:
      questions[field].question,

    field,

    options:
      questions[field].options,

    completed:
      false,
  };
}


// ============================================================
// DASHBOARD COMPATIBILITY
// ============================================================

async function getMockExperience() {

  try {

    const userId =
      getCurrentUserId();


    // --------------------------------------------------------
    // GET PROFILE
    // --------------------------------------------------------

    const profileResponse =
      await getLearnerProfile(
        userId
      );


    const profile =
      normalizeProfileResponse(
        profileResponse
      );


    // --------------------------------------------------------
    // GET RECOMMENDATION
    // --------------------------------------------------------

    const recommendationResponse =
      await getRecommendation(
        userId
      );


    const learningPath =
      normalizeRecommendation(
        recommendationResponse
      );


    if (
      profile &&
      learningPath
    ) {

      return {

        learnerProfile:
          profile,

        learningPath:
          learningPath,
      };
    }


    throw new Error(
      "Incomplete backend data"
    );

  } catch (error) {

    console.warn(
      "Backend data unavailable. Using fallback demonstration data.",
      error
    );


    // --------------------------------------------------------
    // FALLBACK ONLY
    // --------------------------------------------------------

    return {

      learnerProfile: {

        goal:
          "Machine Learning Engineer",

        experience:
          "Intermediate",

        skills: [
          "Python",
          "Mathematics",
        ],

        weeklyHours:
          "10-15 hours",

        learningPreference:
          "Projects",
      },


      learningPath: {

        title:
          "Machine Learning Engineer",

        summary:
          "A personalized project-driven learning path.",

        estimatedWeeks:
          22,

        modules: [

          {

            id:
              "statistics",

            name:
              "Statistics",

            weeks:
              3,

            status:
              "not-started",

            description:
              "Probability, distributions and statistics.",

            resources: [
              "Practical Statistics for Data Scientists",
            ],
          },


          {

            id:
              "machine-learning",

            name:
              "Machine Learning",

            weeks:
              5,

            status:
              "not-started",

            description:
              "Supervised and unsupervised learning.",

            resources: [
              "Hands-On Machine Learning",
            ],
          },


          {

            id:
              "deep-learning",

            name:
              "Deep Learning",

            weeks:
              6,

            status:
              "not-started",

            description:
              "Neural networks and deep learning.",

            resources: [
              "Deep Learning Specialization",
            ],
          },
        ],
      },
    };
  }
}


// ============================================================
// GLOBAL API
// ============================================================

window.PathlineAPI = {

  // Auth
  registerUser,
  loginUser,

  // Profile
  createLearnerProfile,
  getLearnerProfile,

  // Recommendation
  generateLearningPath,
  getRecommendation,
  getSavedRecommendation,

  // Progress
  getProgress,
  saveProgress,

  // Database
  checkDatabase,

  // Onboarding
  sendOnboardingMessage,

  // Dashboard compatibility
  getMockExperience,
};