import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Chart, { IChart } from "./src/models/Chart"; // Import Mongoose model

// Load environment variables from .env file
dotenv.config({ path: "./.env" });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in the .env file.");
  process.exit(1);
}

// --- List of your local JSON files to import ---
// IMPORTANT: Place all your SID/STAR JSON files in a directory named 'data/'
const chartFiles = [
  "LLBG-SUVAS1.json",
  "LLBG-DAFNA1.json",
  "LLBG-MERVA2.json",
  "LLBG-VETEK1A.json",
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connection successful.");

    // 1. Delete all existing charts to prevent duplicates
    await Chart.deleteMany({});
    console.log("🗑️ Existing charts collection cleared.");

    const chartsToInsert: IChart[] = [];

    // 2. Read and parse each JSON file
    for (const file of chartFiles) {
      const filePath = path.resolve(__dirname, "data", file);

      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}. Skipping.`);
        continue;
      }

      const rawData = fs.readFileSync(filePath, "utf-8");
      const chartData = JSON.parse(rawData);

      // Structure the data to match the Mongoose Schema (IChart)
      const structuredChart: IChart = {
        // Use the 'id' field from your JSON as the MongoDB _id
        _id: chartData.id,
        airport_id: chartData.id.split("-")[0], // Extracts 'LLBG' from 'LLBG-SUVAS1'
        name: chartData.name,
        type: chartData.type,
        map_url: chartData.map_url,
        fixes: chartData.fixes,
      } as IChart;

      chartsToInsert.push(structuredChart);
      console.log(
        `- Read ${structuredChart._id} (${structuredChart.fixes.length} fixes)`
      );
    }

    // 3. Insert all documents into the database
    await Chart.insertMany(chartsToInsert);
    console.log(
      `\n🎉 Successfully inserted ${chartsToInsert.length} chart documents.`
    );
  } catch (error) {
    console.error("🛑 Database seeding failed:", error);
  } finally {
    // Close the database connection regardless of success or failure
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
};

seedDB();
