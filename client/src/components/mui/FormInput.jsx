import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import '../../styles/mui/FormInput.css'

function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  min,
  max,
  step,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className={`form-input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className={`form-input-container ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}>
        {Icon && <Icon size={16} className="input-icon" />}
        
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          className="form-input"
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
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

export default FormInput
