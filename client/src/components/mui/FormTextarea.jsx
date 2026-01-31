import { AlertCircle } from 'lucide-react'
import '../../styles/mui/FormTextarea.css'

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  fullWidth = false,
  rows = 4,
  maxLength,
  showCount = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-textarea-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
      {label && (
        <div className="textarea-label-row">
          <label className="form-label">
            {label}
            {required && <span className="required-mark">*</span>}
          </label>
          {showCount && maxLength && (
            <span className="char-count">
              {value?.length || 0} / {maxLength}
            </span>
          )}
        </div>
      )}
      
      <div className={`form-textarea-container ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}>
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className="form-textarea"
          {...props}
        />
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

export default FormTextarea
