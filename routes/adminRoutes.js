import express from "express";
const router = express.Router();
import { login } from "../controllers/adminController.js";

router.post('/login', login);


export default router;