import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFiles, uploadFile, deleteFile } from '../store/apiSlice'
import { FiUpload, FiTrash2, FiFile, FiCheck, FiAlertTriangle, FiFolder } from 'react-icons/fi'

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
    <div className="max-w-2xl mx-auto mt-4 sm:mt-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg mb-3">
          <FiUpload size={22} />
        </div>
        <h1 className="text-2xl font-bold">Upload Documents</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add PDFs to your knowledge base</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 w-full sm:w-auto justify-center font-medium transition"
        >
          {uploading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : <FiUpload size={18} />}
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
        <input ref={inputRef} type="file" accept=".pdf" onChange={handleUpload} hidden />
        {uploadedFile && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
            <FiCheck /> {uploadedFile}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading...
        </div>
      ) : (
        <div className="space-y-2">
          {files?.map((file: any) => (
            <div key={file._id} className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 gap-2 hover:border-gray-300 dark:hover:border-gray-700 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <FiFile className="text-blue-500 dark:text-blue-400" size={16} />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-sm font-medium">{file.originalName}</span>
                  <span className="text-xs text-gray-400">{file.size ? `${(file.size / 1024).toFixed(0)} KB` : ''}</span>
                </div>
                {file.embeddingError && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded" title={file.embeddingError}>
                    <FiAlertTriangle className="inline mr-0.5" size={12} /> failed
                  </span>
                )}
                {file.embedded && (
                  <span className="text-xs text-green-600 dark:text-green-400 shrink-0 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                    <FiCheck className="inline mr-0.5" size={12} /> indexed
                  </span>
                )}
              </div>
              <button onClick={() => handleDelete(file._id)} className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
          {files?.length === 0 && (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <FiFolder size={40} className="mb-3" />
              <p className="text-sm">No files uploaded yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
