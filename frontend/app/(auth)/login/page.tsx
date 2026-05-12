import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="card p-8">

        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-ink">
          <h1 className="text-2xl font-black text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to your NairaRamp account</p>
        </div>

        <form className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-ink mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-ink">
                Password
              </label>
              <a href="#" className="text-xs font-semibold text-brand hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="input"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2">
            Sign In →
          </button>
        </form>

        <p className="mt-6 pt-6 border-t-2 border-ink text-center text-sm text-muted">
          No account yet?{' '}
          <Link href="/register" className="font-black text-brand hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
