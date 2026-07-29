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

export const askQuestion = createAsyncThunk(
  'api/askQuestion',
  async (body: { question: string; fileId?: string }) => {
    const res = await axiosClient.post('/upload/query', body)
    return res.data
  },
)

interface ApiState {
  files: any[]
  loading: boolean
}

const initialState: ApiState = {
  files: [],
  loading: false,
}

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFiles.pending, (state) => { state.loading = true })
      .addCase(getFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = action.payload
      })
      .addCase(getFiles.rejected, (state) => { state.loading = false })
  },
})

export default apiSlice.reducer
