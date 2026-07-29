import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFiles, uploadFile, deleteFile } from '../store/apiSlice'
import { FiUpload, FiTrash2, FiFile, FiAlertCircle } from 'react-icons/fi'

export default function UploadPage() {
  const dispatch = useDispatch<any>()
  const { files, loading } = useSelector((state: any) => state.api)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dispatch(getFiles())
  }, [dispatch])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    const res = await dispatch(uploadFile(formData))
    if (uploadFile.rejected.match(res)) {
      setError((res.payload as any)?.message || 'Upload failed')
    } else {
      dispatch(getFiles())
    }
  }

  const handleDelete = async (id: string) => {
    await dispatch(deleteFile(id))
    dispatch(getFiles())
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiUpload /> Upload PDF
        </button>
        <input ref={inputRef} type="file" accept=".pdf" onChange={handleUpload} hidden />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <FiAlertCircle />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-2">
          {files?.map((file: any) => (
            <div key={file._id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <FiFile className="text-gray-400" />
                <span>{file.originalName}</span>
              </div>
              <button onClick={() => handleDelete(file._id)} className="text-red-500 hover:text-red-700">
                <FiTrash2 />
              </button>
            </div>
          ))}
          {files?.length === 0 && <p className="text-gray-400">No files uploaded yet.</p>}
        </div>
      )}
    </div>
  )
}
