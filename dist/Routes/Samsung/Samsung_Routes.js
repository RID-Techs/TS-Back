import { Router } from "express";
import { upload } from "../../Middlewares/multer_mdw.js";
import { AddGalaxyPhone, GetAllPhones, GetPhoneById } from "../../Controllers/Products/Samsung/galaxy_Phone_Controller.js";
import { AddGalaxyTab, GetAllGalaxyTabs, GetGalaxyTabById } from "../../Controllers/Products/Samsung/galaxy_Tab_Controller.js";
import { AddGalaxyBook, GetAllGalaxyBooks, GetGalaxyBooksById } from "../../Controllers/Products/Samsung/galaxy_book_Controller.js";
import { AddGalaxyBuds, GetAllBuds, GetBudsById } from "../../Controllers/Products/Samsung/galaxy_Buds_Controller.js";
import { AddSamsungAccessories, GetAllSamsungAccessories, GetSamsungAccessoriesById } from "../../Controllers/Products/Samsung/galaxy_Accessories_Controller.js";
import { cookies_Auth } from "../../Middlewares/authCookies.js";
const router = Router();
router.post("/add/phone", upload, cookies_Auth, async (req, res) => {
    await AddGalaxyPhone(req, res);
});
router.post("/add/tablet", upload, cookies_Auth, async (req, res) => {
    await AddGalaxyTab(req, res);
});
router.post("/add/computer", upload, cookies_Auth, async (req, res) => {
    await AddGalaxyBook(req, res);
});
router.post("/add/buds", upload, cookies_Auth, async (req, res) => {
    await AddGalaxyBuds(req, res);
});
router.post("/add/accessories", upload, cookies_Auth, async (req, res) => {
    await AddSamsungAccessories(req, res);
});
router.get("/phone", async (req, res) => {
    await GetAllPhones(req, res);
});
router.get("/phone/:id", async (req, res) => {
    await GetPhoneById(req, res);
});
router.get("/tablet", async (req, res) => {
    await GetAllGalaxyTabs(req, res);
});
router.get("/tablet/:id", async (req, res) => {
    await GetGalaxyTabById(req, res);
});
router.get("/computer", async (req, res) => {
    await GetAllGalaxyBooks(req, res);
});
router.get("/computer/:id", async (req, res) => {
    await GetGalaxyBooksById(req, res);
});
router.get("/airpods", async (req, res) => {
    await GetAllBuds(req, res);
});
router.get("/airpods/:id", async (req, res) => {
    await GetBudsById(req, res);
});
router.get("/accessories", async (req, res) => {
    await GetAllSamsungAccessories(req, res);
});
router.get("/accessories/:id", async (req, res) => {
    await GetSamsungAccessoriesById(req, res);
});
export default router;
