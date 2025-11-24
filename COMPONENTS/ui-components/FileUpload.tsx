/**
 * FileUpload Component
 *
 * A file upload component with drag-and-drop, validation, and preview.
 * Supports multiple files, size limits, and file type restrictions.
 *
 * @example
 * ```tsx
 * // Single file upload
 * <FileUpload
 *   onUpload={(files) => console.log(files)}
 *   label="Upload Image"
 *   accept="image/*"
 *   maxSize={5 * 1024 * 1024}
 * />
 *
 * // Multiple files with preview
 * <FileUpload
 *   multiple
 *   onUpload={(files) => console.log(files)}
 *   showPreview
 *   label="Upload Documents"
 * />
 *
 * // With progress indicator
 * <FileUpload
 *   onUpload={(files) => console.log(files)}
 *   onProgress={(progress) => console.log(progress)}
 *   showProgress
 * />
 * ```
 */

import * as React from 'react'
import { cn } from './utils'

export interface FileUploadProps {
  /**
   * Callback when files are selected
   */
  onUpload?: (files: File[]) => void

  /**
   * Upload progress callback (0-100)
   */
  onProgress?: (progress: number) => void

  /**
   * Label for the file upload
   */
  label?: string

  /**
   * Allow multiple file selection
   */
  multiple?: boolean

  /**
   * Accepted file types (e.g., "image/*", ".pdf,.doc")
   */
  accept?: string

  /**
   * Maximum file size in bytes
   */
  maxSize?: number

  /**
   * Show file preview thumbnails
   */
  showPreview?: boolean

  /**
   * Show upload progress
   */
  showProgress?: boolean

  /**
   * Whether the upload is disabled
   */
  disabled?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

interface UploadedFile {
  file: File
  preview?: string
  error?: string
}

/**
 * FileUpload component with drag-and-drop
 */
export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      onUpload,
      onProgress,
      label,
      multiple = false,
      accept,
      maxSize,
      showPreview = false,
      showProgress = false,
      disabled = false,
      className
    },
    ref
  ) => {
    const uploadId = React.useId()
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    const [files, setFiles] = React.useState<UploadedFile[]>([])
    const [progress, setProgress] = React.useState(0)

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    // Validate file
    const validateFile = (file: File): string | null => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`
      }

      // Check file type
      if (accept) {
        const acceptedTypes = accept.split(',').map(t => t.trim())
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
        const mimeType = file.type

        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return fileExtension === type.toLowerCase()
          }
          if (type.endsWith('/*')) {
            return mimeType.startsWith(type.replace('/*', ''))
          }
          return mimeType === type
        })

        if (!isAccepted) {
          return `File type not accepted. Accepted: ${accept}`
        }
      }

      return null
    }

    // Create preview for image files
    const createPreview = (file: File): Promise<string | undefined> => {
      return new Promise(resolve => {
        if (!file.type.startsWith('image/')) {
          resolve(undefined)
          return
        }

        const reader = new FileReader()
        reader.onload = e => {
          resolve(e.target?.result as string)
        }
        reader.onerror = () => {
          resolve(undefined)
        }
        reader.readAsDataURL(file)
      })
    }

    // Process files
    const processFiles = async (fileList: FileList | File[]) => {
      const newFiles: UploadedFile[] = []
      const filesArray = Array.from(fileList)

      for (const file of filesArray) {
        const error = validateFile(file)
        const preview = showPreview ? await createPreview(file) : undefined

        newFiles.push({
          file,
          preview,
          error: error || undefined
        })
      }

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles
      setFiles(updatedFiles)

      // Simulate upload progress
      if (showProgress && onProgress) {
        let currentProgress = 0
        const interval = setInterval(() => {
          currentProgress += 10
          setProgress(currentProgress)
          onProgress(currentProgress)

          if (currentProgress >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setProgress(0)
            }, 500)
          }
        }, 200)
      }

      // Call onUpload with valid files
      const validFiles = newFiles.filter(f => !f.error).map(f => f.file)
      if (validFiles.length > 0) {
        onUpload?.(validFiles)
      }
    }

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
      }
    }

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragging(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    }

    // Handle click to browse
    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click()
      }
    }

    // Remove file
    const handleRemoveFile = (index: number) => {
      setFiles(files.filter((_, i) => i !== index))
    }

    // Get file icon
    const getFileIcon = (file: File): React.ReactNode => {
      if (file.type.startsWith('image/')) {
        return (
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )
      }

      return (
        <svg
          className="w-8 h-8 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      )
    }

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1.5',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        {/* Hidden input */}
        <input
          ref={inputRef}
          id={uploadId}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          aria-label={label || 'File upload'}
        />

        {/* Drop zone */}
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors',
            'flex flex-col items-center justify-center text-center',
            'cursor-pointer hover:bg-gray-50',
            isDragging && 'border-blue-500 bg-blue-50',
            !isDragging && 'border-gray-300',
            disabled && 'cursor-not-allowed opacity-50 bg-gray-50'
          )}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick()
            }
          }}
        >
          <svg
            className={cn('w-12 h-12 mb-3', isDragging ? 'text-blue-500' : 'text-gray-400')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
          </p>

          <p className="text-xs text-gray-500">
            {accept ? `Accepted: ${accept}` : multiple ? 'Any file type' : 'Single file'}
            {maxSize && ` (Max: ${formatFileSize(maxSize)})`}
          </p>

          {/* Progress bar */}
          {showProgress && progress > 0 && (
            <div className="w-full mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">{progress}% uploaded</p>
            </div>
          )}
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  uploadedFile.error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                )}
              >
                {/* Preview or icon */}
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex-shrink-0">{getFileIcon(uploadedFile.file)}</div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.file.size)}</p>
                  {uploadedFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    handleRemoveFile(index)
                  }}
                  className={cn(
                    'flex-shrink-0 p-1 rounded hover:bg-gray-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'transition-colors'
                  )}
                  aria-label={`Remove ${uploadedFile.file.name}`}
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'
