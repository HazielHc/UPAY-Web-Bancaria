import  {Router}  from "express";
import { register, login, googleLogin} from "../controllers/authController.js"
import { authMiddlewares } from "../middlewares/authMiddleware.js";

const router = Router();

router.get(
    "/test",
    (req, res) => {
        res.json({
            message: "Jalando con todo"
        });
    }
);

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

router.get(
    "/profile",
    authMiddlewares,
    (req, res) => {
        res.json({
            message: "Acceso autorizado",
            user : req.user
        });
    }
);

export default router;