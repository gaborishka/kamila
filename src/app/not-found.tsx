import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-20 text-center">
        <span className="material-symbols-outlined text-outline text-6xl mb-4 block">
          explore_off
        </span>
        <h1 className="text-3xl font-black mb-4">Page not found</h1>
        <p className="text-on-surface-variant mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block gradient-primary text-on-primary px-8 py-3 rounded-md font-bold"
        >
          Go Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
