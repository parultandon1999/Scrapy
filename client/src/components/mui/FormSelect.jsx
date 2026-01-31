import { ChevronDown, AlertCircle } from 'lucide-react'
import '../../styles/mui/FormSelect.css'

function FormSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  hint,
  required = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <div className={`form-select-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className={`form-select-container ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}>
        {Icon && <Icon size={16} className="select-icon" />}
        
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="form-select"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown size={16} className="select-chevron" />
      </div>
      
      {error && (
        <div className="form-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <div className="form-hint">{hint}</div>
      )}
    </div>
  )
}

export default FormSelect
