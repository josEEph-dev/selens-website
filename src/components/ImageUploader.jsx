import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

const inputStyle = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

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

    // Allowed types: JPG, PNG, WebP
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and WebP images are allowed.')
      return
    }

    // Size limit: strictly under 1 MB
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
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </label>

      {/* Preview if image URL exists */}
      {value && (
        <div className="flex items-center gap-3 p-3 bg-selens-ink border border-selens-line rounded-[4px]">
          <div className="w-16 h-16 rounded-[4px] border border-selens-line overflow-hidden shrink-0 bg-selens-black flex items-center justify-center">
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
            <p className="text-xs text-neutral-300 truncate font-sans">{value}</p>
            <span className="text-[11px] text-selens-yellow">Current Image</span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-neutral-400 hover:text-red-400 transition rounded-[4px]"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File Upload Button + Fallback URL Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <label className="relative cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-selens-ink border border-selens-line hover:border-selens-yellow rounded-[4px] text-xs font-semibold text-neutral-200 transition">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-selens-yellow" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-selens-yellow" />
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

        <div className="flex-grow">
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputStyle}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 font-sans">{error}</p>
      )}
    </div>
  )
}
