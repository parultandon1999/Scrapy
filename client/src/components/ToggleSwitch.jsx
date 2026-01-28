
function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="toggle-switch">
      <span className="toggle-label">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="toggle-slider"></span>
    </label>
  )
}

export default ToggleSwitch
