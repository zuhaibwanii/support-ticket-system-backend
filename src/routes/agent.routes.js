import { Router } from "express";
import {createAgent, getAgents} from "../controllers/agent.controller.js";

const router = Router()

router.post("/support-agents", createAgent);
router.get("/support-agents", getAgents);

export default router;