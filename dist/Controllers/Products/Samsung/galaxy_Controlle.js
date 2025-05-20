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
export const AddGalaxyPhone = async (req, res) => {
    try {
        const { phone_name, phone_ram, phone_rom, phone_screen_type, phone_curved_screen, phone_screen_size, phone_screen_resolution, phone_chip, phone_main_camera, phone_selfie, phone_dual_sim, phone_esim, phone_card_slot, phone_dex, phone_fingerprint, phone_stylus, phone_battery, phone_ai_integrated, phone_wired_charging, phone_wireless_charging, phone_mark, phone_type, phone_model, phone_price, phone_available_colors } = req.body;
        if (!phone_name || !phone_ram || !phone_rom || !phone_screen_type || !phone_curved_screen || !phone_screen_size || !phone_screen_resolution || !phone_chip || !phone_main_camera || !phone_selfie || !phone_dual_sim || !phone_esim || !phone_card_slot || !phone_dex || !phone_fingerprint || !phone_stylus || !phone_battery || !phone_ai_integrated || !phone_wired_charging || !phone_wireless_charging || !phone_mark || !phone_type || !phone_model || !phone_price || !phone_available_colors) {
            console.log("Body:", req.body);
            return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
        }
        if (!req.file) {
            return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
        }
        const existingProduct = await sql `select phone_id from iphones where phone_name = ${phone_name}`;
        if (existingProduct.length > 0) {
            return res.status(409).json({ ErrorMsg: "Produit déjà existant !" });
        }
        const filename = generateFileName(req.file.originalname, req.file.mimetype);
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
        const newGalaxyPhone = await sql `
      insert into iphones (phone_name, product_picture, phone_ram, phone_rom, phone_screen_type, phone_curved_screen, phone_screen_size, phone_screen_resolution, phone_chip, phone_main_camera, phone_selfie, phone_dual_sim, phone_esim, phone_card_slot, phone_dex, phone_fingerprint, phone_stylus phone_battery, phone_ai_integrated, phone_wired_charging, phone_wireless_charging, phone_mark, phone_type, phone_model, phone_price, phone_available_colors)
      values (${phone_name}, ${pictureUrl}, ${phone_ram}, ${phone_rom}, ${phone_screen_type}, ${phone_curved_screen}, ${Number(phone_screen_size)}, ${phone_screen_resolution}, ${phone_chip}, ${Number(phone_main_camera)}, ${Number(phone_selfie)}, ${phone_dual_sim}, ${phone_esim}, ${phone_card_slot}, ${phone_dex}, ${phone_fingerprint}, ${phone_stylus}, ${Number(phone_battery)}, ${phone_ai_integrated}, ${phone_wired_charging}, ${phone_wireless_charging}, ${phone_mark}, ${phone_type}, ${phone_model}, ${Number(phone_price)}, ${phone_available_colors})
      returning *
    `;
        console.log("newIphone :", newGalaxyPhone);
        return res.status(201).json({ SuccessMsg: "Nouveau Samsung Galaxy ajouté !", newGalaxyPhone });
    }
    catch (error) {
        console.error("AddIphone Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
