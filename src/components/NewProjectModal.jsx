import React, { useState } from 'react';
import { PROJECT_COLORS } from '../utils/projectsStorage';

export default function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [client, setClient] = useState('');
  const [color, setColor] = useState('slate');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), address: address.trim(), client: client.trim(), color });
    onClose();
  };

  return (
    <div className="mo show" onClick={onClose}>
      <div className="md new-project-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New project</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} className="new-project-form">
          <div className="form-group">
            <label htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 374 Arno Way"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-address">Address</label>
            <input
              id="project-address"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Street, city, state, zip"
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-client">Client</label>
            <input
              id="project-client"
              type="text"
              value={client}
              onChange={e => setClient(e.target.value)}
              placeholder="Client or company name"
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`color-swatch ${color === c.id ? 'active' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => setColor(c.id)}
                  title={c.label}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>Create project</button>
          </div>
        </form>
      </div>
    </div>
  );
}
