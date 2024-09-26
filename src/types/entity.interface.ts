import {ObjectId} from "mongoose";
import { SCOPES, TAG_STATES } from "./types";

export interface HOSTS {
  development: string
  production: string
}

export interface IFile {
	_id?: ObjectId | string
	name: string
	size: number;
  file: Buffer;
  imageProps?: {[key: string]: number | string | boolean}
	type: string;
	encoding: string;
	url: string;
  uid: string
  createdby: string
  updatedby?: string
  createdAt?: string
  updatedAt?: string
}


export interface ITag {
	_id?: ObjectId | string
	name: string
	state?: TAG_STATES
	weightage?: number
	scope?: SCOPES
}


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
