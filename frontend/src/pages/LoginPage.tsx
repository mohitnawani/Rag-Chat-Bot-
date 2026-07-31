import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useLocation } from 'react-router'
import { useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { login, clearError, checkAuth } from '../slices/authSlice'
import axiosClient from '../lib/axios'
import AuthAside from '../components/AuthAside'

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must not exceed 32 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character"
    ),
});

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const dispatch = useDispatch<any>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, error } = useSelector((state: any) => state.auth)
  const from = (location.state as any)?.from || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  useEffect(() => {
    return () => { dispatch(clearError()) }
  }, [dispatch])

  const onSubmit = (data: LoginFormData) => {
    dispatch(login(data))
  }

  const onGoogleSuccess = async (credentialResponse: any) => {
    try {
      await axiosClient.post('/auth/google/verify', {
        token: credentialResponse.credential,
      })
      dispatch(checkAuth())
    } catch (err: any) {
      console.error('Google login failed', err)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-0 min-h-[calc(100dvh-8.5rem)]">
      <AuthAside
        eyebrow="RAG CHATBOT"
        title="Every answer carries its source."
        body="Upload a paper, ask anything. The assistant answers only from your documents — and marks the exact passage each answer came from."
        steps={[
          'Upload a PDF to your reading list.',
          'Ask a question about its contents.',
          'Check the amber tabs — each one points to the source passage.',
        ]}
        note="Your documents are private. The model reads only what you give it."
      />

      <div className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <h1 className="font-serif text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-mute mt-2">Sign in to your account.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-medium text-mute mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-card border border-line rounded-md text-sm placeholder:text-mute/50 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 transition"
              />
              {errors.email && <p className="text-xs text-error mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-mute mb-1.5">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Your password"
                className="w-full px-3.5 py-2.5 bg-card border border-line rounded-md text-sm placeholder:text-mute/50 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 transition"
              />
              {errors.password && <p className="text-xs text-error mt-1.5">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 text-sm text-error bg-error/5 border border-error/20 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-pine text-paper font-medium rounded-md text-sm hover:bg-pine-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-line flex-1" />
              <span className="text-xs text-mute">or continue with</span>
              <div className="h-px bg-line flex-1" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => console.log('Login Failed')}
              />
            </div>
          </div>

          <p className="text-sm text-mute mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-pine hover:text-pine-deep underline underline-offset-2 font-medium">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
