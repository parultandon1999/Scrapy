
function ToggleSwitch({ label, checked, onChange, disabled = false, id }) {
  const toggleId = id || `toggle-${(label || 'switch').replace(/\s+/g, '-').toLowerCase()}`
  
  return (
    <label className="toggle-switch" htmlFor={toggleId}>
      <span className="toggle-label">{label}</span>
      <input
        id={toggleId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      />
      <span className="toggle-slider" aria-hidden="true"></span>
    </label>
  )
}

export default ToggleSwitch
