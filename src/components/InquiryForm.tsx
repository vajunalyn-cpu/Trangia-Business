"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { regions } from "@/content/regions";
import s from "./InquiryForm.module.css";

// Set NEXT_PUBLIC_INQUIRY_ENDPOINT to a form service or CRM webhook that accepts a JSON POST
// (see README). Without it, the form validates but tells the visitor it isn't connected yet.
const ENDPOINT = process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT || "";

const INTERESTS = [
  "Manufacturing",
  "IT-BPM and digital services",
  "Logistics and warehousing",
  "Renewable energy",
  "Agribusiness and food processing",
  "Tourism and hospitality",
  "Healthcare",
  "Real estate and infrastructure",
  "Other",
];
const AMOUNTS = ["Not yet known", "Under US$1 million", "US$1–5 million", "US$5–20 million", "US$20–100 million", "Over US$100 million"];
const TOPICS = [
  ["peza", "PEZA registration"],
  ["boi", "BOI registration"],
  ["unsure", "Not sure which applies"],
  ["services", "Other services only"],
] as const;

type Values = {
  name: string;
  email: string;
  company: string;
  country: string;
  interest: string;
  topic: string;
  amount: string;
  region: string;
  message: string;
  consent: boolean;
  website: string; // honeypot
};
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: "", email: "", company: "", country: "", interest: "", topic: "", amount: "", region: "", message: "", consent: false, website: "" };

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your full name.";
  if (!v.email.trim()) e.email = "Enter your business email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter an email address like name@company.com.";
  if (!v.company.trim()) e.company = "Enter your company name.";
  if (!v.country.trim()) e.country = "Enter the country you're investing from.";
  if (!v.topic) e.topic = "Choose what your inquiry is about.";
  if (v.message.trim().length < 20) e.message = "Describe your project in at least 20 characters.";
  if (!v.consent) e.consent = "Tick the box so we can use your details to reply.";
  return e;
}

type Status = "idle" | "sending" | "sent" | "error" | "unconfigured";

export function InquiryForm() {
  const uid = useId();
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const startedAt = useRef(Date.now());
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Prefill from links elsewhere on the site (?topic=peza, ?region=VII)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const topic = q.get("topic");
    const region = q.get("region");
    setV((p) => ({
      ...p,
      topic: TOPICS.some(([k]) => k === topic) ? topic! : p.topic,
      region: regions.some((r) => r.code === region) ? region! : p.region,
    }));
  }, []);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    const next = { ...v, [k]: val };
    setV(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k: keyof Values) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(v));
  };
  const err = (k: keyof Values) => (touched[k] ? errors[k] : undefined);
  const describe = (k: keyof Values, hint?: boolean) =>
    [hint && `${uid}-${k}-hint`, err(k) && `${uid}-${k}-err`].filter(Boolean).join(" ") || undefined;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(v);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (Object.keys(found).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    // Spam checks: hidden field filled, or submitted implausibly fast. Silently "succeed".
    if (v.website || Date.now() - startedAt.current < 3000) {
      setStatus("sent");
      return;
    }
    if (!ENDPOINT) {
      setStatus("unconfigured");
      requestAnimationFrame(() => resultRef.current?.focus());
      return;
    }
    setStatus("sending");
    try {
      const { website: _hp, ...payload } = v;
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...payload, source: "trangia-website", page: window.location.pathname }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      setV(EMPTY);
      setTouched({});
    } catch {
      setStatus("error");
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  if (status === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} className={s.done} role="status">
        <h2 className="h3">Inquiry sent</h2>
        <p>Thank you. A consultant will reply to the email address you gave us.</p>
        <Link href="/" className="text-link">
          Back to the home page
        </Link>
      </div>
    );
  }

  const errorList = Object.entries(errors).filter(([k]) => touched[k as keyof Values]);

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="visually-hidden">
        Inquiry form
      </h2>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} className={s.summary} role="alert">
          <p className={s.summaryTitle}>Check {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}</p>
          <ul>
            {errorList.map(([k, msg]) => (
              <li key={k}>
                <a href={`#${uid}-${k}`}>{msg}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "unconfigured" && (
        <div ref={resultRef} tabIndex={-1} className={s.notice} role="status">
          <p className={s.summaryTitle}>Online inquiries aren&rsquo;t connected yet</p>
          <p>
            Your details are valid but weren&rsquo;t sent: this site&rsquo;s form endpoint hasn&rsquo;t been set up. Nothing has been
            stored.
          </p>
        </div>
      )}
      {status === "error" && (
        <div ref={resultRef} tabIndex={-1} className={s.summary} role="alert">
          <p className={s.summaryTitle}>Your inquiry wasn&rsquo;t sent</p>
          <p>The form service didn&rsquo;t respond. Check your connection and select Send inquiry again.</p>
        </div>
      )}

      <div className={s.row2}>
        <Field id={`${uid}-name`} label="Full name" error={err("name")} errId={`${uid}-name-err`}>
          <input id={`${uid}-name`} className={s.input} autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} aria-invalid={!!err("name")} aria-describedby={describe("name")} required />
        </Field>
        <Field id={`${uid}-email`} label="Business email" error={err("email")} errId={`${uid}-email-err`}>
          <input id={`${uid}-email`} type="email" className={s.input} autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} aria-invalid={!!err("email")} aria-describedby={describe("email")} required />
        </Field>
      </div>
      <div className={s.row2}>
        <Field id={`${uid}-company`} label="Company name" error={err("company")} errId={`${uid}-company-err`}>
          <input id={`${uid}-company`} className={s.input} autoComplete="organization" value={v.company} onChange={(e) => set("company", e.target.value)} onBlur={() => blur("company")} aria-invalid={!!err("company")} aria-describedby={describe("company")} required />
        </Field>
        <Field id={`${uid}-country`} label="Country" error={err("country")} errId={`${uid}-country-err`}>
          <input id={`${uid}-country`} className={s.input} autoComplete="country-name" value={v.country} onChange={(e) => set("country", e.target.value)} onBlur={() => blur("country")} aria-invalid={!!err("country")} aria-describedby={describe("country")} required />
        </Field>
      </div>

      <fieldset className={s.fieldset} aria-describedby={err("topic") ? `${uid}-topic-err` : undefined}>
        <legend className={s.label}>What is your inquiry about?</legend>
        <div className={s.chips} id={`${uid}-topic`}>
          {TOPICS.map(([k, label]) => (
            <label key={k} className={s.chip}>
              <input type="radio" name={`${uid}-topic`} value={k} checked={v.topic === k} onChange={() => { set("topic", k); setTouched((t) => ({ ...t, topic: true })); }} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {err("topic") && (
          <p id={`${uid}-topic-err`} className={s.error}>
            {err("topic")}
          </p>
        )}
      </fieldset>

      <div className={s.row3}>
        <Field id={`${uid}-interest`} label="Investment interest" optional>
          <select id={`${uid}-interest`} className={s.input} value={v.interest} onChange={(e) => set("interest", e.target.value)}>
            <option value="">Select a sector</option>
            {INTERESTS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field id={`${uid}-amount`} label="Estimated investment" optional>
          <select id={`${uid}-amount`} className={s.input} value={v.amount} onChange={(e) => set("amount", e.target.value)}>
            <option value="">Select a range</option>
            {AMOUNTS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field id={`${uid}-region`} label="Preferred region" optional>
          <select id={`${uid}-region`} className={s.input} value={v.region} onChange={(e) => set("region", e.target.value)}>
            <option value="">No preference yet</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id={`${uid}-message`} label="About your project" error={err("message")} errId={`${uid}-message-err`} hint="Activity, size, timeline, and anything you'd like us to check" hintId={`${uid}-message-hint`}>
        <textarea id={`${uid}-message`} rows={5} className={s.input} value={v.message} onChange={(e) => set("message", e.target.value)} onBlur={() => blur("message")} aria-invalid={!!err("message")} aria-describedby={describe("message", true)} required />
      </Field>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className={s.hp} aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <div className={s.consent}>
        <label className={s.check}>
          <input id={`${uid}-consent`} type="checkbox" checked={v.consent} onChange={(e) => { set("consent", e.target.checked); setTouched((t) => ({ ...t, consent: true })); }} aria-invalid={!!err("consent")} aria-describedby={err("consent") ? `${uid}-consent-err` : undefined} />
          <span>
            I agree that Trangia Business Consultancy may use these details to respond to my inquiry, as described in the{" "}
            <Link href="/privacy/" className="text-link">
              privacy notice
            </Link>
            .
          </span>
        </label>
        {err("consent") && (
          <p id={`${uid}-consent-err`} className={s.error}>
            {err("consent")}
          </p>
        )}
      </div>

      <button type="submit" className={`btn btn-gold ${s.submit}`} disabled={status === "sending"}>
        {status === "sending" ? "Sending inquiry…" : "Send inquiry"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  children,
  error,
  errId,
  optional,
  hint,
  hintId,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  errId?: string;
  optional?: boolean;
  hint?: string;
  hintId?: string;
}) {
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}
        {optional && <span className={s.optional}> (optional)</span>}
      </label>
      {children}
      {hint && (
        <p id={hintId} className={s.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className={s.error}>
          {error}
        </p>
      )}
    </div>
  );
}
