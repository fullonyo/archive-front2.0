import { Upload, X, File, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { handleImageError } from '../../utils/imageUtils';

/**
 * FileUpload Component - Drag & Drop file upload with preview
 * 
 * Features:
 * - Drag and drop support
 * - Click to browse
 * - File preview with thumbnails
 * - Validation (type, size)
 * - Progress indication
 * - Multiple or single file mode
 * 
 * @param {Object} props
 * @param {boolean} props.multiple - Allow multiple files
 * @param {string[]} props.accept - Accepted file types (MIME types or extensions)
 * @param {number} props.maxSize - Max file size in bytes
 * @param {number} props.maxFiles - Max number of files (for multiple mode)
 * @param {Function} props.onChange - Callback when files change
 * @param {Function} props.validate - Custom validation function
 * @param {string} props.label - Input label
 * @param {string} props.helperText - Helper text below input
 * @param {string} props.fileType - Type of file ('asset' | 'image')
 */
const FileUpload = ({
  multiple = false,
  accept = [],
  maxSize = 1024 * 1024 * 1024, // 1GB default
  maxFiles = 5,
  onChange,
  validate,
  label,
  helperText,
  fileType = 'asset',
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Validation function
  const validateFile = useCallback((file) => {
    const errors = [];

    // Size validation
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      errors.push(`File too large. Maximum: ${maxSizeMB}MB`);
    }

    // Type validation
    if (accept.length > 0) {
      const ext = `.${file.name.split('.').pop().toLowerCase()}`;
      const isValid = accept.some(type => {
        if (type.startsWith('.')) {
          return ext === type;
        }
        return file.type === type || file.type.match(type.replace('*', '.*'));
      });

      if (!isValid) {
        errors.push(`Invalid file type. Accepted: ${accept.join(', ')}`);
      }
    }

    // Custom validation
    if (validate) {
      const customError = validate(file);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors;
  }, [accept, maxSize, validate]);

  // Generate preview for image files
  const generatePreview = useCallback((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, { name: file.name, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle file selection
  const handleFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const validationErrors = [];
    const validFiles = [];

    // Check max files limit
    if (multiple && files.length + fileArray.length > maxFiles) {
      setErrors([`Maximum ${maxFiles} files allowed`]);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        validationErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
        generatePreview(file);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(updatedFiles);

    if (onChange) {
      onChange(multiple ? updatedFiles : updatedFiles[0]);
    }
  }, [files, multiple, maxFiles, validateFile, generatePreview, onChange]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  // Click to browse
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // File input change
  const handleInputChange = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  // Remove file
  const removeFile = useCallback((index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    setErrors([]);

    if (onChange) {
      onChange(multiple ? updatedFiles : null);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [files, previews, multiple, onChange]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
          ${isDragging 
            ? 'border-theme-active bg-theme-active/10' 
            : 'border-white/10 hover:border-white/20 bg-surface-float2 hover:bg-surface-base'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          {/* Icon */}
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-theme-active/20' : 'bg-surface-base'}
          `}>
            {fileType === 'image' ? (
              <ImageIcon size={32} className={isDragging ? 'text-theme-active' : 'text-text-secondary'} />
            ) : (
              <Upload size={32} className={isDragging ? 'text-theme-active' : 'text-text-secondary'} />
            )}
          </div>

          {/* Text */}
          <div>
            <p className="text-base font-medium text-text-primary mb-1">
              {isDragging ? 'Drop files here' : 'Drop files or click to browse'}
            </p>
            <p className="text-sm text-text-tertiary">
              {helperText || `Maximum ${formatFileSize(maxSize)}`}
            </p>
            {accept.length > 0 && (
              <p className="text-xs text-text-tertiary mt-1">
                Accepted: {accept.join(', ')}
              </p>
            )}
          </div>

          {/* Upload button visual */}
          <button
            type="button"
            className="btn btn-secondary text-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <Upload size={16} />
            Choose File{multiple ? 's' : ''}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 text-red-500 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File list with previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const preview = previews.find(p => p.name === file.name);
            
            return (
              <div
                key={index}
                className="bg-surface-float border border-white/10 rounded-lg p-3 flex items-center gap-3 group hover:border-white/20 transition-all"
              >
                {/* Preview/Icon */}
                <div className="flex-shrink-0">
                  {preview ? (
                    <img
                      src={preview.url}
                      alt={file.name}
                      className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10"
                      loading="lazy"
                      onError={handleImageError('thumbnail')}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface-base flex items-center justify-center">
                      <File size={24} className="text-text-tertiary" />
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check size={14} className="text-green-500" />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex-shrink-0 p-1.5 hover:bg-surface-base rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={16} className="text-text-tertiary hover:text-text-primary" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
