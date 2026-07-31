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
  },
})

export const { setActiveChat, clearActiveChat } = apiSlice.actions
export default apiSlice.reducer
