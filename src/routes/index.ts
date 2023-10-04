import { Router } from "express";

import iconRouter from "./icon";
import fontRouter from "./font";
import docRouter from "./doc";
import imageRouter from "./image";
import configRouter from "./config";

const router = Router();

router.use("/icon", iconRouter);
router.use("/font", fontRouter);
router.use("/doc", docRouter);
router.use("/image", imageRouter);
router.use("/config", configRouter);

export default router;