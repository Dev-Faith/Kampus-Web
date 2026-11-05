"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, CheckCheck, Clock3, Droplets, KeyRound, LockKeyhole, ShieldCheck, Zap } from "lucide-react";

const STEPS = [
  {
    label: "Book your room", hint: "A place to start",
    title: "That room you saved? Make it your next address.",
    body: "Choose your space and complete checkout. Once payment is confirmed, your booking shows your inspection deadline and a private code. Keep that code to yourself for now.",
    note: "Payment confirmed. Next stop: seeing the room for yourself.",
  },
  {
    label: "See it for yourself", hint: "The details matter",
    title: "Open the door. Check the details. Feel at home.",
    body: "Visit the room, test the water and electricity, and check that it matches the listing. You have 3 calendar days from your move-in date to inspect. Something wrong? Open a dispute before sharing your code.",
    note: "Need more time? Add a day for ₦1,000, up to four times. Seven calendar days maximum; unresolved inspections go to support review with payout paused.",
  },
  {
    label: "Keys. Code. New chapter.", hint: "Make it yours",
    title: "Keys in your hand. A new chapter ahead.",
    body: "Happy with the room and have your keys? Share your inspection code with the host. Their verification records your approval and queues the landlord payout, subject to settlement and balance checks.",
    note: "Your booking updates when the payment provider confirms the transfer.",
  },
];

function RoomDrawing({ welcome = false }: { welcome?: boolean }) {
  return (
    <svg className={`journey-room ${welcome ? "journey-room--welcome" : ""}`} viewBox="0 0 440 360" fill="none" aria-hidden="true">
      <ellipse className="journey-room__shadow" cx="220" cy="318" rx="170" ry="18" />
      <path className="journey-room__wall" d="M62 305V103L218 40L378 103V305H62Z" />
      <path className="journey-room__line" d="M218 40V245M62 305L218 245L378 305M62 103L218 165L378 103" />
      <path className="journey-room__window" d="M86 131L164 162V229L86 198V131Z" />
      <path className="journey-room__line" d="M125 146V214M86 165L164 195" />
      <path className="journey-room__bed" d="M89 254L169 221L238 249L159 283L89 254Z" />
      <path className="journey-room__furniture" d="M89 254V277L159 305L238 272V249L159 283L89 254Z" />
      <path className="journey-room__pillow" d="M104 249L137 235L160 245L127 258L104 249Z" />
      <path className="journey-room__doorframe" d="M270 169L333 145V284L270 260V169Z" />
      <path className="journey-room__door" d={welcome ? "M270 169L305 190V293L270 260V169Z" : "M275 175L328 155V276L275 256V175Z"} />
      <circle className="journey-room__handle" cx={welcome ? 297 : 316} cy={welcome ? 237 : 215} r="3" />
      <path className="journey-room__plant" d="M353 296V247M353 268C328 272 329 243 353 255M354 258C379 251 373 231 354 248" />
      <path className="journey-room__pot" d="M339 281H366L361 308H344L339 281Z" />
      {welcome && <path className="journey-room__sun" d="M328 57V43M350 65L361 54M359 86H374M306 65L295 54M296 86H281M318 105C299 88 312 67 329 70C346 73 347 94 336 105H318Z" />}
    </svg>
  );
}

function JourneyScene({ step }: { step: number }) {
  return (
    <div className={`journey-scene journey-scene--${step + 1}`} aria-label={`Illustration: ${STEPS[step].label}`}>
      <div className="journey-scene__grid" aria-hidden="true" />
      <div className="journey-scene__orbit" aria-hidden="true" />
      <span className="journey-scene__caption">Your move-in journey / illustrated</span>
      {step === 0 ? (
        <div className="journey-ticket">
          <div className="journey-ticket__top"><span className="journey-ticket__mark"><KeyRound /></span><span>Kampus<br /><small>Your next chapter starts here</small></span><CheckCheck className="journey-ticket__check" /></div>
          <div className="journey-ticket__room"><RoomDrawing /><span>One room.<br />So many possibilities.</span></div>
          <div className="journey-ticket__tear" />
          <div className="journey-ticket__row"><span>Booking payment</span><strong><Check /> Confirmed</strong></div>
          <div className="journey-ticket__row"><span>Next step</span><span>Inspect your room <ArrowRight /></span></div>
          <div className="journey-ticket__code"><LockKeyhole /><span>Inspection code <strong>•••• ••••</strong></span><small>For your eyes only</small></div>
        </div>
      ) : step === 1 ? (
        <>
          <div className="journey-scene__room"><RoomDrawing /></div>
          <div className="journey-checks">
            <span><Droplets /><span>Water running</span><Check /></span>
            <span><Zap /><span>Power checked</span><Check /></span>
            <span><KeyRound /><span>Keys received</span><Check /></span>
          </div>
          <div className="journey-day"><strong>03</strong><span>calendar days<br />to inspect</span></div>
        </>
      ) : (
        <>
          <div className="journey-scene__room"><RoomDrawing welcome /></div>
          <div className="journey-key"><KeyRound /><span>Yours to call home.</span></div>
          <div className="journey-approval"><span><ShieldCheck /></span><div><strong>Inspection approved</strong><small>Landlord payout queued</small></div><Check /></div>
        </>
      )}
      <span className="journey-scene__index" aria-hidden="true">0{step + 1}</span>
    </div>
  );
}

export function EscrowVisualizer() {
  const [step, setStep] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = STEPS[step];
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? (index + 1) % STEPS.length
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (index + STEPS.length - 1) % STEPS.length
      : event.key === "Home" ? 0 : event.key === "End" ? STEPS.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); setStep(next); tabs.current[next]?.focus();
  };

  return (
    <section id="escrow" className="rent-journey" aria-labelledby="rent-journey-title">
      <header className="rent-journey__header">
        <div><p className="landing-eyebrow"><span className="landing-eyebrow__dot" /> A little clarity. A big next step.</p><h2 id="rent-journey-title">From “this is the one”<br />to <em>“this is home.”</em></h2></div>
        <p>Your room is more than a listing. Here’s how you get from finding it to settling in—with payment and inspection updates along the way.</p>
      </header>
      <div className="rent-journey__chapters" role="tablist" aria-label="Your booking journey">
        {STEPS.map((item, index) => (
          <button key={item.label} ref={(element) => { tabs.current[index] = element; }} id={`journey-tab-${index}`} role="tab" aria-selected={step === index} aria-controls="journey-panel" tabIndex={step === index ? 0 : -1} onClick={() => setStep(index)} onKeyDown={(event) => onTabKeyDown(event, index)}>
            <span className="rent-journey__number">0{index + 1}</span><span><small>{item.hint}</small><strong>{item.label}</strong></span><ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>
      <div id="journey-panel" role="tabpanel" tabIndex={0} aria-labelledby={`journey-tab-${step}`} className="rent-journey__panel">
        <div key={`scene-${step}`} className="rent-journey__visual"><JourneyScene step={step} /></div>
        <div className="rent-journey__copy" key={`copy-${step}`}>
          <p className="rent-journey__chapter-label">Chapter 0{step + 1} / {active.hint}</p>
          <h3>{active.title}</h3>
          <p>{active.body}</p>
          <div className="rent-journey__note"><Clock3 aria-hidden="true" /><p>{active.note}</p></div>
          {step < 2 ? <button type="button" className="rent-journey__next" onClick={() => { setStep(step + 1); tabs.current[step + 1]?.focus(); }}>Next: {STEPS[step + 1].label.toLowerCase()} <ArrowRight aria-hidden="true" /></button>
            : <Link className="rent-journey__next" href="/explore?campus=FUTMINNA">Find your next room <ArrowRight aria-hidden="true" /></Link>}
        </div>
      </div>
      <footer className="rent-journey__footer"><ShieldCheck aria-hidden="true" /><p>Kampus manages your booking and landlord payout. Flutterwave processes payments and transfers; it does not provide escrow.</p><a href="#landing-faq">A few more answers <ArrowDown aria-hidden="true" /></a></footer>
    </section>
  );
}
