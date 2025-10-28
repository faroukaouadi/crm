import React from 'react'

export const DataTable = ({ headers, data, renderRow, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            {headers.map((header, index) => (
              <th key={index} className="text-left py-4 px-6 text-gray-600 dark:text-gray-400 font-semibold text-xs uppercase tracking-wide">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {renderRow(item)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export const TableCell = ({ children, className = "" }) => (
  <td className={`py-4 px-6 text-gray-900 dark:text-white text-sm ${className}`}>
    {children}
  </td>
)

export const TableHeader = ({ children, className = "" }) => (
  <th className={`text-left py-4 px-6 text-gray-600 dark:text-gray-400 font-semibold text-xs uppercase tracking-wide ${className}`}>
    {children}
  </th>
)
