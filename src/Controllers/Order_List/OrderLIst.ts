import {Request, Response} from "express"
import { sql } from "../../Config/ConnectDB.js";

type Item = {
  name: string;
  price: number;
  quantity: number;
};

export const OrderListFunc = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { user_surname, user_firstname, items, items_uid, items_total_price, user_country, user_city, user_contact } = req.body as {
    user_surname: string;
    user_firstname: string;
    items: Item[];
    items_uid: string;
    items_total_price: string;
    user_country: string;
    user_city: string;
    user_contact: string;
  };

  if(!user_surname || !user_firstname || !items || !items_uid || !user_country || !user_city || !user_contact || !items_total_price) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (items.length === 0) {
    return res.status(400).json({ message: "Items list cannot be empty" });
  }
  if (items.some(item => !item.name || !item.price || !item.quantity)) {
    return res.status(400).json({ message: "All item fields are required" });
  }
  if (items.some(item => item.price <= 0 || item.quantity <= 0)) {
    return res.status(400).json({ message: "Item price and quantity must be greater than 0" });
  }

  const insertNewOrder = await sql`
    insert into order_list 
    (user_surname, user_firstname, items, items_uid, items_total_price, user_country, user_city, user_contact)
    values (${user_surname}, ${user_firstname}, ${JSON.stringify(items)}, ${items_uid}, ${items_total_price}, ${user_country}, ${user_city}, ${user_contact})
    returning items_uid, user_surname, user_firstname, items, items_total_price, user_country, user_city, user_contact
  `;
  const newOrder = insertNewOrder[0];
  return res.status(201).json({ SuccessMsg: "Votre réçu est prêt !", newOrder });
  } catch (error) {
    console.log("Error fetching order list:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}