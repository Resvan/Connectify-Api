import express from "express";
import { createMessage, getMessages } from "../controllers/messageController.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();


/* Add */
router.post('/', createMessage);


/* Get */
router.get('/:converstationId', getMessages)


export default router;