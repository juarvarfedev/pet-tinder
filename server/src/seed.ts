import { db } from "./db";
import { pets } from "./schema";

type SeedPet = {
  name: string;
  species: string;
};

const speciesSets: Record<string, number> = {
  dog: 39,
  cat: 14,
  bird: 9,
  rabbit: 3,
  reptile: 2,
};

const buildPets = (): SeedPet[] => {
  const items: SeedPet[] = [];

  Object.entries(speciesSets).forEach(([species, count]) => {
    for (let i = 1; i <= count; i += 1) {
      items.push({
        name: `${species}-${i}`,
        species,
      });
    }
  });

  return items;
};

const seed = async () => {
  const petsToSeed = buildPets();
  const existingRows = await db.select().from(pets);
  const existingNames = new Set(
    existingRows.map((pet: { name: string }) => pet.name),
  );
  const missing = petsToSeed.filter((pet) => !existingNames.has(pet.name));

  if (missing.length === 0) {
    console.log("Pets table already contains all mock pets. Nothing to seed.");
    return;
  }

  await db.insert(pets).values(missing);
  console.log(`Seeded ${missing.length} missing pets.`);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
