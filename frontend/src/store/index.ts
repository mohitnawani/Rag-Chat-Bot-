import { configureStore } from '@reduxjs/toolkit'
import apiReducer from './apiSlice'

export const store = configureStore({
  reducer: {
    api: apiReducer,
  },
})
