import { Request, Response, Router } from "express";

const router = Router();

router.get(["/"], function (req: Request, res: Response) {
	res.send("Returning Image!");
});

export default router;