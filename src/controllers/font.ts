import {Request, Response} from "express";
import Helper from "../helper";
import FONTS_CONFIG from "../fonts/google-fonts";
import { download } from "../fonts";

export function getFontConfigByName(req: Request, res: Response) {
	const { name } = req.params;
	const fontConfig = FONTS_CONFIG[name as keyof Object];
	if (!fontConfig) {
		res.send("Unable to find descriptor for the requested font: " + name);
	}
	res.send(fontConfig);
}

export function getFont(req: Request, res: Response) {
	const { name, ...params } = req.params;
	const userAgent = req.get("User-Agent");
	const isLocalHost = req.hostname === "localhost" || req.hostname === "127.0.0.1";
	const returnFonts = Helper.processFontRequest(params, name, isLocalHost, userAgent);
	if (returnFonts === null) {
		res.send("Couldn't find descriptor for the requested font: " + name + ". Please check it's spelled properly");
		return;
	}
	res.setHeader("Content-Type", "text/css; charset=utf-8");
	res.send(returnFonts);
}

export async function getFontsPage(req: Request, res: Response) {
	try {
		const {pageSize, from, search, ...filters} = req.query;
		// if (filters && filters.tags) {
		// 	filters["tags.name"] = {$in: (filters.tags as string).split(",").map((tag: string) => tag.trim())};
		// 	delete filters.tags;
		// }
		if (search) {
			(filters as any).name = {$regex: new RegExp(search as string, "i")};
		}
		const initial = from ? +from : 0;
		const till = pageSize ? initial + +pageSize : initial + 30;
		const fontNames = (!search ?
				Object.keys(FONTS_CONFIG) :
				Object.keys(FONTS_CONFIG).filter((fontName: string) => fontName.toLowerCase().indexOf((search as string).toLowerCase()) > -1)
			)
			.splice(initial, till);
		const userAgent = req.get("User-Agent");
		const isLocalHost = req.hostname === "localhost" || req.hostname === "127.0.0.1";
		const returnFontGroups = fontNames.reduce((acc, fontName: string) => acc + Helper.processFontRequest({}, fontName, isLocalHost, userAgent), "");
		// const returnFontGroups = fontNames.map((fontName: string) => Helper.processFontRequest({}, fontName, isLocalHost, userAgent));
		res.setHeader("Content-Type", "text/css; charset=utf-8");
		res.status(200).send({fontNames, returnFontGroups});
	} catch (e) {
		logger.error("[IconController][getIconsPage] Failed to fetch icons");
		res.status(500).json({message: "Unable to fetch icon's page at the moment, please try again later!"});
	}
}

export function getFontFromLocal(req: Request, res: Response) {
	console.log("Received Request with params: ", req.params);
	const { family, specs } = req.params;
	const { fontFileName, contentType } = Helper.getFileNameAndContentTypeFromSpecs(family, specs);

	res.set("Content-Type", contentType);
	res.download("src/fonts/all/" + fontFileName);
}

export function getFontFamilySpecs (req: Request, res: Response) {
	console.log("Received Request with params: ", req.params);
	const { family, specs } = req.params;
	const { fontFileName, contentType } = Helper.getFileNameAndContentTypeFromSpecs(family, specs);
	// const promise = download(fontFileName, "fonts");
	// promise.then((response) => {
	//   const processed = Buffer.from(response);
	//   res.set("Content-Type", contentType);
	//   res.set("Content-Disposition", `attachment; filename="${fontFileName}"`);
	//   res.set("Content-Length", "" + processed.length);
	//   res.end(processed);
	// });
}