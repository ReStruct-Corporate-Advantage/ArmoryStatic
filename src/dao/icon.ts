import { IIcon, IIconMeta, Icon, IconMeta } from "../models/Icon";
import { ITag, Tag } from "../models/Tag";

export async function saveIcons(icons: Array<IIcon>) {
	return await Icon.insertMany(icons);
}

export async function saveIconsMeta(iconsMeta: Array<IIconMeta>) {
	return await IconMeta.insertMany(iconsMeta);
}

export async function getAllIconsMeta() {
	return await IconMeta.find({});
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