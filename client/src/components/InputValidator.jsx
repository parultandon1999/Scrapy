import { useState } from 'react'

function NumericInput({ label, value, onChange, placeholder, className = '', ...props }) {
  const [error, setError] = useState('')

  const handleKeyPress = (e) => {
    if (e.key == 'Enter') {
      return
    }
    
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault()
      setError(`${label} accepts only numeric values`)
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div className={`option-field ${className}`} style={{ position: 'relative' }}>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        {...props}
      />
      {error && <span className="field-error-tooltip">{error}</span>}
    </div>
  )
}

export default NumericInput
