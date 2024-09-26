import { Request, Response, Router } from "express";
import { get, getFromFS, updateImage, uploadDoc, uploadImage } from "../controllers/file";

const router = Router();

router.get(["/:uid"], (req: Request, res: Response) => get(req, res));
router.get("/raw/:uid", (req: Request, res: Response) => get(req, res, true));
router.get("/rawfs/:uid", (req: Request, res: Response) => getFromFS(req, res));
router.post("/image", uploadImage);
router.put("/image", updateImage);
router.post("/doc", uploadDoc);

export default router;
