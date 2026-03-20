"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <span className="material-symbols-outlined text-error text-6xl mb-4">error</span>
      <h1 className="text-3xl font-black mb-4">Something went wrong</h1>
      <p className="text-on-surface-variant mb-8 text-center max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="bg-primary text-on-primary px-8 py-3 rounded-md font-bold"
      >
        Try Again
      </button>
    </div>
  );
}
