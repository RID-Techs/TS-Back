import { sql } from "../../../Config/ConnectDB.js";
import { v4 as uuidv4 } from "uuid";
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
export const AddIpad = async (req, res) => {
    let filename = "";
    const random_id = uuidv4();
    console.log("Random ID:", random_id);
    try {
        const { tablet_name, tablet_ram, tablet_rom, tablet_screen_type, tablet_curved_screen, tablet_screen_size, tablet_screen_resolution, tablet_chip, tablet_rear_camera_captors_number, tablet_rear_camera_captors, tablet_front_camera_captors_number, tablet_front_camera_captors, tablet_recording_video_def, tablet_physical_sim, tablet_esim, tablet_ai_integrated, tablet_touch_id, tablet_face_id, tablet_apple_pay, tablet_apple_pencil, tablet_magic_keyboard, tablet_battery, tablet_wired_charging, tablet_wireless_charging, tablet_mark, tablet_type, tablet_model, tablet_price, tablet_discount, tablet_price_discount, tablet_available_colors, tablet_release_date } = req.body;
        if (!random_id || !tablet_name || !tablet_ram || !tablet_rom || !tablet_screen_type || !tablet_curved_screen || !tablet_screen_size || !tablet_screen_resolution || !tablet_chip || !tablet_rear_camera_captors_number || !tablet_rear_camera_captors || !tablet_front_camera_captors_number || !tablet_front_camera_captors || !tablet_recording_video_def || !tablet_physical_sim || !tablet_esim || !tablet_touch_id || !tablet_face_id || !tablet_apple_pay || !tablet_apple_pencil || !tablet_magic_keyboard || !tablet_battery || !tablet_ai_integrated || !tablet_wired_charging || !tablet_wireless_charging || !tablet_mark || !tablet_type || !tablet_model || !tablet_price || !tablet_available_colors || !tablet_release_date) {
            console.log("Body:", req.body);
            return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
        }
        if (tablet_discount === "oui" && !tablet_price_discount) {
            return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
        }
        let discountPrice = null;
        if (tablet_discount === "oui" && tablet_price_discount.trim() !== "") {
            discountPrice = Number(tablet_price_discount);
        }
        if (!req.file) {
            return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
        }
        const existingProduct = await sql `select tablet_id from itabs where tablet_name = ${tablet_name}`;
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
        const newIpad = await sql `
      insert into itabs (public_id, tablet_name, product_picture, tablet_ram, tablet_rom, tablet_screen_type, tablet_curved_screen, tablet_screen_size, tablet_screen_resolution, tablet_chip, tablet_rear_camera_captors_number, tablet_rear_camera_captors, tablet_front_camera_captors_number, tablet_front_camera_captors, tablet_recording_video_def, tablet_physical_sim, tablet_esim, tablet_ai_integrated, tablet_touch_id, tablet_face_id, tablet_apple_pay, tablet_apple_pencil, tablet_magic_keyboard, tablet_battery, tablet_wired_charging, tablet_wireless_charging, tablet_mark, tablet_type, tablet_model, tablet_price, tablet_discount, tablet_price_discount, tablet_available_colors, tablet_release_date)
      values (${random_id}, ${tablet_name}, ${pictureUrl}, ${tablet_ram}, ${tablet_rom}, ${tablet_screen_type}, ${tablet_curved_screen}, ${Number(tablet_screen_size)}, ${tablet_screen_resolution}, ${tablet_chip}, ${tablet_rear_camera_captors_number}, ${tablet_rear_camera_captors}, ${tablet_front_camera_captors_number}, ${tablet_front_camera_captors}, ${tablet_recording_video_def}, ${tablet_physical_sim}, ${tablet_esim}, ${tablet_ai_integrated}, ${tablet_touch_id}, ${tablet_face_id}, ${tablet_apple_pay}, ${tablet_apple_pencil}, ${tablet_magic_keyboard}, ${Number(tablet_battery)}, ${tablet_wired_charging}, ${tablet_wireless_charging}, ${tablet_mark}, ${tablet_type}, ${tablet_model}, ${Number(tablet_price)}, ${tablet_discount}, ${discountPrice}, ${tablet_available_colors}, ${tablet_release_date})
      returning *
    `;
        console.log("new Ipad :", newIpad);
        return res.status(201).json({ SuccessMsg: "Nouvel Ipad ajouté !" });
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
export const GetAllIpads = async (req, res) => {
    try {
        const allIpads = await sql `select * from itabs`;
        if (allIpads.length === 0) {
            return res.status(404).json({ ErrorMsg: "Aucun Ipad trouvé !" });
        }
        const ipadWithoutId = allIpads.map(({ tablet_id, ...rest }) => rest);
        return res.status(200).json(ipadWithoutId);
    }
    catch (error) {
        console.error("GetAllIpads Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
export const GetIpadById = async (req, res) => {
    try {
        const { id } = req.params;
        const receivedId = id;
        if (!receivedId) {
            return res.status(400).json({ ErrorMsg: "Invalid tablet ID" });
        }
        const tablet = await sql `select * from itabs where public_id = ${receivedId}`;
        if (tablet.length === 0) {
            return res.status(404).json({ ErrorMsg: "Ipad not found" });
        }
        const receivedItem = tablet[0];
        const { tablet_id, ...rest } = receivedItem;
        return res.status(200).json(rest);
    }
    catch (error) {
        console.error("GetIpadById Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
