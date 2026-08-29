/**
 * state.js
 * ----------------------------------------------------------------------------
 * The only place that touches localStorage. onboarding.js and dashboard.js
 * read/write learner data exclusively through this module.
 * ---------------------------------------------------------------------------- */

(function () {
  const KEYS = {
    profile: "pathline:learnerProfile",
    path: "pathline:learningPath",
    progress: "pathline:progress",
  };

  function readJSON(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn(`state.js: failed to read ${key}`, err);
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`state.js: failed to write ${key}`, err);
    }
  }

  function getLearnerProfile() {
    return readJSON(KEYS.profile);
  }
  function saveLearnerProfile(profile) {
    writeJSON(KEYS.profile, profile);
  }

  function getLearningPath() {
    return readJSON(KEYS.path);
  }
  function saveLearningPath(path) {
    writeJSON(KEYS.path, path);
  }

  function getProgress() {
    return readJSON(KEYS.progress) || { completedModules: [] };
  }
  function saveProgress(progress) {
    writeJSON(KEYS.progress, progress);
  }

  function clearLearningState() {
    try {
      window.localStorage.removeItem(KEYS.profile);
      window.localStorage.removeItem(KEYS.path);
      window.localStorage.removeItem(KEYS.progress);
    } catch (err) {
      console.warn("state.js: failed to clear state", err);
    }
  }

  window.PathlineState = {
    getLearnerProfile,
    saveLearnerProfile,
    getLearningPath,
    saveLearningPath,
    getProgress,
    saveProgress,
    clearLearningState,
  };
})();
