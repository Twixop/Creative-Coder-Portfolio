import { Router, type IRouter } from "express";
import chatbotRecruteurRouter from "./chatbot-recruteur";
import contactRouter from "./contact";
import healthRouter from "./health";
import projectsRouter from "./projects";
import weatherRouter from "./weather";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(contactRouter);
router.use(chatbotRecruteurRouter);
router.use(weatherRouter);

export default router;
