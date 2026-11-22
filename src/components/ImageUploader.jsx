import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Upload, X, Loader2 } from 'lucide-react'

export default function ImageUploader({
  value = '',
  onChange,
  label = 'Image',
  placeholder = 'https://... or upload a file',
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and WebP images are allowed.')
      return
    }

    const maxBytes = 1024 * 1024 // 1 MB
    if (file.size > maxBytes) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 1 MB limit. Please upload a smaller image.`)
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)
      const filePath = `uploads/${Date.now()}_${sanitizedName}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('site-images').getPublicUrl(filePath)
      if (data?.publicUrl) {
        onChange(data.publicUrl)
      } else {
        throw new Error('Could not retrieve public URL for uploaded file.')
      }
    } catch (err) {
      console.error('Image upload error:', err)
      setError(err.message || 'Failed to upload image to storage.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="m-field">
      <label className="m-field__label">
        {label}
      </label>

      {/* Preview if image URL exists */}
      {value && (
        <div className="flex items-center gap-3 p-3 bg-[#e7e8ea] border border-[#cdd0d4] rounded-[14px]">
          <div className="w-16 h-16 rounded-[10px] border border-[#cdd0d4] overflow-hidden shrink-0 bg-white flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-xs text-[#121315] truncate font-medium">{value}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#121315] text-[#FFD100] text-[11px] font-medium">
              Current Image
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:text-red-700 hover:bg-white transition cursor-pointer shrink-0"
            title="Remove Image"
            aria-label="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File Upload Button + Fallback URL Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <label className="relative cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 min-h-[48px] px-4 bg-[#121315] text-white hover:bg-[#FFD100] hover:text-[#121315] rounded-full text-xs sm:text-sm font-medium transition group">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#FFD100] group-hover:text-[#121315]" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-[#FFD100] group-hover:text-[#121315]" />
              <span>Upload Image (&lt;1MB)</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        <div className="flex-grow min-w-0">
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="m-field__control"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-700">{error}</p>
      )}
    </div>
  )
}
