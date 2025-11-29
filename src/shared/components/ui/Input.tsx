import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  endAdornment?: React.ReactNode
}

export function Input({
  label,
  error,
  fullWidth = false,
  endAdornment,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const widthClass = fullWidth ? 'w-full' : ''

  const inputClassName = [
    'block px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm',
    error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900',
    endAdornment ? '' : widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={widthClass}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      {endAdornment ? (
        <div className="flex gap-2">
          <input
            id={inputId}
            className={`flex-1 ${inputClassName}`}
            {...props}
          />
          {endAdornment}
        </div>
      ) : (
        <input
          id={inputId}
          className={inputClassName}
          {...props}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export function Textarea({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const widthClass = fullWidth ? 'w-full' : ''

  const textareaClassName = [
    'block px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm',
    error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900',
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={widthClass}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={textareaClassName}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${textareaId}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
