import '../../styles/mui/DataTable.css'

function DataTable({
  columns = [],
  data = [],
  onRowClick,
  striped = false,
  hoverable = true,
  compact = false,
  className = '',
  ...props
}) {
  const tableClass = [
    'data-table',
    striped && 'data-table-striped',
    hoverable && 'data-table-hoverable',
    compact && 'data-table-compact',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="data-table-wrapper">
      <table className={tableClass} {...props}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                style={{ width: column.width, textAlign: column.align }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={column.key || colIndex}
                  style={{ textAlign: column.align }}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
