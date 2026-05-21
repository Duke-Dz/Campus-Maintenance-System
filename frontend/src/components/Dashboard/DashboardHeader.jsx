export const DashboardHeader = ({
  id = "dashboard",
  variant = "student",
  eyebrow,
  title,
  subtitle,
  actions,
  chips,
  children,
}) => {
  return (
    <section id={id} data-dashboard-section="true" className={`dashboard-role-header dashboard-role-header-${variant}`}>
      <div className="dashboard-role-header-grid">
        <div className="space-y-4">
          {eyebrow ? <p className="dashboard-role-eyebrow">{eyebrow}</p> : null}
          <div>
            <h1 className="dashboard-role-title">{title}</h1>
            {subtitle ? <p className="dashboard-role-subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {children ? <div className="dashboard-role-header-side">{children}</div> : null}
      </div>
      {chips?.length ? (
        <div className="dashboard-chip-strip">
          {chips.map((chip) => (
            <div key={chip.label} className="dashboard-chip-card">
              <span className="dashboard-chip-label">{chip.label}</span>
              <strong className="dashboard-chip-value">{chip.value}</strong>
              {chip.helper ? <span className="dashboard-chip-helper">{chip.helper}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
