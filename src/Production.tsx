import { useState, useEffect } from "react";
import { api } from "./api";
import type { Recipe, Sheet } from "./types";
import { ClipboardList } from "lucide-react";
import { Ingredients } from "./Ingredients";
export function Production({ recipes }: { recipes: Recipe[] }) {
  const [date, day] = useState(new Date().toLocaleDateString("en-CA")),
    [venue, site] = useState("MCN Bake"),
    [sheet, set] = useState<Sheet | null>(null),
    [id, select] = useState(""),
    [target, yieldTo] = useState("1"),
    [name, sign] = useState(""),
    [msg, say] = useState("");
  useEffect(() => {
    let current = true;
    set(null);
    say("");
    api("sheet?" + new URLSearchParams({ date, venue }))
      .then((s) => current && set(s))
      .catch((e) => current && say(e.message));
    return () => {
      current = false;
    };
  }, [date, venue]);
  async function update(action: string, line?: string) {
    try {
      set(
        await api("sheet", {
          date,
          venue,
          version: sheet?.version,
          action,
          id,
          target: Number(target),
          line,
          name,
        }),
      );
      say("Saved.");
    } catch (e) {
      say(String(e));
      set(await api("sheet?" + new URLSearchParams({ date, venue })));
    }
  }
  return (
    <>
      <h1>Daily production</h1>
      <div className="row">
        <label>
          Production date
          <input
            type="date"
            value={date}
            onChange={(e) => day(e.target.value)}
          />
        </label>
        <label>
          Venue
          <select value={venue} onChange={(e) => site(e.target.value)}>
            {[
              "MCN Bake",
              "Shotton Grange",
              "The Parlour",
              "The Gibraltar Rock",
              "Marshall Meadows",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="printonly">
        {date.split("-").reverse().join("/")} · {venue}
      </p>
      <div className="controls">
        <label>
          Approved recipe
          <select
            id="production-recipe"
            value={id}
            onChange={(e) => {
              select(e.target.value);
              yieldTo(
                String(
                  recipes.find((r) => r.id === e.target.value)?.baseYield || 1,
                ),
              );
            }}
          >
            <option value="">Choose a recipe</option>
            {recipes
              .filter((r) => r.revision)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          Target {recipes.find((r) => r.id === id)?.unit}
          <input
            type="number"
            min="0"
            step="any"
            value={target}
            onChange={(e) => yieldTo(e.target.value)}
          />
        </label>
        <button
          disabled={!sheet || !id || Number(target) <= 0}
          onClick={() => update("add")}
        >
          Add to sheet
        </button>
        <label>
          Completed by
          <input value={name} onChange={(e) => sign(e.target.value)} />
        </label>
      </div>
      {sheet?.lines.map((l) => (
        <article key={l.id}>
          <h2>{l.recipe.title}</h2>
          <p>
            {l.target} {l.recipe.unit} · Revision {l.recipe.revision}
          </p>
          <Ingredients recipe={l.recipe} target={l.target} />
          <p>
            {l.signoff ? (
              "Completed by " + l.signoff
            ) : (
              <button
                disabled={!name.trim()}
                onClick={() => update("finish", l.id)}
              >
                Sign off
              </button>
            )}
          </p>
        </article>
      ))}
      {!sheet?.lines.length && (
        <div className="blank">
          <ClipboardList />
          <h2>Your production sheet is empty</h2>
          <p>
            {recipes.some((r) => r.revision)
              ? "Select an approved recipe and enter the yield for this shift."
              : "Approve a recipe in the recipe index to start planning this shift."}
          </p>
          {recipes.some((r) => r.revision) && (
            <button
              onClick={() =>
                document.getElementById("production-recipe")?.focus()
              }
            >
              Choose a recipe
            </button>
          )}
        </div>
      )}
      <button onClick={() => window.print()}>Print daily sheet</button>
      <p role="status">{msg}</p>
    </>
  );
}
