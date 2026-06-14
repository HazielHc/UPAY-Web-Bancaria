import  Router  from "express";

const router = Router();

router.get(
    "/test",
    (req, res) => {
        res.json({
            message: "Jalando con todo"
        });
    }
);

export default router;