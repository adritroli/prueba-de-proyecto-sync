import { Router } from "express";
import { getUserNotifications, markNotificationRead } from "../controllers/notificationsController";

const router = Router();

router.get("/:userId", getUserNotifications);
router.put("/read/:id", markNotificationRead);

export default router;
