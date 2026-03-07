import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ImageUpload({ onUpload }) {
  const { t } = useTranslation()
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setPreview(dataUrl)
      onUpload(dataUrl)
    }
    reader.readAsDataURL(file)

    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const clearPreview = () => {
    setPreview(null)
    onUpload(null)
  }

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {/* Paperclip button */}
      <button
        onClick={() => inputRef.current?.click()}
        className="p-2 rounded-lg text-text-secondary dark:text-text-secondary-dark hover:text-accent hover:bg-surface dark:hover:bg-surface-dark transition-colors"
        title={t('drqpcr.attachImage', 'Attach image')}
        type="button"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
        </svg>
      </button>

      {/* Preview thumbnail */}
      {preview && (
        <div className="relative ml-1">
          <img
            src={preview}
            alt={t('drqpcr.imagePreview', 'Image preview')}
            className="w-10 h-10 rounded border border-border dark:border-border-dark object-cover"
          />
          <button
            onClick={clearPreview}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] leading-none hover:bg-red-600"
            type="button"
          >
            x
          </button>
        </div>
      )}
    </div>
  )
}
