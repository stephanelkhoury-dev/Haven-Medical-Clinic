"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Heart, XCircle } from "lucide-react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!id) { setStatus("error"); return; }
    fetch(`/api/unsubscribe?id=${encodeURIComponent(id)}`)
      .then((r) => setStatus(r.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5 flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-primary" />
        </div>
        {status === "loading" && <p className="text-gray-500">Processing...</p>}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">Unsubscribed</h1>
            <p className="text-gray-500 text-sm">You have been removed from our mailing list. We&apos;re sorry to see you go!</p>
            <Link href="/" className="inline-block mt-4 text-sm text-primary hover:underline">Back to Haven Medical</Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-500 text-sm">We couldn&apos;t process your request. Please try again or contact us.</p>
            <Link href="/" className="inline-block mt-4 text-sm text-primary hover:underline">Back to Haven Medical</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
