import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pinsRouter from "./pins";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pinsRouter);

export default router;
