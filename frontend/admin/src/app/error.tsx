"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 text-zinc-500">An unexpected error occurred.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Try again
      </button>
    </main>
  );
}
