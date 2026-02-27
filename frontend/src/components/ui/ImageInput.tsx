import { useState, useRef, ChangeEvent } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon, X } from 'lucide-react';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';

interface ImageInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  optional?: boolean;
}

export default function ImageInput({
  value,
  onChange,
  label,
  placeholder = 'https://example.com/image.jpg',
  className = '',
  optional = true,
}: ImageInputProps) {
  const { success: showSuccess, error: showError } = useToastStore();
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to backend
      const result = await adminApi.uploadImage(file);
      
      // Backend returns URL like /uploads/filename
      // Construct full URL - static files are served from root, not /api
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      // Remove /api from base URL since static files are served from root
      const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
      
      // Ensure URL starts with / if it's a relative path
      const imagePath = result.url.startsWith('/') ? result.url : `/${result.url}`;
      const fullUrl = result.url.startsWith('http') 
        ? result.url 
        : `${baseUrl}${imagePath}`;
      
      onChange(fullUrl);
      showSuccess('Upload hình ảnh thành công!');
    } catch (error: any) {
      console.error('Upload error:', error);
      showError(error?.response?.data?.message || error?.message || 'Lỗi khi upload hình ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {optional && <span className="text-gray-500 text-xs ml-2">(tùy chọn)</span>}
        </label>
      )}

      {/* Mode selector */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            mode === 'url'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            mode === 'upload'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* URL Input Mode */}
      {mode === 'url' && (
        <div className="relative group">
          <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-12 pr-10 py-2.5 bg-black/50 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          {value && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* File Upload Mode */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full px-4 py-2.5 bg-black/50 border border-gray-800 rounded-lg text-gray-100 hover:bg-gray-900/50 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Chọn hình ảnh</span>
                </>
              )}
            </button>
          </div>
          {value && (
            <div className="relative">
              <input
                type="text"
                value={value.startsWith('/uploads/') || value.includes('/uploads/') ? 'Đã upload hình ảnh' : value}
                readOnly
                className="w-full pl-4 pr-10 py-2.5 bg-black/50 border border-gray-800 rounded-lg text-gray-100"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 mb-2">Xem trước:</p>
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="w-20 h-20 rounded-lg object-cover border border-gray-800"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              title="Xóa hình"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

