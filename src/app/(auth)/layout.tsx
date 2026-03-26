export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-sm"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {children}
      </div>
    </main>
  )
}