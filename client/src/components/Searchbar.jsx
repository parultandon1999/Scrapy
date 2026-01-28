import '../styles/SearchBar.css'

function SearchBar({ value, onChange, placeholder, disabled, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit()
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-box">
        <input
          type="url"
          placeholder={placeholder || "Enter URL to scrape..."}
          value={value}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
    </form>
  )
}

export default SearchBar
