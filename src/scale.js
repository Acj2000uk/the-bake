// Keep complex expressions intact. Values in method text refer to the source batch.
export function quantity(raw, factor) {
  if (factor === 1) return raw || "Unspecified";
  const m = raw
    .trim()
    .match(
      /^(\d[\d,]*(?:\.\d+)?)\s*(g|kg|ml|l|litres?|leaves|eggs|pieces|tsp|tbsp|sheets|units)?(?:\s*(\([^)]*\)))?$/i,
    );
  if (!m) return (raw || "Unspecified") + " · check manually";
  const n = Number(m[1].replaceAll(",", "")) * factor;
  return (
    n.toLocaleString("en-GB", { maximumFractionDigits: 4 }) +
    (m[2] ? " " + m[2] : "") +
    (m[3] ? " · base note " + m[3] : "")
  );
}
