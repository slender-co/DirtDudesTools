import React, { useState } from 'react';
import { useBid } from '../context/BidContext';
import { PROJECT_COLORS } from '../utils/projectsStorage';
import NewProjectModal from './NewProjectModal';

export default function ProjectsPage({ onOpenProject }) {
  const { projects, currentProjectId, setCurrentProject, createProject } = useBid();
  const [showNewModal, setShowNewModal] = useState(false);

  const getColorHex = (colorId) => PROJECT_COLORS.find(c => c.id === colorId)?.hex || '#475569';

  const handleCreateProject = (metadata) => {
    createProject(metadata);
    setShowNewModal(false);
    if (onOpenProject) onOpenProject('bid');
  };

  const handleSelectProject = (id) => {
    setCurrentProject(id);
    if (onOpenProject) onOpenProject('bid');
  };

  return (
    <div className="projects-page">
      <div className="projects-page-header">
        <h1 className="projects-title">Projects</h1>
        <p className="projects-subtitle">Select a project to work on, or create a new one. Changes auto-save as you edit.</p>
        <button type="button" className="btn-new-project" onClick={() => setShowNewModal(true)}>
          <span className="btn-new-project-icon">+</span>
          New project
        </button>
      </div>

      <div className="projects-list">
        {projects.length === 0 ? (
          <div className="projects-empty">
            <p>No projects yet.</p>
            <p>Create your first project to get started.</p>
            <button type="button" className="btn-new-project secondary" onClick={() => setShowNewModal(true)}>
              + New project
            </button>
          </div>
        ) : (
          projects.map(project => (
            <button
              key={project.id}
              type="button"
              className={`project-card ${currentProjectId === project.id ? 'active' : ''}`}
              onClick={() => handleSelectProject(project.id)}
            >
              <span className="project-card-dot" style={{ background: getColorHex(project.color) }} />
              <div className="project-card-body">
                <span className="project-card-name">{project.name}</span>
                {project.address && <span className="project-card-address">{project.address}</span>}
                {project.client && <span className="project-card-client">{project.client}</span>}
                <span className="project-card-meta">
                  Updated {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
              </div>
              <span className="project-card-arrow">→</span>
            </button>
          ))
        )}
      </div>

      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
