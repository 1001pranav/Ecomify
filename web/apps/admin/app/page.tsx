import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-white">Ecomify Admin</h1>
        <p className="mb-8 text-xl text-white/80">
          Manage your online store with ease
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 shadow-lg transition hover:bg-gray-100"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
