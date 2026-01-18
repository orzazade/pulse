import { query, mutation } from "./_generated/server";

// Complete list of Azerbaijan cities and towns (80+)
const AZERBAIJAN_CITIES = [
  "Absheron",
  "Agdam",
  "Agdash",
  "Agjabadi",
  "Agstafa",
  "Agsu",
  "Astara",
  "Baku",
  "Balakan",
  "Balakhani",
  "Barda",
  "Beylagan",
  "Bilasuvar",
  "Binagadi",
  "Dashkasan",
  "Davachi",
  "Fuzuli",
  "Gabala",
  "Gadabay",
  "Gakh",
  "Ganja",
  "Garadagh",
  "Gobustan",
  "Goranboy",
  "Goychay",
  "Goygol",
  "Hajigabul",
  "Imishli",
  "Ismayilli",
  "Jabrayil",
  "Jalilabad",
  "Kalbajar",
  "Khachmaz",
  "Khankendi",
  "Khatai",
  "Khizi",
  "Khojaly",
  "Kurdamir",
  "Lachin",
  "Lankaran",
  "Lerik",
  "Masalli",
  "Mingachevir",
  "Nakhchivan",
  "Narimanov",
  "Nasimi",
  "Neftchala",
  "Nizami",
  "Oghuz",
  "Pirallahi",
  "Qazakh",
  "Quba",
  "Qubadli",
  "Qusar",
  "Saatli",
  "Sabail",
  "Sabirabad",
  "Sabunchu",
  "Salyan",
  "Samukh",
  "Shabran",
  "Shaki",
  "Shamakhi",
  "Shamkir",
  "Shirvan",
  "Shusha",
  "Siyazan",
  "Sumqayit",
  "Surakhani",
  "Tartar",
  "Tovuz",
  "Ujar",
  "Yardimli",
  "Yasamal",
  "Yevlakh",
  "Zagatala",
  "Zangilan",
  "Zardab",
];

/**
 * Returns all cities sorted alphabetically.
 * Used for city autocomplete in LocationFilter.
 */
export const listCities = query({
  args: {},
  handler: async (ctx) => {
    const cities = await ctx.db.query("cities").collect();

    // If no cities in DB, return from constant (fallback)
    if (cities.length === 0) {
      return AZERBAIJAN_CITIES;
    }

    // Return city names sorted alphabetically
    return cities.map((c) => c.name).sort((a, b) => a.localeCompare(b));
  },
});

/**
 * Seeds the cities table with all Azerbaijan cities.
 * Safe to call multiple times - checks for existing cities.
 */
export const seedCities = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if cities already exist
    const existingCities = await ctx.db.query("cities").take(1);
    if (existingCities.length > 0) {
      return { status: "already_seeded", count: 0 };
    }

    // Insert all cities
    for (const cityName of AZERBAIJAN_CITIES) {
      await ctx.db.insert("cities", {
        name: cityName,
      });
    }

    return { status: "seeded", count: AZERBAIJAN_CITIES.length };
  },
});
