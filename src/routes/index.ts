import { Router } from "express";

import iconRouter from "./icon";
import fontRouter from "./font";
import fileRouter, {secureFileRouter} from "./file";
import imageRouter, {secureImageRouter} from "./image";
import configRouter from "./config";
import lottieRouter from "./lottie";

const router = Router();

router.use("/icon", iconRouter);
router.use("/font", fontRouter);
router.use("/secure/file", secureFileRouter);
router.use("/file", fileRouter);
router.use("/secure/image", secureImageRouter);
router.use("/image", imageRouter);
router.use("/secure/config", configRouter);
router.use("/lottie", lottieRouter);

export default router;