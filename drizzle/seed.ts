import "dotenv/config";

import {
  category,
  feature,
  space,
  spaceToCategories,
  spaceToFeatures,
  spaceType,
  usersTable,
} from "./schema";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/utils/password";

async function seed() {
  console.log("Starting database seeding...");

  try {
    // --- 1. Seed Users ---
    console.log("Seeding users...");
    const hashedPassword = await hashPassword("888888");
    const insertedUsers = await db
      .insert(usersTable)
      .values([
        {
          username: "alice_smith",
          email: "alice@example.com",
          passwordHash: hashedPassword,
          profilePicture: "https://placehold.co/100x100/FF5733/FFFFFF?text=AS",
          bio: "Avid explorer of urban spaces and hidden gems.",
        },
        {
          username: "bob_jones",
          email: "bob@example.com",
          passwordHash: hashedPassword,
          profilePicture: "https://placehold.co/100x100/33FF57/FFFFFF?text=BJ",
          bio: "Loves quiet parks and architectural marvels.",
        },
        {
          username: "charlie_brown",
          email: "charlie@example.com",
          passwordHash: "hashed_password_charlie",
          bio: "Focused on historical context and unique features.",
        },
      ])
      .returning()
      .onConflictDoNothing();
    console.log("Users seeded:", insertedUsers.length);

    const alice = insertedUsers[0];
    const bob = insertedUsers[1];
    const charlie = insertedUsers[2];

    // --- 2. Seed Space Types ---
    console.log("Seeding space types...");
    const insertedSpaceTypes = await db
      .insert(spaceType)
      .values([
        {
          name: "Park",
          descriptions: "Green public spaces for recreation and relaxation.",
        },
        {
          name: "Plaza",
          descriptions: "Open urban areas, often paved, for public gathering.",
        },
        {
          name: "Landmark",
          descriptions:
            "Structures or sites of historical or cultural significance.",
        },
        {
          name: "Hidden Gem",
          descriptions: "Lesser-known, unique, and often surprising spots.",
        },
      ])
      .returning()
      .onConflictDoNothing();
    console.log("Space types seeded:", insertedSpaceTypes.length);

    const parkType = insertedSpaceTypes[0];
    const plazaType = insertedSpaceTypes[1];
    const landmarkType = insertedSpaceTypes[2];
    const hiddenGemType = insertedSpaceTypes[3];

    // --- 3. Seed Categories ---
    console.log("Seeding categories...");
    const insertedCategories = await db
      .insert(category)
      .values([
        {
          name: "Historical",
          descriptions: "Spaces with deep historical roots and stories.",
        },
        {
          name: "Recreational",
          descriptions: "Ideal for sports, games, and outdoor activities.",
        },
        {
          name: "Architectural",
          descriptions:
            "Known for their unique or significant design and structure.",
        },
        {
          name: "Natural",
          descriptions: "Emphasizing natural landscapes, flora, and fauna.",
        },
        {
          name: "Cultural",
          descriptions: "Host to events, art, or community gatherings.",
        },
      ])
      .returning()
      .onConflictDoNothing();
    console.log("Categories seeded:", insertedCategories.length);

    const historicalCat = insertedCategories[0];
    const recreationalCat = insertedCategories[1];
    const architecturalCat = insertedCategories[2];
    const naturalCat = insertedCategories[3];
    const culturalCat = insertedCategories[4];

    // --- 4. Seed Features ---
    console.log("Seeding features...");
    const insertedFeatures = await db
      .insert(feature)
      .values([
        {
          name: "Wi-Fi",
          descriptions: "Free wireless internet access available.",
        },
        {
          name: "Playground",
          descriptions: "Dedicated area with equipment for children to play.",
        },
        { name: "Restrooms", descriptions: "Public toilet facilities." },
        {
          name: "Wheelchair Accessible",
          descriptions:
            "Features ramps, wide paths, and accessible facilities.",
        },
        {
          name: "Seating",
          descriptions: "Benches, chairs, or other places to sit.",
        },
        {
          name: "Food Stalls",
          descriptions: "Vendors selling snacks, meals, and beverages.",
        },
        { name: "Water Fountain", descriptions: "Drinking water available." },
      ])
      .returning()
      .onConflictDoNothing();
    console.log("Features seeded:", insertedFeatures.length);

    const wifiFeature = insertedFeatures[0];
    const playgroundFeature = insertedFeatures[1];
    const restroomsFeature = insertedFeatures[2];
    const wheelchairFeature = insertedFeatures[3];
    const seatingFeature = insertedFeatures[4];
    const foodStallsFeature = insertedFeatures[5];
    const waterFountainFeature = insertedFeatures[6];

    // --- 5. Seed Spaces ---
    console.log("Seeding spaces...");
    const insertedSpaces = await db
      .insert(space)
      .values([
        {
          name: "City Central Park",
          slug: "city-central-park",
          alternateNames: ["The Green Heart", "Main Park"],
          activities: ["picnic", "running", "cycling", "people_watching"],
          descriptions:
            "A sprawling urban oasis offering diverse recreational opportunities.",
          historicalContext:
            "Established in the late 19th century, a testament to urban planning.",
          architecturalStyle: "Landscape Design",
          operatingHours: null,
          entranceFee: null,
          contactInfo: { phone: "555-PARK", email: "info@citypark.org" },
          accessibility: {
            wheelchair_accessible: true,
            notes: "Main paths are accessible",
          },
          submittedBy: alice.id,
          typeId: parkType.id,
        },
        {
          name: "Liberty Plaza",
          slug: "liberty-plaza",
          alternateNames: ["Freedom Square"],
          activities: ["photography", "protests", "events"],
          descriptions:
            "A historic plaza known for its grand architecture and public gatherings.",
          historicalContext: "Site of major historical speeches and events.",
          architecturalStyle: "Neoclassical",
          operatingHours: { daily: "24/7", notes: "Public space" },
          entranceFee: { amount: 0, currency: "USD" },
          contactInfo: { website: "libertyplaza.com" },
          accessibility: null,
          submittedBy: bob.id,
          typeId: plazaType.id,
        },
        {
          name: "The Old Lighthouse",
          slug: "old-lighthouse",
          alternateNames: ["Coastal Beacon"],
          activities: ["sightseeing", "bird_watching"],
          descriptions:
            "A charming, historic lighthouse offering panoramic ocean views.",
          historicalContext: "Built in 1850, guided ships for over a century.",
          architecturalStyle: "Victorian",
          operatingHours: { daily: "10:00-17:00", seasonal: true },
          entranceFee: {
            amount: 10,
            currency: "USD",
            notes: "Ticket required for tower climb",
          },
          contactInfo: { phone: "555-LIGHT", email: "visit@lighthouse.org" },
          accessibility: {
            wheelchair_accessible: false,
            notes: "Stairs to top",
          },
          submittedBy: charlie.id,
          typeId: landmarkType.id,
        },
        {
          name: "Whispering Woods",
          slug: "whispering-woods",
          alternateNames: ["Secret Grove"],
          activities: ["hiking", "meditation", "nature_walks"],
          descriptions:
            "A tranquil, secluded forest patch, perfect for quiet contemplation.",
          historicalContext: null,
          architecturalStyle: null,
          operatingHours: null,
          entranceFee: null,
          contactInfo: null,
          accessibility: {
            wheelchair_accessible: false,
            notes: "Uneven terrain",
          },
          submittedBy: alice.id,
          typeId: hiddenGemType.id,
        },
      ])
      .returning()
      .onConflictDoNothing();
    console.log("Spaces seeded:", insertedSpaces.length);

    const cityCentralPark = insertedSpaces[0];
    const libertyPlaza = insertedSpaces[1];
    const oldLighthouse = insertedSpaces[2];
    const whisperingWoods = insertedSpaces[3];

    // --- 6. Seed SpaceToFeatures (M:N Junction Table) ---
    console.log("Seeding space to features...");
    await db
      .insert(spaceToFeatures)
      .values([
        // City Central Park features
        { spaceId: cityCentralPark.id, featureId: playgroundFeature.id },
        { spaceId: cityCentralPark.id, featureId: restroomsFeature.id },
        { spaceId: cityCentralPark.id, featureId: seatingFeature.id },
        { spaceId: cityCentralPark.id, featureId: foodStallsFeature.id },
        { spaceId: cityCentralPark.id, featureId: wheelchairFeature.id },
        { spaceId: cityCentralPark.id, featureId: waterFountainFeature.id },

        // Liberty Plaza features
        { spaceId: libertyPlaza.id, featureId: wifiFeature.id },
        { spaceId: libertyPlaza.id, featureId: seatingFeature.id },
        { spaceId: libertyPlaza.id, featureId: wheelchairFeature.id },

        // Old Lighthouse features
        { spaceId: oldLighthouse.id, featureId: restroomsFeature.id },
        { spaceId: oldLighthouse.id, featureId: seatingFeature.id },

        // Whispering Woods features
        { spaceId: whisperingWoods.id, featureId: seatingFeature.id },
        { spaceId: whisperingWoods.id, featureId: waterFountainFeature.id },
      ])
      .onConflictDoNothing();
    console.log("Space to features seeded.");

    // --- 7. Seed SpaceToCategories (M:N Junction Table) ---
    console.log("Seeding space to categories...");
    await db
      .insert(spaceToCategories)
      .values([
        // City Central Park categories
        { spaceId: cityCentralPark.id, categoryId: recreationalCat.id },
        { spaceId: cityCentralPark.id, categoryId: naturalCat.id },
        { spaceId: cityCentralPark.id, categoryId: culturalCat.id },

        // Liberty Plaza categories
        { spaceId: libertyPlaza.id, categoryId: historicalCat.id },
        { spaceId: libertyPlaza.id, categoryId: architecturalCat.id },
        { spaceId: libertyPlaza.id, categoryId: culturalCat.id },

        // Old Lighthouse categories
        { spaceId: oldLighthouse.id, categoryId: historicalCat.id },
        { spaceId: oldLighthouse.id, categoryId: architecturalCat.id },

        // Whispering Woods categories
        { spaceId: whisperingWoods.id, categoryId: naturalCat.id },
        { spaceId: whisperingWoods.id, categoryId: recreationalCat.id },
        { spaceId: whisperingWoods.id, categoryId: historicalCat.id }, // Corrected category ID
      ])
      .onConflictDoNothing();
    console.log("Space to categories seeded.");

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  } finally {
    process.exit(0); // Ensure process exits
  }
}

// Execute the seed function
seed();
