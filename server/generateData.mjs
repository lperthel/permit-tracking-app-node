import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { writeFile } from "fs/promises";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

var database = { products: [] };

for (var i = 1; i <= 300; i++) {
  database.products.push({
    id: uuidv4(),
    name: faker.commerce.productName(),
    description: faker.lorem.sentences(),
    price: faker.commerce.price(),
    quantity: faker.number.int({ min: 1, max: 100 }),
  });
}

try {
  await writeFile(outputFile, JSON.stringify(database, null, 2));
  console.log("✅ database.json written successfully.");
} catch (err) {
  console.error("❌ Error writing file:", err);
}
