import { Router } from "express";
import {createTicket, getTickets} from "../controllers/ticket.controller.js";

const router = Router()

router.post("/support-tickets", createTicket);
router.get("/support-tickets", getTickets);

export default router;