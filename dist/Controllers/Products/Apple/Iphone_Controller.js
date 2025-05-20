import { sql } from "../../../Config/ConnectDB.js";
import supabaseClient from "../../../Config/SupaConnect.js";
const MIME_TYPES = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
};
const generateFileName = (originalName, mimetype) => {
    const name = originalName.replace(/\s+/g, "_").replace(/\.[^/.]+$/, "");
    const extension = MIME_TYPES[mimetype];
    return `${name}_${Date.now()}.${extension}`;
};
export const AddIphone = async (req, res) => {
    let filename = "";
    try {
        const { phone_name, phone_ram, phone_rom, phone_screen_type, phone_curved_screen, phone_screen_size, phone_screen_resolution, phone_chip, phone_main_camera, phone_selfie, phone_dual_sim, phone_esim, phone_battery, phone_ai_integrated, phone_wired_charging, phone_wireless_charging, phone_mark, phone_type, phone_model, phone_price, phone_discount, phone_price_discount, phone_available_colors } = req.body;
        if (!phone_name || !phone_ram || !phone_rom || !phone_screen_type || !phone_curved_screen || !phone_screen_size || !phone_screen_resolution || !phone_chip || !phone_main_camera || !phone_selfie || !phone_dual_sim || !phone_esim || !phone_battery || !phone_ai_integrated || !phone_wired_charging || !phone_wireless_charging || !phone_mark || !phone_type || !phone_model || !phone_price || !phone_available_colors) {
            return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
        }
        if (phone_discount === "oui" && !phone_price_discount) {
            return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
        }
        let discountPrice = null;
        if (phone_discount === "oui" && phone_price_discount.trim() !== "") {
            discountPrice = Number(phone_price_discount);
        }
        if (!req.file) {
            return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
        }
        const existingProduct = await sql `select phone_id from iphones where phone_name = ${phone_name}`;
        if (existingProduct.length > 0) {
            return res.status(409).json({ ErrorMsg: "Produit déjà existant !" });
        }
        filename = generateFileName(req.file.originalname, req.file.mimetype);
        const { data, error } = await supabaseClient.storage
            .from("items-pictures")
            .upload(filename, req.file.buffer, { contentType: req.file.mimetype });
        if (error) {
            console.error("Supabase Upload Error:", error);
            return res.status(500).json({ ErrorMsg: "Erreur lors du téléchargement de l'image" });
        }
        const supabaseUrl = process.env.SUPABASE_URL;
        if (!supabaseUrl) {
            throw new Error("SUPABASE_URL is not defined in the environment variables.");
        }
        const pictureUrl = `${supabaseUrl}/storage/v1/object/public/items-pictures/${filename}`;
        const newIphone = await sql `
      insert into iphones (phone_name, product_picture, phone_ram, phone_rom, phone_screen_type, phone_curved_screen, phone_screen_size, phone_screen_resolution, phone_chip, phone_main_camera, phone_selfie, phone_dual_sim, phone_esim, phone_battery, phone_ai_integrated, phone_wired_charging, phone_wireless_charging, phone_mark, phone_type, phone_model, phone_price, phone_discount, phone_price_discount, phone_available_colors)
      values (${phone_name}, ${pictureUrl}, ${phone_ram}, ${phone_rom}, ${phone_screen_type}, ${phone_curved_screen}, ${Number(phone_screen_size)}, ${phone_screen_resolution}, ${phone_chip}, ${Number(phone_main_camera)}, ${Number(phone_selfie)}, ${phone_dual_sim}, ${phone_esim}, ${Number(phone_battery)}, ${phone_ai_integrated}, ${phone_wired_charging}, ${phone_wireless_charging}, ${phone_mark}, ${phone_type}, ${phone_model}, ${Number(phone_price)}, ${phone_discount}, ${discountPrice}, ${phone_available_colors})
      returning *
    `;
        console.log("newIphone :", newIphone);
        return res.status(201).json({ SuccessMsg: "Nouvel iPhone ajouté !" });
    }
    catch (error) {
        console.error("AddIphone Error:", error);
        if (filename) {
            const { error: deleteError } = await supabaseClient
                .storage
                .from("items-pictures")
                .remove([filename]);
            if (deleteError) {
                console.error("Image delete error:", deleteError.message);
            }
            else {
                console.log("Image successfully deleted after error.");
            }
        }
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
export const GetAllPhones = async (req, res) => {
    try {
        const allPhones = await sql `select * from iphones`;
        if (allPhones.length === 0) {
            return res.status(404).json({ ErrorMsg: "Aucun iPhone trouvé !" });
        }
        return res.status(200).json(allPhones);
    }
    catch (error) {
        console.error("GetAllPhones Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
export const GetPhoneById = async (req, res) => {
    try {
        const { id } = req.params;
        const receivedId = Number(id);
        if (isNaN(receivedId)) {
            return res.status(400).json({ ErrorMsg: "Invalid phone ID" });
        }
        const item = await sql `select * from iphones where phone_id = ${receivedId}`;
        if (item.length === 0) {
            return res.status(404).json({ ErrorMsg: "iPhone not found" });
        }
        return res.status(200).json(item[0]);
    }
    catch (error) {
        console.error("GetPhoneById Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
