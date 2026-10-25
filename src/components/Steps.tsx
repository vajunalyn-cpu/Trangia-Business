import s from "./Steps.module.css";

/** A genuinely ordered process. */
export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className={s.steps}>
      {steps.map((st, i) => (
        <li key={st.title} className={s.step}>
          <span className={s.n} aria-hidden="true">
            {i + 1}
          </span>
          <h3 className={s.title}>{st.title}</h3>
          <p className={s.body}>{st.body}</p>
        </li>
      ))}
    </ol>
  );
}
