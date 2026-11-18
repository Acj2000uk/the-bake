import { useState, useEffect } from "react";
import { api } from "./api";
import { createRoot } from "react-dom/client";
import type { Recipe, Catalog } from "./types";
import { Editor } from "./Editor";
import { Ingredients } from "./Ingredients";
import { Production } from "./Production";
import "@fontsource/inter/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/pinyon-script/latin-400.css";
import "./style.css";
function App() {
  const [data, set] = useState<Catalog | null>(null),
    [password, pw] = useState(""),
    [msg, say] = useState(""),
    [tab, nav] = useState("Recipes"),
    [id, select] = useState(""),
    [q, search] = useState(""),
    [cat, category] = useState("All categories"),
    [mode, filter] = useState("Current"),
    [favs, favourite] = useState<string[]>(() => {
      try {
        return JSON.parse(localStorage.getItem("bake-stars") || "[]");
      } catch {
        return [];
      }
    }),
    [target, yieldTo] = useState("1"),
    [source, showSource] = useState(""),
    [editing, edit] = useState(false),
    [question, ask] = useState(""),
    [answer, reply] = useState(""),
    [aiId, chooseAi] = useState(""),
    [page, bookPage] = useState(0);
  const refresh = async () => {
    set(await api("catalog"));
  };
  useEffect(() => {
    refresh().catch(() => {});
  }, []);
  const r = data?.recipes.find((r) => r.id === id);
  function open(r: Recipe) {
    select(r.id);
    yieldTo(String(r.baseYield));
    edit(false);
    showSource("");
    window.scrollTo(0, 0);
  }
  function star(id: string) {
    const next = favs.includes(id)
      ? favs.filter((v) => v !== id)
      : [...favs, id];
    favourite(next);
    localStorage.setItem("bake-stars", JSON.stringify(next));
  }
  return (
    <>
      <header>
        <span className="brand">
          MCN <i>Bake</i>
        </span>
        <span>THE KITCHEN EDITION</span>
        {data && (
          <button
            onClick={async () => {
              await api("logout", {});
              location.reload();
            }}
          >
            Sign out
          </button>
        )}
      </header>
      {!data ? (
        <main className="login">
          <small>MCN HOSPITALITY</small>
          <h1>The Bake Bible</h1>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api("login", { password });
                await refresh();
                pw("");
                say("");
              } catch (e) {
                say(String(e));
              }
            }}
          >
            <label>
              Kitchen password
              <input
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(e) => pw(e.target.value)}
                required
              />
            </label>
            <button>Open kitchen</button>
          </form>
          <p role="alert">{msg}</p>
        </main>
      ) : (
        <>
          <nav>
            {["Recipes", "Production", "Allergens", "Assistant"].map((t) => (
              <button
                key={t}
                aria-current={tab === t ? "page" : undefined}
                onClick={() => {
                  nav(t);
                  select("");
                  say("");
                }}
              >
                {t}
              </button>
            ))}
          </nav>
          <main>
            {tab === "Recipes" && !r && (
              <>
                <small>MCN HOSPITALITY</small>
                <h1>The Bake Bible</h1>
                <div className="row">
                  <label>
                    Search recipes
                    <input
                      type="search"
                      placeholder="Recipe or ingredient"
                      value={q}
                      onChange={(e) => search(e.target.value)}
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={cat}
                      onChange={(e) => category(e.target.value)}
                    >
                      {[
                        "All categories",
                        ...new Set(data.recipes.map((r) => r.category)),
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Collection
                    <select
                      value={mode}
                      onChange={(e) => filter(e.target.value)}
                    >
                      {["Current", "Favourites", "Archive only"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid">
                  {data.recipes
                    .filter(
                      (r) =>
                        (mode === "Archive only"
                          ? !r.active
                          : mode === "Favourites"
                            ? favs.includes(r.id)
                            : r.active) &&
                        (cat === "All categories" || r.category === cat) &&
                        (
                          r.title +
                          " " +
                          r.ingredients.map((i) => i.name).join(" ")
                        )
                          .toLowerCase()
                          .includes(q.toLowerCase()),
                    )
                    .map((r) => (
                      <article key={r.id}>
                        <small>{r.category}</small>
                        <h2>
                          <button className="title" onClick={() => open(r)}>
                            {r.title}
                          </button>
                        </h2>
                        <footer>
                          <span>
                            {r.revision
                              ? "Approved · " + r.revision
                              : r.amendment
                                ? "Amended · in review"
                                : r.active
                                  ? "In review"
                                  : "Archive"}
                          </span>
                          <button
                            aria-label={"Favourite " + r.title}
                            aria-pressed={favs.includes(r.id)}
                            onClick={() => star(r.id)}
                          >
                            {favs.includes(r.id) ? "★" : "☆"}
                          </button>
                        </footer>
                      </article>
                    ))}
                </div>
                <p className="empty">No matching recipes.</p>
              </>
            )}
            {tab === "Recipes" && r && (
              <>
                <button onClick={() => select("")}>Back to recipes</button>
                <p>
                  <small>
                    {r.category} · Archive page {r.page}
                    {r.amendment ? " · Amendment page " + r.amendment : ""}
                  </small>
                </p>
                <h1>{r.title}</h1>
                <p>
                  {r.revision
                    ? "Approved revision " + r.revision
                    : r.active
                      ? "Review copy · awaiting recipe approval"
                      : "Historical recipe · archived"}
                </p>
                <div className="controls">
                  <label>
                    Target {r.unit}
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={target}
                      onChange={(e) => yieldTo(e.target.value)}
                    />
                  </label>
                  <button
                    disabled={!(Number(target) > 0)}
                    onClick={async () => {
                      const { recipePdf } = await import("./pdf.js");
                      recipePdf(r, Number(target)).save(
                        r.title.replace(/[^a-z0-9 -]/gi, "").trim() + ".pdf",
                      );
                    }}
                  >
                    Download recipe PDF
                  </button>
                  {data.role === "admin" && (
                    <button onClick={() => edit(!editing)}>
                      {editing ? "Close editor" : "Edit recipe"}
                    </button>
                  )}
                </div>
                {editing && <Editor r={r} onSaved={refresh} />}
                <h2>Ingredients</h2>
                {Number(target) > 0 ? (
                  <>
                    <p>
                      Target {target} {r.unit} · Base recipe {r.baseYield}{" "}
                      {r.unit}
                    </p>
                    <Ingredients recipe={r} target={Number(target)} />
                  </>
                ) : (
                  <p>Enter a positive target yield.</p>
                )}
                {r.note && (
                  <>
                    <h2>Production notes</h2>
                    <p className="lines">{r.note}</p>
                  </>
                )}
                <h2>Method</h2>
                {Number(target) !== r.baseYield && (
                  <p>
                    Method quantities below refer to the base batch. Check
                    additions against the scaled ingredient list.
                  </p>
                )}
                <div className="lines">{r.method}</div>
                <h2>Allergen reference</h2>
                <div className="lines">
                  {r.allergen ||
                    "Archived product. No current product declaration."}
                </div>
                <button
                  onClick={async () =>
                    showSource(source ? "" : await api("source?id=" + r.id))
                  }
                >
                  {source ? "Hide" : "View"} archive original
                </button>
                {source && <pre>{source}</pre>}
              </>
            )}
            {tab === "Production" && <Production recipes={data.recipes} />}
            {tab === "Allergens" && (
              <>
                <small>MCN HOSPITALITY · STAFF REFERENCE v0.5</small>
                <h1>Allergen booklet</h1>
                <label>
                  Booklet page
                  <select
                    value={page}
                    onChange={(e) => bookPage(Number(e.target.value))}
                  >
                    {data.booklet.map((p, i) => (
                      <option value={i} key={i}>
                        {i + 1}. {p.trim().split("\n")[0]}
                      </option>
                    ))}
                  </select>
                </label>
                <pre>{data.booklet[page]}</pre>
              </>
            )}
            {tab === "Assistant" && (
              <>
                <h1>Bakery assistant</h1>
                <p>
                  Ask about an approved recipe. Answers quote its recorded
                  ingredients, method or notes.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    reply("Looking up the approved revision…");
                    try {
                      const result = await api("ask", { id: aiId, question });
                      reply(result.answer + "\n\n" + result.citation);
                    } catch (e) {
                      reply(String(e));
                    }
                  }}
                >
                  <label>
                    Approved recipe
                    <select
                      value={aiId}
                      onChange={(e) => {
                        chooseAi(e.target.value);
                        reply("");
                      }}
                    >
                      <option value="">Choose a recipe</option>
                      {data.recipes
                        .filter((r) => r.revision)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Question
                    <textarea
                      required
                      value={question}
                      onChange={(e) => ask(e.target.value)}
                    />
                  </label>
                  <button disabled={!aiId}>Ask assistant</button>
                </form>
                {!data.recipes.some((r) => r.revision) && (
                  <p>Approved recipes will appear here after manager review.</p>
                )}
                <p className="lines" role="status">
                  {answer}
                </p>
              </>
            )}
          </main>
        </>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
