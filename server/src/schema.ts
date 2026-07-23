import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
});
