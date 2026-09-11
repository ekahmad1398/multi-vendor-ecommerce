import "dotenv/config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";

dotenv.config({ path: ".env.local", override: true });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) throw new Error("MONGODB_URI or MONGO_URI is required to seed products.");

const categories = [
  ["Home", "Considered pieces for comfortable, functional spaces."],
  ["Office", "Tools and objects for a calmer workday."],
  ["Kitchen", "Useful essentials for cooking and sharing."],
  ["Travel", "Well-made companions for wherever you are headed."],
  ["Wellness", "Small rituals for rest, movement, and everyday care."],
];

const productNames = [
  "Arc Table Lamp", "Linen Weekend Tote", "Stoneware Pour Over Set", "Wool Desk Pad", "Travel Candle Tin",
  "Oak Monitor Stand", "Everyday Water Bottle", "Canvas Market Bag", "Ceramic Breakfast Bowl", "Pocket Notebook Set",
  "Studio Headphones", "Cloud Throw Blanket", "Brass Bookend Pair", "Portable Tea Set", "Soft Linen Apron",
  "Workday Task Pad", "Ribbed Glass Carafe", "Carry-On Packing Cubes", "Scented Bath Soak", "Minimal Wall Clock",
  "Felt Laptop Sleeve", "Olive Oil Cruet", "Canvas Field Jacket", "Hand Cream Trio", "Cedar Desk Tray",
  "Weekend Picnic Set", "Ceramic Incense Holder", "Leather Cable Wrap", "Glass Storage Jar Set", "Foldaway Yoga Mat",
  "Paper Desk Calendar", "Travel Cutlery Kit", "Woven Storage Basket", "Wool House Slippers", "Oak Serving Board",
  "Pocket Sketchbook", "Insulated Lunch Tote", "Bedside Carafe Set", "Quiet Hour Diffuser", "Compact Tool Roll",
  "Linen Duvet Cover", "Notebook Folio", "Pour Over Kettle", "Passport Wallet", "Daily Mineral Sunscreen",
  "Ceramic Plant Pot", "Adjustable Reading Light", "Recycled Travel Umbrella", "Cotton Bath Towel Set", "Sunday Coffee Mug",
];

const images = [
  "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
];

const brands = ["Morrow Studio", "Northline", "Field Notes", "Common Form", "Stillmade"];

const run = async () => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  const categoryDocuments = await Promise.all(
    categories.map(([name, description]) =>
      Category.findOneAndUpdate(
        { name },
        { $setOnInsert: { name, description } },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      ),
    ),
  );

  const operations = productNames.map((name, index) => {
    const categoryIndex = index % categoryDocuments.length;
    const number = String(index + 1).padStart(3, "0");
    return {
      updateOne: {
        filter: { sku: `MRW-SEED-${number}` },
        update: {
          $setOnInsert: {
            name,
            description: `${name} is a thoughtfully selected everyday essential, made to be useful, durable, and easy to live with.`,
            price: 18 + ((index * 13) % 142),
            stock: 6 + ((index * 7) % 45),
            category: categoryDocuments[categoryIndex]._id,
            brand: brands[index % brands.length],
            sku: `MRW-SEED-${number}`,
            image: images[categoryIndex],
            discount: index % 6 === 0 ? 15 : index % 4 === 0 ? 10 : 0,
            isActive: true,
            rating: Number((3.8 + ((index % 12) / 10)).toFixed(1)),
            reviewCount: 4 + ((index * 3) % 38),
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Product.bulkWrite(operations, { ordered: false });
  console.log(`Products seeded: ${result.upsertedCount} added, ${productNames.length - result.upsertedCount} already present.`);
};

run()
  .catch((error) => {
    console.error(`Product seeding failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
