import { db } from "./db";
import { pets } from "./schema";

type SeedPet = {
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  gender: string;
  bio: string;
  traits: string[];
  city: string;
  state: string;
  photo: string;
  adoptionFee: number;
};

const speciesPhotoCount: Record<string, number> = {
  dog: 39,
  cat: 14,
  bird: 9,
  rabbit: 3,
  reptile: 2,
};

const randomPhoto = (species: string) => {
  const count = speciesPhotoCount[species] ?? 39;
  const index = Math.floor(Math.random() * count) + 1;
  return `https://pets-images.dev-apis.com/pets/${species}${index}.jpg`;
};

const speciesDetails = [
  {
    species: "dog",
    breeds: [
      "boxer mix",
      "golden retriever",
      "beagle",
      "corgi",
      "australian shepherd",
    ],
    genders: ["male", "female"],
    bios: [
      "I'm a joyful pup who loves fetch and belly rubs.",
      "I nap hard, play harder, and always wag my tail.",
      "My favorite place is next to you on the couch.",
      "I have a big heart and an even bigger appetite for adventure.",
    ],
    traits: ["playful", "loyal", "friendly", "energetic", "couch potato"],
    cities: ["Kent", "Seattle", "Tacoma", "Bellevue", "Everett"],
    states: ["WA"],
    feeRange: [120, 180],
  },
  {
    species: "cat",
    breeds: ["orange tabby", "calico", "siamese", "maine coon", "short hair"],
    genders: ["male", "female"],
    bios: [
      "I spend my days lounging in sunbeams and purring on command.",
      "I'm curious, clever, and always ready for a treat.",
      "I love slow pets, warm laps, and quiet afternoons.",
      "I may be small, but my personality is huge.",
    ],
    traits: ["independent", "curious", "affectionate", "calm", "spunky"],
    cities: ["Seattle", "Portland", "Bend", "Salem", "Vancouver"],
    states: ["WA", "OR"],
    feeRange: [80, 120],
  },
  {
    species: "bird",
    breeds: ["budgie", "cockatiel", "lovebird", "parakeet", "canary"],
    genders: ["male", "female"],
    bios: [
      "I sing the sweetest songs and love exploring my cage.",
      "I'm a bright little buddy who enjoys millet treats.",
      "I love company and enjoy watching everything from my perch.",
      "I'm gentle, social, and a curious feathered friend.",
    ],
    traits: ["playful", "talkative", "friendly", "bright", "social"],
    cities: ["Spokane", "Yakima", "Pasco", "Kennewick", "Wenatchee"],
    states: ["WA", "OR"],
    feeRange: [30, 60],
  },
  {
    species: "rabbit",
    breeds: [
      "mini rex",
      "lionhead",
      "netherland dwarf",
      "holland lop",
      "english spot",
    ],
    genders: ["male", "female"],
    bios: [
      "I'm soft, sweet, and I love gentle pets.",
      "I enjoy hopping around and exploring cozy spaces.",
      "I'm calm, curious, and a great quiet companion.",
      "I like fresh greens, soft blankets, and gentle attention.",
    ],
    traits: ["gentle", "quiet", "friendly", "curious", "soft"],
    cities: ["Portland", "Salem", "Hillsboro", "Gresham", "Corvallis"],
    states: ["OR"],
    feeRange: [50, 75],
  },
  {
    species: "reptile",
    breeds: [
      "bearded dragon",
      "corn snake",
      "leopard gecko",
      "crestie",
      "ball python",
    ],
    genders: ["male", "female"],
    bios: [
      "I love basking under warm lights and slow, steady exploration.",
      "I'm easygoing, calm, and a fascinating companion.",
      "I enjoy gentle handling and quiet, warm spaces.",
      "I'm a relaxed reptile who prefers a peaceful setup.",
    ],
    traits: ["easygoing", "chill", "curious", "low maintenance", "observant"],
    cities: ["Boise", "Eugene", "Medford", "Bend", "Bozeman"],
    states: ["ID", "OR", "MT"],
    feeRange: [60, 90],
  },
];

const buildPets = (): SeedPet[] => {
  const pets: SeedPet[] = [];

  for (let i = 1; i <= 50; i += 1) {
    const detail = speciesDetails[(i - 1) % speciesDetails.length];
    const breed = detail.breeds[i % detail.breeds.length];
    const gender = detail.genders[i % detail.genders.length];
    const bio = detail.bios[i % detail.bios.length];
    const city = detail.cities[i % detail.cities.length];
    const state = detail.states[i % detail.states.length];
    const traits = [
      detail.traits[i % detail.traits.length],
      detail.traits[(i + 1) % detail.traits.length],
    ];
    const adoptionFee =
      detail.feeRange[0] +
      ((i * 7) % (detail.feeRange[1] - detail.feeRange[0] + 1));

    pets.push({
      name: `${detail.species}-${i}`,
      species: detail.species,
      breed,
      ageMonths: 6 + (i % 60),
      gender,
      bio,
      traits,
      city,
      state,
      photo: randomPhoto(detail.species),
      adoptionFee,
    });
  }

  return pets;
};

const petsToSeed = buildPets();

const seed = async () => {
  await db.insert(pets).values(petsToSeed);
  console.log(`Seeded ${petsToSeed.length} pets.`);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
