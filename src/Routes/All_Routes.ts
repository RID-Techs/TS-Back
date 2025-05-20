import userRoute from "./User_Route.js";
import itemsOrderListRoute from "./Order_List_Route/ItemsOrderListRoute.js";
import AppleRoutes from "./Apple/Apple_Routes.js";
import SamsungRoutes from "./Samsung/Samsung_Routes.js";
import { Router } from "express";

const router = Router();
router.use("/user", userRoute);
router.use("/items", itemsOrderListRoute);
router.use("/apple/items", AppleRoutes);
router.use("/samsung/items", SamsungRoutes);

export default router;