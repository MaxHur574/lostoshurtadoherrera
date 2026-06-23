import { Router }                        from "express";
import { validateToken }                  from "../config/auth.js";
import { getProgress, updateProgress }    from "../controllers/progress.controller.js";

const router = Router();

router.get("/",  validateToken, getProgress);
router.put("/",  validateToken, updateProgress);

export default router;