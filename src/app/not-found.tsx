import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-muted-dark">
      <div className="text-center px-6">
        <p className="text-7xl font-bold text-primary mb-4">404</p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-dark mb-4">
          Page Not Found
        </h1>
        <p className="text-dark-light mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved. Let us help you find your way.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition-all"
          >
            View Services
          </Link>
        </div>
      </div>
    </section>
  );
}
