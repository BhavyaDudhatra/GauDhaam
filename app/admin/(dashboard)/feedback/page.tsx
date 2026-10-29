import type { Metadata } from "next";
import { MessageSquare, Reply, Trash2 } from "lucide-react";
import {
  deleteFeedbackAction,
  replyFeedbackAction,
  toggleFeedbackAction,
} from "@/lib/actions/feedback";
import { formatDateTime } from "@/lib/money";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Feedback · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const store = await getStore();
  const feedback = await store.feedback.list();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[24px]">Feedback</h1>
        <p className="mt-1 text-[13px] text-body">
          {feedback.length} reviews · approve/hide and reply
        </p>
      </div>

      <div className="space-y-3">
        {feedback.map((item) => (
          <article key={item.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-brand-dark">{item.userName}</p>
                  <span className="text-[12px] text-body">{"★".repeat(item.rating)}</span>
                  <span className={`badge ${item.approved ? "badge-green" : "badge-brown"}`}>
                    {item.approved ? "Approved" : "Hidden"}
                  </span>
                </div>
                <p className="mt-0.5 text-[11.5px] text-body/70">
                  {formatDateTime(item.createdAt)}
                  {item.productName ? ` · ${item.productName}` : ""}
                </p>
                <h2 className="mt-2 text-[16px]">{item.title}</h2>
                <p className="mt-1 text-[13px] leading-relaxed">{item.comment}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={toggleFeedbackAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="approved" value={String(!item.approved)} />
                  <button className="btn btn-outline btn-sm">
                    {item.approved ? "Hide" : "Approve"}
                  </button>
                </form>
                <form action={deleteFeedbackAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="btn btn-outline btn-sm">
                    <Trash2 size={14} />
                    Delete
                  </button>
                </form>
              </div>
            </div>

            {item.reply ? (
              <div className="mt-4 rounded-xl border border-line bg-cream/50 p-3.5">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-dark">
                  <Reply size={13} />
                  Reply from {item.repliedBy ?? "GauDhaam"}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed">{item.reply}</p>
                {item.repliedAt && (
                  <p className="mt-1 text-[11px] text-body/70">
                    {formatDateTime(item.repliedAt)}
                  </p>
                )}
              </div>
            ) : (
              <form action={replyFeedbackAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="id" value={item.id} />
                <input
                  name="reply"
                  required
                  placeholder="Write a reply to the customer..."
                  className="input flex-1"
                />
                <button className="btn btn-primary btn-sm">
                  <MessageSquare size={14} />
                  Reply
                </button>
              </form>
            )}
          </article>
        ))}
        {feedback.length === 0 && (
          <div className="card px-5 py-10 text-center text-body">
            No feedback yet.
          </div>
        )}
      </div>
    </div>
  );
}
