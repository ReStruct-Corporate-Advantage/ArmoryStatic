import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: String,
		state: {
			type: String,
			default: "underreview",
		},
		weightage: {
			type: Number,
			default: 0,
		},
		scope: {
			type: String,
			default: "public",
		},
  },
  {timestamps: true},
);


const Tag = mongoose.model("Tag", tagSchema);

export {tagSchema, Tag};