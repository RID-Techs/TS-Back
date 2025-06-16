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
export const AddAppleAccessories = async (req, res) => {
    let filename = "";
    const random_id = uuidv4();
    console.log("Random ID:", random_id);
    try {
        const { apple_accessories_name, apple_accessories_description, apple_accessories_mark, apple_accessories_type, apple_accessories_price, apple_accessories_discount, apple_accessories_price_discount, apple_accessories_release_date } = req.body;
        if (!random_id || !apple_accessories_name || !apple_accessories_description || !apple_accessories_mark || !apple_accessories_type || !apple_accessories_price || !apple_accessories_discount || !apple_accessories_release_date) {
            console.log("Body:", req.body);
            return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
        }
        if (apple_accessories_discount === "oui" && !apple_accessories_price_discount) {
            return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
        }
        let discountPrice = null;
        if (apple_accessories_discount === "oui" && apple_accessories_price_discount.trim() !== "") {
            discountPrice = Number(apple_accessories_price_discount);
        }
        if (!req.file) {
            return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
        }
        const existingProduct = await sql `select apple_accessories_id from iaccessories where apple_accessories_name = ${apple_accessories_name}`;
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
        const NewAppleAccessories = await sql `
      insert into iaccessories (public_id, apple_accessories_name, product_picture, apple_accessories_description, apple_accessories_mark, apple_accessories_type, apple_accessories_price, apple_accessories_discount, apple_accessories_price_discount, apple_accessories_release_date)
      values (${random_id}, ${apple_accessories_name}, ${pictureUrl}, ${apple_accessories_description}, ${apple_accessories_mark}, ${apple_accessories_type}, ${Number(apple_accessories_price)}, ${apple_accessories_discount}, ${discountPrice}, ${apple_accessories_release_date})
      returning *
    `;
        console.log("new Apple Accessory :", NewAppleAccessories);
        return res.status(201).json({ SuccessMsg: "Nouvel accessoire Apple ajouté !" });
    }
    catch (error) {
        console.error("AddAppleAccessories Error:", error);
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
export const GetAllAppleAccessories = async (req, res) => {
    try {
        const allAppleAccessories = await sql `select * from iaccessories`;
        if (allAppleAccessories.length === 0) {
            return res.status(404).json({ ErrorMsg: "Aucun Accessoire trouvé !" });
        }
        const accessoriesWithoutId = allAppleAccessories.map(({ apple_accessories_id, ...rest }) => rest);
        return res.status(200).json(accessoriesWithoutId);
    }
    catch (error) {
        console.error("GetAllAppleAccessories Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
export const GetAppleAccessoriesById = async (req, res) => {
    try {
        const { id } = req.params;
        const receivedId = id;
        if (!receivedId) {
            return res.status(400).json({ ErrorMsg: "Invalid MacBook ID" });
        }
        const item = await sql `select * from iaccessories where public_id = ${receivedId}`;
        if (item.length === 0) {
            return res.status(404).json({ ErrorMsg: "Apple Accessories not found" });
        }
        const receivedItem = item[0];
        const { apple_accessories_id, ...rest } = receivedItem;
        return res.status(200).json(rest);
    }
    catch (error) {
        console.error("GetAppleAccessoriesById Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
export const GetAppleAccessoriesByQuery = async (req, res) => {
    try {
        const phonequery = req.query.phonequery;
        const receivedQuery = typeof phonequery === "string" ? phonequery : "";
        if (receivedQuery === undefined || receivedQuery === "") {
            return res.status(400).json({ ErrorMsg: "Query parameter is required" });
        }
        const item = await sql `select * from iaccessories where apple_accessories_type ilike ${`%${receivedQuery}%`}`;
        if (item.length === 0) {
            return res.status(404).json({ ErrorMsg: "Apple Accessories not found" });
        }
        return res.status(200).json(item);
    }
    catch (error) {
        console.error("GetAppleAccessoriesById Error:", error);
        return res.status(500).json({ ErrorMsg: "Server error" });
    }
};
