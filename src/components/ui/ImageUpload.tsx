'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  helperText?: string;
  error?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  placeholderText?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  helperText = 'Upload JPG, JPEG, or PNG (Max 5MB)',
  error: externalError,
  className,
  aspectRatio = 'auto',
  placeholderText = 'Click or drag image file here to upload',
}: ImageUploadProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const error = externalError || internalError;

  const processFile = (file: File) => {
    setInternalError(null);

    // Validate MIME type
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setInternalError(`Invalid file format: ${file.type || 'unknown'}. Only JPG, JPEG, PNG, and WebP are supported.`);
      return;
    }

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setInternalError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${maxSizeMB}MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setInternalError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input value so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setInternalError(null);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-xs font-bold text-[#3A2930] mb-1.5">
          {label}
        </label>
      )}

      {value ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl border border-[#EBCBD4] bg-[#FFF9FA] overflow-hidden p-3 space-y-3 shadow-2xs">
          <div
            className={cn(
              'relative w-full bg-[#FCECEF] rounded-xl overflow-hidden flex items-center justify-center border border-[#EBCBD4]/60',
              aspectRatio === 'video' ? 'h-48' : aspectRatio === 'square' ? 'h-40 w-40 mx-auto' : 'h-44'
            )}
          >
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-[#4A7C59] font-semibold">
              <ImageIcon className="w-4 h-4 text-[#4A7C59]" />
              <span>Image attached</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="subtle"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<RefreshCw className="w-3 h-3" />}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="danger"
                size="xs"
                onClick={handleRemove}
                leftIcon={<X className="w-3 h-3" />}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-[#B86B84] bg-[#B86B84]/10 scale-[0.99]'
              : 'border-[#EBCBD4] bg-[#FFF9FA] hover:border-[#B86B84] hover:bg-[#FFF5F7]/50',
            error && 'border-[#A84355]'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-[#FFF5F7] border border-[#EBCBD4] flex items-center justify-center mx-auto mb-2 text-[#8C455C]">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-[#3A2930]">{placeholderText}</p>
          <p className="text-[11px] text-[#765D66] mt-1">{helperText}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-[#A84355] font-medium mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

