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
	const format = Helper.getFontTypeFromAgent(userAgent as string);
	params.format = format;
	let returnFonts;
	const configName = name.replace(/\+/g, " ");
	/* eslint-ignore @typescript-eslint/no-explicit-any */
	const fontConfig: any = FONTS_CONFIG[configName as keyof object];
	const isLocalHost = req.hostname === "localhost" || req.hostname === "127.0.0.1";
	const listenPort = (global as any).ARMCOSTATIC.appConfig?.app?.port || process.env.APP_PORT || 8081;
	const host = isLocalHost ? `http://localhost:${listenPort}/api` : "https://static.armco.tech";
	params.host = host;
	if (!fontConfig) {
		res.send("Couldn't find descriptor for the requested font: " + name + ". Please check it's spelled properly");
	}
	if (format === "woff2") {
		returnFonts = fontConfig.subsets && fontConfig.subsets.reduce((acc: string, subset: string) => {
			params.subset = subset;
			return acc + Helper.generateFont(name, fontConfig, params);
		}, "");
	} else {
		returnFonts = Helper.generateFont(name, fontConfig, params);
	}
	res.setHeader("Content-Type", "text/css; charset=utf-8");
	res.send(returnFonts);
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