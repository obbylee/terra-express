import { sql } from "drizzle-orm";
import {
  pgTable,
  primaryKey,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  profilePicture: text("profilePicture"),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const spaceType = pgTable("space_type", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  descriptions: text("descriptions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  descriptions: text("descriptions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const feature = pgTable("feature", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  descriptions: text("descriptions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const space = pgTable("space", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: text("slug").unique().notNull(),
  alternateNames: text("alternateNames")
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  activities: text("activities")
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  descriptions: text("descriptions"),

  historicalContext: text("historical_context"),
  architecturalStyle: varchar("architectural_style", { length: 100 }),

  operatingHours: jsonb("operatingHours"),
  entranceFee: jsonb("entranceFee"),
  contactInfo: jsonb("contactInfo"),
  accessibility: jsonb("accessibility"),

  submittedBy: uuid("submitted_by")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  typeId: uuid("type_id")
    .references(() => spaceType.id, { onDelete: "cascade" })
    .notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const spaceToFeatures = pgTable(
  "space_to_features",
  {
    spaceId: uuid("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "cascade" }),

    featureId: uuid("feature_id")
      .notNull()
      .references(() => feature.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.spaceId, table.featureId] })],
);

export const spaceToCategories = pgTable(
  "space_to_categories",
  {
    spaceId: uuid("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.spaceId, table.categoryId] })],
);
