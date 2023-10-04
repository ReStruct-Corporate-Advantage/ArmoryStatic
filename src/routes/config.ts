import { Request, Response, Router } from "express";

const router = Router();

router.get("/:org/:space/:name", function (req: Request, res: Response) {
	res.send("Returning Config!");
});

export default router;
