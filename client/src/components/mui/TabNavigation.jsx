import '../../styles/mui/TabNavigation.css'

function TabNavigation({
  tabs = [],
  activeTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`tab-navigation tab-navigation-${variant} ${fullWidth ? 'tab-full-width' : ''} ${className}`}
      role="tablist"
      {...props}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`tab-item ${activeTab === tab.value ? 'tab-active' : ''} ${tab.disabled ? 'tab-disabled' : ''}`}
          onClick={() => !tab.disabled && onChange(tab.value)}
          disabled={tab.disabled}
          role="tab"
          aria-selected={activeTab === tab.value}
          aria-controls={`tabpanel-${tab.value}`}
        >
          {tab.icon && <tab.icon size={18} />}
          <span>{tab.label}</span>
          {tab.badge && (
            <span className="tab-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation
