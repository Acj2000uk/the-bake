import { useState, useEffect } from "react";
import { api } from "./api";
import { createRoot } from "react-dom/client";
import type { Recipe, Catalog } from "./types";
import { Editor } from "./Editor";
import { Ingredients } from "./Ingredients";
import { Production } from "./Production";
import "@fontsource/inter/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import { Collection, Engraving } from "./Collection";
import {
  Wheat,
  LogOut,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  ArrowLeft,
  Download,
  KeyRound,
  ChevronRight,
} from "lucide-react";
import "./style.css";
function App() {
  const [data, set] = useState<Catalog | null>(null),
    [password, pw] = useState(""),
    [msg, say] = useState(""),
    [tab, nav] = useState("Recipes"),
    [id, select] = useState(""),
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
      <header className="topbar">
        <div className="identity">
          <Wheat />
          <span>MCN Bake</span>
        </div>
        {data && (
          <nav aria-label="Kitchen navigation">
            {(data.role === "review"
              ? ["Recipes", "Allergens"]
              : ["Recipes", "Production", "Allergens", "Assistant"]
            ).map((t) => {
              const Icon =
                {
                  Recipes: BookOpen,
                  Production: ClipboardList,
                  Allergens: ShieldCheck,
                  Assistant: MessageSquare,
                }[t] || BookOpen;
              return (
                <button
                  key={t}
                  aria-current={tab === t ? "page" : undefined}
                  onClick={() => {
                    nav(t);
                    select("");
                    say("");
                  }}
                >
                  <Icon />
                  {t}
                </button>
              );
            })}
          </nav>
        )}
        {data && (
          <button
            className="exit"
            aria-label="Sign out"
            title="Sign out"
            onClick={async () => {
              await api("logout", {});
              location.reload();
            }}
          >
            <LogOut />
          </button>
        )}
      </header>
      {!data ? (
        <main className="login">
          <div className="cover book">
            <div>
              <small>MCN Hospitality</small>
              <h1>The Bake Bible</h1>
              <p>Kitchen edition</p>
            </div>
            <Engraving />
          </div>
          <div className="signin">
            <small>Kitchen access</small>
            <h2>Open your recipe book</h2>
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
                Password
                <input
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(e) => pw(e.target.value)}
                  required
                />
              </label>
              <button className="primary">
                <KeyRound />
                Open kitchen
                <ChevronRight />
              </button>
            </form>
            <p role="alert">{msg}</p>
          </div>
        </main>
      ) : (
        <>
          <main>
            <div hidden={tab !== "Recipes" || Boolean(r)}>
              <Collection
                recipes={data.recipes}
                favs={favs}
                star={star}
                open={open}
              />
            </div>
            {tab === "Recipes" && r && (
              <>
                <button className="back" onClick={() => select("")}>
                  <ArrowLeft />
                  Recipe index
                </button>
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
                    Target yield
                    <span className="unitinput">
                      <input
                        aria-label={"Target " + r.unit}
                        type="number"
                        min="0"
                        step="any"
                        value={target}
                        onChange={(e) => yieldTo(e.target.value)}
                      />
                      <span>{r.unit}</span>
                    </span>
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
                    <Download />
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
                <div className="booklet">
                  <small>
                    Staff reference · Page {page + 1} of {data.booklet.length}
                  </small>
                  <pre>{data.booklet[page]}</pre>
                </div>
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
