// **** Variables **** //
import mongoose, {Schema} from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    uid: String,
    name: String,
    file: Buffer,
    imageProps: Schema.Types.Mixed,
		mime: String,
		type: String,
		encoding: String,
		size: Number,
		url: String,
		metaUrl: String,
    createdby: String,
    updatedby: String,
  },
  {timestamps: true},
);


const File = mongoose.model("File", fileSchema);

export {fileSchema, File};