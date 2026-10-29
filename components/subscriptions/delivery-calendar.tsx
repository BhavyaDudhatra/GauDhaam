import type { DailyDelivery } from "@/lib/types";

type DeliveryCalendarProps = {
  month: string;
  deliveries: DailyDelivery[];
};

const statusStyles: Record<DailyDelivery["status"], string> = {
  delivered: "border-brand bg-brand text-white",
  scheduled: "border-line bg-white text-brand-dark",
  paused: "border-brown/30 bg-[#F6EBE4] text-brown",
  skipped: "border-line bg-light/60 text-body/45",
};

const statusLabels: Record<DailyDelivery["status"], string> = {
  delivered: "Delivered",
  scheduled: "Scheduled",
  paused: "Paused",
  skipped: "Skipped",
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DeliveryCalendar({ month, deliveries }: DeliveryCalendarProps) {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const leading = (first.getDay() + 6) % 7;

  const byDate = new Map(deliveries.map((delivery) => [delivery.date, delivery]));
  const cells = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-body/60">
        {weekdays.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`blank-${index}`} className="aspect-square" />;
          }
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const delivery = byDate.get(date);
          const style = delivery
            ? statusStyles[delivery.status]
            : "border-dashed border-line/60 bg-transparent text-body/35";
          return (
            <span
              key={date}
              title={
                delivery
                  ? `${date} · ${statusLabels[delivery.status]}`
                  : `${date} · No delivery`
              }
              className={`grid aspect-square place-items-center rounded-xl border text-[12px] font-semibold ${style}`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-body/70">
        {(Object.keys(statusLabels) as DailyDelivery["status"][]).map(
          (status) => (
            <span key={status} className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full border ${statusStyles[status]}`}
              />
              {statusLabels[status]}
            </span>
          ),
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-line/60" />
          No delivery
        </span>
      </div>
    </div>
  );
}
