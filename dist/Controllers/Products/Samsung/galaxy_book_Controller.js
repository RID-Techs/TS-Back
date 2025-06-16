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
export const AddGalaxyBook = async (req, res) => {
    let filename = "";
    const random_id = uuidv4();
    console.log("Random ID:", random_id);
    try {
        const { computer_name, computer_ram, computer_rom, computer_screen_type, computer_screen_size, computer_screen_resolution, computer_touch_screen, computer_anti_reflexive_glass, computer_chip, computer_chip_frequency, computer_core_number, computer_integrated_graphics, computer_npu, computer_card_slot, computer_hdmi_port, computer_jack_port, computer_usba_port, computer_usba_port_number, computer_usbc_port, computer_usbc_port_number, computer_battery, computer_battery_autonomy, computer_os, computer_camera, computer_ai_integrated, computer_copilot_key, computer_mark, computer_type, computer_model, computer_price, computer_discount, computer_price_discount, computer_release_date } = req.body;
        if (!random_id || !computer_name || !computer_ram || !computer_rom || !computer_screen_type || !computer_screen_size || !computer_screen_resolution || !computer_touch_screen || !computer_anti_reflexive_glass || !computer_chip || !computer_chip_frequency || !computer_core_number || !computer_integrated_graphics || !computer_npu || !computer_card_slot || !computer_hdmi_port || !computer_jack_port || !computer_usba_port || !computer_usba_port_number || !computer_usbc_port || !computer_usbc_port_number || !computer_battery || !computer_battery_autonomy || !computer_os || !computer_camera || !computer_ai_integrated || !computer_copilot_key || !computer_mark || !computer_type || !computer_model || !computer_price || !computer_release_date) {
            console.log("Body:", req.body);
            return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
        }
        if (computer_discount === "oui" && !computer_price_discount) {
            return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
        }
        let discountPrice = null;
        if (computer_discount === "oui" && computer_price_discount.trim() !== "") {
            discountPrice = Number(computer_price_discount);
        }
        if (!req.file) {
            return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
        }
        const existingProduct = await sql `select computer_id from galaxy_books where computer_name = ${computer_name}`;
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
        const newGalaxyBook = await sql `
      insert into galaxy_books (public_id, computer_name, product_picture, computer_ram, computer_rom, computer_screen_type, computer_screen_size, computer_screen_resolution, computer_touch_screen, computer_anti_reflexive_glass, computer_chip, computer_chip_frequency, computer_core_number, computer_integrated_graphics, computer_npu, computer_card_slot, computer_hdmi_port, computer_jack_port, computer_usba_port, computer_usba_port_number, computer_usbc_port, computer_usbc_port_number, computer_battery, computer_battery_autonomy, computer_os, computer_camera, computer_ai_integrated, computer_copilot_key, computer_mark, computer_type, computer_model, computer_price, computer_discount, computer_price_discount, computer_release_date)
      values (${random_id}, ${computer_name}, ${pictureUrl}, ${computer_ram}, ${computer_rom}, ${computer_screen_type}, ${Number(computer_screen_size)}, ${computer_screen_resolution}, ${computer_touch_screen}, ${computer_anti_reflexive_glass}, ${computer_chip}, ${computer_chip_frequency}, ${Number(computer_core_number)}, ${computer_integrated_graphics}, ${computer_npu}, ${computer_card_slot}, ${computer_hdmi_port}, ${computer_jack_port}, ${computer_usba_port}, ${Number(computer_usba_port_number)}, ${computer_usbc_port}, ${Number(computer_usbc_port_number)}, ${computer_battery}, ${computer_battery_autonomy}, ${computer_os}, ${Number(computer_camera)}, ${computer_ai_integrated}, ${computer_copilot_key}, ${computer_mark}, ${computer_type}, ${computer_model}, ${Number(computer_price)}, ${computer_discount}, ${discountPrice}, ${computer_release_date})
      returning *
    `;
        console.log("new Samsung :", newGalaxyBook);
        return res.status(201).json({ SuccessMsg: "Nouveau Samsung Galaxy Book ajouté !" });
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
export const GetAllGalaxyBooks = async (req, res) => {
    try {
        const allGalaxyBooks = await sql `select * from galaxy_books`;
        if (allGalaxyBooks.length === 0) {
            return res.status(404).json({ ErrorMsg: "Aucun Galaxy Book Trouvé !" });
        }
        const galaxyBookWithoutId = allGalaxyBooks.map(({ computer_id, ...rest }) => rest);
        return res.status(200).json(galaxyBookWithoutId);
    }
    catch (error) {
        console.error("GetAllGalaxyBooks Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
export const GetGalaxyBooksById = async (req, res) => {
    try {
        const { id } = req.params;
        const receivedId = id;
        if (!receivedId) {
            return res.status(400).json({ ErrorMsg: "Invalid tablet ID" });
        }
        const item = await sql `select * from galaxy_books where public_id = ${receivedId}`;
        if (item.length === 0) {
            return res.status(404).json({ ErrorMsg: "GalaxyBook not found" });
        }
        const receivedItem = item[0];
        const { computer_id, ...rest } = receivedItem;
        return res.status(200).json(rest);
    }
    catch (error) {
        console.error("GetGalaxyBooksById Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
