import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, Link } from 'react-router'
import { useState } from 'react'
import axiosClient from '../lib/axios'
import AuthAside from '../components/AuthAside'
import { FiCheck, FiX } from 'react-icons/fi'

const resetSchema = z
  .object({
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

type ResetFormData = z.infer<typeof resetSchema>

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

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  const passwordValue = watch('password') ?? ''

  const onSubmit = async ({ password }: ResetFormData) => {
    if (!token) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await axiosClient.post('/auth/password-reset', {
        token,
        newPassword: password,
      })
      setMessage(res.data.message || 'Password reset successfully')
      setStatus('success')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to reset password')
      setStatus('error')
    }
  }

  if (!token) {
    return (
      <div className="grid lg:grid-cols-2 gap-0 min-h-[calc(100dvh-8.5rem)]">
        <AuthAside
          eyebrow="RAG CHATBOT"
          title="This link is invalid."
          body="Password reset links are single-use and expire after 15 minutes."
          steps={[
            'Request a new link with your account email.',
            'Check your inbox and click the new link.',
            'Choose a new password to sign back in.',
          ]}
          note="For security, reset links cannot be reused."
        />
        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm text-center">
            <h1 className="font-serif text-3xl font-semibold">Link missing or expired</h1>
            <p className="text-sm text-mute mt-2">No valid reset token was found in the URL.</p>
            <Link
              to="/login"
              className="inline-block mt-6 py-2.5 px-6 bg-pine text-paper font-medium rounded-md text-sm hover:bg-pine-deep transition"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-0 min-h-[calc(100dvh-8.5rem)]">
      <AuthAside
        eyebrow="RAG CHATBOT"
        title="Set a new password."
        body="Your reset link is valid for 15 minutes. Choose a strong password and sign back in."
        steps={[
          'Enter a new password.',
          'Confirm it, then reset.',
          'Sign in with your new password.',
        ]}
        note="Your documents and chats stay untouched."
      />

      <div className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <h1 className="font-serif text-3xl font-semibold">Reset password</h1>
          <p className="text-sm text-mute mt-2">Choose a new password for your account.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-medium text-mute mb-1.5">New password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Choose a new password"
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

            {status === 'success' && (
              <div className="p-3 text-sm text-pine bg-pine/5 border border-pine/20 rounded-md">
                {message}
              </div>
            )}
            {status === 'error' && (
              <div className="p-3 text-sm text-error bg-error/5 border border-error/20 rounded-md">
                {message}
              </div>
            )}

            {status === 'success' ? (
              <Link
                to="/login"
                className="block w-full text-center py-2.5 bg-pine text-paper font-medium rounded-md text-sm hover:bg-pine-deep transition"
              >
                Sign in with new password
              </Link>
            ) : (
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-2.5 bg-pine text-paper font-medium rounded-md text-sm hover:bg-pine-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {status === 'loading' ? 'Resetting…' : 'Reset password'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
