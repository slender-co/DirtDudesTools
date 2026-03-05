/**
 * PROJECTS STORAGE — Directory + per-project data
 * ================================================
 * Projects list (metadata) and each project's bid data stored separately.
 */

const PROJECTS_LIST_KEY = 'dirt_dudes_projects_v1';
const PROJECT_DATA_PREFIX = 'dirt_dudes_project_';
const CURRENT_PROJECT_KEY = 'dirt_dudes_current_project_id';

/** Color options for project cards (match theme accents) */
export const PROJECT_COLORS = [
  { id: 'blue',   hex: '#3b82f6', label: 'Blue' },
  { id: 'green',  hex: '#16a34a', label: 'Green' },
  { id: 'orange', hex: '#ea580c', label: 'Orange' },
  { id: 'purple', hex: '#7c3aed', label: 'Purple' },
  { id: 'slate',  hex: '#475569', label: 'Slate' },
  { id: 'rose',   hex: '#e11d48', label: 'Rose' },
  { id: 'amber',  hex: '#d97706', label: 'Amber' },
  { id: 'teal',   hex: '#0d9488', label: 'Teal' },
];

/** Get full list of projects (metadata only) */
export function getProjectsList() {
  try {
    const raw = localStorage.getItem(PROJECTS_LIST_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('getProjectsList failed:', e);
    return [];
  }
}

/** Save projects list */
export function saveProjectsList(projects) {
  try {
    localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(projects));
    return true;
  } catch (e) {
    console.error('saveProjectsList failed:', e);
    return false;
  }
}

/** Get stored bid data for a project (or null) */
export function getProjectData(projectId) {
  if (!projectId) return null;
  try {
    const raw = localStorage.getItem(PROJECT_DATA_PREFIX + projectId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('getProjectData failed:', e);
    return null;
  }
}

/** Save bid data for a project */
export function saveProjectData(projectId, data) {
  if (!projectId) return false;
  try {
    const payload = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROJECT_DATA_PREFIX + projectId, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error('saveProjectData failed:', e);
    return false;
  }
}

/** Get last selected project id */
export function getCurrentProjectId() {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

/** Persist current project id */
export function setCurrentProjectId(id) {
  if (id) localStorage.setItem(CURRENT_PROJECT_KEY, id);
  else localStorage.removeItem(CURRENT_PROJECT_KEY);
}

/** Get savedAt timestamp for a project (or null) */
export function getProjectSavedTime(projectId) {
  const data = getProjectData(projectId);
  if (!data || !data.savedAt) return null;
  try {
    return new Date(data.savedAt);
  } catch {
    return null;
  }
}

/** Delete a project: remove from list and remove its stored data. Returns new list. */
export function deleteProject(projectId) {
  if (!projectId) return getProjectsList();
  try {
    localStorage.removeItem(PROJECT_DATA_PREFIX + projectId);
    const list = getProjectsList().filter(p => p.id !== projectId);
    saveProjectsList(list);
    return list;
  } catch (e) {
    console.error('deleteProject failed:', e);
    return getProjectsList();
  }
}
