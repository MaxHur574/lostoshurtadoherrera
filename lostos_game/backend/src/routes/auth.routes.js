import { Router } from "express";
import { validateToken } from "../config/auth.js";
import { login, setUsername } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", validateToken, login);
router.put("/username", validateToken, setUsername);

export default router;