import { Router } from "express";
import {
	lottieToMP4,
	lottieToGif,
	lottieToSvg,
	lottieToPng,
} from "../controllers/lottie";

const router = Router();

router.get(["/"], (req, res) => res.json({message: "Welcome to Lottie Tools Page!"}));
router.post(["/to-mp4"], lottieToMP4);
router.post(["/to-gif"], lottieToGif);
router.post(["/to-svg"], lottieToSvg);
router.post(["/to-png"], lottieToPng);

export default router;
