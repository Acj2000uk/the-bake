import { useState, useEffect } from "react";
import { api } from "./api";
import type { Recipe } from "./types";
export function Editor({
  r,
  onSaved,
}: {
  r: Recipe;
  onSaved: () => Promise<void>;
}) {
  const [draft, set] = useState<{ recipe: Recipe; version: number } | null>(
      null,
    ),
    [reviewer, name] = useState(""),
    [verified, verify] = useState(false),
    [msg, say] = useState("");
  useEffect(() => {
    api("draft?id=" + r.id)
      .then(set)
      .catch((e) => say(e.message));
  }, [r.id]);
  if (!draft) return <p>{msg || "Loading draft…"}</p>;
  const rec = draft.recipe;
  function edit(k: keyof Recipe, v: unknown) {
    set(draft && { ...draft, recipe: { ...rec, [k]: v } });
  }
  async function save(approve: boolean) {
    try {
      set(
        await api("draft", { ...draft, id: r.id, reviewer, verified, approve }),
      );
      await onSaved();
      say(approve ? "Revision approved." : "Draft saved.");
      verify(false);
    } catch (e) {
      say(String(e));
    }
  }
  return (
    <section>
      <h2>Edit and approve</h2>
      {(
        [
          "title",
          "category",
          "unit",
          "baseYield",
          "note",
          "method",
          "allergen",
        ] as const
      ).map((k) => (
        <label key={k}>
          {
            {
              title: "Recipe name",
              category: "Category",
              unit: "Yield unit",
              baseYield: "Base yield",
              note: "Production notes",
              method: "Method",
              allergen: "Allergen reference",
            }[k]
          }
          {["note", "method", "allergen"].includes(k) ? (
            <textarea
              value={rec[k]}
              onChange={(e) => edit(k, e.target.value)}
            />
          ) : (
            <input
              value={rec[k]}
              type={k === "baseYield" ? "number" : "text"}
              onChange={(e) =>
                edit(
                  k,
                  k === "baseYield" ? Number(e.target.value) : e.target.value,
                )
              }
            />
          )}
        </label>
      ))}
      <h3>Ingredients</h3>
      {rec.ingredients.map((i, n) => (
        <div className="row" key={n}>
          {(["name", "amount"] as const).map((k) => (
            <input
              aria-label={"Ingredient " + (n + 1) + " " + k}
              key={k}
              value={i[k]}
              onChange={(e) =>
                edit(
                  "ingredients",
                  rec.ingredients.map((a, b) =>
                    b === n ? { ...a, [k]: e.target.value } : a,
                  ),
                )
              }
            />
          ))}
          <button
            onClick={() =>
              edit(
                "ingredients",
                rec.ingredients.filter((_, b) => n !== b),
              )
            }
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          edit("ingredients", [...rec.ingredients, { name: "", amount: "" }])
        }
      >
        Add ingredient
      </button>{" "}
      <button onClick={() => save(false)}>Save draft</button>
      <label>
        Reviewer name
        <input value={reviewer} onChange={(e) => name(e.target.value)} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => verify(e.target.checked)}
        />{" "}
        I checked the quantities, method and current allergen evidence.
      </label>
      <button
        disabled={!verified || !reviewer.trim() || !r.active}
        onClick={() => save(true)}
      >
        Approve revision
      </button>
      <p role="status">{msg}</p>
    </section>
  );
}
