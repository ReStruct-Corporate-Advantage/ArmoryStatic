import {Request, Response} from "express";
import renderLottie from "puppeteer-lottie";

export async function lottieToMP4(req: Request, res: Response) {
	const {lottie, name} = req.body;
	try {
		const filename = name ? name.endsWith(".mp4") ? name : name + ".mp4" : lottie?.nm ? lottie.nm + ".mp4" : "generated.mp4";
		const fileLocation = `/Users/mohit/__Projects__/ArmoryStatic/${filename}`;
		await renderLottie({
			animationData: lottie,
			output: filename,
		});
		res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
		res.setHeader("Content-Type", "video/mp4");
		res.download(fileLocation, (err) => err && res.status(404).send("File not found"));
	} catch (error) {
		console.error("Error generating Lottie animation:", error);
		res.status(500).send("Internal Server Error");
	}
}

export async function lottieToGif(req: Request, res: Response) {
	const {lottie, name} = req.body;
	try {
		const filename = name ? name.endsWith(".gif") ? name : name + ".gif" : lottie?.nm ? lottie.nm + ".gif" : "generated.gif";
		const fileLocation = `/Users/mohit/__Projects__/ArmoryStatic/${filename}`;
		await renderLottie({
			animationData: lottie,
			output: filename,
			width: 640,
		});
		res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
		res.setHeader("Content-Type", "image/gif");
		res.download(fileLocation, (err) => err && res.status(404).send("File not found"));
	} catch (error) {
		console.error("Error generating Lottie animation:", error);
		res.status(500).send("Internal Server Error");
	}
}

export async function lottieToSvg(req: Request, res: Response) {
	const {lottie} = req.body;
}

export async function lottieToPng(req: Request, res: Response) {
	const {lottie} = req.body;
	return await renderLottie;
}