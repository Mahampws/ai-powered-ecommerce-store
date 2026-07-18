import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Product } from "./models/Product.js";
import { generateText } from "./openai.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is missing. Add it to .env before using database routes.");
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}


const demoProducts = [
  { name:"FocusBook Air", category:"Laptop", price:899, description:"Lightweight laptop with 16 GB RAM.", tags:["remote work","portable"] },
  { name:"StudioView 27", category:"Monitor", price:329, description:"27-inch QHD productivity monitor.", tags:["design","coding"] },
  { name:"QuietType Keyboard", category:"Accessory", price:79, description:"Low-profile wireless keyboard.", tags:["office","quiet"] },
  { name:"SoundBubble Headset", category:"Audio", price:119, description:"Noise-cancelling headset with clear microphone.", tags:["meetings","remote work"] }
];

app.get("/api/products", async (_req, res, next) => {
  try { res.json(await Product.find().sort({ price: 1 })); } catch (error) { next(error); }
});

app.post("/api/products/seed", async (_req, res, next) => {
  try {
    await Product.bulkWrite(demoProducts.map(product => ({
      updateOne: { filter: { name: product.name }, update: { $set: product }, upsert: true }
    })));
    res.json({ ok: true });
  } catch (error) { next(error); }
});

app.post("/api/recommend", async (req, res, next) => {
  try {
    const products = await Product.find().lean();
    if (!products.length) return res.status(400).json({ message: "Seed the catalog first." });
    const recommendation = await generateText(
      "You are a shopping assistant. Recommend only products present in the supplied catalog. Explain tradeoffs and never invent specifications.",
      `Customer request: ${req.body.preferences}\nCatalog:\n${JSON.stringify(products)}`
    );
    res.json({ recommendation });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Server error" });
});
const port = process.env.PORT || 5000;
connectDatabase().then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
.catch(error => { console.error(error); process.exit(1); });
