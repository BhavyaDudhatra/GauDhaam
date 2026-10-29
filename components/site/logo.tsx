import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-btn focus-visible:outline-2"
      aria-label="GauDhaam home"
    >
      <Image
        src="/assets/images/gaudhamlogo.png"
        alt=""
        width={44}
        height={44}
        className="h-10 w-10 md:h-11 md:w-11"
        priority
      />
      <span className="flex flex-col leading-none">
        <span className="text-[21px] font-bold tracking-[-0.02em] text-brand-dark">
          GauDhaam
        </span>
        {!compact && (
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.19em] text-brown">
            Pure by nature
          </span>
        )}
      </span>
    </Link>
  );
}
