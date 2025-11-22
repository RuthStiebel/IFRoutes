import mongoose, { Schema, Document } from "mongoose";

// Interface for Fixes
export interface IFix extends Document {
  fix_name: string;
  min_alt: string;
  max_alt: string;
}

// Updated Interface with new map variants
export interface IChart extends Document {
  airport_id: string;
  name: string;
  type: "SID" | "STAR";
  map_url: string; // Standard (Full)
  map_url_no_alt: string; // No Altitudes
  map_url_no_fix: string; // No Fix Names
  map_url_clean: string; // No Fixes or Altitudes (Line only)
  fixes: IFix[];
}

const FixSchema: Schema = new Schema(
  {
    fix_name: { type: String, required: true },
    min_alt: { type: String, required: true },
    max_alt: { type: String, required: true },
  },
  { _id: false }
);

const ChartSchema: Schema = new Schema({
  _id: { type: String, required: true },
  airport_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["SID", "STAR"], required: true },

  // Image Variants
  map_url: { type: String, required: true },
  map_url_no_alt: { type: String, required: true },
  map_url_no_fix: { type: String, required: true },
  map_url_clean: { type: String, required: true },

  fixes: [FixSchema],
});

export default mongoose.model<IChart>("Chart", ChartSchema, "charts");
