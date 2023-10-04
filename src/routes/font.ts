import { Router } from "express";
import { getFontConfigByName, getFontFamilySpecs, getFontFromLocal } from "../controllers/font";

const router = Router();

router.get("/font/config/:name", getFontConfigByName);
router.get("/font/:name/:style?/:weight?", );
router.get("/f-local/:family/:specs?", getFontFromLocal);
router.get("/f/:family/:specs?", getFontFamilySpecs);

export default router;