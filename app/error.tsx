"use client";

export const metadata = {
  title: "Something went wrong",
};

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-gd flex flex-col items-center px-6 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-light text-brand">
        <span className="text-lg font-bold">!</span>
      </span>
      <h1 className="mt-4 text-[24px]">Something went wrong</h1>
      <p className="mt-2 max-w-md text-[13.5px]">
        An unexpected error came up while loading this page. Please try again.
      </p>
      <button type="button" onClick={() => reset()} className="btn btn-primary mt-5">
        Try again
      </button>
    </div>
  );
}
