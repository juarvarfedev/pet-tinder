import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { db } from "./db.js";
import { pets } from "./schema.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Better Auth must receive the raw request; mount it before express.json().
app.all("/api/auth/*splat", toNodeHandler(auth));
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
      breed: pet.breed,
      ageMonths: pet.ageMonths,
      gender: pet.gender,
      bio: pet.bio,
      traits: pet.traits,
      city: pet.city,
      state: pet.state,
      photo: pet.photo,
      adoptionFee: pet.adoptionFee,
    })),
  );
});

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  res.json(session);
});

app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  res.sendFile(path.join(__dirname, "../../dist/client/index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
