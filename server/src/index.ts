import express from "express";
import path from "path";
import dotenv from "dotenv";
import { db } from "./db";
import { pets } from "./schema";
import { eq } from "drizzle-orm";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../../dist/client")));

app.get("/api/pets", async (req, res) => {
  const results = await db.select().from(pets).limit(50);
  res.json(
    results.map((pet) => ({
      id: String(pet.id),
      name: pet.name,
      species: pet.species,
    })),
  );
});

app.post("/api/pets", async (req, res) => {
  const { name, species } = req.body;
  if (!name || !species) {
    return res.status(400).json({ message: "name and species are required" });
  }

  const existing = await db
    .select()
    .from(pets)
    .where(eq(pets.name, name))
    .limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ message: "Pet already exists" });
  }

  const inserted = await db.insert(pets).values({ name, species }).returning();
  res.status(201).json(inserted[0]);
});

app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  res.sendFile(path.join(__dirname, "../../dist/client/index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
