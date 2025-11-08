import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Tag as TagIcon, Link as LinkIcon, AlertCircle, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import { assetService } from '../../services/assetService';
import FileUpload from '../../components/upload/FileUpload';
import Breadcrumb from '../../components/common/Breadcrumb';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../config/api';

const NewAssetPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    tags: '',
    external_url: ''
  });

  // File states
  const [mainFile, setMainFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  // UI states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to upload assets');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/assets/categories/list');
      
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // Handle main file selection
  const handleMainFileChange = useCallback((file) => {
    setMainFile(file);
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  }, [errors]);

  // Handle image files selection
  const handleImageFilesChange = useCallback((files) => {
    setImageFiles(files || []);
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!mainFile) {
      newErrors.file = 'Asset file is required';
    }

    // Optional: Validate external URL format
    if (formData.external_url && formData.external_url.trim()) {
      try {
        new URL(formData.external_url);
      } catch {
        newErrors.external_url = 'Invalid URL format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mainFile]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      // Create FormData
      const uploadData = new FormData();
      
      // Add main file
      uploadData.append('file', mainFile);

      // Add images
      imageFiles.forEach((imageFile) => {
        uploadData.append('images', imageFile);
      });

      // Add metadata
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category_id', formData.category_id);
      
      // Process tags (convert comma-separated string to array)
      if (formData.tags.trim()) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        uploadData.append('tags', JSON.stringify(tagsArray));
      }

      if (formData.external_url.trim()) {
        uploadData.append('external_url', formData.external_url);
      }

      console.log('Uploading asset...');

      // Upload with progress tracking
      const response = await api.post('/assets', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
        timeout: 10 * 60 * 1000, // 10 minutes timeout
      });

      console.log('Upload response:', response.data);

      if (response.data.success) {
        const asset = response.data.data;
        
        // Check if auto-approved
        const isAutoApproved = asset.isApproved;
        
        if (isAutoApproved) {
          toast.success('Asset uploaded successfully! It\'s now live.', {
            duration: 5000,
            icon: '🎉'
          });
        } else {
          toast.success('Asset uploaded successfully! It\'s pending approval.', {
            duration: 5000,
            icon: '⏳'
          });
        }

        // Redirect to asset detail page or user's assets
        setTimeout(() => {
          navigate(`/asset/${asset.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload asset';
      toast.error(errorMessage, {
        duration: 5000
      });
      
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (loading) {
      toast.error('Upload in progress, please wait');
      return;
    }

    if (mainFile || imageFiles.length > 0 || Object.values(formData).some(v => v)) {
      if (window.confirm('Are you sure? All unsaved changes will be lost.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  }, [loading, mainFile, imageFiles, formData, navigate]);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Breadcrumb */}
      <div className="px-3 sm:px-4 lg:px-6 pt-6">
        <Breadcrumb
          items={[
            { label: t('sidebar.newAsset') || 'Upload New Asset', path: '/new-asset' }
          ]}
        />
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 lg:px-6 pb-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
            disabled={loading}
          >
            <ArrowLeft size={16} />
            <span>{t('common.back') || 'Back'}</span>
          </button>

          <h1 className="text-3xl font-bold mb-2">{t('sidebar.newAsset') || 'Upload New Asset'}</h1>
          <p className="text-text-secondary">
            {t('upload.subtitle') || 'Share your VRChat creations with the community'}
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main File Upload */}
        <div className="bg-surface-float border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Asset File *</h2>
          
          <FileUpload
            accept={[
              '.zip',
              '.unitypackage',
              '.rar',
              '.7z',
              'application/zip',
              'application/x-zip-compressed',
              'application/octet-stream',
              'application/x-unity-package'
            ]}
            maxSize={1024 * 1024 * 1024} // 1GB
            onChange={handleMainFileChange}
            label=""
            helperText="Upload your asset package (.zip, .unitypackage, .rar, .7z - Max 1GB)"
            fileType="asset"
          />

          {errors.file && (
            <div className="mt-3 flex items-start gap-2 text-red-500 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errors.file}</span>
            </div>
          )}
        </div>

        {/* Images Upload */}
        <div className="bg-surface-float border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Preview Images (Optional)</h2>
          
          <FileUpload
            multiple
            accept={['.jpg', '.jpeg', '.png', '.gif', '.webp', 'image/*']}
            maxSize={10 * 1024 * 1024} // 10MB per image
            maxFiles={5}
            onChange={handleImageFilesChange}
            label=""
            helperText="Add up to 5 preview images (.jpg, .png, .gif, .webp - Max 10MB each)"
            fileType="image"
          />

          {errors.images && (
            <div className="mt-3 flex items-start gap-2 text-red-500 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errors.images}</span>
            </div>
          )}
        </div>

        {/* Asset Information */}
        <div className="bg-surface-float border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Asset Information</h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter asset title"
              className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
              maxLength={100}
              disabled={loading}
            />
            {errors.title && (
              <div className="mt-1.5 flex items-start gap-2 text-red-500 text-sm">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{errors.title}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-text-tertiary">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your asset, features, and usage instructions"
              rows={6}
              className={`input w-full resize-none ${errors.description ? 'border-red-500' : ''}`}
              maxLength={2000}
              disabled={loading}
            />
            {errors.description && (
              <div className="mt-1.5 flex items-start gap-2 text-red-500 text-sm">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{errors.description}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-text-tertiary">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-text-primary mb-2">
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className={`input w-full ${errors.category_id ? 'border-red-500' : ''}`}
              disabled={loading || loadingCategories}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category._count?.assets || 0} assets)
                </option>
              ))}
            </select>
            {errors.category_id && (
              <div className="mt-1.5 flex items-start gap-2 text-red-500 text-sm">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{errors.category_id}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-text-primary mb-2">
              <TagIcon size={16} className="inline mr-1" />
              Tags (Optional)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="anime, outfit, particle, shader (comma-separated)"
              className="input w-full"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Separate tags with commas. Example: anime, outfit, particle
            </p>
          </div>

          {/* External URL */}
          <div>
            <label htmlFor="external_url" className="block text-sm font-medium text-text-primary mb-2">
              <LinkIcon size={16} className="inline mr-1" />
              External Link (Optional)
            </label>
            <input
              type="url"
              id="external_url"
              name="external_url"
              value={formData.external_url}
              onChange={handleInputChange}
              placeholder="https://example.com/documentation"
              className={`input w-full ${errors.external_url ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.external_url && (
              <div className="mt-1.5 flex items-start gap-2 text-red-500 text-sm">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{errors.external_url}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-text-tertiary">
              Link to documentation, tutorial, or your website
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && (
          <div className="bg-surface-float border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Loader size={20} className="text-theme-active animate-spin" />
              <h3 className="text-lg font-semibold">Uploading...</h3>
            </div>

            <div className="w-full bg-surface-base rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-theme-primary to-theme-accent h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-text-secondary text-center">
              {uploadProgress}% - Please don't close this page
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-400">
              <p className="font-semibold mb-1">Before you upload:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-400/80">
                <li>Make sure your asset follows VRChat guidelines</li>
                <li>Include clear preview images to attract users</li>
                <li>Your asset will be reviewed before going live (unless you're a moderator/admin)</li>
                <li>You can edit or delete your asset anytime from your profile</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary flex-1 justify-center"
            disabled={loading}
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 justify-center"
            disabled={loading || !mainFile || !formData.title || !formData.description || !formData.category_id}
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                {t('upload.uploading') || 'Uploading'}... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload size={16} />
                {t('upload.submit') || 'Upload Asset'}
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default NewAssetPage;
