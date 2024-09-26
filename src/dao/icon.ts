import { ObjectType } from "@armco/node-starter-kit/types/types";
import { Icon, IconMeta } from "../models/Icon";
import { Tag } from "../models/Tag";
import { IIcon, IIconMeta, ITag } from "../types/entity.interface";

export async function saveIcons(icons: Array<IIcon>) {
	return await Icon.insertMany(icons);
}

export async function saveIconsMeta(iconsMeta: Array<IIconMeta>) {
	return await IconMeta.insertMany(iconsMeta);
}

export async function getIconsBy(filter: any) {
	return await Icon.find(filter);
}

export async function getAllIconsMeta() {
	return await IconMeta.find({});
}

export async function getPageIconsMeta(skip: number, limit: number, filters?: ObjectType) {
	return await IconMeta.find(filters || {}).skip(skip).limit(limit);
}

export async function saveIcon(icon: IIcon) {
	return await Icon.create(icon);
}

export async function saveIconMeta(iconMeta: IIconMeta) {
	return await IconMeta.create(iconMeta);
}

export async function saveTag(tag: ITag) {
	return await Tag.create(tag);
}

export async function saveTags(tags: Array<ITag>) {
	return await Tag.insertMany(tags);
}