import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useLocation } from 'react-router'
import { useEffect } from 'react'
import { signup, clearError } from '../slices/authSlice'
import { FiCheck, FiX } from 'react-icons/fi'
import AuthAside from '../components/AuthAside'

const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters"),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must not exceed 32 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>

const passwordRules = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'At most 32 characters', test: (v: string) => v.length <= 32 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
]

function PasswordRequirements({ value }: { value: string }) {
  if (!value) return null
  return (
    <ul className="mt-2 space-y-1">
      {passwordRules.map((rule) => {
        const passed = rule.test(value)
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs ${passed ? 'text-pine' : 'text-mute'}`}
          >
            {passed ? <FiCheck size={13} /> : <FiX size={13} />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

export default function RegisterPage() {
  const dispatch = useDispatch<any>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, error } = useSelector((state: any) => state.auth)
  const from = (location.state as any)?.from || '/'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const passwordValue = watch('password') ?? ''

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  useEffect(() => {
    return () => { dispatch(clearError()) }
  }, [dispatch])

  const onSubmit = ({ name, email, password }: SignupFormData) => {
    dispatch(signup({ name, email, password }))
  }

  return (
    <div className="grid lg:grid-cols-2 gap-0 min-h-[calc(100dvh-8.5rem)]">
      <AuthAside
        eyebrow="RAG CHATBOT"
        title="A reading room for your documents."
        body="Keep your research in one place. Every claim the assistant makes points back to the page it came from — nothing is invented."
        steps={[
          'Add your PDFs to the library.',
          'Ask questions in plain language.',
          'Trace each answer to its source passage.',
        ]}
        note="One account. Your files stay yours."
      />

      <div className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <h1 className="font-serif text-3xl font-semibold">Create account</h1>
          <p className="text-sm text-mute mt-2">Sign up to start uploading.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-medium text-mute mb-1.5">Name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="How should we address you?"
                className="w-full px-3.5 py-2.5 bg-card border border-line rounded-md text-sm placeholder:text-mute/50 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 transition"
              />
              {errors.name && <p className="text-xs text-error mt-1.5">{errors.name.message}</p>}
            </div>

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
                placeholder="Choose a password"
                className="w-full px-3.5 py-2.5 bg-card border border-line rounded-md text-sm placeholder:text-mute/50 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 transition"
              />
              {errors.password && <p className="text-xs text-error mt-1.5">{errors.password.message}</p>}
              <PasswordRequirements value={passwordValue} />
            </div>

            <div>
              <label className="block text-xs font-medium text-mute mb-1.5">Confirm password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Repeat your password"
                className="w-full px-3.5 py-2.5 bg-card border border-line rounded-md text-sm placeholder:text-mute/50 outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 transition"
              />
              {errors.confirmPassword && <p className="text-xs text-error mt-1.5">{errors.confirmPassword.message}</p>}
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>

          <p className="text-sm text-mute mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-pine hover:text-pine-deep underline underline-offset-2 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
