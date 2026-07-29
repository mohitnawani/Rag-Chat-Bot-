import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFiles, uploadFile, deleteFile } from '../store/apiSlice'
import { FiUpload, FiTrash2, FiFile, FiCheck, FiAlertTriangle } from 'react-icons/fi'

export default function UploadPage() {
  const dispatch = useDispatch<any>()
  const { files, loading } = useSelector((state: any) => state.api)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState('')

  useEffect(() => {
    dispatch(getFiles())
  }, [dispatch])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploadedFile('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await dispatch(uploadFile(formData))
    setUploading(false)

    if (uploadFile.rejected.match(res)) {
      setError((res.payload as any)?.message || 'Upload failed')
      return
    }

    const data = res.payload as any
    if (data?.file?.embeddingError) {
      setError(`File uploaded but embedding failed: ${data.file.embeddingError}`)
    }

    setUploadedFile(file.name)
    dispatch(getFiles())
    setTimeout(() => setUploadedFile(''), 3000)
  }

  const handleDelete = async (id: string) => {
    await dispatch(deleteFile(id))
    dispatch(getFiles())
  }

  return (
    <div className="max-w-2xl mx-auto mt-4 sm:mt-8 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 w-full sm:w-auto justify-center"
        >
          {uploading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : <FiUpload />}
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
        <input ref={inputRef} type="file" accept=".pdf" onChange={handleUpload} hidden />
        {uploadedFile && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <FiCheck /> {uploadedFile} uploaded
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-2">
          {files?.map((file: any) => (
            <div key={file._id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FiFile className="text-gray-400 shrink-0" />
                <span className="truncate text-sm sm:text-base">{file.originalName}</span>
                {file.embeddingError && (
                  <span className="text-xs text-amber-600 shrink-0" title={file.embeddingError}>
                    <FiAlertTriangle className="inline" /> failed
                  </span>
                )}
                {file.embedded && (
                  <span className="text-xs text-green-600 shrink-0"><FiCheck className="inline" /> indexed</span>
                )}
              </div>
              <button onClick={() => handleDelete(file._id)} className="text-red-500 hover:text-red-700 shrink-0">
                <FiTrash2 />
              </button>
            </div>
          ))}
          {files?.length === 0 && <p className="text-gray-400 text-center sm:text-left">No files uploaded yet.</p>}
        </div>
      )}
    </div>
  )
}
