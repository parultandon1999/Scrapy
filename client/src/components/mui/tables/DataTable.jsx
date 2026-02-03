import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  Checkbox,
} from '@mui/material'

/**
 * Material-UI DataTable Component
 * 
 * Advanced data table with sorting, pagination, filtering, and row selection.
 * Uses Material-UI Table components.
 * 
 * @param {array} columns - Column definitions [{key, label, width, align, sortable, render}]
 * @param {array} data - Table data array
 * @param {function} onRowClick - Row click handler
 * @param {boolean} striped - Striped rows
 * @param {boolean} hoverable - Hoverable rows
 * @param {boolean} compact - Compact padding
 * @param {boolean} pagination - Enable pagination
 * @param {number} rowsPerPageOptions - Rows per page options
 * @param {boolean} sortable - Enable sorting
 * @param {boolean} filterable - Enable filtering
 * @param {boolean} selectable - Enable row selection
 * @param {function} onSelectionChange - Selection change handler
 * @param {string} className - Additional CSS classes
 */

function DataTable({
  columns = [],
  data = [],
  onRowClick,
  striped = false,
  hoverable = true,
  compact = false,
  pagination = true,
  rowsPerPageOptions = [5, 10, 25, 50],
  sortable = true,
  filterable = false,
  selectable = false,
  onSelectionChange,
  className = '',
  ...props
}) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0])
  const [orderBy, setOrderBy] = useState('')
  const [order, setOrder] = useState('asc')
  const [filterText, setFilterText] = useState('')
  const [selected, setSelected] = useState([])

  // Handle sort
  const handleSort = (columnKey) => {
    if (!sortable) return
    
    const isAsc = orderBy === columnKey && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(columnKey)
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!orderBy) return 0
    
    const aValue = a[orderBy]
    const bValue = b[orderBy]
    
    if (aValue === bValue) return 0
    
    const comparison = aValue < bValue ? -1 : 1
    return order === 'asc' ? comparison : -comparison
  })

  // Filter data
  const filteredData = filterText
    ? sortedData.filter((row) =>
        columns.some((column) => {
          const value = row[column.key]
          return value && value.toString().toLowerCase().includes(filterText.toLowerCase())
        })
      )
    : sortedData

  // Paginate data
  const paginatedData = pagination
    ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredData

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = paginatedData.map((row) => row.id)
      setSelected(newSelected)
      onSelectionChange && onSelectionChange(newSelected)
    } else {
      setSelected([])
      onSelectionChange && onSelectionChange([])
    }
  }

  // Handle select row
  const handleSelectRow = (id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = [...selected, id]
    } else {
      newSelected = selected.filter((selectedId) => selectedId !== id)
    }

    setSelected(newSelected)
    onSelectionChange && onSelectionChange(newSelected)
  }

  const isSelected = (id) => selected.indexOf(id) !== -1

  return (
    <Box className={className}>
      {filterable && (
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter table data..."
          />
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table
          size={compact ? 'small' : 'medium'}
          sx={{
            '& .MuiTableRow-root:hover': hoverable
              ? { backgroundColor: 'action.hover' }
              : {},
          }}
          {...props}
        >
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 && selected.length < paginatedData.length
                    }
                    checked={
                      paginatedData.length > 0 && selected.length === paginatedData.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  sortDirection={orderBy === column.key ? order : false}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.key}
                      direction={orderBy === column.key ? order : 'asc'}
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, rowIndex) => {
              const isItemSelected = isSelected(row.id)
              
              return (
                <TableRow
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  selected={isItemSelected}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    backgroundColor:
                      striped && rowIndex % 2 === 1 ? 'action.hover' : 'inherit',
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectRow(row.id)
                        }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align || 'left'}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      )}
    </Box>
  )
}

export default DataTable
