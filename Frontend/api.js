/**
 * api.js
 * ----------------------------------------------------------------------------
 * All backend communication goes through this file. Nothing else in the
 * application should call fetch() directly.
 *
 * Right now every function resolves with mock data so the product can be
 * demonstrated with no backend running. When a real backend exists, replace
 * the body of each function with a fetch() call against API_BASE_URL — the
 * function signatures and return shapes are already what the UI expects, so
 * onboarding.js and dashboard.js will not need to change.
 * ---------------------------------------------------------------------------- */

/* once a real backend exists, e.g. "https://api.pathline.app" */
const API_BASE_URL = "";

const ENDPOINTS = {
  profile: "/api/profile",
  onboarding: "/api/onboarding",
  generatePath: "/api/generate-path",
};

const USE_MOCKS = true;
const MOCK_DATA_URL = "data/mock-data.json";


async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}

let cachedMockData = null;
async function loadMockData() {
  if (cachedMockData) return cachedMockData;
  try {
    const response = await fetch(MOCK_DATA_URL);
    if (!response.ok) throw new Error("mock data not found");
    cachedMockData = await response.json();
  } catch (err) {
    
    cachedMockData = {
      learnerProfile: {
        goal: "Machine Learning Engineer",
        experience: "Intermediate",
        skills: ["Python", "Mathematics"],
        weeklyHours: "10-15 hours",
        learningPreference: "Projects",
      },
      learningPath: {
        title: "Machine Learning Engineer",
        summary:
          "A project-driven path that builds statistical foundations before moving into modeling, evaluation and deployment.",
        estimatedWeeks: 22,
        modules: [
          { id: "statistics", name: "Statistics", weeks: 3, status: "not-started", description: "Probability, distributions and hypothesis testing needed to reason about model behavior.", resources: ["Practical Statistics for Data Scientists"] },
          { id: "machine-learning", name: "Machine Learning", weeks: 5, status: "not-started", description: "Supervised and unsupervised learning, feature engineering and core algorithms.", resources: ["Hands-On Machine Learning with Scikit-Learn"] },
          { id: "model-evaluation", name: "Model Evaluation", weeks: 2, status: "not-started", description: "Cross-validation, metrics selection and diagnosing overfitting and underfitting.", resources: ["Evaluating Machine Learning Models"] },
          { id: "deep-learning", name: "Deep Learning", weeks: 6, status: "not-started", description: "Neural network fundamentals, training dynamics and common architectures.", resources: ["Deep Learning Specialization"] },
          { id: "deployment", name: "Deployment", weeks: 3, status: "not-started", description: "Packaging models, serving predictions and monitoring performance in production.", resources: ["Designing Machine Learning Systems"] },
          { id: "capstone-project", name: "Capstone Project", weeks: 3, status: "not-started", description: "An end-to-end project applying the full path to a problem you define.", resources: ["Project template and rubric"] },
        ],
      },
    };
  }
  return cachedMockData;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const ONBOARDING_QUEUE = [
  {
    field: "experience",
    question: "Before I build your path, how comfortable are you with this subject overall?",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    field: "weeklyHours",
    question: "How much time can you realistically study each week?",
    options: ["2-5 hours", "5-10 hours", "10-15 hours", "15+ hours"],
  },
  {
    field: "learningPreference",
    question: "How do you prefer to learn?",
    options: ["Projects", "Courses", "Practice", "Mixed"],
  },
];


async function createLearnerProfile(profile) {
  if (USE_MOCKS) {
    await wait(300);
    return { id: `profile_${Date.now()}`, ...profile };
  }
  return request(ENDPOINTS.profile, {
    method: "POST",
    body: JSON.stringify(profile),
  });
}


async function sendOnboardingMessage(profile) {
  if (USE_MOCKS) {
    await wait(450);
    const next = ONBOARDING_QUEUE.find((item) => !profile[item.field]);
    if (!next) {
      return { question: null, field: null, options: [], completed: true };
    }
    return {
      question: next.question,
      field: next.field,
      options: next.options,
      completed: false,
    };
  }
  return request(ENDPOINTS.onboarding, {
    method: "POST",
    body: JSON.stringify(profile),
  });
}


async function generateLearningPath(profile) {
  if (USE_MOCKS) {
    // Simulated processing time; the UI shows a step sequence during this.
    await wait(3200);


    if ((profile.goal || "").toLowerCase().includes("force error")) {
      throw new Error("Simulated failure for testing the error state.");
    }

    if (window.PathlineGoals) {
      const built = window.PathlineGoals.buildLearningPath(profile);
      if (built) return built;
    }


    const mock = await loadMockData();
    return {
      ...mock.learningPath,
      title: profile.goal || mock.learningPath.title,
    };
  }
  return request(ENDPOINTS.generatePath, {
    method: "POST",
    body: JSON.stringify(profile),
  });
}


async function getMockExperience() {
  return loadMockData();
}

window.PathlineAPI = {
  createLearnerProfile,
  sendOnboardingMessage,
  generateLearningPath,
  getMockExperience,
};
