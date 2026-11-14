"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Coffee,
  DoorOpen,
  Handshake,
  House,
  Loader2,
  LockKeyhole,
  MessageCircle,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import { apiClient } from "@/api/client";
import {
  requestLabel,
  type Introduction,
  type RoommateChatLine,
} from "@/api/roommate-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import "./roommate-inbox.css";

function errorMessage(error: unknown) {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === "string"
    ? message
    : "Couldn’t connect. Please try again.";
}

function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const tone =
    [...name].reduce((value, char) => value + char.charCodeAt(0), 0) % 3;
  return (
    <span
      aria-hidden="true"
      className={`roommate-chat-avatar tone-${tone}${large ? " is-large" : ""}`}
    >
      {letters || "K"}
    </span>
  );
}

type Filter = "all" | "chats" | "requests" | "closed";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chats", label: "Chats" },
  { id: "requests", label: "Requests" },
  { id: "closed", label: "Archived" },
];

export function RoommateInbox({
  requests,
  error,
  reload,
  initialConnectionId,
  browse,
}: {
  requests?: Introduction[];
  error?: string;
  reload: () => void;
  initialConnectionId?: string | null;
  browse: () => void;
}) {
  const [selectedId, setSelectedId] = useState(initialConnectionId || "");
  const [mobileThread, setMobileThread] = useState(
    Boolean(initialConnectionId),
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const inboxRef = useRef<HTMLElement>(null);
  const items = requests || [];
  const selected =
    items.find((item) => item.id === selectedId) ||
    items.find((item) => item.status === "ACCEPTED") ||
    items[0];
  const activeId = selected?.id;
  const rememberPreview = useCallback(
    (value: string) => {
      if (activeId)
        setPreviews((current) =>
          current[activeId] === value
            ? current
            : { ...current, [activeId]: value },
        );
    },
    [activeId],
  );
  const waiting = items.filter(
    (item) => item.direction === "RECEIVED" && item.status === "PENDING",
  ).length;
  useEffect(() => {
    if (
      mobileThread &&
      activeId &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      inboxRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [mobileThread, activeId]);
  const filtered = items.filter((item) => {
    const matches =
      filter === "all" ||
      (filter === "chats" && item.status === "ACCEPTED") ||
      (filter === "requests" && item.status === "PENDING") ||
      (filter === "closed" && ["CLOSED", "DECLINED"].includes(item.status));
    return (
      matches &&
      `${item.otherName} ${item.message || ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    );
  });

  return (
    <section
      ref={inboxRef}
      className={`roommate-inbox ${mobileThread && selected ? "is-thread-open" : ""}`}
      aria-label="Roommate messages"
    >
      <aside className="roommate-inbox-sidebar" aria-label="Conversations">
        <header className="roommate-inbox-heading">
          <div>
            <p className="roommate-chat-eyebrow">
              A little hello goes a long way
            </p>
            <h2>
              Conversations<span>{items.length}</span>
            </h2>
          </div>
          <button
            type="button"
            className="roommate-chat-icon-button"
            onClick={reload}
            aria-label="Refresh conversations"
          >
            <RefreshCw size={17} />
          </button>
        </header>
        <label className="roommate-inbox-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search conversations</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a conversation"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear conversation search"
            >
              <X size={15} />
            </button>
          )}
        </label>
        <div
          className="roommate-inbox-filters"
          aria-label="Filter conversations"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {waiting > 0 && (
          <p className="roommate-inbox-waiting">
            <span aria-hidden="true" />
            {waiting} introduction{waiting === 1 ? "" : "s"} waiting for your
            reply
          </p>
        )}
        {error && (
          <div role="alert" className="roommate-chat-error">
            {error} <button onClick={reload}>Retry</button>
          </div>
        )}
        <nav className="roommate-inbox-list" aria-label="Select a conversation">
          {!requests && !error ? (
            <p role="status" className="roommate-chat-loading">
              <Loader2 className="animate-spin" size={18} />
              Loading conversations…
            </p>
          ) : !filtered.length ? (
            <div className="roommate-inbox-empty-list">
              <MessageCircle size={28} />
              <h3>
                {items.length
                  ? "No conversations found"
                  : "Your people are out there."}
              </h3>
              <p>
                {items.length
                  ? "Try a different name or filter."
                  : "Introduce yourself to a student. Your requests and replies will appear here."}
              </p>
              {items.length ? (
                <button
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear search & filters
                </button>
              ) : (
                <button onClick={browse}>
                  Find a roommate <ArrowUpRight size={16} />
                </button>
              )}
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className="roommate-inbox-person"
                aria-label={`Open conversation with ${item.otherName}`}
                aria-current={selected?.id === item.id ? "true" : undefined}
                onClick={() => {
                  setSelectedId(item.id);
                  setMobileThread(true);
                }}
              >
                <Avatar name={item.otherName} />
                <span className="roommate-inbox-person-copy">
                  <span className="roommate-inbox-person-top">
                    <strong>{item.otherName}</strong>
                    {item.status === "PENDING" &&
                      item.direction === "RECEIVED" && (
                        <span
                          className="roommate-chat-dot"
                          aria-label="Awaiting your reply"
                        />
                      )}
                  </span>
                  <span className="roommate-inbox-preview">
                    {drafts[item.id] ? (
                      <>
                        <em>Draft: </em>
                        {drafts[item.id]}
                      </>
                    ) : (
                      previews[item.id] ||
                      item.message ||
                      "Start getting to know each other."
                    )}
                  </span>
                  <span
                    className={`roommate-chat-status status-${item.status.toLowerCase()}`}
                  >
                    {item.status === "PENDING"
                      ? item.direction === "RECEIVED"
                        ? "Reply to introduction"
                        : "Introduction sent"
                      : requestLabel(item.status)}
                  </span>
                </span>
                <ChevronRight size={15} className="roommate-inbox-chevron" />
              </button>
            ))
          )}
        </nav>
        <div className="roommate-inbox-footer">
          <House size={21} />
          <div>
            <strong>A place. A person. A fresh start.</strong>
            <p>Make room for a good conversation.</p>
          </div>
        </div>
      </aside>
      {selected ? (
        <Conversation
          key={selected.id + ":" + selected.status}
          request={selected}
          draft={drafts[selected.id] || ""}
          setDraft={(value) =>
            setDrafts((current) => ({ ...current, [selected.id]: value }))
          }
          onMessage={rememberPreview}
          onChanged={reload}
          back={() => setMobileThread(false)}
        />
      ) : (
        <div className="roommate-chat-welcome">
          <div className="roommate-chat-orbit" aria-hidden="true">
            <span>
              <House size={40} strokeWidth={1.3} />
            </span>
            <i>
              <MessageCircle size={22} />
            </i>
            <b>
              <Coffee size={22} />
            </b>
          </div>
          <p className="roommate-chat-eyebrow">More than sharing a space</p>
          <h2>
            Find someone
            <br />
            you can feel at home with.
          </h2>
          <p>
            A conversation about budgets, routines, and the little things is a
            good place to start.
          </p>
          <button className="roommate-chat-primary" onClick={browse}>
            Meet your next roommate <ArrowUpRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}

function dayLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date(),
    yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function timeLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}
const starters = [
  {
    icon: House,
    label: "Talk budget",
    text: "What yearly rent budget works for you?",
  },
  {
    icon: Coffee,
    label: "Daily routines",
    text: "What does a typical day at home look like for you?",
  },
  {
    icon: DoorOpen,
    label: "Move-in plans",
    text: "When are you hoping to move in?",
  },
];

function Conversation({
  request: r,
  draft,
  setDraft,
  onChanged,
  onMessage,
  back,
}: {
  request: Introduction;
  draft: string;
  setDraft: (value: string) => void;
  onChanged: () => void;
  onMessage: (value: string) => void;
  back: () => void;
}) {
  const [decision, setDecision] = useState<Introduction["status"] | null>(null);
  const status = decision || r.status;
  const canRead = status === "ACCEPTED" || status === "CLOSED";
  const [messages, setMessages] = useState<RoommateChatLine[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [retry, setRetry] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);
  const [awayFromBottom, setAwayFromBottom] = useState(false);
  const nearBottom = useRef(true);
  const forceScroll = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const requestVersion = useRef(0);
  const path = `/roommates/connections/${r.id}`;

  useEffect(() => {
    if (!canRead) return;
    let disposed = false;
    let controller: AbortController | undefined;
    async function load() {
      if (document.visibilityState !== "visible" || busyRef.current) return;
      controller?.abort();
      controller = new AbortController();
      const version = ++requestVersion.current;
      try {
        const response = await apiClient.get(path + "/messages", {
          signal: controller.signal,
        });
        if (!disposed && version === requestVersion.current) {
          const loaded = response.data.data as RoommateChatLine[];
          setMessages(loaded);
          if (loaded.length) onMessage(loaded[loaded.length - 1].body);
          setLoadError("");
        }
      } catch (error) {
        if (
          !disposed &&
          !controller.signal.aborted &&
          version === requestVersion.current
        )
          setLoadError(errorMessage(error));
      }
    }
    void load();
    const timer = setInterval(() => void load(), 30000);
    const refresh = () => void load();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      disposed = true;
      controller?.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [canRead, path, retry, onMessage]);

  useLayoutEffect(() => {
    if (scroller.current && (nearBottom.current || forceScroll.current)) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
      forceScroll.current = false;
    }
  }, [messages]);
  useLayoutEffect(() => {
    if (!textarea.current) return;
    textarea.current.style.height = "auto";
    textarea.current.style.height =
      Math.min(120, textarea.current.scrollHeight) + "px";
  }, [draft, status]);

  async function decide(next: "ACCEPTED" | "DECLINED" | "CLOSED") {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    try {
      await apiClient.put(path, { status: next });
      setDecision(next);
      setConfirmClose(false);
      onChanged();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function send() {
    const body = draft.trim();
    if (!body || busyRef.current || status !== "ACCEPTED") return;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    // A GET started before this send must not overwrite the confirmed message.
    ++requestVersion.current;
    try {
      const response = await apiClient.post(path + "/messages", { body });
      const message = response.data.data as RoommateChatLine;
      forceScroll.current = true;
      setMessages((current) =>
        [
          ...(current || []).filter((item) => item.id !== message.id),
          message,
        ].slice(-50),
      );
      setDraft("");
      onMessage(body);
      textarea.current?.focus();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const firstName = r.otherName.trim().split(/\s+/)[0] || "your roommate";

  return (
    <article
      className="roommate-conversation"
      aria-label={`Conversation with ${r.otherName}`}
    >
      <header className="roommate-conversation-header">
        <button
          type="button"
          className="roommate-chat-icon-button roommate-chat-back"
          onClick={back}
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar name={r.otherName} />
        <div className="roommate-conversation-title">
          <h2>{r.otherName}</h2>
          <p>
            <LockKeyhole size={12} aria-hidden="true" />
            {status === "ACCEPTED"
              ? "Roommate conversation"
              : status === "CLOSED"
                ? "Conversation closed"
                : status === "DECLINED"
                  ? "Introduction declined"
                  : "A new introduction"}
          </p>
        </div>
        {status === "ACCEPTED" && (
          <button
            type="button"
            className="roommate-chat-icon-button"
            aria-label="Close conversation"
            title="Close conversation"
            disabled={busy}
            onClick={() => setConfirmClose(true)}
          >
            <DoorOpen size={19} />
          </button>
        )}
      </header>
      <div className="roommate-conversation-context">
        <Handshake size={16} />
        <span>
          {status === "ACCEPTED"
            ? "Connected. Now find your common ground."
            : status === "PENDING"
              ? "A shared home starts with getting to know each other."
              : "Every introduction is a step towards your people."}
        </span>
        {status === "ACCEPTED" && (
          <span className="roommate-chat-connected">
            <Check size={12} />
            Accepted
          </span>
        )}
      </div>
      <div
        className="roommate-message-scroll"
        ref={scroller}
        onScroll={() => {
          const el = scroller.current;
          if (el) {
            nearBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            setAwayFromBottom(!nearBottom.current);
          }
        }}
      >
        <div className="roommate-intro-note">
          <MessageSquareText size={18} />
          <div>
            <p className="roommate-chat-eyebrow">
              {r.direction === "SENT" ? "Your introduction" : "How it started"}
            </p>
            <p>
              {r.message ||
                `${r.otherName} would like to connect about finding a roommate.`}
            </p>
          </div>
        </div>
        {status === "PENDING" ? (
          <div className="roommate-chat-request-state">
            <Avatar name={r.otherName} large />
            <p className="roommate-chat-eyebrow">
              {r.direction === "RECEIVED"
                ? "There could be a connection here"
                : "You’ve made the first move"}
            </p>
            <h3>
              {r.direction === "RECEIVED"
                ? `Say hello to ${firstName}.`
                : "A little patience. A possible roommate."}
            </h3>
            <p>
              {r.direction === "RECEIVED"
                ? "Accept this introduction to talk about your plans, routines, and what makes a place feel like home."
                : `Your introduction is with ${firstName}. You can start chatting once they accept.`}
            </p>
            {!r.listingActive && (
              <p className="roommate-chat-paused">
                {r.direction === "RECEIVED"
                  ? "Your post is paused. Publish it again before accepting."
                  : "This post is paused. You can withdraw this request."}
              </p>
            )}
            <div className="roommate-chat-request-actions">
              {r.direction === "RECEIVED" ? (
                <>
                  <button
                    className="roommate-chat-primary"
                    disabled={busy || !r.listingActive}
                    onClick={() => void decide("ACCEPTED")}
                  >
                    Accept introduction <ArrowUpRight size={17} />
                  </button>
                  <button
                    className="roommate-chat-secondary"
                    disabled={busy}
                    onClick={() => void decide("DECLINED")}
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  className="roommate-chat-secondary"
                  disabled={busy}
                  onClick={() => void decide("CLOSED")}
                >
                  Withdraw introduction
                </button>
              )}
            </div>
          </div>
        ) : status === "DECLINED" ? (
          <div className="roommate-chat-request-state">
            <MessageCircle size={36} />
            <h3>This introduction wasn’t a match.</h3>
            <p>
              There are other students looking for the right person to share
              with.
            </p>
          </div>
        ) : (
          <>
            {loadError && (
              <div role="alert" className="roommate-chat-error">
                {loadError}{" "}
                <button onClick={() => setRetry((value) => value + 1)}>
                  Retry messages
                </button>
              </div>
            )}
            {!messages && !loadError && (
              <p role="status" className="roommate-chat-loading">
                <Loader2 size={18} className="animate-spin" />
                Loading messages…
              </p>
            )}
            {messages?.length === 0 && (
              <div className="roommate-chat-first-message">
                <span>
                  <MessageCircle size={26} />
                </span>
                <h3>
                  {status === "ACCEPTED"
                    ? "You’ve connected. Make it a conversation."
                    : "No messages in this conversation."}
                </h3>
                <p>
                  {status === "ACCEPTED"
                    ? "No messages yet. Break the ice with a question below."
                    : "This conversation is closed."}
                </p>
              </div>
            )}
            <div
              className="roommate-messages"
              role="log"
              aria-label="Messages"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {messages?.map((message, index) => {
                const day = dayLabel(message.createdAt),
                  newDay =
                    index === 0 ||
                    day !== dayLabel(messages[index - 1].createdAt);
                return (
                  <Fragment key={message.id}>
                    {newDay && day && (
                      <div className="roommate-message-day">
                        <span>{day}</span>
                      </div>
                    )}
                    <div
                      className={`roommate-message ${message.mine ? "is-mine" : "is-theirs"}`}
                    >
                      <span className="sr-only">
                        {message.mine ? "You" : r.otherName}:
                      </span>
                      <div className="roommate-message-bubble">
                        <p>{message.body}</p>
                        <time dateTime={message.createdAt}>
                          {timeLabel(message.createdAt)}
                        </time>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>
      {awayFromBottom && !!messages?.length && (
        <button
          type="button"
          className="roommate-chat-latest"
          onClick={() => {
            scroller.current?.scrollTo({
              top: scroller.current.scrollHeight,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            });
          }}
        >
          <ArrowDown size={14} />
          Latest messages
        </button>
      )}
      {actionError && !confirmClose && (
        <p role="alert" className="roommate-chat-error">
          {actionError}
        </p>
      )}
      {status === "ACCEPTED" ? (
        <form
          className="roommate-chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          {messages?.length === 0 && !draft && (
            <div
              className="roommate-chat-starters"
              aria-label="Conversation starters"
            >
              {starters.map(({ icon: Icon, label, text }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setDraft(text);
                    textarea.current?.focus();
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="roommate-chat-compose-box">
            <label>
              <span className="sr-only">Message</span>
              <textarea
                ref={textarea}
                rows={1}
                maxLength={1000}
                placeholder={`Message ${firstName}…`}
                value={draft}
                disabled={busy}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    window.matchMedia("(min-width: 768px)").matches
                  ) {
                    event.preventDefault();
                    void send();
                  }
                }}
              />
            </label>
            <button
              type="submit"
              className="roommate-chat-send"
              disabled={busy || !draft.trim()}
              aria-label={busy ? "Sending message" : "Send message"}
            >
              {busy ? (
                <Loader2 size={19} className="animate-spin" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </div>
          <div className="roommate-chat-composer-meta">
            <span>
              <LockKeyhole size={11} />
              Only share details you’re comfortable with.
            </span>
            <span>
              {draft.length ? `${draft.length}/1,000` : "Latest 50 messages"}
            </span>
          </div>
        </form>
      ) : (
        <footer className="roommate-chat-readonly">
          <LockKeyhole size={15} />
          <span>
            {status === "PENDING"
              ? "Chat opens when the introduction is accepted."
              : "This conversation is read-only. You can’t send new messages."}
          </span>
        </footer>
      )}
      <Dialog
        open={confirmClose}
        onOpenChange={(open) => {
          if (!busy) {
            setConfirmClose(open);
            setActionError("");
          }
        }}
      >
        <DialogContent
          className="roommate-chat-close-dialog"
          showCloseButton={false}
        >
          <span className="roommate-chat-close-icon">
            <DoorOpen size={26} />
          </span>
          <DialogTitle>Close this conversation?</DialogTitle>
          <DialogDescription>
            You and {firstName} will still be able to read your messages, but
            neither of you can send new ones. This can’t be undone.
          </DialogDescription>
          {actionError && (
            <p role="alert" className="roommate-chat-error">
              {actionError}
            </p>
          )}
          <footer>
            <button
              className="roommate-chat-secondary"
              disabled={busy}
              onClick={() => setConfirmClose(false)}
            >
              Keep chatting
            </button>
            <button
              className="roommate-chat-primary"
              disabled={busy}
              onClick={() => void decide("CLOSED")}
            >
              {busy ? "Closing…" : "Close conversation"}
            </button>
          </footer>
        </DialogContent>
      </Dialog>
    </article>
  );
}
