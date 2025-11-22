import mongoose, { Schema, Document } from "mongoose";

// Interface for the Fix data (nested within the Chart document)
export interface IFix extends Document {
  fix_name: string;
  min_alt: string;
  max_alt: string;
  //  x: number;
  //  y: number;
}

// Interface for the main Chart document
export interface IChart extends Document {
  airport_id: string;
  name: string;
  type: "SID" | "STAR";
  map_url: string;
  fixes: IFix[];
}

// Define the Schema for the Fixes (sub-document schema)
const FixSchema: Schema = new Schema(
  {
    fix_name: { type: String, required: true },
    min_alt: { type: String, required: true },
    max_alt: { type: String, required: true },
    //   x: { type: Number, required: true },
    //  y: { type: Number, required: true },
  },
  { _id: false }
); // MongoDB will not generate IDs for sub-documents

// Define the main Chart Schema
const ChartSchema: Schema = new Schema({
  _id: { type: String, required: true }, // Using _id to store the chart ID (e.g., 'LLBG-SUVAS1')
  airport_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["SID", "STAR"], required: true },
  map_url: { type: String, required: true },
  fixes: [FixSchema],
});

// Export the Mongoose Model
export default mongoose.model<IChart>("Chart", ChartSchema, "charts"); // The collection name in Mongo will be 'charts'
