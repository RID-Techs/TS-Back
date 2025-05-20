import { Router } from 'express';
import { OrderListFunc } from '../../Controllers/Order_List/OrderLIst.js';
const router = Router();
router.post("/order", async (req, res) => {
    OrderListFunc(req, res);
});
export default router;
