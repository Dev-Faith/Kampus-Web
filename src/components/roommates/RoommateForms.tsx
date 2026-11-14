"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  House,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CAMPUS_AREA_OPTIONS,
  getCampusAreaLabel,
} from "@/lib/constants/campus-areas";
import {
  INTENTS,
  postLabel,
  rentShare,
  type HousingIntent,
  type RoommateListing,
  type RoommateListingInput,
} from "@/api/roommate-types";
import "./roommate-forms.css";
const styles = {
  dialog: "roommate-form-dialog",
  introduction: "roommate-form-introduction",
  header: "roommate-form-header",
  eyebrow: "roommate-form-eyebrow",
  title: "roommate-form-title",
  description: "roommate-form-description",
  close: "roommate-form-close",
  steps: "roommate-form-steps",
  form: "roommate-form-form",
  scroll: "roommate-form-scroll",
  layout: "roommate-form-layout",
  content: "roommate-form-content",
  sectionTitle: "roommate-form-sectionTitle",
  hint: "roommate-form-hint",
  choices: "roommate-form-choices",
  choice: "roommate-form-choice",
  choiceIcon: "roommate-form-choiceIcon",
  radio: "roommate-form-radio",
  privacy: "roommate-form-privacy",
  field: "roommate-form-field",
  controlIcon: "roommate-form-controlIcon",
  money: "roommate-form-money",
  counter: "roommate-form-counter",
  optionalTitle: "roommate-form-optionalTitle",
  fieldGrid: "roommate-form-fieldGrid",
  preview: "roommate-form-preview",
  previewIcon: "roommate-form-previewIcon",
  footer: "roommate-form-footer",
  actions: "roommate-form-actions",
  footerNote: "roommate-form-footerNote",
  error: "roommate-form-error",
  person: "roommate-form-person",
  avatar: "roommate-form-avatar",
};

const areas = CAMPUS_AREA_OPTIONS.filter((area) => area.id !== "all");
const steps = ["Your plan", "Place & budget", "About you"];
const fields = {
  department: ["Department", "e.g. Architecture"],
  level: ["Study level", "e.g. 300 level"],
  sleepSchedule: ["Sleep schedule", "e.g. Early riser"],
  cleanliness: ["Cleaning routine", "e.g. A weekly cleaning rota"],
  cookingHabits: ["Cooking habits", "e.g. I cook most evenings"],
} as const;

function FormHeader({
  title,
  description,
  close,
  busy,
}: {
  title: string;
  description: string;
  close: () => void;
  busy: boolean;
}) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>KAMPUS · ROOMMATES</p>
        <DialogTitle className={styles.title}>{title}</DialogTitle>
        <DialogDescription className={styles.description}>
          {description}
        </DialogDescription>
      </div>
      <Button
        type="button"
        variant="ghost"
        className={styles.close}
        aria-label="Close form"
        disabled={busy}
        onClick={close}
      >
        <X size={20} />
      </Button>
    </header>
  );
}
function PrivacyNote({ children }: { children: ReactNode }) {
  return (
    <div className={styles.privacy}>
      <ShieldCheck size={19} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

export function RoommatePostForm({
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
  save: (data: RoommateListingInput) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<HousingIntent | "">(
    post?.housingIntent || "",
  );
  const [area, setArea] = useState(post?.area || "");
  const [amount, setAmount] = useState(post?.annualShare?.toString() || "");
  const [bio, setBio] = useState(post?.bio || "");
  const [validation, setValidation] = useState("");
  const [extras, setExtras] = useState({
    department: post?.department || department,
    level: post?.level || "",
    sleepSchedule: post?.sleepSchedule || "",
    cleanliness: post?.cleanliness || "",
    cookingHabits: post?.cookingHabits || "",
  });
  const body = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
    heading.current?.focus();
  }, [step]);
  const amountValid =
    Number.isFinite(Number(amount)) &&
    Number(amount) >= 1 &&
    Number(amount) <= 9999999999999;
  const action = post?.isHidden
    ? "Save changes"
    : post && !post.isActive
      ? "Publish again"
      : post
        ? "Save post"
        : "Publish post";
  const changeStep = (next: number) => {
    setValidation("");
    setStep(next);
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent className={styles.dialog} showCloseButton={false}>
        <FormHeader
          title={
            post
              ? "Make your post feel like you."
              : "Find your kind of roommate."
          }
          description="A few details help the right person say hello."
          close={close}
          busy={busy}
        />
        <ol className={styles.steps} aria-label="Post progress">
          {steps.map((label, index) => (
            <li
              key={label}
              aria-current={step === index ? "step" : undefined}
              data-complete={step > index}
            >
              <span>{step > index ? <Check size={14} /> : index + 1}</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (busy) return;
            if (!intent) {
              setValidation(
                "Choose whether you have a room or want to search together.",
              );
              setStep(0);
              return;
            }
            if (
              step > 0 &&
              (!areas.some((a) => a.id === area) || !amountValid)
            ) {
              setValidation(
                "Choose an area and enter a valid yearly rent share.",
              );
              setStep(1);
              return;
            }
            if (step < 2) {
              changeStep(step + 1);
              return;
            }
            void save({
              university: "FUTMINNA",
              housingIntent: intent,
              area,
              annualShare: Number(amount),
              bio: bio.trim(),
              ...extras,
            });
          }}
        >
          <div ref={body} className={styles.scroll}>
            <fieldset className={styles.layout} disabled={busy}>
              <section className={styles.content}>
                <div>
                  <p className={styles.eyebrow}>STEP 0{step + 1} OF 03</p>
                  <h2
                    ref={heading}
                    tabIndex={-1}
                    className={styles.sectionTitle}
                  >
                    {
                      [
                        "What’s your plan?",
                        "Let’s talk location and rent.",
                        "A little about living with you.",
                      ][step]
                    }
                  </h2>
                  <p className={styles.hint}>
                    {
                      [
                        "Start with the situation that fits you today.",
                        "Be clear about the yearly amount for one person.",
                        "These details are optional, but make introductions easier.",
                      ][step]
                    }
                  </p>
                </div>
                {step === 0 && (
                  <>
                    <div
                      className={styles.choices}
                      role="radiogroup"
                      aria-label="Housing situation"
                    >
                      {(Object.keys(INTENTS) as HousingIntent[]).map(
                        (value) => {
                          const Icon = value === "HAS_ROOM" ? House : Search;
                          return (
                            <label
                              key={value}
                              className={styles.choice}
                              data-selected={intent === value}
                            >
                              <input
                                type="radio"
                                name="housingIntent"
                                value={value}
                                checked={intent === value}
                                onChange={() => setIntent(value)}
                                required
                              />
                              <span className={styles.choiceIcon}>
                                <Icon size={23} />
                              </span>
                              <span>
                                <strong>{INTENTS[value]}</strong>
                                <small>
                                  {value === "HAS_ROOM"
                                    ? "Invite someone to share your space and the rent."
                                    : "Team up and find a place that suits you both."}
                                </small>
                              </span>
                              <span className={styles.radio} aria-hidden="true">
                                {intent === value && <Check size={14} />}
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>
                    <PrivacyNote>
                      You choose who to connect with. A private conversation
                      opens after an introduction is accepted.
                    </PrivacyNote>
                  </>
                )}
                {step === 1 && (
                  <>
                    <label className={styles.field}>
                      {intent === "HAS_ROOM"
                        ? "Where is the room?"
                        : "Where would you like to live?"}
                      <span className={styles.controlIcon}>
                        <MapPin size={18} />
                        <select
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          required
                        >
                          <option value="">Choose a FUTMINNA area</option>
                          {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.campus} · {a.label}
                            </option>
                          ))}
                        </select>
                      </span>
                    </label>
                    <label className={styles.field}>
                      {intent === "HAS_ROOM"
                        ? "Roommate’s yearly rent share"
                        : "Your maximum yearly rent share"}
                      <span className={styles.money}>
                        <span aria-hidden="true">₦</span>
                        <input
                          aria-label="Yearly rent share in naira"
                          type="number"
                          inputMode="decimal"
                          min="1"
                          max="9999999999999"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="e.g. 250000"
                          required
                        />
                        <span>/ year</span>
                      </span>
                      <small>
                        {intent === "HAS_ROOM"
                          ? "The rent one roommate will contribute for a full year."
                          : "The most you want to contribute for a full year."}
                      </small>
                    </label>
                    {post && post.annualShare == null && (
                      <p className={styles.privacy}>
                        Your old post lists {rentShare(post)}. Enter the yearly
                        amount you want to publish.
                      </p>
                    )}
                    <PrivacyNote>
                      Discuss service charges, utilities and other shared costs
                      together before making a commitment.
                    </PrivacyNote>
                  </>
                )}
                {step === 2 && (
                  <>
                    <label className={styles.field}>
                      What should a roommate know?
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={1000}
                        rows={4}
                        placeholder="Your move-in plans, daily routine, or what makes a shared home work for you…"
                      />
                      <small className={styles.counter}>
                        Keep phone numbers and private contact details out of
                        your post.<span>{bio.length}/1000</span>
                      </small>
                    </label>
                    <div className={styles.optionalTitle}>
                      <span>Study & daily life</span>
                      <span>Optional</span>
                    </div>
                    <div className={styles.fieldGrid}>
                      {(Object.keys(fields) as (keyof typeof fields)[]).map(
                        (key) => (
                          <label className={styles.field} key={key}>
                            {fields[key][0]}
                            <input
                              value={extras[key]}
                              onChange={(e) =>
                                setExtras({ ...extras, [key]: e.target.value })
                              }
                              maxLength={key === "department" ? 255 : 100}
                              placeholder={fields[key][1]}
                            />
                          </label>
                        ),
                      )}
                    </div>
                  </>
                )}
              </section>
              <aside className={styles.preview} aria-label="Your post summary">
                <span className={styles.previewIcon}>
                  <House size={24} />
                </span>
                <p className={styles.eyebrow}>YOUR POST AT A GLANCE</p>
                <h3>
                  {intent
                    ? postLabel(intent)
                    : "A good home starts with good company."}
                </h3>
                <dl>
                  <div>
                    <dt>Campus</dt>
                    <dd>FUTMINNA</dd>
                  </div>
                  <div>
                    <dt>Area</dt>
                    <dd>{getCampusAreaLabel(area) || "Choose your area"}</dd>
                  </div>
                  <div>
                    <dt>Yearly rent share</dt>
                    <dd>
                      {amountValid
                        ? "₦" + Number(amount).toLocaleString("en-NG")
                        : "Add your budget"}
                    </dd>
                  </div>
                </dl>
                <p>
                  Start with a hello. Talk about the details. Decide together.
                </p>
              </aside>
            </fieldset>
          </div>
          <footer className={styles.footer}>
            {(validation || error) && (
              <p className={styles.error} role="alert">
                {validation || error}
              </p>
            )}
            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => (step ? changeStep(step - 1) : close())}
              >
                {step ? <ArrowLeft size={16} /> : null}
                {step ? "Back" : "Cancel"}
              </Button>
              <span className={styles.footerNote}>
                {step === 2
                  ? "Ready when you are."
                  : "Your progress stays as you go back."}
              </span>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : step === 2 ? action : "Continue"}
                {!busy &&
                  (step === 2 ? <Check size={16} /> : <ArrowRight size={16} />)}
              </Button>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RoommateIntroduction({
  post,
  note,
  setNote,
  busy,
  error,
  close,
  send,
}: {
  post: RoommateListing;
  note: string;
  setNote: (value: string) => void;
  busy: boolean;
  error: string;
  close: () => void;
  send: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent
        className={`${styles.dialog} ${styles.introduction}`}
        showCloseButton={false}
      >
        <FormHeader
          title="A good match starts with hello."
          description="Send a thoughtful introduction. Keep it simple and personal."
          close={close}
          busy={busy}
        />
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy && note.trim()) send();
          }}
        >
          <div className={styles.scroll}>
            <div className={styles.content}>
              <div className={styles.person}>
                <span className={styles.avatar}>
                  {post.name.trim().slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{post.name}</strong>
                  <p>
                    {getCampusAreaLabel(post.area)} ·{" "}
                    {postLabel(post.housingIntent)}
                  </p>
                  <span>{rentShare(post)}</span>
                </div>
              </div>
              <label className={styles.field}>
                Your private introduction
                <textarea
                  required
                  rows={5}
                  maxLength={500}
                  value={note}
                  disabled={busy}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Hi! I’m studying… I’m hoping to move in around… Your post caught my eye because…"
                />
                <small className={styles.counter}>
                  A little about you, your plans, and what you’d like to know.
                  <span>{note.length}/500</span>
                </small>
              </label>
              <PrivacyNote>
                Your introduction goes privately to {post.name}. If they accept,
                you can chat privately in My requests.
              </PrivacyNote>
            </div>
          </div>
          <footer className={styles.footer}>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={close}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !note.trim()}>
                <MessageCircle size={17} />
                {busy ? "Sending…" : "Send introduction"}
              </Button>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
