import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { useState } from 'react'
import axiosClient from '../lib/axios'
import AuthAside from '../components/AuthAside'
import { FiCheck } from 'react-icons/fi'

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
})

type ForgotFormData = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async ({ email }: ForgotFormData) => {
    setStatus('loading')
    setMessage('')
    try {
      await axiosClient.post('/auth/forgot-password', { email })
      setStatus('sent')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to send reset email')
      setStatus('error')
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-0 min-h-[calc(100dvh-8.5rem)]">
      <AuthAside
        eyebrow="RAG CHATBOT"
        title="Recover access to your account."
        body="Enter the email you signed up with. We will send you a one-time link to set a new password — valid for 15 minutes."
        steps={[
          'Enter your account email.',
          'Check your inbox for the reset link.',
          'Click it and choose a new password.',
        ]}
        note="The link works once and expires quickly for your safety."
      />

      <div className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <h1 className="font-serif text-3xl font-semibold">Forgot password</h1>
          <p className="text-sm text-mute mt-2">We will email you a reset link.</p>

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

            {status === 'sent' && (
              <div className="flex items-start gap-2.5 p-3 text-sm text-pine bg-pine/5 border border-pine/20 rounded-md">
                <FiCheck size={16} className="mt-0.5 shrink-0" />
                <span>
                  If the email exists, a reset link has been sent. Check your inbox (and spam folder) — it expires
                  in 15 minutes.
                </span>
              </div>
            )}
            {status === 'error' && (
              <div className="p-3 text-sm text-error bg-error/5 border border-error/20 rounded-md">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'sent'}
              className="w-full py-2.5 bg-pine text-paper font-medium rounded-md text-sm hover:bg-pine-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {status === 'loading' ? 'Sending…' : 'Send reset link'}
            </button>
          </div>

          <p className="text-sm text-mute mt-6">
            Remembered your password?{' '}
            <Link to="/login" className="text-pine hover:text-pine-deep underline underline-offset-2 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
