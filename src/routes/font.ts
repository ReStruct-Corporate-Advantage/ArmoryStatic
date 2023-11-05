import { Router } from "express";
import { getFont, getFontConfigByName, getFontFamilySpecs, getFontFromLocal } from "../controllers/font";

const router = Router();

router.get("/config/:name", getFontConfigByName);
router.get("/local/:family/:specs?", getFontFromLocal);
router.get("/f/:family/:specs?", getFontFamilySpecs);
router.get("/:name/:style?/:weight?", getFont);

export default router;