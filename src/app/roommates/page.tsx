"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import { RoommateInbox } from "@/components/roommates/RoommateInbox";
import {
  RoommatePostForm,
  RoommateIntroduction,
} from "@/components/roommates/RoommateForms";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { apiClient } from "@/api/client";
import {
  CAMPUS_AREA_OPTIONS,
  getCampusAreaLabel,
} from "@/lib/constants/campus-areas";
import {
  postLabel,
  rentShare,
  requestLabel,
  type Introduction,
  type RoommateListing,
} from "@/api/roommate-types";

const input =
  "block mt-2 min-h-12 w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2";
const card =
  "rounded-3xl border border-border bg-card p-6 space-y-4 leading-relaxed";
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
          setState((current) => ({
            path,
            revision,
            value: current?.path === path ? current.value : undefined,
            error: apiError(e),
          }));
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
  const [focusedConnection, setFocusedConnection] = useState(connectionId);
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
    const update = () => {
      if (document.visibilityState === "visible") setInboxTick((v) => v + 1);
    };
    const timer = setInterval(update, 30000);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
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
      <div
        className={`mx-auto ${tab === "requests" ? "max-w-7xl" : "max-w-6xl"} px-4 py-8 sm:px-8 space-y-6`}
      >
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-3">
            <p className="editorial-eyebrow">FUTMINNA · Student housing</p>
            <h1 className="editorial-title text-4xl">
              {tab === "requests"
                ? "Good company starts here."
                : "Find a roommate."}
            </h1>
            <p className="text-muted-foreground">
              {tab === "requests"
                ? "Your introductions, conversations, and plans for a place to call home."
                : "Share a room you already have, or find someone to house-hunt with."}
            </p>
          </div>
          {tab === "browse" && (!role || student) && (
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
        {ownPost && tab === "browse" && (
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
              className="grid gap-5 rounded-3xl border border-border bg-muted/40 p-5 sm:grid-cols-2 lg:grid-cols-4 items-end text-sm"
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
                        <div className="flex items-center gap-3">
                          <span
                            className="roommate-avatar grid size-11 shrink-0 place-items-center rounded-full text-lg"
                            aria-hidden="true"
                          >
                            {p.name.trim().slice(0, 1).toUpperCase()}
                          </span>
                          <h2 className="text-xl font-semibold tracking-tight">
                            {p.name}
                          </h2>
                        </div>
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
                            onClick={() => {
                              setFocusedConnection(existing.id);
                              setTab("requests");
                            }}
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
          <RoommateInbox
            key={focusedConnection || connectionId || "inbox"}
            requests={inbox?.value}
            error={inbox?.error}
            reload={reload}
            initialConnectionId={focusedConnection || connectionId}
            browse={() => setTab("browse")}
          />
        )}
        {student && tab === "browse" && inbox?.error && (
          <p role="alert">
            Couldn’t load request statuses.{" "}
            <button onClick={reload}>Retry</button>
          </p>
        )}
        {intro && (
          <RoommateIntroduction
            post={intro}
            note={note}
            setNote={setNote}
            busy={busy}
            error={error}
            close={() => {
              if (!busy) setIntro(null);
            }}
            send={() => {
              void mutate(
                () =>
                  apiClient
                    .post("/roommates/" + intro.id + "/connect", {
                      message: note.trim(),
                    })
                    .then((response) =>
                      setFocusedConnection(response.data.data.id),
                    ),
                "View your introduction in My requests.",
                () => {
                  setIntro(null);
                  setTab("requests");
                },
              );
            }}
          />
        )}
        {edit && (
          <RoommatePostForm
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
