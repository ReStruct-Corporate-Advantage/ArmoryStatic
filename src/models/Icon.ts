// **** Variables **** //
import mongoose from "mongoose";
import { ITag } from "../types/entity.interface";

const iconMetaSchema = new mongoose.Schema({
  name: String,
  group: String,
  description: {
    type: String,
    default: "",
  },
  tags: Array<ITag>,
  meta: {
    size: String,
    downloadTimes: Number,
    favoriteTimes: Number,
  },
  createdby: String,
  updtedby: String,
});

const iconSchema = new mongoose.Schema(
  {
    name: String,
    icon: String,
    createdby: String,
    updtedby: String,
  },
  {timestamps: true},
);


const Icon = mongoose.model("Icon", iconSchema);
const IconMeta = mongoose.model("IconMeta", iconMetaSchema);

export {iconSchema, Icon, iconMetaSchema, IconMeta};