const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pets = [
  { name: "Fluffy", species: "cat" },
  { name: "Fido", species: "dog" },
  { name: "Goldie", species: "fish" },
  { name: "Rex", species: "lion" },
];

app.get("/pets", (request, response) => {
  response.json(pets);
});

app.post("/pets", (request, response) => {
  const newPet = request.body;

  const exists = pets.some(
    (pet) => pet.name === newPet.name && pet.species === newPet.species,
  );

  if (exists) {
    return response.status(409).json({
      message: "Pet already exists",
    });
  }

  pets.push(newPet);

  response.status(201).json({
    message: "Pet added",
    pet: newPet,
  });
});

app.listen(3000);
console.log("Request received");
