// **** Variables **** //
import mongoose, { ObjectId } from "mongoose";
import { ITag } from "./Tag";

export interface IMeta {
	size?: string
	downloadTimes?: number
	favoriteTimes?: number
}

export interface IIconMeta {
	_id?: ObjectId | string;
	name: string;
	group: string;
  description?: string
	tags?: Array<ITag>
	meta?: IMeta
  createdby: string
  updatedby?: string
  createdAt?: string
  updatedAt?: string
}

export interface IIcon {
	_id?: ObjectId | string
	name: string
  icon: string
  createdby: string
  updatedby?: string
  createdAt?: string
  updatedAt?: string
}


export interface IconResponse {
  name: string
  group: string
  svg: string
  tags?: Array<ITag>
	meta?: IMeta
  createdby: string
  updatedby?: string
  createdAt?: string
  updatedAt?: string
}

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