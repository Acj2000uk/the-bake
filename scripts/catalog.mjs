import { readFileSync } from "node:fs";
const pages = (name) =>
  JSON.parse(
    readFileSync(new URL("../data/" + name + ".json", import.meta.url)),
  );
export const booklet = pages("allergens");
const original = pages("archive"),
  amended = pages("amendments").slice(1);
const amendments = new Map(
  amended.map((p, i) => [
    Number(p.match(/Original Bake Bible page (\d+)/)[1]),
    { text: p, page: i + 2 },
  ]),
);
const registerPages = [
  5, 8, 17, 46, 32, 33, 47, 37, 6, 24, 24, 24, 10, 11, 12, 13, 14, 15, 16, 18,
  19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 31, 35, 39, 41, 42, 43, 48,
];
const entries = booklet.slice(5, 9).flatMap((p) =>
  p
    .replace(/MCN HOSPITALITY \| STAFF REFERENCE[^]*$/, "")
    .split(/\n\s*\n/)
    .filter((x) => x.includes("\nContains:"))
    .map((x) => x.trim()),
);
if (entries.length !== 37 || amendments.size !== 32)
  throw Error("Source reconciliation failed");
function rows(text) {
  const result = [];
  for (const line of text
    .trimEnd()
    .split("\n")
    .filter((l) => l.trim())) {
    const parts = line.trim().split(/\s{2,}/);
    if (parts.length > 1)
      result.push({ name: parts.shift(), amount: parts.join(" ") });
    else if (result.length && /^\s{15,}/.test(line))
      result.at(-1).amount += " " + line.trim();
    else if (result.length) result.at(-1).name += " " + line.trim();
    else result.push({ name: line.trim(), amount: "" });
  }
  return result;
}
const yields = new Map([
  [5, [20, "sticks"]],
  [6, [3, "trays"]],
  [12, [40, "portions"]],
  [13, [40, "portions"]],
  [14, [72, "portions"]],
  [17, [60, "buns"]],
  [33, [80, "buns"]],
  [37, [50, "rolls"]],
  [47, [60, "baps"]],
]);
export const recipes = original.flatMap((p, i) => {
  const head = p.trim().match(/^CHAPTER: (\w+)\s+ARCHIVE REF: (\S+)/);
  if (!head) return [];
  const page = i + 1,
    amendment = amendments.get(page);
  const source = amendment?.text || p;
  const [before, method] = source.split(
    /METHOD \(FROM ARCHIVE\)|METHOD OF PREPARATION/,
  );
  const [table, note = ""] = before
    .split("INGREDIENTS")
    .at(-1)
    .split("AMENDMENT / PRODUCTION NOTE");
  const title = amendment
    ? source.trim().split("\n")[0].trim()
    : p.split("DIFFICULTY:")[0].trim().split("\n").at(-1).trim();
  const allergen = entries
    .filter((_, j) => registerPages[j] === page)
    .join("\n\n");
  return [
    {
      id: head[2],
      title,
      category: head[1][0] + head[1].slice(1).toLowerCase(),
      page,
      amendment: amendment?.page || 0,
      active: Boolean(allergen),
      ingredients: rows(table),
      method: (method || "")
        .replace(
          /(?:MCN BAKE \| Amended recipes|THE McN BAKE BIBLE • PAGE)[^]*$/i,
          "",
        )
        .trim(),
      note: note.trim(),
      allergen,
      baseYield: yields.get(page)?.[0] || 1,
      unit: yields.get(page)?.[1] || "batches",
      revision: 0,
    },
  ];
});
export function originalPage(page) {
  return original[page - 1] + (page === 6 ? "\n" + original[6] : "");
}
