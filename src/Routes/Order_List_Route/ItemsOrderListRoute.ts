import {Router, Request, Response} from 'express';
import { OrderListFunc } from '../../Controllers/Order_List/OrderLIst.js';

const router = Router();

router.post("/order", async (req: Request, res: Response) => {
  OrderListFunc(req, res);
})

export default router;