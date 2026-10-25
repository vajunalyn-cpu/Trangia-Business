import { sources, type Source, type SourceId } from "@/content/sources";

/** Inline source reference: publisher, linked, with the date it was checked. */
export function Cite({ ids, prefix = "Source" }: { ids: readonly SourceId[]; prefix?: string }) {
  const list: Source[] = ids.map((id) => sources[id]);
  return (
    <span className="cite">
      {prefix}
      {list.length > 1 ? "s" : ""}:{" "}
      {list.map((src, i) => (
        <span key={src.id}>
          {i > 0 && "; "}
          <a href={src.url} target="_blank" rel="noopener noreferrer" title={src.title}>
            {src.publisher}
          </a>
          {src.secondary && <span title="Secondary summary; confirm against the official text"> (summary)</span>}
        </span>
      ))}
      , checked {list[0].checked}.
    </span>
  );
}
