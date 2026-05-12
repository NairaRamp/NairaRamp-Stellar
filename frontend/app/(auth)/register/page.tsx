import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="card p-8">

        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-ink">
          <span className="section-label text-xs mb-3 inline-block">Free</span>
          <h1 className="text-2xl font-black text-ink">Create account</h1>
          <p className="mt-1 text-sm text-muted">Start converting crypto to Naira today</p>
        </div>

        <form className="space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-xs font-black uppercase tracking-widest text-ink mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="John"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-xs font-black uppercase tracking-widest text-ink mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                className="input"
              />
            </div>
          </div>

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
            <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-ink mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="input"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2">
            Create Account →
          </button>

          <p className="text-xs text-muted text-center leading-relaxed">
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-brand">Terms</a> and{' '}
            <a href="#" className="underline hover:text-brand">Privacy Policy</a>.
          </p>
        </form>

        <p className="mt-6 pt-6 border-t-2 border-ink text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-black text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
