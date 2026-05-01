import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-zinc-900">404</h1>
      <p className="mt-2 text-lg text-zinc-500">Page not found.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
