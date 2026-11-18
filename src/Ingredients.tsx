import type { Recipe } from "./types";
import { quantity } from "./scale.js";
export function Ingredients({
  recipe,
  target,
}: {
  recipe: Recipe;
  target: number;
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Ingredient</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        {recipe.ingredients.map((i, k) => (
          <tr key={k}>
            <td>{i.name}</td>
            <td>{quantity(i.amount, target / recipe.baseYield)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
