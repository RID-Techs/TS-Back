import { Router } from "express";
import { Login, SignUp } from "../Controllers/users/Users_Controller.js";
const router = Router();
router.post("/signup", async (req, res) => {
    await SignUp(req, res);
});
router.post("/login", async (req, res) => {
    await Login(req, res);
});
export default router;
