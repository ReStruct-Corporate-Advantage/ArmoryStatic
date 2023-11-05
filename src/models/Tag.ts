import mongoose, {ObjectId} from "mongoose";

type TAG_STATES = "verified" | "underreview" | "deprecated"
type SCOPES = "public" | "private" | "org"

export interface ITag {
	_id?: ObjectId | string
	name: string
	state?: TAG_STATES
	weightage?: number
	scope?: SCOPES
}

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