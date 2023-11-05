import { Router } from "express";
import {addIcon, addTag, getIcon, getIcons, getAllIcons, getAllTags, getIconsPage, incorrectUrlFormathandler, populateToDb,
	genMore, findAndAttemptGenMissing, genMoreByCount, genDirectories, getIconClusters, getIconJuice, addTags} from "../controllers/icon";

const router = Router();

router.get(["/"], incorrectUrlFormathandler);
router.get("/download/:src", getIcons);
router.get("/clusters", getIconClusters);
router.post("/secure/add", addIcon);
router.get("/all/:color?/:size?/:className?", getAllIcons);
router.get("/page/:color?/:size?/:className?", getIconsPage);
router.get("/all-for-ml", getIconJuice);
router.get("/tag/all", getAllTags);
router.post("/secure/tag/add", addTag);
router.post("/secure/tags/add", addTags);
router.get("/gen", genMore);
router.get("/dir-gen", genDirectories);
router.post("/gen-by-count", genMoreByCount);
router.post("/check", findAndAttemptGenMissing);
router.get("/:source/:name/:color?/:size?/:className?", getIcon);


// Careful with this one
router.get("/populate", populateToDb);

export default router;
