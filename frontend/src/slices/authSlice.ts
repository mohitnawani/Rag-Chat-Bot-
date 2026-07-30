import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from '../lib/axios'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/auth/signup', data)
      return res.data.user
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Signup failed')
    }
  },
)

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/auth/login', data)
      return res.data.user
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  },
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await axiosClient.post('/auth/logout')
})

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/auth/me')
      return res.data.user
    } catch {
      return rejectWithValue('Not authenticated')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => { state.loading = true; state.error = null })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
