import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { Request, Response } from "express";
import axios from "axios";

import * as dao from "../dao/file";
import API_CONFIG from "../config/api-config";
import { HOSTS, IFile } from "../types/entity.interface";
import ENDPOINTS from "../config/endpoints";

/**
 * Controller to upload, update and get images (with metadata), and upload documents, both from list of allowed mime types
 * TODO: Images endpoints can be moved to dedicated image router
 * There are two types of doc and image endpoints exposed here and have there corresponding routers, private and open ones
 * private files need to be served over secure router (/secure endpoint) and public ones should not have authentication or authorization
 * Similary upload use cases can be public upload (no private or secure marker in file) or private where a private key is added in file metadata
 * to protect it if requested over public endpoint.
 * Upload when done by user manually should always be private, but if a file is requested by another armco service it can be deemed for public use
 * TODO: When a file is added from another armco service, that service should send it's secret along with to armco static which can then be used to
 * determine if the file can be uploaded without private marker.
 * Update image doesn't need a public endpoint, as it's never expected that another armco service might update a file metadata (until and unless the use case arises some day)
 *
 * @param req
 * @param res
 * @param isRaw
 */
const validDocMimeTypes = [
	"text/plain",
	"text/html",
	"text/csv",
	"application/rtf",
	"application/json",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.oasis.opendocument.text",
	"application/vnd.oasis.opendocument.spreadsheet",
	"application/vnd.oasis.opendocument.presentation",
];

const validImageMimeTypes = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"image/tiff",
	"image/bmp",
	"image/x-icon",
];

const HOST = API_CONFIG.IAM[(process.env.NODE_ENV || "development") as keyof HOSTS];
const URLPATH = ENDPOINTS.IAM.ROOT + ENDPOINTS.IAM.USERS.ROOT + ENDPOINTS.IAM.USERS.FIND;

export const getPublic = (req: Request, res: Response, isRaw?: boolean) => {
	logger.info("[FILE][GET] Received a request to fetch a file with metadata over public endpoint");
	logger.info("[FILE][GET] User details won't be validated");
	const uid = req.params.uid;
	try {
		return dao.query({uid, $or: [
			{ secure: { $exists: false } },
			{ secure: { $ne: true } },
		]}).then((response) => {
			const fileRecord = response[0];
			if (fileRecord) {
				logger.info("[FILE][GET] Fetched requested file successfully, returning...");
				if (isRaw) {
					const mimeType = fileRecord.mime || "text/plain"; // Default to plain text if no MIME type found
					return res.status(200).type(mimeType).send(fileRecord.file?.buffer); // Set headers before sending data
				} else {
					return res.status(200).json(fileRecord);
				}
			} else {
				logger.info("[FILE][GET] A public file with given UID could not be located, returning 404...");
				return res.status(404).json({error: "Couldn't locate the file with given UUID"});
			}
		});
	} catch (error) {
		logger.error("[FILE][GET] Error fetching file from database:", error);
		return res.status(500).json({error: "Error storing file in database."});
	}
};

export const getSecure = (req: Request, res: Response, isRaw?: boolean) => {
	logger.info("[FILE][GETSECURE] Received a request to fetch a file with metadata");
	logger.info("[FILE][GETSECURE] Verifying user details of requesting user");
	const userInfo = (req as Request & {decoded: {username: string}}).decoded;
	const username = userInfo?.username;
	const uid = req.params.uid;

	if (username) {
		return axios.get(`${HOST}${URLPATH}?username=${username}`,
			{headers: {"x-access-token": req.cookies["x-access-token"]}})
			.then((axiosRes) => {
				const user = axiosRes.data;
				if (!user) {
					logger.error("[FILE][GETSECURE] User details not found, rejecting request.");
					return res.status(401).json({error: "Not authenticated"});
				}
				logger.info("[FILE][GETSECURE] User details found, fetching file record.");
				try {
					return dao.query({uid, secure: true}).then((response) => {
						const fileRecord = response[0];
						if (fileRecord) {
							logger.info("[FILE][GETSECURE] Fetched requested file successfully, returning record...");
							if (isRaw) {
								const mimeType = fileRecord.mime || "text/plain"; // Default to plain text if no MIME type found
								return res.status(200).type(mimeType).send(fileRecord.file?.buffer); // Set headers before sending data
							} else {
								return res.status(200).json(fileRecord);
							}
						} else {
							logger.info("[FILE][GETSECURE] File with given UID could not be located, returning 404...");
							return res.status(404).json({error: "Couldn't locate the file with given UUID"});
						}
					});
				} catch (error) {
					logger.error("[FILE][GETSECURE] Error fetching file from database:", error);
					return res.status(500).json({error: "Error storing file in database."});
				}
		})
		.catch(() => {
			logger.error("[FILE][GETSECURE] User details could not be fetched, rejecting request.");
			return res.status(500).json({error: "Couldn't authenticate user, rejecting request..."});
		});
	} else {
		logger.error("[FILE][GETSECURE] Missing user details, cancelling operation");
		return res.status(401).json({error: "Not authenticated"});
	}
};

export const uploadPrivateImage = (req: Request, res: Response) => {
	logger.info("[FILE][UPLOADPRIVATEIMAGE] Received a request to save an image");
	let files = req.files as Express.Multer.File[] | undefined;
	if (!files || files.length === 0) {
		logger.warn("[FILE][UPLOADPRIVATEIMAGE] File not present, returning...");
		return res.status(400).json({error: "No file uploaded."});
	}
	files = files.filter((fileObj: Express.Multer.File) => validImageMimeTypes.indexOf(fileObj.mimetype) > -1);

	if (files.length === 0) {
		logger.warn("[FILE][UPLOADPRIVATEIMAGE] Invalid documents, returning...");
		return res.status(400).json({error: "Uploaded files are not image or are of unknown type."});
	}

	logger.info("[FILE][UPLOADPRIVATEIMAGE] Verifying user details of requesting user");
	const userInfo = (req as Request & {decoded: {username: string}}).decoded;
	const username = userInfo?.username;

	if (username) {
		const token = req.headers["x-access-token"] || req.cookies["x-access-token"];
		return axios.get(`${HOST}${URLPATH}?username=${username}`,
			{headers: {"x-access-token": token}})
			.then((axiosRes) => {
				const user = axiosRes.data;
				if (!user) {
					logger.error("[FILE][UPLOADPRIVATEIMAGE] User details not found, file won't be uploaded.");
					return res.status(401).json({error: "Not authenticated"});
				}
				logger.info("[FILE][UPLOADPRIVATEIMAGE] User details found, proceeding with file upload.");
				const filesMeta = files?.map((file) => {
					const uid = randomUUID();
					return {
						...file,
						uid,
						createdby: user.username,
						updatedby: user.username,
						name: file.originalname,
						mime: file.mimetype,
						type: "image",
						url: API_CONFIG.STATIC_HOST[(process.env.NODE_ENV || "development") as keyof HOSTS] + ENDPOINTS.FILE.ROOT + ENDPOINTS.FILE.RAW + "/" + uid,
						metaUrl: API_CONFIG.STATIC_HOST[(process.env.NODE_ENV || "development") as keyof HOSTS] + ENDPOINTS.FILE.ROOT + ENDPOINTS.FILE.GET + uid,
						file: file.buffer,
						secure: true,
					};
				});
				try {
					return filesMeta && dao.saveFiles(filesMeta).then((response) => {
						logger.info("[FILE][UPLOADPRIVATEIMAGE] All images uploaded successfully");
						return res.status(200).json({message: "File stored successfully.", saved: response});
					});
				} catch (error) {
					logger.error("[FILE][UPLOADPRIVATEIMAGE] Error storing file in database:", error);
					return res.status(500).json({error: "Error storing file in database."});
				}
		})
		.catch(() => {
			logger.error("[FILE][UPLOADPRIVATEIMAGE] User details could not be fetched, rejecting request.");
			return res.status(500).json({error: "Couldn't authenticate user, aborting upload..."});
		});
	} else {
		logger.error("[FILE][UPLOADPRIVATEIMAGE] Missing user details, cancelling operation");
		return res.status(401).json({error: "Not authenticated"});
	}
};

export const uploadPublicImage = (req: Request, res: Response) => {
	logger.info("[FILE][UPLOADPUBLICIMAGE] Received a request to save an image");
	let files = req.files as Express.Multer.File[] | undefined;
	if (!files || files.length === 0) {
		logger.warn("[FILE][UPLOADPUBLICIMAGE] File not present, returning...");
		return res.status(400).json({error: "No file uploaded."});
	}
	files = files.filter((fileObj: Express.Multer.File) => validImageMimeTypes.indexOf(fileObj.mimetype) > -1);

	if (files.length === 0) {
		logger.warn("[FILE][UPLOADPUBLICIMAGE] Invalid documents, returning...");
		return res.status(400).json({error: "Uploaded files are not image or are of unknown type."});
	}

	logger.warn("[FILE][UPLOADPUBLICIMAGE] Attempting public upload of file, user details will not be verified!!");
	const filesMeta = files?.map((file) => {
		const uid = randomUUID();
		return {
			...file,
			uid,
			createdby: "ARMCO",
			updatedby: "ARMCO",
			name: file.originalname,
			mime: file.mimetype,
			type: "image",
			url: API_CONFIG.STATIC_HOST[(process.env.NODE_ENV || "development") as keyof HOSTS] + ENDPOINTS.FILE.ROOT + ENDPOINTS.FILE.RAW + "/" + uid,
			metaUrl: API_CONFIG.STATIC_HOST[(process.env.NODE_ENV || "development") as keyof HOSTS] + ENDPOINTS.FILE.ROOT + ENDPOINTS.FILE.GET + uid,
			file: file.buffer,
		};
	});

	try {
		return filesMeta && dao.saveFiles(filesMeta).then((response) => {
			logger.info("[FILE][UPLOADPUBLICIMAGE] All images uploaded successfully");
			return res.status(200).json({message: "File stored successfully.", saved: response});
		});
	} catch (error) {
		logger.error("[FILE][UPLOADPUBLICIMAGE] Error storing file in database:", error);
		return res.status(500).json({error: "Error storing file in database."});
	}
};

export const updatePrivateImage = async (req: Request, res: Response) => {
	logger.info("[FILE][UPDATEIMAGE] Received a request to update multiple image metadata records");
	let updates = req.body; // Expecting an array of objects with { uid, ...updateData }

	if (!updates || Array.isArray(updates)) {
		if (updates.length === 0) {
			logger.warn("[FILE][UPDATEIMAGE] Invalid input, missing files...");
			return res.status(400).json({ error: "Invalid input, missing files..." });
		}
	} else {
		updates = [updates];
	}

	const userInfo = (req as Request & { decoded: { username: string } }).decoded;
	const username = userInfo?.username;

	if (username) {
		return axios.get(`${HOST}${URLPATH}?username=${username}`,
			{headers: {"x-access-token": req.cookies["x-access-token"]}})
			.then((axiosRes) => {
				const user = axiosRes.data;
				if (!user) {
					logger.error("[FILE][UPDATEIMAGE] User details not found, file won't be uploaded.");
					return res.status(401).json({error: "Not authenticated"});
				}
				try {
						Promise.all(updates.map((update: IFile) =>
								dao.saveOrUpdateFile({uid: update.uid}, {
										imageProps: update.imageProps,
										updatedby: username,
								})
						)).then((results) => {
							logger.info("[FILE][UPDATEIMAGE] Image metadata updated successfully for supplied records");
							return res.status(200).json({ message: "Image metadata updated successfully for supplied records.", updated: results });
						}).catch((e) => {
							logger.error("[FILE][UPDATEIMAGE] Failed to update Image metadata for supplied records, returning...", e);
							return res.status(500).json({ error: "Failed to update Image metadata for supplied records." });
						});
				} catch (error) {
						logger.error("[FILE][UPDATEIMAGE] Error updating image metadata in database:", error);
						return res.status(500).json({ error: "Error updating image metadata in database." });
				}
				return;
			})
			.catch(() => {
				logger.error("[FILE][UPDATEIMAGE] User details could not be fetched, rejecting request.");
				return res.status(500).json({error: "Couldn't authenticate user, aborting upload..."});
			});
	} else {
		logger.error("[FILE][UPDATEIMAGE] Missing user details, cancelling operation");
		return res.status(401).json({error: "Not authenticated"});
	}
};

export async function getFromFS(req: Request, res: Response) {
  const filename = req.params.uid;
	const projectRoot = path.join(__dirname, "../..");
  const filePath = path.join(projectRoot, "assets", "images", filename);

  try {
    const fileData = fs.readFileSync(filePath); // Assuming text file for simplicity
		res.setHeader("Content-Type", "image/png"); // Assuming PNG for testing
		return res.send(fileData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error reading file" });
  }
}

export const uploadPrivateDoc = (req: Request, res: Response) => {
	logger.info("[FILE][UPLOADPRIVATEDOC] Received a request to save a document");
	let files = req.files as Express.Multer.File[] | undefined;
	if (!files || files.length === 0) {
		logger.warn("[FILE][UPLOADPRIVATEDOC] File not present, returning...");
		return res.status(400).json({error: "No file uploaded."});
	}
	files = files.filter((fileObj: Express.Multer.File) => validDocMimeTypes.indexOf(fileObj.mimetype) > -1);

	if (files.length === 0) {
		logger.warn("[FILE][UPLOADPRIVATEDOC] Invalid document type, returning...");
		return res.status(400).json({error: "Uploaded file is not of a valid document type."});
	}

	logger.info("[FILE][UPLOADPRIVATEDOC] Verifying user details of requesting user");
	const userInfo = (req as Request & {decoded: {username: string}}).decoded;
	const username = userInfo?.username;

	if (username) {
		return axios.get(`${HOST}${URLPATH}?username=${username}`, {headers: {"x-access-token": req.cookies["x-access-token"]}})
			.then((axiosRes) => {
				const user = axiosRes.data;
				if (!user) {
					logger.error("[FILE][UPLOADPRIVATEDOC] User details not found, file won't be uploaded.");
					return res.status(401).json({error: "Not authenticated"});
				}
				logger.info("[FILE][UPLOADPRIVATEDOC] User details found, proceeding with file upload.");
				const filesMeta = files?.map((file) => {
					const uid = randomUUID();
					return {
						...file,
						uid,
						createdby: user.username,
						updatedby: user.username,
						name: file.originalname,
						mime: file.mimetype,
						type: "document",
						url: API_CONFIG.STATIC_HOST[(process.env.NODE_ENV || "development") as keyof HOSTS] + ENDPOINTS.FILE.ROOT + ENDPOINTS.FILE.RAW + "/" + uid,
						metaUrl: API_CONFIG.STATIC_HOST[(process.env.NODE_ENV || "development") as keyof HOSTS] + ENDPOINTS.FILE.ROOT + ENDPOINTS.FILE.GET + uid,
						file: file.buffer,
						secure: true,
					};
				});

				try {
						return filesMeta && dao.saveFiles(filesMeta).then((response) => {
							logger.info("[FILE][UPLOADPRIVATEDOC] All documents uploaded successfully");
							return res.status(200).json({message: "File stored successfully.", saved: response});
						});
				} catch (error) {
						logger.error("[FILE][UPLOADPRIVATEDOC] Error storing file in database:", error);
						return res.status(500).json({error: "Error storing file in database."});
				}
			})
			.catch(() => {
				logger.error("[FILE][UPLOADPRIVATEDOC] User details could not be fetched, rejecting request.");
				return res.status(500).json({error: "Couldn't authenticate user, aborting upload..."});
			});
	} else {
		logger.error("[FILE][UPLOADPRIVATEDOC] Missing user details, cancelling operation");
		return res.status(401).json({error: "Not authenticated"});
	}
};

export const uploadPublicDoc = (req: Request, res: Response) => {
	logger.info("[FILE][UPLOADPUBLICDOC] Received a request to save a document");
	let files = req.files as Express.Multer.File[] | undefined;
	if (!files || files.length === 0) {
		logger.warn("[FILE][UPLOADPUBLICDOC] File not present, returning...");
		return res.status(400).json({error: "No file uploaded."});
	}
	files = files.filter((fileObj: Express.Multer.File) => validDocMimeTypes.indexOf(fileObj.mimetype) > -1);

	if (files.length === 0) {
		logger.warn("[FILE][UPLOADPUBLICDOC] Invalid document type, returning...");
		return res.status(400).json({error: "Uploaded file is not of a valid document type."});
	}

	logger.warn("[FILE][UPLOADPUBLICDOC] Attempting public upload, user details will not be verified!!");

	const filesMeta = files?.map((file) => {
		const uid = randomUUID();
		return {
			...file,
			uid,
			createdby: "ARMCO",
			updatedby: "ARMCO",
			name: file.originalname,
			mime: file.mimetype,
			type: "document",
			url: API_CONFIG.STATIC_HOST[(process.env.NODE_ENV || "development") as keyof HOSTS] + ENDPOINTS.FILE.ROOT + ENDPOINTS.FILE.RAW + "/" + uid,
			metaUrl: API_CONFIG.STATIC_HOST[(process.env.NODE_ENV || "development") as keyof HOSTS] + ENDPOINTS.FILE.ROOT + ENDPOINTS.FILE.GET + uid,
			file: file.buffer,
		};
	});

	try {
			return filesMeta && dao.saveFiles(filesMeta).then((response) => {
				logger.info("[FILE][UPLOADPUBLICDOC] All documents uploaded successfully");
				return res.status(200).json({message: "File stored successfully.", saved: response});
			});
	} catch (error) {
			logger.error("[FILE][UPLOADPUBLICDOC] Error storing file in database:", error);
			return res.status(500).json({error: "Error storing file in database."});
	}
};
