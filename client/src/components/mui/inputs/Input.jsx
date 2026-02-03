import { useState } from 'react'
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Switch,
  Slider,
  Autocomplete,
  InputAdornment,
  IconButton,
  FormHelperText
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

/**
 * Material-UI Input Component Wrapper
 * 
 * Unified input component that handles all input types using Material-UI.
 * Supports text, password, email, number, select, checkbox, radio, switch, etc.
 * 
 * @param {string} type - Input type (text, password, email, number, tel, url, date, time, datetime-local, select, checkbox, radio, switch, slider, autocomplete, textarea)
 * @param {string} variant - Material-UI variant (outlined, filled, standard)
 * @param {string} label - Input label
 * @param {any} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Required field
 * @param {boolean} disabled - Disabled state
 * @param {boolean} error - Error state
 * @param {string} helperText - Helper/error text
 * @param {boolean} fullWidth - Full width input
 * @param {string} size - Input size (small, medium)
 * @param {boolean} multiline - Multiline textarea
 * @param {number} rows - Number of rows for textarea
 * @param {object} icon - Icon component (for text fields)
 * @param {string} iconPosition - Icon position (start, end)
 * @param {array} options - Options for select/autocomplete/radio
 * @param {number} min - Min value for number/slider
 * @param {number} max - Max value for number/slider
 * @param {number} step - Step value for number/slider
 * @param {boolean} showPasswordToggle - Show password toggle for password fields
 */

function Input({
  type = 'text',
  variant = 'outlined',
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = false,
  size = 'medium',
  rows = 4,
  icon: Icon,
  iconPosition = 'start',
  options = [],
  min,
  max,
  step,
  showPasswordToggle = true,
  className = '',
  name,
  id,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)

  // Text Field (default, password, email, number, tel, url, date, time, datetime-local)
  if (
    type === 'text' || 
    type === 'email' || 
    type === 'number' || 
    type === 'tel' || 
    type === 'url' ||
    type === 'date' ||
    type === 'time' ||
    type === 'datetime-local' ||
    type === 'password'
  ) {
    const inputProps = {}
    
    if (type === 'number') {
      if (min !== undefined) inputProps.min = min
      if (max !== undefined) inputProps.max = max
      if (step !== undefined) inputProps.step = step
    }

    const startAdornment = Icon && iconPosition === 'start' ? (
      <InputAdornment position="start">
        <Icon size={20} />
      </InputAdornment>
    ) : null

    const endAdornment = type === 'password' && showPasswordToggle ? (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setShowPassword(!showPassword)}
          edge="end"
          aria-label="toggle password visibility"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ) : Icon && iconPosition === 'end' ? (
      <InputAdornment position="end">
        <Icon size={20} />
      </InputAdornment>
    ) : null

    return (
      <TextField
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        variant={variant}
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        size={size}
        className={className}
        name={name}
        id={id}
        InputProps={{
          startAdornment,
          endAdornment,
        }}
        inputProps={inputProps}
        InputLabelProps={
          type === 'date' || type === 'time' || type === 'datetime-local'
            ? { shrink: true }
            : undefined
        }
        {...props}
      />
    )
  }

  // Textarea
  if (type === 'textarea') {
    return (
      <TextField
        variant={variant}
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        size={size}
        multiline
        rows={rows}
        className={className}
        name={name}
        id={id}
        {...props}
      />
    )
  }

  // Select Dropdown
  if (type === 'select') {
    return (
      <FormControl 
        variant={variant} 
        fullWidth={fullWidth} 
        size={size}
        required={required}
        disabled={disabled}
        error={error}
        className={className}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          value={value}
          onChange={onChange}
          label={label}
          name={name}
          id={id}
          {...props}
        >
          {options.map((option, index) => (
            <MenuItem 
              key={option.value || index} 
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }

  // Autocomplete
  if (type === 'autocomplete') {
    return (
      <Autocomplete
        options={options}
        value={value}
        onChange={(event, newValue) => onChange({ target: { value: newValue } })}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        className={className}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant={variant}
            required={required}
            error={error}
            helperText={helperText}
            placeholder={placeholder}
            name={name}
            id={id}
          />
        )}
        {...props}
      />
    )
  }

  // Checkbox
  if (type === 'checkbox') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={value}
            onChange={onChange}
            disabled={disabled}
            name={name}
            id={id}
            {...props}
          />
        }
        label={label}
        className={className}
      />
    )
  }

  // Radio Group
  if (type === 'radio') {
    return (
      <FormControl 
        component="fieldset" 
        disabled={disabled}
        error={error}
        className={className}
      >
        {label && <FormLabel component="legend">{label}</FormLabel>}
        <RadioGroup
          value={value}
          onChange={onChange}
          name={name}
          {...props}
        >
          {options.map((option, index) => (
            <FormControlLabel
              key={option.value || index}
              value={option.value}
              control={<Radio />}
              label={option.label}
              disabled={option.disabled}
            />
          ))}
        </RadioGroup>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }

  // Switch
  if (type === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={value}
            onChange={onChange}
            disabled={disabled}
            name={name}
            id={id}
            {...props}
          />
        }
        label={label}
        className={className}
      />
    )
  }

  // Slider
  if (type === 'slider') {
    return (
      <div className={className}>
        {label && (
          <FormLabel component="legend" style={{ marginBottom: 8 }}>
            {label}
          </FormLabel>
        )}
        <Slider
          value={value}
          onChange={(event, newValue) => onChange({ target: { value: newValue } })}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          valueLabelDisplay="auto"
          name={name}
          id={id}
          {...props}
        />
        {helperText && (
          <FormHelperText error={error}>{helperText}</FormHelperText>
        )}
      </div>
    )
  }

  // File Input
  if (type === 'file') {
    return (
      <TextField
        type="file"
        variant={variant}
        label={label}
        onChange={onChange}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        size={size}
        className={className}
        name={name}
        id={id}
        InputLabelProps={{
          shrink: true,
        }}
        {...props}
      />
    )
  }

  // Default fallback to text field
  return (
    <TextField
      type={type}
      variant={variant}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      size={size}
      className={className}
      name={name}
      id={id}
      {...props}
    />
  )
}

export default Input
