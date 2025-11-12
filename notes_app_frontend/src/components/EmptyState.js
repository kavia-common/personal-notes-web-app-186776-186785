import React from "react";

// PUBLIC_INTERFACE
export default function EmptyState({ onCreate }) {
  /** Displayed when there is no note selected or no notes exist. */
  return (
    <div className="empty-state">
      <div>
        <div className="badge">
          <span className="dot" />
          Ocean Professional
        </div>
        <h2 style={{ marginTop: 10 }}>Welcome to Ocean Notes</h2>
        <p style={{ color: "#6b7280" }}>
          Create your first note to get started. Your notes are saved locally and will persist across reloads.
        </p>
        <button className="btn primary" onClick={onCreate}>+ Create Note</button>
      </div>
    </div>
  );
}
