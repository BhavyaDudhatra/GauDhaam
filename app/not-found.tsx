import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <div className="container-gd flex flex-col items-center px-6 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-light text-brand">
        <span className="text-lg font-bold">404</span>
      </span>
      <h1 className="mt-4 text-[24px]">This page went off the beaten path</h1>
      <p className="mt-2 max-w-md text-[13.5px]">
        We could not find what you were looking for. It may have been moved, or
        it never existed.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href="/" className="btn btn-primary">
          Back home
        </a>
        <a href="/shop" className="btn btn-outline">
          Browse products
        </a>
      </div>
    </div>
  );
}
