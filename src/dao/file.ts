import { FilterQuery, UpdateQuery } from "mongoose";
import { File } from "../models/File";
import { IFile } from "../types/entity.interface";

export async function saveFiles(files: Array<IFile>) {
	return await File.insertMany(files);
}

export async function query(query: FilterQuery<IFile>) {
	return await File.find(query || {}).lean();
}

export async function saveOrUpdateFile(filter: FilterQuery<IFile>, update: UpdateQuery<IFile>) {
	return await File.findOneAndUpdate(filter, update, {
		new: true, // Return new record, else old is returned
		upsert: true,
	});
}