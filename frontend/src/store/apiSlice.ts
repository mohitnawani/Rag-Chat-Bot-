import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../lib/axios'

export const getFiles = createAsyncThunk('api/getFiles', async () => {
  const res = await axiosClient.get('/upload/getfiles')
  return res.data.files
})

export const uploadFile = createAsyncThunk('api/uploadFile', async (formData: FormData) => {
  const res = await axiosClient.post('/upload', formData)
  return res.data
})

export const deleteFile = createAsyncThunk('api/deleteFile', async (id: string) => {
  await axiosClient.delete(`/upload/${id}`)
  return id
})

export const listChats = createAsyncThunk('api/listChats', async () => {
  const res = await axiosClient.get('/chat')
  return res.data.chats
})

export const createChat = createAsyncThunk('api/createChat', async () => {
  const res = await axiosClient.post('/chat')
  return res.data.chat
})

export const getChat = createAsyncThunk('api/getChat', async (id: string) => {
  const res = await axiosClient.get(`/chat/${id}`)
  return res.data.chat
})

export const deleteChat = createAsyncThunk('api/deleteChat', async (id: string) => {
  await axiosClient.delete(`/chat/${id}`)
  return id
})

export const askInChat = createAsyncThunk(
  'api/askInChat',
  async ({ chatId, question, fileId }: { chatId: string; question: string; fileId?: string }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(`/chat/${chatId}/ask`, { question, fileId })
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'The answer could not be generated. Try again.')
    }
  },
)

export const askInChatStream = createAsyncThunk(
  'api/askInChatStream',
  async (
    { chatId, question, fileId, onDelta }: { chatId: string; question: string; fileId?: string; onDelta?: (text: string) => void },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question, chatId, fileId }),
      })
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'The answer could not be generated. Try again.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let sep
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sep)
          buffer = buffer.slice(sep + 2)
          const dataLine = rawEvent.split('\n').find((l) => l.startsWith('data:'))
          if (!dataLine) continue
          const data = dataLine.slice(5).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.event_type === 'delta' && typeof parsed.text === 'string') {
              onDelta?.(parsed.text)
            }
          } catch {
            // ignore malformed events
          }
        }
      }
      return chatId
    } catch (err: any) {
      return rejectWithValue(err.message || 'The answer could not be generated. Try again.')
    }
  },
)

interface ApiState {
  files: any[]
  chats: any[]
  activeChat: any | null
  loading: boolean
  chatLoading: boolean
  chatError: string | null
}

const initialState: ApiState = {
  files: [],
  chats: [],
  activeChat: null,
  loading: false,
  chatLoading: false,
  chatError: null,
}

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setActiveChat(state, action) {
      state.activeChat = action.payload
    },
    clearActiveChat(state) {
      state.activeChat = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFiles.pending, (state) => { state.loading = true })
      .addCase(getFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = action.payload
      })
      .addCase(getFiles.rejected, (state) => { state.loading = false })
      
      .addCase(listChats.fulfilled, (state, action) => {
        state.chats = action.payload
      })
      .addCase(getChat.pending, (state) => { state.chatLoading = true })
      .addCase(getChat.fulfilled, (state, action) => {
        state.chatLoading = false
        state.activeChat = action.payload
      })
      .addCase(getChat.rejected, (state) => { state.chatLoading = false })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload)
        state.activeChat = action.payload
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter((c: any) => c._id !== action.payload)
        if (state.activeChat?._id === action.payload) state.activeChat = null
      })
      .addCase(askInChat.pending, (state) => { state.chatError = null })
      .addCase(askInChat.fulfilled, (state, action) => {
        if (action.payload.chat) {
          state.activeChat = action.payload.chat
          const idx = state.chats.findIndex((c: any) => c._id === action.payload.chat._id)
          if (idx !== -1) state.chats[idx] = action.payload.chat
        }
      })
      .addCase(askInChat.rejected, (state, action) => {
        state.chatError = action.payload as string || 'The answer could not be generated. Try again.'
      })
      .addCase(askInChatStream.pending, (state) => { state.chatError = null })
      .addCase(askInChatStream.fulfilled, () => {})
      .addCase(askInChatStream.rejected, (state, action) => {
        state.chatError = action.payload as string || 'The answer could not be generated. Try again.'
      })
  },
})

export const { setActiveChat, clearActiveChat } = apiSlice.actions
export default apiSlice.reducer
