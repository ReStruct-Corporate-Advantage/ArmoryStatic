import { Router } from "express";
import {addIcon, addTag, getIcon, getIcons, getAllIcons, incorrectUrlFormathandler, populateToDb,
	genMore, findAndAttemptGenMissing, genMoreByCount, genDirectories, getIconClusters} from "../controllers/icon";

const router = Router();

router.get(["/"], incorrectUrlFormathandler);
router.get("/download/:src", getIcons);
router.get("/clusters", getIconClusters);
router.post("add", addIcon);
router.get("/all/:color?/:size?/:className?", getAllIcons);
router.post("/tag/add", addTag);
router.get("/gen", genMore);
router.get("/dir-gen", genDirectories);
router.post("/gen-by-count", genMoreByCount);
router.post("/check", findAndAttemptGenMissing);
router.get("/:source/:name/:color?/:size?/:className?", getIcon);

// Careful with this one
router.get("/populate", populateToDb);

export default router;
