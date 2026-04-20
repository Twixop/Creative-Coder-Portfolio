import { Router, type IRouter } from "express";
import contactRouter from "./contact";
import healthRouter from "./health";
import projectsRouter from "./projects";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(contactRouter);

export default router;
