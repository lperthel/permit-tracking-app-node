import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { writeFile } from "fs/promises";

var database = { products: [] };

for (var i = 1; i <= 300; i++) {
  database.products.push({
    uuid: uuidv4(),
    name: faker.commerce.productName(),
    description: faker.lorem.sentences(),
    price: faker.commerce.price(),
    quantity: faker.number.int({ min: 1, max: 100 }),
  });
}

try {
  await writeFile("database.json", JSON.stringify(database, null, 2));
  console.log("Data written to database.json");
} catch (err) {
  console.error("Error writing file:", err);
}
