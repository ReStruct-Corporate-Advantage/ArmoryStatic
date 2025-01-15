import { Request, Response, Router } from "express";

const router = Router();
const secureRouter = Router();

router.get(["/"], function (req: Request, res: Response) {
	res.send("Returning Image!");
});

secureRouter.get(["/"], function (req: Request, res: Response) {
	res.send("Returning Image!");
});

export {secureRouter as secureImageRouter};
export default router;