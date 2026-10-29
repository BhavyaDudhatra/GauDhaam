import { formatINR } from "@/lib/money";

export function BillSummary({
  month,
  deliveredDays,
  pausedDays,
  scheduledDays,
  total,
}: {
  month: string;
  deliveredDays: number;
  pausedDays: number;
  scheduledDays: number;
  total: number;
}) {
  return (
    <div className="card p-5">
      <h3 className="text-[17px]">Current month bill</h3>
      <p className="mt-1 text-[12.5px] text-body/80">{month}</p>
      <div className="mt-4 space-y-2 text-[13px]">
        <div className="flex items-center justify-between">
          <span>Delivered days</span>
          <span>{deliveredDays}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Paused days (excluded)</span>
          <span>{pausedDays}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Upcoming deliveries</span>
          <span>{scheduledDays}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[14px] font-semibold text-brand-dark">
          <span>Running balance</span>
          <span>{formatINR(total)}</span>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-body/65">
        Only delivered days are billed. Paused and upcoming days are not
        charged yet.
      </p>
    </div>
  );
}
