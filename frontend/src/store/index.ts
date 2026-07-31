import { configureStore } from '@reduxjs/toolkit'
import apiReducer from './apiSlice'
import authReducer from '../slices/authSlice'
import themeReducer from '../slices/themeSlice'

export const store = configureStore({
  reducer: {
    api: apiReducer,
    auth: authReducer,
    theme: themeReducer,
  },
})
