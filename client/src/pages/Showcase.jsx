import { useState } from 'react'
import { Typography } from '@mui/material'
import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'
import Button from '../components/mui/buttons/Button'
import Input from '../components/mui/inputs/Input'
import Badge from '../components/mui/badges/Badge'
import Breadcrumb from '../components/mui/breadcrumbs/Breadcrumb'
import StatCard from '../components/mui/cards/StatCard'
import DataTable from '../components/mui/tables/DataTable'
import Icon from '../components/mui/icons/Icon'
import Progress from '../components/mui/progress/Progress'
import { useToast } from '../components/mui/toasts/useToast'
import { 
  SkeletonBox, 
  SkeletonCircle, 
  SkeletonText, 
  SkeletonButton, 
  SkeletonInput,
  SkeletonBadge,
  SkeletonAvatar,
  ConfigSectionSkeleton,
  HistoryCardSkeleton,
  DatabaseTableSkeleton
} from '../components/mui/skeletons/SkeletonLoader'
import { 
  Copy, Save, Trash2, Download, Search,
  Settings, Edit,
  Star, User, Mail,
  Database, FileText, Folder, Package, Bell, TrendingUp, TrendingDown
} from 'lucide-react'
import '../styles/Showcase.css'

function Showcase({ darkMode, toggleDarkMode }) {
  const [activeSection, setActiveSection] = useState('buttons')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  
  // Input states
  const [textValue, setTextValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [multilineValue, setMultilineValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [checkboxValue, setCheckboxValue] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [switchValue, setSwitchValue] = useState(false)
  const [sliderValue, setSliderValue] = useState(30)
  const [autocompleteValue, setAutocompleteValue] = useState(null)
  const [dateValue, setDateValue] = useState('')
  const [timeValue, setTimeValue] = useState('')
  const [numberValue, setNumberValue] = useState('')
  const [selectedRows, setSelectedRows] = useState([])

  // Sample table data
  const sampleUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Editor', status: 'Active' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
    { id: 6, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin', status: 'Active' },
    { id: 7, name: 'Eve Davis', email: 'eve@example.com', role: 'User', status: 'Inactive' },
    { id: 8, name: 'Frank Miller', email: 'frank@example.com', role: 'Editor', status: 'Active' },
  ]

  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value) => (
        <Badge 
          variant="chip" 
          content={value} 
          color={value === 'Active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
  ]

  const handleLoadingTest = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const autocompleteOptions = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 },
    { label: 'Option 4', value: 4 },
  ]

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} currentPage="showcase" />
      <div className="showcase-page">
        {/* Sidebar */}
        <aside className="showcase-sidebar">
          <h2>Showcase</h2>
          <nav className="showcase-nav">
            <button
              className={`showcase-nav-item ${activeSection === 'buttons' ? 'active' : ''}`}
              onClick={() => setActiveSection('buttons')}
            >
              <Package size={18} />
              Buttons
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'inputs' ? 'active' : ''}`}
              onClick={() => setActiveSection('inputs')}
            >
              <Edit size={18} />
              Input Fields
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'badges' ? 'active' : ''}`}
              onClick={() => setActiveSection('badges')}
            >
              <Star size={18} />
              Badges & Chips
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'breadcrumbs' ? 'active' : ''}`}
              onClick={() => setActiveSection('breadcrumbs')}
            >
              <Folder size={18} />
              Breadcrumbs
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'cards' ? 'active' : ''}`}
              onClick={() => setActiveSection('cards')}
            >
              <Package size={18} />
              Cards
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'tables' ? 'active' : ''}`}
              onClick={() => setActiveSection('tables')}
            >
              <Database size={18} />
              Tables
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'skeletons' ? 'active' : ''}`}
              onClick={() => setActiveSection('skeletons')}
            >
              <Package size={18} />
              Skeletons
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'toasts' ? 'active' : ''}`}
              onClick={() => setActiveSection('toasts')}
            >
              <Bell size={18} />
              Toasts
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'icons' ? 'active' : ''}`}
              onClick={() => setActiveSection('icons')}
            >
              <Star size={18} />
              Icons
            </button>
            <button
              className={`showcase-nav-item ${activeSection === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveSection('progress')}
            >
              <TrendingUp size={18} />
              Progress
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="showcase-main">
          <div className="showcase-container">
            
            {/* BUTTONS SECTION */}
            {activeSection === 'buttons' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Buttons</h1>
                  <p>All button variants using Material-UI default styling</p>
                </div>

                {/* Button Variants */}
                <section className="showcase-section">
                  <h2>Button Variants</h2>
                  <p className="section-description">Different visual styles for various use cases</p>
                  <div className="button-grid">
                    <div className="button-demo">
                      <Button variant="default">Default</Button>
                      <span className="button-label">variant="default"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="primary">Primary</Button>
                      <span className="button-label">variant="primary"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="secondary">Secondary</Button>
                      <span className="button-label">variant="secondary"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="success">Success</Button>
                      <span className="button-label">variant="success"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="danger">Danger</Button>
                      <span className="button-label">variant="danger"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="warning">Warning</Button>
                      <span className="button-label">variant="warning"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="ghost">Ghost</Button>
                      <span className="button-label">variant="ghost"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="outline">Outline</Button>
                      <span className="button-label">variant="outline"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="link">Link</Button>
                      <span className="button-label">variant="link"</span>
                    </div>
                  </div>
                </section>

                {/* Button Sizes */}
                <section className="showcase-section">
                  <h2>Button Sizes</h2>
                  <div className="button-row">
                    <div className="button-demo">
                      <Button variant="primary" size="small">Small</Button>
                      <span className="button-label">size="small"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="primary" size="medium">Medium</Button>
                      <span className="button-label">size="medium"</span>
                    </div>
                    <div className="button-demo">
                      <Button variant="primary" size="large">Large</Button>
                      <span className="button-label">size="large"</span>
                    </div>
                  </div>
                </section>

                {/* Buttons with Icons */}
                <section className="showcase-section">
                  <h2>Buttons with Icons</h2>
                  <div className="button-grid">
                    <Button variant="primary" icon={Save}>Save</Button>
                    <Button variant="danger" icon={Trash2}>Delete</Button>
                    <Button variant="success" icon={Download}>Download</Button>
                    <Button variant="default" icon={Search}>Search</Button>
                  </div>
                </section>

                {/* Icon-Only Buttons */}
                <section className="showcase-section">
                  <h2>Icon-Only Buttons</h2>
                  <div className="button-row">
                    <Button variant="icon" icon={Copy} iconOnly ariaLabel="Copy" />
                    <Button variant="icon" icon={Save} iconOnly ariaLabel="Save" />
                    <Button variant="icon" icon={Trash2} iconOnly ariaLabel="Delete" />
                    <Button variant="icon" icon={Settings} iconOnly ariaLabel="Settings" />
                  </div>
                </section>

                {/* Button States */}
                <section className="showcase-section">
                  <h2>Button States</h2>
                  <div className="button-grid">
                    <Button variant="primary">Normal</Button>
                    <Button variant="primary" disabled>Disabled</Button>
                    <Button variant="primary" loading={loading} onClick={handleLoadingTest}>
                      {loading ? 'Loading...' : 'Click to Load'}
                    </Button>
                  </div>
                </section>
              </>
            )}

            {/* INPUTS SECTION */}
            {activeSection === 'inputs' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Input Fields</h1>
                  <p>All input field types using Material-UI default components</p>
                </div>

                {/* Text Fields */}
                <section className="showcase-section">
                  <h2>Text Fields (Using Input Component)</h2>
                  <p className="section-description">Our unified Input component wrapper</p>
                  <div className="input-grid">
                    <Input
                      type="text"
                      label="Text Input"
                      variant="outlined"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Enter text"
                      fullWidth
                    />
                    <Input
                      type="email"
                      label="Email"
                      variant="outlined"
                      icon={Mail}
                      iconPosition="start"
                      fullWidth
                    />
                    <Input
                      type="password"
                      label="Password"
                      variant="outlined"
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      fullWidth
                    />
                  </div>
                </section>

                {/* Text Fields */}
                <section className="showcase-section">
                  <h2>Text Fields (Direct Material-UI)</h2>
                  <p className="section-description">Standard text input fields</p>
                  <div className="input-grid">
                    <Input
                      type="text"
                      label="Standard"
                      variant="outlined"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      fullWidth
                    />
                    <Input
                      type="text"
                      label="Filled"
                      variant="filled"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      fullWidth
                    />
                    <Input
                      type="text"
                      label="Standard (underline)"
                      variant="standard"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      fullWidth
                    />
                  </div>
                </section>

                {/* Text Field States */}
                <section className="showcase-section">
                  <h2>Text Field States</h2>
                  <div className="input-grid">
                    <Input
                      type="text"
                      label="Normal"
                      variant="outlined"
                      fullWidth
                    />
                    <Input
                      type="text"
                      label="Disabled"
                      variant="outlined"
                      disabled
                      fullWidth
                    />
                    <Input
                      type="text"
                      label="Error"
                      variant="outlined"
                      error
                      helperText="This field has an error"
                      fullWidth
                    />
                    <Input
                      type="text"
                      label="Required"
                      variant="outlined"
                      required
                      fullWidth
                    />
                  </div>
                </section>

                {/* Select Dropdown */}
                <section className="showcase-section">
                  <h2>Select Dropdown</h2>
                  <div className="input-grid">
                    <Input
                      type="select"
                      label="Select Option"
                      variant="outlined"
                      value={selectValue}
                      onChange={(e) => setSelectValue(e.target.value)}
                      options={[
                        { label: 'None', value: '' },
                        { label: 'Option 1', value: 'option1' },
                        { label: 'Option 2', value: 'option2' },
                        { label: 'Option 3', value: 'option3' },
                      ]}
                      fullWidth
                    />
                    <Input
                      type="select"
                      label="Filled Select"
                      variant="filled"
                      value={selectValue}
                      onChange={(e) => setSelectValue(e.target.value)}
                      options={[
                        { label: 'Option 1', value: 'option1' },
                        { label: 'Option 2', value: 'option2' },
                        { label: 'Option 3', value: 'option3' },
                      ]}
                      fullWidth
                    />
                  </div>
                </section>

                {/* Textarea */}
                <section className="showcase-section">
                  <h2>Multiline Text Field (Textarea)</h2>
                  <div className="input-grid">
                    <Input
                      type="textarea"
                      label="Description"
                      variant="outlined"
                      rows={4}
                      value={multilineValue}
                      onChange={(e) => setMultilineValue(e.target.value)}
                      placeholder="Enter your description here..."
                      fullWidth
                    />
                  </div>
                </section>

                {/* Autocomplete */}
                <section className="showcase-section">
                  <h2>Autocomplete</h2>
                  <div className="input-grid">
                    <Input
                      type="autocomplete"
                      label="Autocomplete"
                      variant="outlined"
                      value={autocompleteValue}
                      onChange={(e) => setAutocompleteValue(e.target.value)}
                      options={autocompleteOptions}
                      fullWidth
                    />
                  </div>
                </section>

                {/* Checkboxes */}
                <section className="showcase-section">
                  <h2>Checkboxes</h2>
                  <div className="input-row">
                    <Input
                      type="checkbox"
                      label="Checkbox"
                      value={checkboxValue}
                      onChange={(e) => setCheckboxValue(e.target.checked)}
                    />
                    <Input
                      type="checkbox"
                      label="Checked"
                      value={true}
                      onChange={() => {}}
                    />
                    <Input
                      type="checkbox"
                      label="Disabled"
                      disabled
                    />
                  </div>
                </section>

                {/* Radio Buttons */}
                <section className="showcase-section">
                  <h2>Radio Buttons</h2>
                  <Input
                    type="radio"
                    label="Select an option"
                    value={radioValue}
                    onChange={(e) => setRadioValue(e.target.value)}
                    options={[
                      { label: 'Option 1', value: 'option1' },
                      { label: 'Option 2', value: 'option2' },
                      { label: 'Option 3', value: 'option3' },
                      { label: 'Disabled', value: 'option4', disabled: true },
                    ]}
                  />
                </section>

                {/* Switch */}
                <section className="showcase-section">
                  <h2>Switch</h2>
                  <div className="input-row">
                    <Input
                      type="switch"
                      label="Switch"
                      value={switchValue}
                      onChange={(e) => setSwitchValue(e.target.checked)}
                    />
                    <Input
                      type="switch"
                      label="Checked"
                      value={true}
                      onChange={() => {}}
                    />
                    <Input
                      type="switch"
                      label="Disabled"
                      disabled
                    />
                  </div>
                </section>

                {/* Slider */}
                <section className="showcase-section">
                  <h2>Slider</h2>
                  <div className="input-grid">
                    <Input
                      type="slider"
                      label={`Value: ${sliderValue}`}
                      value={sliderValue}
                      onChange={(e) => setSliderValue(e.target.value)}
                      min={0}
                      max={100}
                    />
                    <Input
                      type="slider"
                      label="Disabled Slider"
                      value={30}
                      disabled
                    />
                  </div>
                </section>

                {/* Date and Time */}
                <section className="showcase-section">
                  <h2>Date and Time Inputs</h2>
                  <div className="input-grid">
                    <Input
                      type="date"
                      label="Date"
                      variant="outlined"
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      fullWidth
                    />
                    <Input
                      type="time"
                      label="Time"
                      variant="outlined"
                      value={timeValue}
                      onChange={(e) => setTimeValue(e.target.value)}
                      fullWidth
                    />
                    <Input
                      type="datetime-local"
                      label="DateTime"
                      variant="outlined"
                      fullWidth
                    />
                  </div>
                </section>

                {/* Number Input */}
                <section className="showcase-section">
                  <h2>Number Input</h2>
                  <div className="input-grid">
                    <Input
                      type="number"
                      label="Number"
                      variant="outlined"
                      value={numberValue}
                      onChange={(e) => setNumberValue(e.target.value)}
                      fullWidth
                    />
                    <Input
                      type="number"
                      label="Number with Min/Max"
                      variant="outlined"
                      min={0}
                      max={100}
                      fullWidth
                    />
                  </div>
                </section>

                {/* File Input */}
                <section className="showcase-section">
                  <h2>File Input</h2>
                  <div className="input-grid">
                    <Input
                      type="file"
                      variant="outlined"
                      fullWidth
                    />
                  </div>
                </section>

                {/* Input Sizes */}
                <section className="showcase-section">
                  <h2>Input Sizes</h2>
                  <div className="input-grid">
                    <Input
                      type="text"
                      label="Small"
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                    <Input
                      type="text"
                      label="Medium (default)"
                      variant="outlined"
                      fullWidth
                    />
                  </div>
                </section>
              </>
            )}

            {/* BADGES SECTION */}
            {activeSection === 'badges' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Badges & Chips</h1>
                  <p>Badge overlays and standalone chip components</p>
                </div>

                {/* Badge Overlays */}
                <section className="showcase-section">
                  <h2>Badge Overlays</h2>
                  <p className="section-description">Badges that overlay on icons or content</p>
                  <div className="button-row">
                    <Badge content={4} color="primary">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={10} color="error">
                      <Mail size={24} />
                    </Badge>
                    <Badge content={99} color="secondary">
                      <Settings size={24} />
                    </Badge>
                    <Badge content={1000} max={999} color="warning">
                      <Database size={24} />
                    </Badge>
                  </div>
                </section>

                {/* Badge Colors */}
                <section className="showcase-section">
                  <h2>Badge Colors</h2>
                  <div className="button-row">
                    <Badge content={5} color="default">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={5} color="primary">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={5} color="secondary">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={5} color="error">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={5} color="warning">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={5} color="info">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={5} color="success">
                      <Bell size={24} />
                    </Badge>
                  </div>
                </section>

                {/* Dot Badges */}
                <section className="showcase-section">
                  <h2>Dot Badges</h2>
                  <p className="section-description">Small dot indicators</p>
                  <div className="button-row">
                    <Badge variant="dot" color="primary">
                      <Bell size={24} />
                    </Badge>
                    <Badge variant="dot" color="error">
                      <Mail size={24} />
                    </Badge>
                    <Badge variant="dot" color="success">
                      <Settings size={24} />
                    </Badge>
                  </div>
                </section>

                {/* Badge Positions */}
                <section className="showcase-section">
                  <h2>Badge Positions</h2>
                  <div className="button-row">
                    <Badge content={4} color="primary" anchorOrigin="top-right">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={4} color="primary" anchorOrigin="top-left">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={4} color="primary" anchorOrigin="bottom-right">
                      <Bell size={24} />
                    </Badge>
                    <Badge content={4} color="primary" anchorOrigin="bottom-left">
                      <Bell size={24} />
                    </Badge>
                  </div>
                </section>

                {/* Chips - Filled */}
                <section className="showcase-section">
                  <h2>Chips (Filled)</h2>
                  <p className="section-description">Standalone labels and tags</p>
                  <div className="button-row">
                    <Badge variant="chip" content="Default" color="default" />
                    <Badge variant="chip" content="Primary" color="primary" />
                    <Badge variant="chip" content="Secondary" color="secondary" />
                    <Badge variant="chip" content="Success" color="success" />
                    <Badge variant="chip" content="Error" color="error" />
                    <Badge variant="chip" content="Warning" color="warning" />
                    <Badge variant="chip" content="Info" color="info" />
                  </div>
                </section>

                {/* Chips - Outlined */}
                <section className="showcase-section">
                  <h2>Chips (Outlined)</h2>
                  <div className="button-row">
                    <Badge variant="chip" chipVariant="outlined" content="Default" color="default" />
                    <Badge variant="chip" chipVariant="outlined" content="Primary" color="primary" />
                    <Badge variant="chip" chipVariant="outlined" content="Secondary" color="secondary" />
                    <Badge variant="chip" chipVariant="outlined" content="Success" color="success" />
                    <Badge variant="chip" chipVariant="outlined" content="Error" color="error" />
                  </div>
                </section>

                {/* Chips with Icons */}
                <section className="showcase-section">
                  <h2>Chips with Icons</h2>
                  <div className="button-row">
                    <Badge variant="chip" content="User" color="primary" icon={User} />
                    <Badge variant="chip" content="Email" color="secondary" icon={Mail} />
                    <Badge variant="chip" content="Settings" color="default" icon={Settings} />
                  </div>
                </section>

                {/* Chip Sizes */}
                <section className="showcase-section">
                  <h2>Chip Sizes</h2>
                  <div className="button-row">
                    <Badge variant="chip" content="Small" color="primary" size="small" />
                    <Badge variant="chip" content="Medium" color="primary" size="medium" />
                  </div>
                </section>

                {/* Clickable Chips */}
                <section className="showcase-section">
                  <h2>Clickable Chips</h2>
                  <div className="button-row">
                    <Badge 
                      variant="chip" 
                      content="Click Me" 
                      color="primary" 
                      clickable 
                      onClick={() => alert('Chip clicked!')}
                    />
                    <Badge 
                      variant="chip" 
                      content="With Icon" 
                      color="secondary" 
                      icon={Star}
                      clickable 
                      onClick={() => alert('Chip clicked!')}
                    />
                  </div>
                </section>

                {/* Deletable Chips */}
                <section className="showcase-section">
                  <h2>Deletable Chips</h2>
                  <p className="section-description">Chips with delete button</p>
                  <div className="button-row">
                    <Badge 
                      variant="chip" 
                      content="Deletable" 
                      color="primary" 
                      onDelete={() => alert('Delete clicked!')}
                    />
                    <Badge 
                      variant="chip" 
                      content="With Icon" 
                      color="secondary" 
                      icon={User}
                      onDelete={() => alert('Delete clicked!')}
                    />
                  </div>
                </section>
              </>
            )}

            {/* BREADCRUMBS SECTION */}
            {activeSection === 'breadcrumbs' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Breadcrumbs</h1>
                  <p>Navigation breadcrumbs showing current location in site hierarchy</p>
                </div>

                {/* Basic Breadcrumbs */}
                <section className="showcase-section">
                  <h2>Basic Breadcrumbs</h2>
                  <p className="section-description">Simple navigation path</p>
                  <Breadcrumb
                    items={[
                      { label: 'Dashboard', path: '/dashboard' },
                      { label: 'Settings', path: '/settings' },
                      { label: 'Profile' }
                    ]}
                  />
                </section>

                {/* Breadcrumbs with Icons */}
                <section className="showcase-section">
                  <h2>Breadcrumbs with Icons</h2>
                  <p className="section-description">Navigation with custom icons</p>
                  <Breadcrumb
                    items={[
                      { label: 'Database', path: '/database', icon: Database },
                      { label: 'Tables', path: '/database/tables', icon: FileText },
                      { label: 'Users', icon: User }
                    ]}
                  />
                </section>

                {/* Without Home */}
                <section className="showcase-section">
                  <h2>Without Home Link</h2>
                  <Breadcrumb
                    showHome={false}
                    items={[
                      { label: 'Products', path: '/products' },
                      { label: 'Electronics', path: '/products/electronics' },
                      { label: 'Laptops' }
                    ]}
                  />
                </section>

                {/* Custom Separator */}
                <section className="showcase-section">
                  <h2>Custom Separators</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Breadcrumb
                      separator=">"
                      items={[
                        { label: 'Config', path: '/config' },
                        { label: 'Advanced' }
                      ]}
                    />
                    <Breadcrumb
                      separator="•"
                      items={[
                        { label: 'Docs', path: '/docs' },
                        { label: 'API', path: '/docs/api' },
                        { label: 'Reference' }
                      ]}
                    />
                    <Breadcrumb
                      separator="-"
                      items={[
                        { label: 'Projects', path: '/projects' },
                        { label: 'Web Scraper' }
                      ]}
                    />
                  </div>
                </section>

                {/* Max Items (Collapsed) */}
                <section className="showcase-section">
                  <h2>Collapsed Breadcrumbs</h2>
                  <p className="section-description">Long paths automatically collapse</p>
                  <Breadcrumb
                    maxItems={3}
                    items={[
                      { label: 'Level 1', path: '/level1' },
                      { label: 'Level 2', path: '/level2' },
                      { label: 'Level 3', path: '/level3' },
                      { label: 'Level 4', path: '/level4' },
                      { label: 'Level 5' }
                    ]}
                  />
                </section>

                {/* Real Examples */}
                <section className="showcase-section">
                  <h2>Real-World Examples</h2>
                  <p className="section-description">Examples from actual pages</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Database Page
                      </Typography>
                      <Breadcrumb
                        items={[
                          { label: 'Database', icon: Database }
                        ]}
                      />
                    </div>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Config Page
                      </Typography>
                      <Breadcrumb
                        items={[
                          { label: 'Configuration', icon: Settings }
                        ]}
                      />
                    </div>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Scraping Progress
                      </Typography>
                      <Breadcrumb
                        items={[
                          { label: 'Scraping', path: '/scraping' },
                          { label: 'Progress' }
                        ]}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* CARDS SECTION */}
            {activeSection === 'cards' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Cards</h1>
                  <p>Statistics cards and data display components</p>
                </div>

                {/* Stat Cards */}
                <section className="showcase-section">
                  <h2>Stat Cards</h2>
                  <p className="section-description">Display key metrics and statistics</p>
                  <div className="button-grid">
                    <StatCard
                      title="Total Users"
                      value="1,234"
                      icon={User}
                      color="primary"
                    />
                    <StatCard
                      title="Revenue"
                      value="$45,678"
                      icon={Database}
                      color="success"
                    />
                    <StatCard
                      title="Active Sessions"
                      value="89"
                      icon={Bell}
                      color="warning"
                    />
                    <StatCard
                      title="Error Rate"
                      value="2.3%"
                      icon={Settings}
                      color="error"
                    />
                  </div>
                </section>

                {/* Stat Cards with Trends */}
                <section className="showcase-section">
                  <h2>Stat Cards with Trends</h2>
                  <p className="section-description">Cards showing trend indicators</p>
                  <div className="button-grid">
                    <StatCard
                      title="Sales"
                      value="$12,345"
                      icon={TrendingUp}
                      color="primary"
                      trend="up"
                      trendValue="+12.5% from last month"
                    />
                    <StatCard
                      title="Visitors"
                      value="8,432"
                      icon={User}
                      color="info"
                      trend="up"
                      trendValue="+5.2% from last week"
                    />
                    <StatCard
                      title="Bounce Rate"
                      value="32%"
                      icon={TrendingDown}
                      color="warning"
                      trend="down"
                      trendValue="-3.1% from last month"
                    />
                  </div>
                </section>

                {/* Stat Cards with Subtitles */}
                <section className="showcase-section">
                  <h2>Stat Cards with Subtitles</h2>
                  <div className="button-grid">
                    <StatCard
                      title="Total Revenue"
                      value="$123,456"
                      subtitle="Last updated: 2 hours ago"
                      icon={Database}
                      color="success"
                    />
                    <StatCard
                      title="Active Projects"
                      value="42"
                      subtitle="12 completed this month"
                      icon={Folder}
                      color="primary"
                    />
                  </div>
                </section>

                {/* Clickable Stat Cards */}
                <section className="showcase-section">
                  <h2>Clickable Stat Cards</h2>
                  <p className="section-description">Cards with hover effects and click handlers</p>
                  <div className="button-grid">
                    <StatCard
                      title="View Details"
                      value="Click Me"
                      icon={FileText}
                      color="primary"
                      onClick={() => alert('Card clicked!')}
                    />
                    <StatCard
                      title="Open Settings"
                      value="Interactive"
                      icon={Settings}
                      color="secondary"
                      onClick={() => alert('Settings clicked!')}
                    />
                  </div>
                </section>
              </>
            )}

            {/* TABLES SECTION */}
            {activeSection === 'tables' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Data Tables</h1>
                  <p>Advanced tables with sorting, pagination, filtering, and selection</p>
                </div>

                {/* Basic Table */}
                <section className="showcase-section">
                  <h2>Basic Table</h2>
                  <p className="section-description">Simple data table with default settings</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    pagination={false}
                  />
                </section>

                {/* Table with Pagination */}
                <section className="showcase-section">
                  <h2>Table with Pagination</h2>
                  <p className="section-description">Table with pagination controls</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    pagination={true}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </section>

                {/* Sortable Table */}
                <section className="showcase-section">
                  <h2>Sortable Table</h2>
                  <p className="section-description">Click column headers to sort</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    sortable={true}
                    pagination={true}
                  />
                </section>

                {/* Filterable Table */}
                <section className="showcase-section">
                  <h2>Filterable Table</h2>
                  <p className="section-description">Search and filter table data</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    filterable={true}
                    sortable={true}
                    pagination={true}
                  />
                </section>

                {/* Selectable Table */}
                <section className="showcase-section">
                  <h2>Selectable Table</h2>
                  <p className="section-description">Select rows with checkboxes</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    selectable={true}
                    sortable={true}
                    pagination={true}
                    onSelectionChange={(selected) => setSelectedRows(selected)}
                  />
                  {selectedRows.length > 0 && (
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Selected {selectedRows.length} row(s): {selectedRows.join(', ')}
                    </Typography>
                  )}
                </section>

                {/* Striped Table */}
                <section className="showcase-section">
                  <h2>Striped Table</h2>
                  <p className="section-description">Alternating row colors</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    striped={true}
                    pagination={true}
                  />
                </section>

                {/* Compact Table */}
                <section className="showcase-section">
                  <h2>Compact Table</h2>
                  <p className="section-description">Smaller padding for dense data</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    compact={true}
                    pagination={true}
                  />
                </section>

                {/* Clickable Rows */}
                <section className="showcase-section">
                  <h2>Clickable Rows</h2>
                  <p className="section-description">Click rows to trigger actions</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    onRowClick={(row) => alert(`Clicked: ${row.name}`)}
                    pagination={true}
                  />
                </section>

                {/* Full Featured Table */}
                <section className="showcase-section">
                  <h2>Full Featured Table</h2>
                  <p className="section-description">All features enabled</p>
                  <DataTable
                    columns={userColumns}
                    data={sampleUsers}
                    sortable={true}
                    filterable={true}
                    selectable={true}
                    striped={true}
                    hoverable={true}
                    pagination={true}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowClick={(row) => console.log('Row clicked:', row)}
                    onSelectionChange={(selected) => console.log('Selection:', selected)}
                  />
                </section>
              </>
            )}

            {/* SKELETONS SECTION */}
            {activeSection === 'skeletons' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Skeleton Loaders</h1>
                  <p>Loading state placeholders with animations</p>
                </div>

                {/* Basic Skeletons */}
                <section className="showcase-section">
                  <h2>Basic Skeleton Components</h2>
                  <p className="section-description">Simple skeleton shapes</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Text Skeleton
                      </Typography>
                      <SkeletonBox width="200px" height="20px" />
                    </div>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Circle Skeleton (Avatar)
                      </Typography>
                      <SkeletonCircle size="40px" />
                    </div>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Multiple Text Lines
                      </Typography>
                      <SkeletonText lines={3} />
                    </div>
                  </div>
                </section>

                {/* UI Element Skeletons */}
                <section className="showcase-section">
                  <h2>UI Element Skeletons</h2>
                  <p className="section-description">Skeletons for common UI elements</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Button Skeleton
                      </Typography>
                      <SkeletonButton width="120px" height="40px" />
                    </div>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Input Skeleton
                      </Typography>
                      <SkeletonInput width="300px" height="40px" />
                    </div>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Badge Skeleton
                      </Typography>
                      <SkeletonBadge width="60px" height="24px" />
                    </div>
                    <div>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Avatar Skeleton
                      </Typography>
                      <SkeletonAvatar size="48px" />
                    </div>
                  </div>
                </section>

                {/* Card Skeleton */}
                <section className="showcase-section">
                  <h2>Card Skeleton</h2>
                  <p className="section-description">Loading state for cards</p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <SkeletonCircle size="48px" />
                    <div style={{ flex: 1 }}>
                      <SkeletonBox width="60%" height="20px" sx={{ mb: 1 }} />
                      <SkeletonBox width="100%" height="16px" sx={{ mb: 1 }} />
                      <SkeletonBox width="80%" height="16px" />
                    </div>
                  </div>
                </section>

                {/* History Card Skeleton */}
                <section className="showcase-section">
                  <h2>History Card Skeleton</h2>
                  <p className="section-description">Complex card loading state</p>
                  <HistoryCardSkeleton count={1} />
                </section>

                {/* Config Section Skeleton */}
                <section className="showcase-section">
                  <h2>Config Section Skeleton</h2>
                  <p className="section-description">Form section loading state</p>
                  <ConfigSectionSkeleton count={1} />
                </section>

                {/* Table Skeleton */}
                <section className="showcase-section">
                  <h2>Table Skeleton</h2>
                  <p className="section-description">Data table loading state</p>
                  <DatabaseTableSkeleton rows={5} columns={4} />
                </section>

                {/* List Skeleton */}
                <section className="showcase-section">
                  <h2>List Skeleton</h2>
                  <p className="section-description">List items loading state</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <SkeletonCircle size="40px" />
                        <div style={{ flex: 1 }}>
                          <SkeletonBox width="70%" height="18px" sx={{ mb: 0.5 }} />
                          <SkeletonBox width="50%" height="14px" />
                        </div>
                        <SkeletonButton width="80px" height="32px" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Profile Skeleton */}
                <section className="showcase-section">
                  <h2>Profile Skeleton</h2>
                  <p className="section-description">User profile loading state</p>
                  <div style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <SkeletonAvatar size="80px" />
                    <div style={{ flex: 1 }}>
                      <SkeletonBox width="200px" height="24px" sx={{ mb: 1 }} />
                      <SkeletonBox width="150px" height="16px" sx={{ mb: 2 }} />
                      <SkeletonText lines={2} />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <SkeletonButton width="100px" height="36px" />
                        <SkeletonButton width="100px" height="36px" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Stats Grid Skeleton */}
                <section className="showcase-section">
                  <h2>Stats Grid Skeleton</h2>
                  <p className="section-description">Statistics dashboard loading state</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', textAlign: 'center' }}>
                        <SkeletonBox width="60px" height="36px" sx={{ mx: 'auto', mb: 1 }} />
                        <SkeletonBox width="80px" height="16px" sx={{ mx: 'auto' }} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Media Card Skeleton */}
                <section className="showcase-section">
                  <h2>Media Card Skeleton</h2>
                  <p className="section-description">Image card loading state</p>
                  <div style={{ maxWidth: '300px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                    <SkeletonBox width="100%" height="200px" variant="rectangular" />
                    <div style={{ padding: '16px' }}>
                      <SkeletonBox width="80%" height="20px" sx={{ mb: 1 }} />
                      <SkeletonText lines={2} />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <SkeletonButton width="80px" height="32px" />
                        <SkeletonButton width="80px" height="32px" />
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* TOASTS SECTION */}
            {activeSection === 'toasts' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Toast Notifications</h1>
                  <p>Snackbar notifications with different severity levels</p>
                </div>

                {/* Toast Types */}
                <section className="showcase-section">
                  <h2>Toast Types</h2>
                  <p className="section-description">Click buttons to show different toast notifications</p>
                  <div className="button-grid">
                    <Button 
                      variant="success" 
                      onClick={() => showToast('Operation completed successfully!', 'success')}
                    >
                      Show Success Toast
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => showToast('An error occurred!', 'error')}
                    >
                      Show Error Toast
                    </Button>
                    <Button 
                      variant="warning" 
                      onClick={() => showToast('This is a warning message!', 'warning')}
                    >
                      Show Warning Toast
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => showToast('This is an info message!', 'info')}
                    >
                      Show Info Toast
                    </Button>
                  </div>
                </section>

                {/* Toast with Custom Duration */}
                <section className="showcase-section">
                  <h2>Custom Duration</h2>
                  <p className="section-description">Toasts with different auto-hide durations</p>
                  <div className="button-grid">
                    <Button 
                      variant="primary" 
                      onClick={() => showToast('Quick toast (2 seconds)', 'info', 2000)}
                    >
                      2 Second Toast
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => showToast('Normal toast (4 seconds)', 'info', 4000)}
                    >
                      4 Second Toast (Default)
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => showToast('Long toast (8 seconds)', 'info', 8000)}
                    >
                      8 Second Toast
                    </Button>
                  </div>
                </section>

                {/* Multiple Toasts */}
                <section className="showcase-section">
                  <h2>Multiple Toasts</h2>
                  <p className="section-description">Show multiple toasts at once (they stack)</p>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      showToast('First notification', 'success')
                      setTimeout(() => showToast('Second notification', 'info'), 500)
                      setTimeout(() => showToast('Third notification', 'warning'), 1000)
                    }}
                  >
                    Show Multiple Toasts
                  </Button>
                </section>

                {/* Real-World Examples */}
                <section className="showcase-section">
                  <h2>Real-World Examples</h2>
                  <p className="section-description">Common use cases for toast notifications</p>
                  <div className="button-grid">
                    <Button 
                      variant="success"
                      icon={Save}
                      onClick={() => showToast('Data saved successfully!', 'success')}
                    >
                      Save Data
                    </Button>
                    <Button 
                      variant="danger"
                      icon={Trash2}
                      onClick={() => showToast('Item deleted', 'success')}
                    >
                      Delete Item
                    </Button>
                    <Button 
                      variant="primary"
                      icon={Copy}
                      onClick={() => showToast('Copied to clipboard!', 'success')}
                    >
                      Copy Text
                    </Button>
                    <Button 
                      variant="primary"
                      icon={Download}
                      onClick={() => showToast('Download started', 'info')}
                    >
                      Download File
                    </Button>
                  </div>
                </section>

                {/* Toast Features */}
                <section className="showcase-section">
                  <h2>Toast Variants</h2>
                  <p className="section-description">Different visual styles for toasts</p>
                  <div className="button-grid">
                    <Button 
                      variant="success" 
                      onClick={() => showToast('Filled variant (default)', 'success', 4000, 'filled')}
                    >
                      Filled Variant
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => showToast('Outlined variant', 'success', 4000, 'outlined')}
                    >
                      Outlined Variant
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => showToast('Standard variant', 'success', 4000, 'standard')}
                    >
                      Standard Variant
                    </Button>
                  </div>
                </section>

                {/* All Variants with All Types */}
                <section className="showcase-section">
                  <h2>All Variants × All Types</h2>
                  <p className="section-description">See all combinations</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Filled (Default)</Typography>
                      <div className="button-row">
                        <Button size="small" variant="success" onClick={() => showToast('Success filled', 'success', 4000, 'filled')}>Success</Button>
                        <Button size="small" variant="danger" onClick={() => showToast('Error filled', 'error', 4000, 'filled')}>Error</Button>
                        <Button size="small" variant="warning" onClick={() => showToast('Warning filled', 'warning', 4000, 'filled')}>Warning</Button>
                        <Button size="small" variant="primary" onClick={() => showToast('Info filled', 'info', 4000, 'filled')}>Info</Button>
                      </div>
                    </div>
                    <div>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Outlined</Typography>
                      <div className="button-row">
                        <Button size="small" variant="success" onClick={() => showToast('Success outlined', 'success', 4000, 'outlined')}>Success</Button>
                        <Button size="small" variant="danger" onClick={() => showToast('Error outlined', 'error', 4000, 'outlined')}>Error</Button>
                        <Button size="small" variant="warning" onClick={() => showToast('Warning outlined', 'warning', 4000, 'outlined')}>Warning</Button>
                        <Button size="small" variant="primary" onClick={() => showToast('Info outlined', 'info', 4000, 'outlined')}>Info</Button>
                      </div>
                    </div>
                    <div>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Standard</Typography>
                      <div className="button-row">
                        <Button size="small" variant="success" onClick={() => showToast('Success standard', 'success', 4000, 'standard')}>Success</Button>
                        <Button size="small" variant="danger" onClick={() => showToast('Error standard', 'error', 4000, 'standard')}>Error</Button>
                        <Button size="small" variant="warning" onClick={() => showToast('Warning standard', 'warning', 4000, 'standard')}>Warning</Button>
                        <Button size="small" variant="primary" onClick={() => showToast('Info standard', 'info', 4000, 'standard')}>Info</Button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Toast Features */}
                <section className="showcase-section">
                  <h2>Toast Features</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Typography variant="body2">
                      ✅ Auto-hide after duration (default 4 seconds)
                    </Typography>
                    <Typography variant="body2">
                      ✅ Manual close with X button
                    </Typography>
                    <Typography variant="body2">
                      ✅ Multiple toasts stack vertically
                    </Typography>
                    <Typography variant="body2">
                      ✅ Positioned at bottom-right
                    </Typography>
                    <Typography variant="body2">
                      ✅ Material Design styling with theme support
                    </Typography>
                    <Typography variant="body2">
                      ✅ Smooth slide-in/out animations
                    </Typography>
                  </div>
                </section>
              </>
            )}

            {/* ICONS SECTION */}
            {activeSection === 'icons' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Icons</h1>
                  <p>Centralized icon component with all Material-UI icons</p>
                </div>

                {/* Icon Sizes */}
                <section className="showcase-section">
                  <h2>Icon Sizes</h2>
                  <p className="section-description">Different sizes for various use cases</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Home" size="small" />
                      <Typography variant="caption" display="block">Small (20px)</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Home" size="medium" />
                      <Typography variant="caption" display="block">Medium (24px)</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Home" size="large" />
                      <Typography variant="caption" display="block">Large (32px)</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Home" size={48} />
                      <Typography variant="caption" display="block">Custom (48px)</Typography>
                    </div>
                  </div>
                </section>

                {/* Icon Colors */}
                <section className="showcase-section">
                  <h2>Icon Colors</h2>
                  <p className="section-description">Material-UI color variants</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Favorite" color="inherit" />
                      <Typography variant="caption" display="block">Inherit</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Favorite" color="primary" />
                      <Typography variant="caption" display="block">Primary</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Favorite" color="secondary" />
                      <Typography variant="caption" display="block">Secondary</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Favorite" color="error" />
                      <Typography variant="caption" display="block">Error</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Favorite" color="warning" />
                      <Typography variant="caption" display="block">Warning</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Favorite" color="success" />
                      <Typography variant="caption" display="block">Success</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Icon name="Favorite" color="#FF6B6B" />
                      <Typography variant="caption" display="block">Custom</Typography>
                    </div>
                  </div>
                </section>

                {/* Common Icons */}
                <section className="showcase-section">
                  <h2>Common Icons</h2>
                  <p className="section-description">Frequently used icons</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                    {[
                      'Home', 'Settings', 'Search', 'Notifications', 'Person', 'Mail',
                      'Delete', 'Edit', 'Add', 'Remove', 'Check', 'Close',
                      'ArrowBack', 'ArrowForward', 'ArrowUpward', 'ArrowDownward',
                      'Menu', 'MoreVert', 'MoreHoriz', 'Star', 'StarBorder', 'Favorite',
                      'FavoriteBorder', 'Visibility', 'VisibilityOff', 'Lock', 'LockOpen',
                      'Download', 'Upload', 'Share', 'Save', 'Print', 'Refresh'
                    ].map((iconName) => (
                      <div key={iconName} style={{ textAlign: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <Icon name={iconName} size="medium" color="primary" />
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '11px' }}>
                          {iconName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Action Icons */}
                <section className="showcase-section">
                  <h2>Action Icons</h2>
                  <p className="section-description">Icons for user actions</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                    {[
                      'ContentCopy', 'ContentCut', 'ContentPaste', 'Undo', 'Redo',
                      'ZoomIn', 'ZoomOut', 'FilterList', 'Sort', 'ViewList',
                      'ViewModule', 'ViewQuilt', 'Dashboard', 'Fullscreen', 'FullscreenExit'
                    ].map((iconName) => (
                      <div key={iconName} style={{ textAlign: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <Icon name={iconName} size="medium" color="action" />
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '11px' }}>
                          {iconName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* File & Folder Icons */}
                <section className="showcase-section">
                  <h2>File & Folder Icons</h2>
                  <p className="section-description">Document and folder management</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                    {[
                      'Folder', 'FolderOpen', 'CreateNewFolder', 'InsertDriveFile',
                      'Description', 'Article', 'AttachFile', 'CloudUpload', 'CloudDownload',
                      'Image', 'PictureAsPdf', 'VideoLibrary', 'AudioFile'
                    ].map((iconName) => (
                      <div key={iconName} style={{ textAlign: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <Icon name={iconName} size="medium" color="primary" />
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '11px' }}>
                          {iconName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Communication Icons */}
                <section className="showcase-section">
                  <h2>Communication Icons</h2>
                  <p className="section-description">Messaging and social</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                    {[
                      'Email', 'Chat', 'Comment', 'Forum', 'Message',
                      'Phone', 'Call', 'Contacts', 'ContactMail', 'Send',
                      'ThumbUp', 'ThumbDown', 'Share', 'Reply', 'Forward'
                    ].map((iconName) => (
                      <div key={iconName} style={{ textAlign: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <Icon name={iconName} size="medium" color="secondary" />
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '11px' }}>
                          {iconName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Status & Alert Icons */}
                <section className="showcase-section">
                  <h2>Status & Alert Icons</h2>
                  <p className="section-description">Feedback and notifications</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                    {[
                      'CheckCircle', 'Error', 'Warning', 'Info', 'Help',
                      'Cancel', 'Block', 'Report', 'Verified', 'NewReleases',
                      'Update', 'Sync', 'SyncProblem', 'Done', 'DoneAll'
                    ].map((iconName) => (
                      <div key={iconName} style={{ textAlign: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <Icon name={iconName} size="medium" color="warning" />
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '11px' }}>
                          {iconName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Navigation Icons */}
                <section className="showcase-section">
                  <h2>Navigation Icons</h2>
                  <p className="section-description">Directional and menu icons</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                    {[
                      'ChevronLeft', 'ChevronRight', 'ExpandMore', 'ExpandLess',
                      'FirstPage', 'LastPage', 'NavigateBefore', 'NavigateNext',
                      'Apps', 'MenuOpen', 'SubdirectoryArrowRight', 'Launch',
                      'OpenInNew', 'ExitToApp', 'Input', 'Output'
                    ].map((iconName) => (
                      <div key={iconName} style={{ textAlign: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <Icon name={iconName} size="medium" color="inherit" />
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '11px' }}>
                          {iconName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Media Icons */}
                <section className="showcase-section">
                  <h2>Media Icons</h2>
                  <p className="section-description">Playback and media controls</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                    {[
                      'PlayArrow', 'Pause', 'Stop', 'SkipNext', 'SkipPrevious',
                      'FastForward', 'FastRewind', 'Replay', 'VolumeUp', 'VolumeOff',
                      'Mic', 'MicOff', 'Videocam', 'VideocamOff', 'Camera'
                    ].map((iconName) => (
                      <div key={iconName} style={{ textAlign: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <Icon name={iconName} size="medium" color="error" />
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '11px' }}>
                          {iconName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Device Icons */}
                <section className="showcase-section">
                  <h2>Device Icons</h2>
                  <p className="section-description">Hardware and device types</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                    {[
                      'Computer', 'Laptop', 'PhoneIphone', 'Tablet', 'Watch',
                      'Tv', 'Keyboard', 'Mouse', 'Headset', 'Speaker',
                      'Print', 'Scanner', 'Router', 'Wifi', 'Bluetooth'
                    ].map((iconName) => (
                      <div key={iconName} style={{ textAlign: 'center', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <Icon name={iconName} size="medium" color="success" />
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: '11px' }}>
                          {iconName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Usage Example */}
                <section className="showcase-section">
                  <h2>Usage Example</h2>
                  <p className="section-description">How to use the Icon component</p>
                  <div style={{ background: darkMode ? '#404147ff' : '#f5f5f5', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px' }}>
                    <div>{'import Icon from \'../components/mui/icons/Icon\''}</div>
                    <br />
                    <div>{'// Basic usage'}</div>
                    <div>{'<Icon name="Home" />'}</div>
                    <br />
                    <div>{'// With size'}</div>
                    <div>{'<Icon name="Settings" size="large" />'}</div>
                    <br />
                    <div>{'// With color'}</div>
                    <div>{'<Icon name="Favorite" color="error" />'}</div>
                    <br />
                    <div>{'// With click handler'}</div>
                    <div>{'<Icon name="Delete" onClick={() => handleDelete()} />'}</div>
                    <br />
                    <div>{'// Custom size and color'}</div>
                    <div>{'<Icon name="Star" size={40} color="#FFD700" />'}</div>
                  </div>
                </section>
              </>
            )}

            {/* PROGRESS SECTION */}
            {activeSection === 'progress' && (
              <>
                <div className="showcase-header">
                  <h1>Material-UI Progress</h1>
                  <p>Linear and circular progress indicators</p>
                </div>

                {/* Linear Progress - Determinate */}
                <section className="showcase-section">
                  <h2>Linear Progress - Determinate</h2>
                  <p className="section-description">Shows specific progress value</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>25% Progress</Typography>
                      <Progress type="linear" variant="determinate" value={25} />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>50% Progress</Typography>
                      <Progress type="linear" variant="determinate" value={50} />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>75% Progress</Typography>
                      <Progress type="linear" variant="determinate" value={75} />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>100% Progress</Typography>
                      <Progress type="linear" variant="determinate" value={100} />
                    </div>
                  </div>
                </section>

                {/* Linear Progress - With Label */}
                <section className="showcase-section">
                  <h2>Linear Progress - With Label</h2>
                  <p className="section-description">Shows percentage label</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Progress type="linear" variant="determinate" value={35} showLabel />
                    <Progress type="linear" variant="determinate" value={65} showLabel />
                    <Progress type="linear" variant="determinate" value={90} showLabel />
                  </div>
                </section>

                {/* Linear Progress - Colors */}
                <section className="showcase-section">
                  <h2>Linear Progress - Colors</h2>
                  <p className="section-description">Different color variants</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Primary</Typography>
                      <Progress type="linear" variant="determinate" value={60} color="primary" />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Secondary</Typography>
                      <Progress type="linear" variant="determinate" value={60} color="secondary" />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Success</Typography>
                      <Progress type="linear" variant="determinate" value={60} color="success" />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Error</Typography>
                      <Progress type="linear" variant="determinate" value={60} color="error" />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Warning</Typography>
                      <Progress type="linear" variant="determinate" value={60} color="warning" />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Info</Typography>
                      <Progress type="linear" variant="determinate" value={60} color="info" />
                    </div>
                  </div>
                </section>

                {/* Linear Progress - Sizes */}
                <section className="showcase-section">
                  <h2>Linear Progress - Sizes</h2>
                  <p className="section-description">Different height sizes</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Small (4px)</Typography>
                      <Progress type="linear" variant="determinate" value={70} size="small" />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Medium (6px)</Typography>
                      <Progress type="linear" variant="determinate" value={70} size="medium" />
                    </div>
                    <div>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Large (10px)</Typography>
                      <Progress type="linear" variant="determinate" value={70} size="large" />
                    </div>
                  </div>
                </section>

                {/* Linear Progress - Indeterminate */}
                <section className="showcase-section">
                  <h2>Linear Progress - Indeterminate</h2>
                  <p className="section-description">Animated loading indicator</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Progress type="linear" variant="indeterminate" />
                    <Progress type="linear" variant="indeterminate" color="secondary" />
                    <Progress type="linear" variant="indeterminate" color="success" />
                  </div>
                </section>

                {/* Linear Progress - Buffer */}
                <section className="showcase-section">
                  <h2>Linear Progress - Buffer</h2>
                  <p className="section-description">Shows buffering progress</p>
                  <Progress type="linear" variant="buffer" value={40} valueBuffer={60} />
                </section>

                {/* Circular Progress - Determinate */}
                <section className="showcase-section">
                  <h2>Circular Progress - Determinate</h2>
                  <p className="section-description">Circular progress with specific value</p>
                  <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                    <Progress type="circular" variant="determinate" value={25} />
                    <Progress type="circular" variant="determinate" value={50} />
                    <Progress type="circular" variant="determinate" value={75} />
                    <Progress type="circular" variant="determinate" value={100} />
                  </div>
                </section>

                {/* Circular Progress - With Label */}
                <section className="showcase-section">
                  <h2>Circular Progress - With Label</h2>
                  <p className="section-description">Shows percentage inside circle</p>
                  <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                    <Progress type="circular" variant="determinate" value={30} showLabel />
                    <Progress type="circular" variant="determinate" value={60} showLabel />
                    <Progress type="circular" variant="determinate" value={90} showLabel />
                  </div>
                </section>

                {/* Circular Progress - Colors */}
                <section className="showcase-section">
                  <h2>Circular Progress - Colors</h2>
                  <p className="section-description">Different color variants</p>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={70} color="primary" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Primary</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={70} color="secondary" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Secondary</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={70} color="success" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Success</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={70} color="error" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Error</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={70} color="warning" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Warning</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={70} color="info" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Info</Typography>
                    </div>
                  </div>
                </section>

                {/* Circular Progress - Sizes */}
                <section className="showcase-section">
                  <h2>Circular Progress - Sizes</h2>
                  <p className="section-description">Different circle sizes</p>
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={65} size="small" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Small (30px)</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={65} size="medium" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Medium (40px)</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={65} size="large" />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Large (60px)</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circular" variant="determinate" value={65} size={80} />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>Custom (80px)</Typography>
                    </div>
                  </div>
                </section>

                {/* Circular Progress - Indeterminate */}
                <section className="showcase-section">
                  <h2>Circular Progress - Indeterminate</h2>
                  <p className="section-description">Animated loading spinner</p>
                  <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                    <Progress type="circular" variant="indeterminate" />
                    <Progress type="circular" variant="indeterminate" color="secondary" />
                    <Progress type="circular" variant="indeterminate" color="success" />
                  </div>
                </section>

                {/* Usage Example */}
                <section className="showcase-section">
                  <h2>Usage Example</h2>
                  <p className="section-description">How to use the Progress component</p>
                  <div style={{ background: darkMode ? '#404147ff' : '#f5f5f5', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px' }}>
                    <div>{'import Progress from \'../components/mui/progress/Progress\''}</div>
                    <br />
                    <div>{'// Linear progress'}</div>
                    <div>{'<Progress type="linear" variant="determinate" value={50} />'}</div>
                    <br />
                    <div>{'// Linear with label'}</div>
                    <div>{'<Progress type="linear" variant="determinate" value={75} showLabel />'}</div>
                    <br />
                    <div>{'// Circular progress'}</div>
                    <div>{'<Progress type="circular" variant="determinate" value={60} />'}</div>
                    <br />
                    <div>{'// Circular with label'}</div>
                    <div>{'<Progress type="circular" variant="determinate" value={80} showLabel />'}</div>
                    <br />
                    <div>{'// Indeterminate (loading)'}</div>
                    <div>{'<Progress type="linear" variant="indeterminate" />'}</div>
                    <div>{'<Progress type="circular" variant="indeterminate" />'}</div>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
      {/* <Footer /> */}
    </>
  )
}

export default Showcase
