var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
var aiInstance = null;
var lastApiKeyServer = null;
function getCleanApiKey(key) {
  if (!key) return "";
  let clean = key.trim();
  const aizaIndex = clean.indexOf("AIzaSy");
  if (aizaIndex !== -1) {
    clean = clean.substring(aizaIndex).trim();
  }
  if (clean.startsWith('"') && clean.endsWith('"') || clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.substring(1, clean.length - 1).trim();
  }
  const isInvalid = !clean || clean === "MY_GEMINI_API_KEY" || clean === "undefined" || clean === "null" || clean === "[object Object]" || clean === "placeholder" || clean.length < 10;
  return isInvalid ? "" : clean;
}
function getAI(customApiKey) {
  let apiKey = getCleanApiKey(customApiKey);
  if (!apiKey) {
    apiKey = getCleanApiKey(process.env.GEMINI_API_KEY);
  }
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please add it to your environment variables or key configuration.");
  }
  if (!aiInstance || lastApiKeyServer !== apiKey) {
    aiInstance = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    lastApiKeyServer = apiKey;
  }
  return aiInstance;
}
app.post("/api/extract-recipe", async (req, res) => {
  try {
    const { files } = req.body;
    const customApiKey = req.headers["x-gemini-api-key"];
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "No files provided for extraction" });
    }
    const ai = getAI(customApiKey);
    const parts = files.map((file) => {
      return {
        inlineData: {
          data: file.data,
          mimeType: file.mimeType
        }
      };
    });
    const prompt = `Extract ALL recipes from the provided documents.
CRITICAL MANDATE FOR MULTIPLE RECIPES: Scan the entire document/images meticulously. If there is more than one recipe (for example, separate sub-recipes, multiple recipes on a single page, or multiple pages of a handbook/booklet), you MUST extract and separate EACH and EVERY one of them. Do NOT skip any recipe, and do NOT lump multiple distinct recipes together into a single recipe object. Each distinct recipe MUST be its own separate element inside the 'recipes' array of the returned JSON object.

Be extremely precise with ingredient names and their exact weights/quantities (e.g. mapping Ingredient/Weight columns).
If there are special sections like "Rational Oven Settings", "Oven Settings", "Baking Profile", or "Bake Settings", append them as separate steps at the end of the 'method' array (e.g. "Oven Settings: Inject steam...").
For the 'description' field, capture or create a brief, elegant editorial-style summary (1-2 sentences) describing the heritage, origin, or style of the recipe (e.g. "Adapted from the original PIA DO Milano Ciabatta recipe...").
For 'category', choose the most appropriate from: Sourdough, Pastries, Cakes, Cookies, Breads.
For 'difficulty', estimate based on complexity.
For 'cuisine', infer the style (e.g. British, French, Italian, Scandinavian, etc.).`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [...parts, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            recipes: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  title: { type: import_genai.Type.STRING },
                  category: {
                    type: import_genai.Type.STRING,
                    enum: ["Sourdough", "Pastries", "Cakes", "Cookies", "Breads"]
                  },
                  cuisine: { type: import_genai.Type.STRING },
                  ingredients: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        item: { type: import_genai.Type.STRING },
                        quantity: { type: import_genai.Type.STRING }
                      },
                      required: ["item", "quantity"]
                    }
                  },
                  method: {
                    type: import_genai.Type.ARRAY,
                    items: { type: import_genai.Type.STRING }
                  },
                  description: { type: import_genai.Type.STRING },
                  difficulty: {
                    type: import_genai.Type.STRING,
                    enum: ["Easy", "Intermediate", "Advanced", "Beginner", "Professional"]
                  },
                  imagePrompt: { type: import_genai.Type.STRING },
                  allergens: {
                    type: import_genai.Type.ARRAY,
                    items: { type: import_genai.Type.STRING }
                  }
                },
                required: ["title", "category", "cuisine", "ingredients", "method", "description", "difficulty", "imagePrompt", "allergens"]
              }
            }
          },
          required: ["recipes"]
        }
      }
    });
    const text = response.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanJson);
    res.json(result);
  } catch (err) {
    let errorMessage = err.message || "Failed to extract recipe data";
    const lowerMessage = errorMessage.toLowerCase();
    const isQuotaOrDepleted = lowerMessage.includes("resource_exhausted") || lowerMessage.includes("depleted") || lowerMessage.includes("quota") || lowerMessage.includes("429") || lowerMessage.includes("prepayment credits");
    if (isQuotaOrDepleted) {
      console.warn("Gemini server-side extraction: Default credits depleted (429 Resource Exhausted). Directing user to use custom key.");
      errorMessage = "Gemini server-side extraction failed: The default workspace API key prepayment credits are depleted (429 Resource Exhausted). Please click 'Key Config' at the top of the upload dialog to save your own Gemini API Key.";
    } else {
      console.error("Gemini server-side extraction failed:", err);
    }
    res.status(500).json({ error: errorMessage });
  }
});
async function startServer() {
  const isDev = process.env.NODE_ENV === "development" || process.argv[1] && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("tsx"));
  if (isDev) {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Critical server boot error:", err);
});
//# sourceMappingURL=server.cjs.map
