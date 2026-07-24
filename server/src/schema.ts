import { pgTable, serial, text, integer, jsonb } from "drizzle-orm/pg-core";

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed").notNull(),
  ageMonths: integer("age_months").notNull(),
  gender: text("gender").notNull(),
  bio: text("bio").notNull(),
  traits: jsonb("traits").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  photo: text("photo").notNull(),
  adoptionFee: integer("adoption_fee").notNull(),
});
