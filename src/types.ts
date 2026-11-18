export type Ingredient = { name: string; amount: string };
export type Recipe = {
  id: string;
  title: string;
  category: string;
  page: number;
  active: boolean;
  amendment: number;
  revision: number;
  baseYield: number;
  unit: string;
  ingredients: Ingredient[];
  method: string;
  note: string;
  allergen: string;
};
export type Catalog = { recipes: Recipe[]; role: string; booklet: string[] };
export type Sheet = {
  version: number;
  lines: { id: string; recipe: Recipe; target: number; signoff: string }[];
};
