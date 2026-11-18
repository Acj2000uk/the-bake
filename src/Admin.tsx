import { useState, useEffect } from "react";
import { Camera, Upload, Undo2 } from "lucide-react";
import { api } from "./api";
import type { Catalog, Recipe } from "./types";
export function Admin({
  data,
  open,
  refresh,
}: {
  data: Catalog;
  open: (r: Recipe) => void;
  refresh: () => Promise<void>;
}) {
  const [query, search] = useState(""),
    [error, say] = useState("");
  return (
    <>
      <small>Curator access</small>
      <h1>Recipe administration</h1>
      <label>
        Find a recipe
        <input
          type="search"
          value={query}
          onChange={(e) => search(e.target.value)}
        />
      </label>
      <div className="adminRows">
        {data.recipes
          .filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
          .map((r) => (
            <button key={r.id} onClick={() => open(r)}>
              <strong>{r.title}</strong>
              <small>
                {r.revision
                  ? "Revision " + r.revision
                  : r.active
                    ? "Awaiting approval"
                    : "Archived"}
              </small>
            </button>
          ))}
      </div>
      <h2>Deleted recipes</h2>
      {!data.deleted?.length && (
        <p>Deleted recipes will appear here for recovery.</p>
      )}
      {data.deleted?.map((r) => (
        <p key={r.id}>
          {r.title}{" "}
          <button
            onClick={async () => {
              try {
                await api("manage", { action: "restore", id: r.id });
                await refresh();
              } catch (e) {
                say(String(e));
              }
            }}
          >
            <Undo2 />
            Restore
          </button>
        </p>
      ))}
      <p role="status">{error}</p>
    </>
  );
}
export function PhotoTools({
  r,
  refresh,
}: {
  r: Recipe;
  refresh: () => Promise<void>;
}) {
  const [message, say] = useState(""),
    [busy, wait] = useState(false);
  async function render(file?: File) {
    wait(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 750;
      const ctx = canvas.getContext("2d")!;
      if (file) {
        if (!file.type.startsWith("image/"))
          throw Error("Choose an image file.");
        const bmp = await createImageBitmap(file);
        const scale = Math.max(600 / bmp.width, 750 / bmp.height);
        ctx.drawImage(
          bmp,
          (600 - bmp.width * scale) / 2,
          (750 - bmp.height * scale) / 2,
          bmp.width * scale,
          bmp.height * scale,
        );
        bmp.close();
      } else {
        ctx.fillStyle = "#eae0cb";
        ctx.fillRect(0, 0, 600, 750);
        ctx.strokeStyle = "#a78856";
        ctx.strokeRect(26, 26, 548, 698);
        ctx.textAlign = "center";
        ctx.fillStyle = "#4c392a";
        ctx.font = "28px Georgia";
        ctx.fillText("MCN BAKE", 300, 115);
        ctx.font = "italic 125px Georgia";
        ctx.fillText(
          r.title
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join(""),
          300,
          390,
        );
        ctx.font = "26px Georgia";
        ctx.fillText(r.category.toUpperCase(), 300, 500);
        ctx.fillText("Archive " + r.page, 300, 625);
      }
      const photo = canvas.toDataURL("image/jpeg", 0.62);
      if (photo.length > 230000) throw Error("Choose a smaller image.");
      await api("manage", { action: "photo", id: r.id, photo });
      await refresh();
      say(file ? "Photo saved." : "Archive cover generated.");
    } catch (e) {
      say(String(e));
    } finally {
      wait(false);
    }
  }
  return (
    <aside className="photoTools">
      <button
        disabled={busy}
        title="Generate a typeset archive cover"
        onClick={() => render()}
      >
        <Camera />
        Auto visual
      </button>
      <label>
        <Upload />
        Upload photo
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) render(f);
            e.target.value = "";
          }}
        />
      </label>
      {message && <span role="status">{message}</span>}
    </aside>
  );
}

export function RecipeOrigin({
  id,
  category,
}: {
  id: string;
  category: string;
}) {
  const [info, set] = useState<{ origin: string; level: string } | null>(null);
  useEffect(() => {
    let active = true;
    set(null);
    api("source?id=" + id)
      .then((source: string) => {
        if (active)
          set({
            origin: source.match(/CUISINE:\s*([^\n]+)/)?.[1]?.trim() || "",
            level: source.match(/DIFFICULTY:\s*([^\n]+)/)?.[1]?.trim() || "",
          });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [id]);
  return (
    <div className="recipeOrigin">
      <div>
        <small>Technical origin</small>
        <p>
          {[info?.origin.toLowerCase(), category].filter(Boolean).join(" · ")}
        </p>
      </div>
      {info?.level && (
        <div>
          <small>Complexity</small>
          <p>{info.level.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}
