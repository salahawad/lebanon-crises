import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-6xl block mb-4" aria-hidden="true">
            🔍
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Page not found
          </h1>
          <p className="text-slate-500 mb-6 text-sm">
            The page you are looking for does not exist.
          </p>
          <Link
            href="/en"
            className="inline-flex items-center gap-1 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
