import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFiles, uploadFile, deleteFile } from '../store/apiSlice'
import { FiUpload, FiTrash2, FiFile } from 'react-icons/fi'

export default function UploadPage() {
  const dispatch = useDispatch<any>()
  const { files, loading } = useSelector((state: any) => state.api)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    dispatch(getFiles())
  }, [dispatch])

  const handleUpload = async (file: File) => {
    setError('')
    setUploadedFile('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await dispatch(uploadFile(formData))
    setUploading(false)

    if (uploadFile.rejected.match(res)) {
      setError((res.payload as any)?.message || 'Upload failed. Try another file.')
      return
    }

    const data = res.payload as any
    if (data?.file?.embeddingError) {
      setError(`The file uploaded, but indexing failed: ${data.file.embeddingError}`)
    }

    setUploadedFile(file.name)
    dispatch(getFiles())
    setTimeout(() => setUploadedFile(''), 3000)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDelete = async (id: string) => {
    await dispatch(deleteFile(id))
    dispatch(getFiles())
  }

  return (
    <div className="max-w-2xl mx-auto mt-4 sm:mt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">Document library</p>
      <h1 className="font-serif text-3xl font-semibold mt-2">Your documents</h1>
      <p className="text-sm text-mute mt-2">
        PDFs you upload become the assistant's reading list. Every answer is drawn from them.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border p-6 rounded-md transition ${
          dragOver ? 'border-pine bg-pine-tint' : 'border-line bg-card'
        }`}
      >
        <div>
          <p className="text-sm font-medium text-ink">Drop a PDF here</p>
          <p className="text-xs text-mute mt-1">
            PDF files only{uploading ? ` — indexing ${uploadedFile || 'document'}…` : ''}
          </p>
          {uploadedFile && !uploading && (
            <p className="text-xs text-pine mt-1">{uploadedFile} is in your library.</p>
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-pine text-paper font-medium rounded-md text-sm hover:bg-pine-deep disabled:opacity-50 transition shrink-0"
        >
          {uploading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : <FiUpload size={16} />}
          Choose a file
        </button>
        <input ref={inputRef} type="file" accept=".pdf" onChange={handleInput} hidden />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 mt-4 text-sm text-error bg-error/5 border border-error/20 rounded-md">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-sm text-mute">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading your library…
        </div>
      ) : (
        <div className="mt-10">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">Index</p>
            <p className="font-mono text-[11px] text-mute">{files?.length ?? 0} document{files?.length === 1 ? '' : 's'}</p>
          </div>
          {files?.map((file: any, i: number) => (
            <div key={file._id} className="flex items-center gap-4 border-b border-line py-3.5 group">
              <span className="font-mono text-xs text-mute w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <FiFile className="text-pine shrink-0" size={16} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm text-ink">{file.originalName}</p>
                <p className="font-mono text-[11px] text-mute mt-0.5">
                  {file.size ? `${(file.size / 1024).toFixed(0)} KB` : ''}
                </p>
              </div>
              {file.embeddingError ? (
                <span className="font-mono text-xs text-error shrink-0" title={file.embeddingError}>
                  Indexing failed
                </span>
              ) : file.embedded ? (
                <span className="font-mono text-xs text-pine shrink-0">Indexed</span>
              ) : null}
              <button
                onClick={() => handleDelete(file._id)}
                className="p-1.5 text-mute hover:text-error transition shrink-0"
                aria-label={`Remove ${file.originalName}`}
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          ))}
          {files?.length === 0 && (
            <div className="py-12 text-center">
              <p className="font-serif text-xl text-ink">No documents yet.</p>
              <p className="text-sm text-mute mt-2">Upload a PDF above and it becomes searchable.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
