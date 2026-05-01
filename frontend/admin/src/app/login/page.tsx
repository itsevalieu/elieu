'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { login } from '@/lib/auth';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: FormValues) {
    setFormError(null);
    try {
      await login(data.email, data.password);
      router.push('/');
      router.refresh();
    } catch {
      setFormError('Something went wrong. Check your credentials and try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{`Eva's Admin`}</h1>
          <p className="mt-1 text-sm text-zinc-600">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {formError ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-inner outline-none ring-zinc-400 transition focus:border-zinc-500 focus:ring-2"
              {...register('email')}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-inner outline-none ring-zinc-400 transition focus:border-zinc-500 focus:ring-2"
              {...register('password')}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
