import React from "react";

// PUBLIC_INTERFACE
export default function AppShell({ headerRight, sidebar, children }) {
  /** Layout wrapper with header, sidebar, and main content. */
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <header className="app-header">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-title">Ocean Notes</div>
          </div>
          <div>{headerRight}</div>
        </header>
        {sidebar}
      </aside>
      <main className="main">
        {children}
      </main>
    </div>
  );
}
