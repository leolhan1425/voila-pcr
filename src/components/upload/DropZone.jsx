import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import { parseFile } from '../../parsers/index'

export default function DropZone() {
  const { t } = useTranslation()
  const { setParsedData } = useStore()
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    setError(null)
    setParsing(true)

    try {
      const result = await parseFile(file)
      if (result.error) {
        setError(result.error)
      } else {
        setParsedData(result.parsedData)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setParsing(false)
    }
  }, [setParsedData])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => setDragOver(false), [])

  const onChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all
          ${dragOver
            ? 'border-accent bg-accent/5'
            : 'border-border dark:border-border-dark hover:border-accent/50'
          }
        `}
      >
        {parsing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary dark:text-text-secondary-dark">
              {t('upload.parsing')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-text-secondary dark:text-text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="font-medium">{t('upload.dropzone')}</p>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              {t('upload.dropzoneOr')}
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onChange}
          className="hidden"
        />
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
          {t('upload.formats')}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span>{t('upload.privacy')}</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error === 'unrecognized'
            ? 'Could not auto-detect your file format. Please check the file or try a CSV export.'
            : error
          }
        </div>
      )}
    </div>
  )
}
