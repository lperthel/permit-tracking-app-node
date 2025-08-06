/* global console */

import { faker } from "@faker-js/faker";
import { existsSync } from "fs";
import { unlink, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

faker.seed(123);

// Path resolution
const __dirname = dirname(fileURLToPath(import.meta.url));
const outputFile = join(__dirname, "database.json");

// Delete file if it exists
if (existsSync(outputFile)) {
  try {
    await unlink(outputFile);
    console.log("🗑️  Existing database.json deleted.");
  } catch (err) {
    console.error("⚠️  Failed to delete existing file:", err);
  }
}

const permitStatuses = ["SUBMITTED", "APPROVED", "REJECTED", "UNDER_REVIEW"];

const database = { permits: [] };

for (let i = 1; i <= 300; i++) {
  database.permits.push({
    id: uuidv4(),
    permitName: faker.commerce.productName(), // Example: "Eco-Friendly Lamp"
    applicantName: faker.person.fullName().replace(/[^a-zA-Z0-9 \-.']/g, ""), // Strips invalid chars
    permitType: faker.helpers.arrayElement([
      "Building",
      "Electrical",
      "Plumbing",
      "Occupancy",
      "Zoning",
    ]),
    status: faker.helpers.arrayElement(permitStatuses),
  });
}

try {
  await writeFile(outputFile, JSON.stringify(database, null, 2));
  console.log("✅ database.json written successfully.");
} catch (err) {
  console.error("❌ Error writing file:", err);
}
