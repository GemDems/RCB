import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import submitLeadRouter from "./submit-lead";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(submitLeadRouter);

export default router;
