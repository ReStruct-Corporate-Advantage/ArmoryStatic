import { Request, Response, Router } from "express";
import { getPublic, getFromFS, getSecure, uploadPrivateImage, uploadPrivateDoc, updatePrivateImage, uploadPublicImage, uploadPublicDoc } from "../controllers/file";

const router = Router();
const secureRouter = Router();

router.get(["/:uid"], (req: Request, res: Response) => getPublic(req, res));
router.get("/raw/:uid", (req: Request, res: Response) => getPublic(req, res, true));
router.get("/rawfs/:uid", (req: Request, res: Response) => getFromFS(req, res));
router.post("/image", uploadPublicImage);
router.post("/doc", uploadPublicDoc);

secureRouter.get(["/:uid"], (req: Request, res: Response) => getSecure(req, res));
secureRouter.get("/raw/:uid", (req: Request, res: Response) => getSecure(req, res, true));
secureRouter.get("/rawfs/:uid", (req: Request, res: Response) => getFromFS(req, res));
secureRouter.post("/image", uploadPrivateImage);
secureRouter.put("/image", updatePrivateImage);
secureRouter.post("/doc", uploadPrivateDoc);

export {secureRouter as secureFileRouter};
export default router;
