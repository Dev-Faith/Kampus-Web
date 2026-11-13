"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { apiClient } from "@/api/client";
import {
  CAMPUS_AREA_OPTIONS,
  getCampusAreaLabel,
} from "@/lib/constants/campus-areas";
import {
  INTENTS,
  postLabel,
  rentShare,
  requestLabel,
  type HousingIntent,
  type Introduction,
  type RoommateChatLine,
  type RoommateListing,
} from "@/api/roommate-types";

const input =
  "block mt-1 w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground";
const card = "rounded-2xl border border-border bg-card p-5 space-y-3";
const areas = CAMPUS_AREA_OPTIONS.filter((a) => a.id !== "all");
const apiError = (e: unknown) => {
  const msg = (e as { response?: { data?: { message?: unknown } } })?.response
    ?.data?.message;
  return typeof msg === "string"
    ? msg
    : "Couldn’t complete the request. Please try again.";
};
function useResource<T>(path: string | null, revision: number) {
  const [state, setState] = useState<{
    path: string;
    revision: number;
    value?: T;
    error?: string;
  }>();
  useEffect(() => {
    if (!path) return;
    const abort = new AbortController();
    apiClient
      .get(path, { signal: abort.signal })
      .then((r) => {
        if (!abort.signal.aborted)
          setState({ path, revision, value: r.data.data });
      })
      .catch((e) => {
        if (!abort.signal.aborted)
          setState({ path, revision, error: apiError(e) });
      });
    return () => abort.abort();
  }, [path, revision]);
  return state?.path === path ? state : undefined;
}
type Feed = {
  items: RoommateListing[];
  pagination: { totalPages: number; total: number };
};
export default function RoommatesPage() {
  const user = useAuthStore((s) => s.user);
  const [auth, setAuth] = useState(false);
  return (
    <>
      <Navbar />
      <Suspense fallback={<p>Loading roommate requests…</p>}>
        <Roommates
          key={user?.id || "guest"}
          role={user?.role}
          department={user?.student?.department || ""}
          openAuth={() => setAuth(true)}
        />
      </Suspense>
      <AuthModal isOpen={auth} onClose={() => setAuth(false)} />
    </>
  );
}
function Roommates({
  role,
  department,
  openAuth,
}: {
  role?: string;
  department: string;
  openAuth: () => void;
}) {
  const connectionId = useSearchParams().get("connectionId");
  const student = role === "STUDENT";
  const [tab, setTab] = useState<"browse" | "requests">(
      connectionId ? "requests" : "browse",
    ),
    [edit, setEdit] = useState(false);
  const [intro, setIntro] = useState<RoommateListing | null>(null),
    [note, setNote] = useState("");
  const [intent, setIntent] = useState(""),
    [area, setArea] = useState(""),
    [budget, setBudget] = useState(""),
    [limit, setLimit] = useState("");
  const [page, setPage] = useState(1),
    [rev, refresh] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [inboxTick, setInboxTick] = useState(0);
  useEffect(() => {
    if (tab !== "requests" || !student) return;
    const timer = setInterval(() => setInboxTick((v) => v + 1), 30000);
    return () => clearInterval(timer);
  }, [tab, student]);
  const params = new URLSearchParams({
    university: "FUTMINNA",
    page: String(page),
    pageSize: "12",
  });
  if (intent) params.set("housingIntent", intent);
  if (area) params.set("area", area);
  if (limit) params.set("maxAnnualShare", limit);
  const feed = useResource<Feed>("/roommates?" + params, rev);
  const own = useResource<RoommateListing | null>(
    student ? "/roommates/me" : null,
    rev,
  );
  const inbox = useResource<Introduction[]>(
    student ? "/roommates/connections" : null,
    rev + inboxTick,
  );
  const reload = () => refresh((v) => v + 1);
  async function mutate(
    work: () => Promise<unknown>,
    success: string,
    after?: () => void,
  ) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
      after?.();
      setNotice(success);
      reload();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }
  function start(action: () => void) {
    setError("");
    if (!role) openAuth();
    else if (student) action();
  }
  const ownPost = own?.value;
  return (
    <main className="editorial-page roommates-page min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-3">
            <p className="editorial-eyebrow">FUTMINNA · Student housing</p>
            <h1 className="editorial-title text-4xl">Find a roommate.</h1>
            <p className="text-muted-foreground">
              Share a room you already have, or find someone to house-hunt with.
            </p>
          </div>
          {(!role || student) && (
            <Button
              disabled={
                busy ||
                (student &&
                  !own?.value &&
                  !own?.error &&
                  own?.value !== null) ||
                Boolean(own?.error)
              }
              onClick={() => start(() => setEdit(true))}
            >
              {ownPost ? "Edit my post" : "Create a post"}
            </Button>
          )}
        </header>
        {student && own?.error && (
          <p role="alert">
            Couldn’t load your post. <button onClick={reload}>Retry</button>
          </p>
        )}
        {ownPost && (
          <div className={card}>
            <strong>
              {ownPost.isHidden
                ? "Your post is under moderation"
                : ownPost.isActive
                  ? "Your post is visible"
                  : "Your post is paused"}
            </strong>
            {ownPost.isActive && !ownPost.isHidden && (
              <Button
                className="ml-3"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  mutate(
                    () => apiClient.delete("/roommates/me"),
                    "Your post is paused.",
                  )
                }
              >
                Pause post
              </Button>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant={tab === "browse" ? "default" : "outline"}
            onClick={() => setTab("browse")}
          >
            Browse posts
          </Button>
          {student && (
            <Button
              variant={tab === "requests" ? "default" : "outline"}
              onClick={() => setTab("requests")}
            >
              My requests
              {inbox?.value?.some(
                (r) => r.direction === "RECEIVED" && r.status === "PENDING",
              )
                ? " · New"
                : ""}
            </Button>
          )}
          <Button variant="ghost" onClick={reload}>
            Refresh
          </Button>
        </div>
        {error && !edit && !intro && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {notice && <p role="status">{notice}</p>}
        {tab === "browse" ? (
          <>
            <form
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end"
              onSubmit={(e) => {
                e.preventDefault();
                setLimit(budget);
                setPage(1);
              }}
            >
              <label>
                Show students who
                <select
                  className={input}
                  value={intent}
                  onChange={(e) => {
                    setIntent(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Have either plan</option>
                  <option value="HAS_ROOM">Have a room</option>
                  <option value="SEARCH_TOGETHER">
                    Want to search together
                  </option>
                </select>
              </label>
              <label>
                Area
                <select
                  className={input}
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All FUTMINNA areas</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.campus} · {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Maximum yearly share (₦)
                <input
                  className={input}
                  type="number"
                  min="1"
                  max="9999999999999"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Any amount"
                />
              </label>
              <Button type="submit" variant="outline">
                Apply budget
              </Button>
            </form>
            {feed?.error ? (
              <p role="alert">
                {feed.error} <button onClick={reload}>Retry</button>
              </p>
            ) : !feed?.value ? (
              <p role="status">Loading roommate posts…</p>
            ) : (
              <>
                {!feed.value.items.length && (
                  <div className={card}>
                    <h2>No posts for this search</h2>
                    <p>Try another area or publish what you’re looking for.</p>
                    {(intent || area || limit) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIntent("");
                          setArea("");
                          setBudget("");
                          setLimit("");
                          setPage(1);
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {feed.value.items.map((p) => {
                    const mine = p.id === ownPost?.id,
                      existing = inbox?.value?.find(
                        (r) => r.listingId === p.id && r.direction === "SENT",
                      );
                    return (
                      <article className={card} key={p.id}>
                        <p className="text-sm text-brand-strong">
                          {postLabel(p.housingIntent)}
                        </p>
                        <h2 className="text-xl font-semibold">{p.name}</h2>
                        <p>
                          {getCampusAreaLabel(p.area) || "Area not specified"} ·{" "}
                          {p.university}
                        </p>
                        <p>
                          <strong>{rentShare(p)}</strong>{" "}
                          {p.housingIntent === "HAS_ROOM"
                            ? "per roommate"
                            : "personal budget"}
                        </p>
                        <p className="text-muted-foreground">
                          {[
                            p.department,
                            p.level,
                            p.sleepSchedule,
                            p.cleanliness,
                            p.cookingHabits,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {p.bio && <p className="break-words">{p.bio}</p>}
                        {mine ? (
                          <span>Your post</span>
                        ) : existing ? (
                          <Button
                            variant="outline"
                            onClick={() => setTab("requests")}
                          >
                            {requestLabel(existing.status)} · View request
                          </Button>
                        ) : (
                          (!role || student) && (
                            <Button
                              disabled={
                                busy ||
                                (student &&
                                  (!own || !inbox?.value || !!own.error))
                              }
                              onClick={() =>
                                start(() => {
                                  setIntro(p);
                                  setNote("");
                                })
                              }
                            >
                              Introduce myself
                            </Button>
                          )
                        )}
                      </article>
                    );
                  })}
                </div>
                {feed.value.pagination.totalPages > 1 && (
                  <div className="flex gap-3 items-center">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((v) => v - 1)}
                    >
                      Previous
                    </Button>
                    Page {page} of {feed.value.pagination.totalPages}
                    <Button
                      variant="outline"
                      disabled={page >= feed.value.pagination.totalPages}
                      onClick={() => setPage((v) => v + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <section className="space-y-3">
            {inbox?.error ? (
              <p role="alert">
                {inbox.error} <button onClick={reload}>Retry</button>
              </p>
            ) : !inbox?.value ? (
              <p>Loading requests…</p>
            ) : inbox.value.length === 0 ? (
              <div className={card}>
                Your introductions and replies will appear here.
              </div>
            ) : (
              [...inbox.value]
                .sort(
                  (a, b) =>
                    Number(b.id === connectionId) -
                    Number(a.id === connectionId),
                )
                .map((r) => (
                  <Request
                    key={r.id}
                    r={r}
                    initialOpen={
                      r.id === connectionId && r.status === "ACCEPTED"
                    }
                    busy={busy}
                    rev={rev}
                    mutate={mutate}
                  />
                ))
            )}
          </section>
        )}
        {student && tab === "browse" && inbox?.error && (
          <p role="alert">
            Couldn’t load request statuses.{" "}
            <button onClick={reload}>Retry</button>
          </p>
        )}
        <Dialog
          open={!!intro}
          onOpenChange={(open) => {
            if (!open && !busy) setIntro(null);
          }}
        >
          <DialogContent>
            <DialogTitle>Introduce yourself to {intro?.name}</DialogTitle>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (intro && note.trim())
                  void mutate(
                    () =>
                      apiClient.post("/roommates/" + intro.id + "/connect", {
                        message: note.trim(),
                      }),
                    "View your introduction in My requests.",
                    () => setIntro(null),
                  );
              }}
            >
              <label>
                Private introduction
                <textarea
                  className={input}
                  autoFocus
                  required
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What do you have in mind for the room or the search?"
                />
              </label>
              <p>They can accept to start a private conversation.</p>
              {error && <p role="alert">{error}</p>}
              <Button type="submit" disabled={busy || !note.trim()}>
                Send introduction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        {edit && (
          <PostForm
            post={ownPost}
            department={department}
            busy={busy}
            error={error}
            close={() => {
              if (!busy) setEdit(false);
            }}
            save={(data) =>
              mutate(
                () => apiClient.put("/roommates/me", data),
                ownPost?.isHidden
                  ? "Changes saved for review."
                  : "Your post is published.",
                () => setEdit(false),
              )
            }
          />
        )}
      </div>
    </main>
  );
}
type Mutate = (
  fn: () => Promise<unknown>,
  message: string,
  after?: () => void,
) => Promise<void>;
function Request({
  r,
  initialOpen = false,
  busy,
  rev,
  mutate,
}: {
  r: Introduction;
  initialOpen?: boolean;
  busy: boolean;
  rev: number;
  mutate: Mutate;
}) {
  const [open, setOpen] = useState(initialOpen),
    [text, setText] = useState("");
  const [poll, setPoll] = useState(0);
  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => setPoll((v) => v + 1), 30000);
    return () => clearInterval(timer);
  }, [open]);
  const path = "/roommates/connections/" + r.id;
  const chat = useResource<RoommateChatLine[]>(
    open ? path + "/messages" : null,
    rev + poll,
  );
  const decide = (status: string) =>
    mutate(() => apiClient.put(path, { status }), "Request updated.");
  return (
    <article className={card}>
      <h2 className="font-semibold">
        {r.direction === "SENT" ? "To" : "From"} {r.otherName}
      </h2>
      <p>{requestLabel(r.status)}</p>
      {r.status === "PENDING" && !r.listingActive && (
        <p className="text-sm text-muted-foreground">
          {r.direction === "RECEIVED"
            ? "Your post is paused. Publish it again before accepting."
            : "This post is paused. You can withdraw this request."}
        </p>
      )}
      {r.message && <p className="break-words">{r.message}</p>}
      <div className="flex flex-wrap gap-2">
        {r.status === "PENDING" &&
          (r.direction === "RECEIVED" ? (
            <>
              <Button
                disabled={busy || !r.listingActive}
                onClick={() => decide("ACCEPTED")}
              >
                Accept introduction
              </Button>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() => decide("DECLINED")}
              >
                Decline
              </Button>
            </>
          ) : (
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => decide("CLOSED")}
            >
              Withdraw
            </Button>
          ))}
        {(r.status === "ACCEPTED" || r.status === "CLOSED") && (
          <Button variant="outline" onClick={() => setOpen(!open)}>
            {open ? "Hide conversation" : "View conversation"}
          </Button>
        )}
        {r.status === "ACCEPTED" && (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              if (window.confirm("Close this conversation for both students?"))
                void decide("CLOSED");
            }}
          >
            Close conversation
          </Button>
        )}
      </div>
      {open && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-sm">Latest 50 private messages</p>
          {chat?.error ? (
            <p role="alert">{chat.error}</p>
          ) : !chat?.value ? (
            <p>Loading…</p>
          ) : chat.value.length ? (
            chat.value.map((m) => (
              <p className="break-words" key={m.id}>
                <strong>{m.mine ? "You" : r.otherName}</strong> · {m.body}
              </p>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
          {r.status === "ACCEPTED" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim())
                  void mutate(
                    () =>
                      apiClient.post(path + "/messages", { body: text.trim() }),
                    "Message sent.",
                    () => setText(""),
                  );
              }}
            >
              <label>
                Message
                <textarea
                  className={input}
                  maxLength={1000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </label>
              <Button type="submit" disabled={busy || !text.trim()}>
                Send message
              </Button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
function PostForm({
  post,
  department,
  busy,
  error,
  close,
  save,
}: {
  post?: RoommateListing | null;
  department: string;
  busy: boolean;
  error: string;
  close: () => void;
  save: (x: unknown) => Promise<void>;
}) {
  const [intent, setIntent] = useState(post?.housingIntent || ""),
    [area, setArea] = useState(post?.area || ""),
    [amount, setAmount] = useState(post?.annualShare?.toString() || ""),
    [bio, setBio] = useState(post?.bio || "");
  const [extras, setExtras] = useState({
    department: post?.department || department,
    level: post?.level || "",
    sleepSchedule: post?.sleepSchedule || "",
    cleanliness: post?.cleanliness || "",
    cookingHabits: post?.cookingHabits || "",
  });
  const labels = {
    department: "Department",
    level: "Study level",
    sleepSchedule: "Sleep schedule",
    cleanliness: "Cleaning routine",
    cookingHabits: "Cooking habits",
  };
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) close();
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-auto">
        <DialogTitle>
          {post ? "Edit your roommate post" : "Create a roommate post"}
        </DialogTitle>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save({
              university: "FUTMINNA",
              housingIntent: intent,
              area,
              annualShare: Number(amount),
              bio,
              ...extras,
            });
          }}
        >
          <label className="block">
            What’s your situation?
            <select
              className={input}
              required
              value={intent}
              onChange={(e) => setIntent(e.target.value as HousingIntent)}
            >
              <option value="">Choose one</option>
              {Object.entries(INTENTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            {intent === "HAS_ROOM"
              ? "Where is the room?"
              : "Where would you like to live?"}
            <select
              className={input}
              value={area}
              required
              onChange={(e) => setArea(e.target.value)}
            >
              <option value="">Choose a FUTMINNA area</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.campus} · {a.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            {intent === "HAS_ROOM"
              ? "Roommate’s yearly rent share"
              : "Your maximum yearly rent share"}{" "}
            (₦)
            <input
              className={input}
              required
              type="number"
              min="1"
              max="9999999999999"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          {post && post.annualShare == null && (
            <p>
              Your old post lists {rentShare(post)}. Enter the yearly amount you
              want to publish.
            </p>
          )}
          <label className="block">
            What should a roommate know?
            <textarea
              className={input}
              maxLength={1000}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="For example, your move-in plans or how you share bills. Leave out private contact details."
            />
          </label>
          <details>
            <summary>Optional study and living preferences</summary>
            {(Object.keys(labels) as (keyof typeof labels)[]).map((k) => (
              <label className="block my-2" key={k}>
                {labels[k]}
                <input
                  className={input}
                  maxLength={k === "department" ? 255 : 100}
                  value={extras[k]}
                  onChange={(e) =>
                    setExtras({ ...extras, [k]: e.target.value })
                  }
                />
              </label>
            ))}
          </details>
          {error && <p role="alert">{error}</p>}
          <Button type="submit" disabled={busy}>
            {post?.isHidden
              ? "Save changes"
              : post && !post.isActive
                ? "Publish again"
                : "Publish post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
