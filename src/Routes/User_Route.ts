import { Router, Request, Response } from "express";
import { Login, SignUp } from "../Controllers/users/Users_Controller.js";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  await SignUp(req, res);
});
router.post("/login", async (req: Request, res: Response) => {
  await Login(req, res);
});

export default router;
