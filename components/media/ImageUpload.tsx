/**
 * ImageUpload Component
 *
 * Drag-and-drop image uploader with preview and progress tracking.
 *
 * Features:
 * - Drag and drop zone
 * - Click to browse files
 * - Image preview before upload
 * - Progress indicator
 * - Multiple file support
 * - File type and size validation
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <ImageUpload
 *   onUpload={async (files) => {
 *     // Upload logic here
 *     return urls
 *   }}
 *   multiple
 *   maxSize={5 * 1024 * 1024}
 *   accept="image/*"
 * />
 * ```
 */

import React, { useState, useRef, useCallback } from 'react'

export interface ImageFile {
  file: File
  preview: string
  id: string
}

export interface ImageUploadProps {
  /**
   * Upload handler (should return URLs of uploaded images)
   */
  onUpload: (files: File[]) => Promise<string[]>

  /**
   * Allow multiple files
   */
  multiple?: boolean

  /**
   * Maximum file size in bytes
   */
  maxSize?: number

  /**
   * Maximum number of files
   */
  maxFiles?: number

  /**
   * Accepted file types
   */
  accept?: string

  /**
   * Custom class name
   */
  className?: string

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Callback when files are selected
   */
  onFilesSelected?: (files: ImageFile[]) => void

  /**
   * Callback when upload completes
   */
  onUploadComplete?: (urls: string[]) => void

  /**
   * Callback on error
   */
  onError?: (error: Error) => void
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  accept = 'image/*',
  className,
  disabled = false,
  onFilesSelected,
  onUploadComplete,
  onError
}) => {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createPreview = (file: File): Promise<string> => {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return `${file.name} is not an image file`
    }
    if (file.size > maxSize) {
      return `${file.name} is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`
    }
    return null
  }

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)
      const validFiles: ImageFile[] = []
      const errors: string[] = []

      // Validate files
      for (const file of fileArray) {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          const preview = await createPreview(file)
          validFiles.push({
            file,
            preview,
            id: `${file.name}-${Date.now()}-${Math.random()}`
          })
        }
      }

      // Check max files
      const totalFiles = files.length + validFiles.length
      if (totalFiles > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`)
        return
      }

      if (errors.length > 0) {
        const errorMsg = errors.join('; ')
        setError(errorMsg)
        onError?.(new Error(errorMsg))
        return
      }

      setError(null)
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles
      setFiles(updatedFiles)
      onFilesSelected?.(updatedFiles)
    },
    [files, multiple, maxSize, maxFiles, onFilesSelected, onError]
  )

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

    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const fileObjects = files.map(f => f.file)
      const urls = await onUpload(fileObjects)

      setProgress(100)
      onUploadComplete?.(urls)

      // Clear files after successful upload
      setFiles([])
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 1000)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed')
      setError(error.message)
      onError?.(error)
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isDragging ? '#eff6ff' : disabled ? '#f9fafb' : '#ffffff',
          transition: 'all 0.3s',
          opacity: disabled ? 0.5 : 1
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload images"
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        <svg
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            color: isDragging ? '#3b82f6' : '#9ca3af'
          }}
          xmlns="http://www.w3.org/2000/svg"
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

        <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
          {isDragging ? 'Drop images here' : 'Drag and drop images here'}
        </p>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          or click to browse
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          {multiple ? `Up to ${maxFiles} files, ` : 'Single file, '}
          max {Math.round(maxSize / 1024 / 1024)}MB each
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px'
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '16px'
            }}
          >
            {files.map(file => (
              <div
                key={file.id}
                style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  aspectRatio: '1',
                  border: '1px solid #e5e7eb'
                }}
              >
                <img
                  src={file.preview}
                  alt={file.file.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Remove button */}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}
                  aria-label={`Remove ${file.file.name}`}
                >
                  ×
                </button>

                {/* File name */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {file.file.name}
                </div>
              </div>
            ))}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || disabled}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '12px',
              backgroundColor: uploading || disabled ? '#d1d5db' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: uploading || disabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => {
              if (!uploading && !disabled) {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }
            }}
            onMouseLeave={e => {
              if (!uploading && !disabled) {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }
            }}
          >
            {uploading
              ? 'Uploading...'
              : `Upload ${files.length} ${files.length === 1 ? 'file' : 'files'}`}
          </button>

          {/* Progress bar */}
          {uploading && (
            <div
              style={{
                marginTop: '12px',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageUpload
