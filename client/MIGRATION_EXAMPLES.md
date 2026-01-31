# Button Component Migration Examples

Quick reference for migrating existing buttons to the new Button component.

## Common Patterns

### 1. Simple Button
**Before:**
```jsx
<button className="btn-primary" onClick={handleClick}>
  Submit
</button>
```

**After:**
```jsx
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>
```

### 2. Button with Icon
**Before:**
```jsx
<button className="btn-primary" onClick={handleClick}>
  <Play size={18} />
  Start
</button>
```

**After:**
```jsx
<Button variant="primary" icon={Play} onClick={handleClick}>
  Start
</Button>
```

### 3. Disabled Button
**Before:**
```jsx
<button className="btn-primary" disabled={isDisabled} onClick={handleClick}>
  Submit
</button>
```

**After:**
```jsx
<Button variant="primary" disabled={isDisabled} onClick={handleClick}>
  Submit
</Button>
```

### 4. Loading Button
**Before:**
```jsx
<button className="btn-primary" disabled={loading} onClick={handleClick}>
  {loading ? (
    <>
      <div className="spinner"></div>
      Loading...
    </>
  ) : (
    'Submit'
  )}
</button>
```

**After:**
```jsx
<Button variant="primary" loading={loading} onClick={handleClick}>
  {loading ? 'Loading...' : 'Submit'}
</Button>
```

### 5. Danger Button
**Before:**
```jsx
<button className="btn-danger" onClick={handleDelete}>
  <Trash2 size={16} />
  Delete
</button>
```

**After:**
```jsx
<Button variant="danger" icon={Trash2} onClick={handleDelete}>
  Delete
</Button>
```

### 6. Small Button
**Before:**
```jsx
<button className="btn-small btn-primary" onClick={handleClick}>
  Action
</button>
```

**After:**
```jsx
<Button variant="primary" size="small" onClick={handleClick}>
  Action
</Button>
```

### 7. Full Width Button
**Before:**
```jsx
<button className="btn-primary full-width" onClick={handleClick}>
  Continue
</button>
```

**After:**
```jsx
<Button variant="primary" fullWidth onClick={handleClick}>
  Continue
</Button>
```

### 8. Button Group
**Before:**
```jsx
<div className="button-group">
  <button className="btn-primary" onClick={handleSave}>Save</button>
  <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
</div>
```

**After:**
```jsx
<div className="btn-group">
  <Button variant="primary" onClick={handleSave}>Save</Button>
  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
</div>
```

### 9. Icon Only Button
**Before:**
```jsx
<button className="icon-btn" onClick={handleEdit}>
  <Edit size={16} />
</button>
```

**After:**
```jsx
<Button variant="ghost" icon={Edit} onClick={handleEdit} className="btn-icon-only">
  Edit
</Button>
```

### 10. Submit Button in Form
**Before:**
```jsx
<button type="submit" className="btn-primary" disabled={!isValid}>
  Submit Form
</button>
```

**After:**
```jsx
<Button type="submit" variant="primary" disabled={!isValid}>
  Submit Form
</Button>
```

## Class Name Mapping

| Old Class | New Variant |
|-----------|-------------|
| `btn-primary` | `variant="primary"` |
| `btn-secondary` | `variant="secondary"` |
| `btn-danger` | `variant="danger"` |
| `btn-success` | `variant="success"` |
| `btn-warning` | `variant="warning"` |
| `btn-default` | `variant="default"` |
| `btn-ghost` | `variant="ghost"` |
| `btn-outline` | `variant="outline"` |
| `btn-link` | `variant="link"` |
| `btn-small` | `size="small"` |
| `btn-large` | `size="large"` |
| `full-width` | `fullWidth` |

## Import Statement

Add this to the top of your file:
```jsx
import Button from '../components/Button'
import { IconName } from 'lucide-react' // if using icons
```

## Tips

1. **Icons**: Use the `icon` prop instead of manually adding icon components
2. **Loading**: Use the `loading` prop instead of conditional rendering
3. **Variants**: Choose semantic variants (primary, danger, success) over generic ones
4. **Size**: Use size prop instead of custom classes
5. **Groups**: Use `btn-group` or `btn-group-vertical` classes for button groups

## Testing

After migration, test:
- Click functionality
- Disabled state
- Loading state
- Hover effects
- Focus states
- Dark mode appearance
- Responsive behavior

## Demo

Visit `/button-demo` in your browser to see all variants and test interactions.
