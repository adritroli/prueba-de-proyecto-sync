import { Router } from "express";
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } from "../controllers/notificationsController";

const router = Router();

router.get("/:userId", getUserNotifications);
router.put("/read/:id", markNotificationRead);
router.put("/read-all/:userId", markAllNotificationsRead);
router.delete("/clear-all/:userId", clearAllNotifications);

export default router;
