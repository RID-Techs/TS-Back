import { Router } from "express";
import { AddIphone, GetAllPhones, GetPhoneById } from "../../Controllers/Products/Apple/Iphone_Controller.js";
import { upload } from "../../Middlewares/multer_mdw.js";
import { AddIpad, GetAllIpads, GetIpadById } from "../../Controllers/Products/Apple/Ipad_Controller.js";
import { AddMacBook, GetAllMacBooks, GetMacBookById } from "../../Controllers/Products/Apple/MacBook_Controller.js";
import { AddAirPods, GetAirpodsById, GetAllAirpods } from "../../Controllers/Products/Apple/Airpods_Controller.js";
import { AddAppleAccessories, GetAllAppleAccessories, GetAppleAccessoriesById, GetAppleAccessoriesByQuery } from "../../Controllers/Products/Apple/Apple_Accessories_Controller.js";
const router = Router();
router.post("/add/phone", upload, async (req, res) => {
    await AddIphone(req, res);
});
router.post("/add/tablet", upload, async (req, res) => {
    await AddIpad(req, res);
});
router.post("/add/computer", upload, async (req, res) => {
    await AddMacBook(req, res);
});
router.post("/add/airpods", upload, async (req, res) => {
    await AddAirPods(req, res);
});
router.post("/add/accessories", upload, async (req, res) => {
    await AddAppleAccessories(req, res);
});
router.get("/phone", async (req, res) => {
    await GetAllPhones(req, res);
});
router.get("/phone/:id", async (req, res) => {
    await GetPhoneById(req, res);
});
router.get("/tablet", async (req, res) => {
    await GetAllIpads(req, res);
});
router.get("/tablet/:id", async (req, res) => {
    await GetIpadById(req, res);
});
router.get("/computer", async (req, res) => {
    await GetAllMacBooks(req, res);
});
router.get("/computer/:id", async (req, res) => {
    await GetMacBookById(req, res);
});
router.get("/airpods", async (req, res) => {
    await GetAllAirpods(req, res);
});
router.get("/airpods/:id", async (req, res) => {
    await GetAirpodsById(req, res);
});
router.get("/accessories", async (req, res) => {
    await GetAllAppleAccessories(req, res);
});
router.get("/accessories/:id", async (req, res) => {
    await GetAppleAccessoriesById(req, res);
});
router.get("/queriedaccessories", async (req, res) => {
    await GetAppleAccessoriesByQuery(req, res);
});
export default router;
