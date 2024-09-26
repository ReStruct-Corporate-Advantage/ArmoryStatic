import { Router } from "express";

import iconRouter from "./icon";
import fontRouter from "./font";
import fileRouter from "./file";
import imageRouter from "./image";
import configRouter from "./config";
import lottieRouter from "./lottie";

const router = Router();

router.use("/icon", iconRouter);
router.use("/font", fontRouter);
router.use("/secure/file", fileRouter);
router.use("/image", imageRouter);
router.use("/secure/config", configRouter);
router.use("/lottie", lottieRouter);

export default router;