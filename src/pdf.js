import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { quantity } from "./scale.js";
export function recipePdf(recipe, target) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" }),
    width = 174,
    left = 18;
  let y = 25;
  const clean = (text) =>
    String(text)
      .replace(/[’‘]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/→/g, " to ")
      .replace(/\u202f/g, " ");
  function paragraph(text, size = 10, font = "helvetica", style = "normal") {
    pdf.setFont(font, style);
    pdf.setFontSize(size);
    pdf.setTextColor(55, 45, 36);
    for (const line of pdf.splitTextToSize(clean(text), width)) {
      if (y > 273) {
        pdf.addPage();
        y = 22;
      }
      pdf.text(line, left, y);
      y += size * 0.45;
    }
    y += 3;
  }
  paragraph("MCN BAKE   /   KITCHEN EDITION", 9);
  paragraph(recipe.title, 24, "times");
  paragraph(
    (recipe.revision ? "Approved revision " + recipe.revision : "Review copy") +
      "   |   Target " +
      target +
      " " +
      recipe.unit +
      "   |   Archive page " +
      recipe.page,
  );
  autoTable(pdf, {
    startY: y,
    margin: { left, right: left, top: 16, bottom: 20 },
    head: [["Ingredient", "Quantity"]],
    body: recipe.ingredients.map((i) => [
      clean(i.name),
      clean(quantity(i.amount, target / recipe.baseYield)),
    ]),
    theme: "grid",
    headStyles: { fillColor: [78, 65, 48] },
    alternateRowStyles: { fillColor: [250, 247, 240] },
    styles: { fontSize: 10, cellPadding: 2.2 },
    rowPageBreak: "avoid",
  });
  y = pdf.lastAutoTable.finalY + 10;
  for (const [title, body] of [
    ["Production notes", recipe.note],
    [
      "Method",
      (target !== recipe.baseYield
        ? "Quantities in the method refer to the original batch.\n\n"
        : "") + recipe.method,
    ],
    [
      "Allergen reference",
      recipe.allergen || "Archived product. No current product declaration.",
    ],
  ]) {
    if (!body) continue;
    if (y > 251) {
      pdf.addPage();
      y = 22;
    }
    paragraph(title, 16, "times");
    paragraph(body);
  }
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica");
    pdf.setFontSize(9);
    pdf.text("MCN Hospitality  |  Internal kitchen copy", left, 287);
    pdf.text(i + " / " + pages, 192, 287, { align: "right" });
  }
  return pdf;
}
