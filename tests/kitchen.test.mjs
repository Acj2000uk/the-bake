import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { api } from "../scripts/api.mjs";
import { recipes, booklet } from "../scripts/catalog.mjs";
import { quantity } from "../src/scale.js";
test("catalog reconciles archive, amendments and operational register", () => {
  assert.equal(new Set(recipes.map((r) => r.id)).size, 44);
  assert.equal(recipes.filter((r) => r.amendment).length, 32);
  assert.equal(recipes.filter((r) => r.active).length, 35);
  assert.equal(
    recipes.flatMap((r) => r.allergen.match(/Contains:/g) || []).length,
    37,
  );
  assert.equal(booklet.length, 17);
  for (const r of recipes) {
    assert.ok(r.ingredients.length && r.method);
    assert.equal(r.revision, 0);
  }
});
test("scales base quantities, preserves notes and flags manual amounts", () => {
  assert.equal(quantity("4,000 g", 0.5), "2,000 g");
  assert.equal(quantity("1.5 kg", 2), "3 kg");
  assert.equal(quantity("80 g (2%)", 1.25), "100 g · base note (2%)");
  assert.match(quantity("90–150 g", 2), /check manually/);
});
test("staff permissions, version checks, approval, production snapshots and assistant scope", async (t) => {
  const dir = mkdtempSync(tmpdir() + "/bake-"),
    middleware = api(dir, { admin: "admin-test", staff: "staff-test" });
  const server = createServer((req, res) =>
    middleware(req, res, () => res.end()),
  );
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  t.after(async () => {
    await new Promise((ok) => server.close(ok));
    rmSync(dir, { recursive: true, force: true });
  });
  const request = (path, body, cookie = "") =>
    fetch("http://127.0.0.1:" + server.address().port + "/api/" + path, {
      method: body ? "POST" : "GET",
      headers: { cookie, "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    });
  const login = async (password) =>
    (await request("login", { password })).headers
      .get("set-cookie")
      .split(";")[0];
  const staff = await login("staff-test"),
    admin = await login("admin-test"),
    r = recipes.find((r) => r.active);
  assert.equal((await request("catalog")).status, 401);
  assert.equal((await request("draft?id=" + r.id, null, staff)).status, 403);
  assert.equal(
    (await request("ask", { id: r.id, question: "Ingredients?" }, staff))
      .status,
    400,
  );
  const sheet = {
    date: "2026-11-18",
    venue: "MCN Bake",
    version: 0,
    action: "add",
    id: r.id,
    target: 3,
  };
  assert.equal((await request("sheet", sheet, staff)).status, 400);
  const draft = {
    id: r.id,
    recipe: r,
    version: 0,
    reviewer: "Test kitchen",
    verified: true,
    approve: true,
  };
  assert.equal((await request("draft", draft, admin)).status, 200);
  assert.equal((await request("draft", draft, admin)).status, 409);
  const first = await (await request("sheet", sheet, staff)).json();
  assert.equal(first.lines[0].recipe.revision, 1);
  assert.equal((await request("sheet", sheet, staff)).status, 409);
  assert.equal(
    (
      await request(
        "draft",
        { ...draft, version: 1, recipe: { ...r, title: "Second version" } },
        admin,
      )
    ).status,
    200,
  );
  const done = await (
    await request(
      "sheet",
      {
        ...sheet,
        version: 1,
        action: "finish",
        line: first.lines[0].id,
        name: "Test baker",
      },
      staff,
    )
  ).json();
  assert.equal(done.lines[0].signoff, "Test baker");
  assert.equal(done.lines[0].recipe.title, r.title);
});
test("PDF generation paginates all 44 source records", async () => {
  const { recipePdf } = await import("../src/pdf.js");
  for (const r of recipes) {
    const pdf = recipePdf(r, r.baseYield * 2);
    assert.ok(pdf.getNumberOfPages() >= 1);
    assert.ok(pdf.output().startsWith("%PDF"));
  }
});
