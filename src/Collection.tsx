/// <reference types="vite/client" />
import { useState } from "react";
import { Search, Bookmark, Wheat, X } from "lucide-react";
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
const images = import.meta.glob<string>("./plates/*.webp", { eager:true, import:"default", query:"?url" });
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
    [cat, category] = useState("The full Bible"),
    [mode, filter] = useState("All");
  const chapters = [
    "The full Bible",
    "Sourdough",
    "Pastries",
    "Cakes",
    "Cookies",
    "Breads",
  ];

  const pool = recipes.filter(
    (r) =>
      mode === "All" || (mode === "Current" ? r.active : favs.includes(r.id)),
  );
  const matches = pool.filter(
    (r) =>
      (cat === chapters[0] || cat === r.category) &&
      (r.title + " " + r.ingredients.map((i) => i.name).join(" "))
        .toLowerCase()
        .includes(q.toLowerCase().trim()),
  );
  return (
    <div className="archiveShell">
      <aside className="chapterRail">
        <small>Chapters index</small>
        <div className="chapterList">
          {chapters.map((name, i) => (
            <button
              key={name}
              aria-pressed={cat === name}
              onClick={() => category(name)}
            >
              {name}
              <span>
                (
                {i === 0
                  ? pool.length
                  : pool.filter((r) => r.category === name).length}
                )
              </span>
            </button>
          ))}
        </div>
        <small>Library tools</small>
        <div className="shelfModes">
          {["All", "Current", "Favourites"].map((name) => (
            <button
              key={name}
              aria-pressed={mode === name}
              onClick={() => filter(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </aside>
      <div className="archiveBody">
        <small className="kicker">Archives</small>
        <div className="archiveTitle">
          <h1>
            <i>The Bake</i> Bible
          </h1>
          <div>
            <small>Available vol.</small>
            <em>{matches.length}</em>
          </div>
        </div>
        <label className="archiveSearch">
          <Search />
          <input
            aria-label="Search recipes"
            type="search"
            placeholder="Search recipes or ingredients"
            value={q}
            onChange={(e) => search(e.target.value)}
          />
        </label>
        <div className="plates">
          {matches.map((r) => {
            const photo = images["./plates/"+r.page+".webp"];
            return (
              <article className="plate" key={r.id}>
                <button className="plateLink" onClick={() => open(r)}>
                  <span className="plateImage">
                    {photo ? (
                      <img
                        loading="lazy"
                        src={photo}
                        alt=""
                      />
                    ) : (
                      <span className="typePlate">
                        <small>MCN Bake</small>
                        <i>{r.title}</i>
                        <small>{r.category}</small>
                      </span>
                    )}
                    <span className="folio">Archive p. {r.page}</span>
                  </span>
                  <span className="plateCaption">
                    <small>
                      {r.category} ·{" "}
                      {r.revision
                        ? "Approved"
                        : r.active
                          ? "In review"
                          : "Archived"}
                    </small>
                    <strong>{r.title}</strong>
                  </span>
                </button>
                <button
                  className="plateMark"
                  aria-label={"Favourite " + r.title}
                  aria-pressed={favs.includes(r.id)}
                  onClick={() => star(r.id)}
                >
                  <Bookmark
                    fill={favs.includes(r.id) ? "currentColor" : "none"}
                  />
                </button>
              </article>
            );
          })}
        </div>
        {!matches.length && (
          <div className="blank">
            <Wheat />
            <h2>No matching recipes</h2>
            <button
              onClick={() => {
                search("");
                category(chapters[0]);
                filter("All");
              }}
            >
              <X />
              Browse the full Bible
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
