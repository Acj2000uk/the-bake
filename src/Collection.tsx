import { useState } from "react";
import {
  Search,
  Bookmark,
  ChevronRight,
  BookOpen,
  Archive,
  Wheat,
  X,
  SlidersHorizontal,
} from "lucide-react";
import type { Recipe } from "./types";

// A wheat engraving for the cover and masthead.
export function Engraving() {
  return (
    <svg
      viewBox="0 0 300 220"
      aria-hidden="true"
      className="engraving"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
    >
      {[
        [120, 190, -22, 1],
        [148, 200, 8, 1.15],
        [157, 196, 34, 0.9],
      ].map(([x, y, a, s]) => (
        <g key={a} transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
          <path d="M0 20 Q-5 -66 0 -150 M-2 -34 Q-30 -45 -39 -78 Q-17 -62 -2 -40" />
          {Array.from({ length: 7 }, (_, i) => {
            let h = -56 - i * 12;
            return (
              <g key={i} transform={`translate(0 ${h})`}>
                <path d="M0 0 Q-18 -5 -15 -21 Q-1 -16 0 0 M0 -5 Q17 -11 14 -27 Q1 -20 0 -5 M-15 -21 l-8 -19 M14 -27 l6 -19 M-13 -19 l10 15 M12 -24 l-10 15" />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
export function Collection({
  recipes,
  favs,
  star,
  open,
}: {
  recipes: Recipe[];
  favs: string[];
  star: (id: string) => void;
  open: (r: Recipe) => void;
}) {
  const [q, search] = useState(""),
    [cat, category] = useState("All categories"),
    [mode, filter] = useState("Current");
  const modes = [
    { name: "Current", icon: BookOpen },
    { name: "Favourites", icon: Bookmark },
    { name: "Archive", icon: Archive },
  ];
  const matches = recipes.filter(
    (r) =>
      (mode === "Archive"
        ? !r.active
        : mode === "Favourites"
          ? favs.includes(r.id)
          : r.active) &&
      (cat === "All categories" || r.category === cat) &&
      (r.title + " " + r.ingredients.map((i) => i.name).join(" "))
        .toLowerCase()
        .includes(q.toLowerCase().trim()),
  );
  return (
    <>
      <div className="cover">
        <div>
          <small>MCN Hospitality · Kitchen collection</small>
          <h1>The Bake Bible</h1>
          <p>
            {recipes.filter((r) => r.active).length} current recipes{" "}
            <span>/</span> {new Set(recipes.map((r) => r.category)).size}{" "}
            categories
          </p>
        </div>
        <Engraving />
      </div>
      <div className="segments" aria-label="Collection">
        {modes.map(({ name, icon: Icon }) => (
          <button
            key={name}
            aria-pressed={name === mode}
            onClick={() => filter(name)}
          >
            <Icon />
            {name}
          </button>
        ))}
      </div>
      <div className="tools">
        <label className="search">
          <Search />
          <input
            type="search"
            aria-label="Search recipes"
            placeholder="Search recipes or ingredients"
            value={q}
            onChange={(e) => search(e.target.value)}
          />
        </label>
        <label className="category">
          <SlidersHorizontal />
          <select
            aria-label="Category"
            value={cat}
            onChange={(e) => category(e.target.value)}
          >
            {["All categories", ...new Set(recipes.map((r) => r.category))].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
        </label>
      </div>
      <div className="ledger">
        <div className="ledgerhead">
          <small>Recipe index</small>
          <small>
            {matches.length} {matches.length === 1 ? "recipe" : "recipes"}
          </small>
        </div>
        {matches.map((r) => (
          <div className="entry" key={r.id}>
            <button className="entrylink" onClick={() => open(r)}>
              <span className="record">
                <small>{r.category}</small>
                <strong>{r.title}</strong>
              </span>
              <span className="status">
                {r.revision
                  ? "Approved"
                  : !r.active
                    ? "Archived"
                    : r.amendment
                      ? "Amended"
                      : "In review"}
              </span>
              <ChevronRight />
            </button>
            <button
              className="mark"
              aria-label={"Favourite " + r.title}
              aria-pressed={favs.includes(r.id)}
              onClick={() => star(r.id)}
            >
              <Bookmark fill={favs.includes(r.id) ? "currentColor" : "none"} />
            </button>
          </div>
        ))}
      </div>
      {!matches.length && (
        <div className="blank">
          <Wheat />
          <h2>
            {mode === "Favourites"
              ? "No saved recipes here"
              : "No recipes found"}
          </h2>
          <p>
            {mode === "Favourites"
              ? "Use the bookmark beside a recipe to save it on this device."
              : "Try another ingredient or browse the full collection."}
          </p>
          <button
            onClick={() => {
              search("");
              category("All categories");
              filter("Current");
            }}
          >
            <X />
            Clear filters and browse
          </button>
        </div>
      )}
    </>
  );
}
