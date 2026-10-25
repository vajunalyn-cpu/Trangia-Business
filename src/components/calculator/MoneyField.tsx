"use client";

import { useEffect, useState } from "react";
import s from "./PezaCalculator.module.css";

type Props = { id: string; label: string; hint?: string; value: number; onChange: (v: number) => void; error?: string };

const format = (n: number) => (Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "");

/** Text input that shows thousands separators and reports NaN for unparseable input. */
export function MoneyField({ id, label, hint, value, onChange, error }: Props) {
  const [text, setText] = useState(format(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(format(value));
  }, [value, focused]);

  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      <div className={s.prefixWrap}>
        <span className={s.prefix} aria-hidden="true">
          ₱
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={s.input}
          value={text}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setText(format(value));
          }}
          onChange={(e) => {
            setText(e.target.value);
            const cleaned = e.target.value.replace(/[,\s₱]/g, "");
            onChange(cleaned === "" ? 0 : Number(cleaned));
          }}
          aria-invalid={!!error}
          aria-describedby={[hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined}
        />
      </div>
      {hint && (
        <p id={`${id}-hint`} className={s.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className={s.error}>
          {error}
        </p>
      )}
    </div>
  );
}
