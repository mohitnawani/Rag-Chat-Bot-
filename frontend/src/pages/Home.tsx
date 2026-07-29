import { FiFileText, FiUpload, FiMessageSquare } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center mt-20 gap-6">
      <h1 className="text-4xl font-bold">RAG Chatbot</h1>
      <p className="text-gray-500 text-lg">Upload PDFs and ask questions about them</p>
      <div className="flex gap-4 mt-4">
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border w-40">
          <FiUpload className="text-3xl text-blue-500 mb-2" />
          <span className="font-medium">Upload</span>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border w-40">
          <FiFileText className="text-3xl text-green-500 mb-2" />
          <span className="font-medium">Manage Files</span>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border w-40">
          <FiMessageSquare className="text-3xl text-purple-500 mb-2" />
          <span className="font-medium">Chat</span>
        </div>
      </div>
    </div>
  )
}
