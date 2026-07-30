import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
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

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
