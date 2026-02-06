import { useState } from 'react'
import Input from './mui/inputs/Input'
import Icon from './mui/icons/Icon'

function SearchBar({ 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  onSubmit, 
  error, 
  valid, 
  recentUrls = [], 
  onSelectRecent,
  onDeleteRecent,
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit()
    }
  }

  const handleSelectUrl = (url) => {
    if (onSelectRecent) {
      onSelectRecent(url)
    }
    setIsFocused(false)
  }

  const handleDeleteUrl = (e, url) => {
    e.stopPropagation()
    if (onDeleteRecent) {
      onDeleteRecent(url)
    }
  }

  const getFaviconUrl = (url) => {
    try {
      const urlObj = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
    } catch {
      return null
    }
  }

  const shouldShowDropdown = isFocused && recentUrls.length > 0 && !value

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-[600px] relative"
    >
      <div className="relative">
        <Input
          type="url"
          placeholder={placeholder || "Enter URL to scrape..."}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          error={!!error}
          helperText={error || ''}
          fullWidth
          size="medium"
          icon={valid && !error ? () => <Icon name="CheckCircle" size={20} /> : null}
          iconPosition="end"
          // We pass styles via className to your custom Input component
          // Assuming your Input component accepts className or passes props down
          className={`
            transition-all duration-200
            rounded-[50px] bg-white border border-gray-200 shadow-[0_1px_6px_rgba(32,33,36,0.08)]
            hover:shadow-[0_1px_6px_rgba(32,33,36,0.18)] hover:border-gray-200
            focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus-within:border-gray-200
            ${error ? 'border-red-500 shadow-[0_1px_6px_rgba(234,67,53,0.2)]' : ''}
            [&_input]:py-3 [&_input]:px-4
          `}
        />

        {/* Recent URLs Dropdown */}
        {shouldShowDropdown && (
          <div
            className="absolute top-[calc(100%+4px)] left-0 right-0 z-[1000] max-h-[240px] overflow-hidden rounded-lg bg-white shadow-md border border-gray-100"
            onMouseDown={(e) => e.preventDefault()} // Prevents blur
          >
            <ul className="max-h-[240px] overflow-y-auto custom-scrollbar p-0 m-0 list-none">
              {recentUrls.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectUrl(item.url)}
                  className={`
                    group flex items-center gap-3 py-2 px-4 cursor-pointer hover:bg-gray-50
                    ${index < recentUrls.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
                >
                  {/* Favicon */}
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <img 
                      src={getFaviconUrl(item.url)} 
                      alt=""
                      className="w-full h-full object-contain"
                      onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-gray-400">
                       <Icon name="Language" size={16} />
                    </div>
                  </div>
                  
                  {/* URL Text */}
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-700">
                    {item.url}
                  </span>
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteUrl(e, item.url)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer"
                  >
                    <Icon name="Close" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </form>
  )
}

export default SearchBar