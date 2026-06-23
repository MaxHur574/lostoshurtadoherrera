import { Router } from "express";
import { validateToken } from "../config/auth.js";
import { login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", validateToken, login);

export default router;