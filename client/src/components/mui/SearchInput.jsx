import { Search, X } from 'lucide-react'
import '../../styles/mui/SearchInput.css'

function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onChange({ target: { value: '' } })
    }
  }

  return (
    <div className={`search-input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
      <Search size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="search-input"
        {...props}
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}

export default SearchInput
