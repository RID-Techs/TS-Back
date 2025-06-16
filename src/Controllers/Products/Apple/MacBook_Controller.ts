import { sql } from "../../../Config/ConnectDB.js";
import {v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import supabaseClient from "../../../Config/SupaConnect.js";
import { Macbook_Types } from "../../../Types/all_types.js";

const MIME_TYPES: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
}
const generateFileName = (originalName: string, mimetype: string): string => {
  const name = originalName.replace(/\s+/g, "_").replace(/\.[^/.]+$/, "");
  const extension = MIME_TYPES[mimetype];
  return `${name}_${Date.now()}.${extension}`;
};

export const AddMacBook = async (req: Request, res: Response): Promise <Response |void> => {
  let filename = "";
  const random_id = uuidv4();
  console.log("Random ID:", random_id);
  try {
    const { computer_name, computer_ram, computer_rom, computer_screen_type, computer_screen_size, computer_screen_resolution, computer_touch_screen, computer_chip, computer_core_number, computer_integrated_graphics, computer_gpu_core_number, computer_neural_engine_core, computer_card_slot, computer_hdmi_port, computer_jack_port, computer_magsafe_port, computer_usbc_port, computer_usbc_port_number, computer_battery, computer_battery_autonomy, computer_os, computer_camera, computer_ai_integrated, computer_touch_id, computer_mark, computer_type, computer_model, computer_price, computer_discount, computer_price_discount, computer_release_date } = req.body as Macbook_Types;
    if (!random_id || !computer_name || !computer_ram || !computer_rom || !computer_screen_type || !computer_screen_size || !computer_screen_resolution || !computer_touch_screen || !computer_chip || !computer_core_number || !computer_integrated_graphics || !computer_gpu_core_number || !computer_neural_engine_core || !computer_card_slot || !computer_hdmi_port || !computer_jack_port || !computer_magsafe_port || !computer_usbc_port || !computer_usbc_port_number || !computer_battery || !computer_battery_autonomy || !computer_os || !computer_camera || !computer_ai_integrated || !computer_touch_id || !computer_mark || !computer_type || !computer_model || !computer_price ||!computer_release_date) {
      console.log("Body:" ,req.body);
      return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
    }

    if (computer_discount === "oui" && !computer_price_discount) {
        return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
      }

    let discountPrice: number | null = null;
    if (computer_discount === "oui" && computer_price_discount.trim() !== "") {
      discountPrice = Number(computer_price_discount);
    }

    if(!req.file) {
      return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
    }

    const existingProduct = await sql`select computer_id from imacbook where computer_name = ${computer_name}`;

    if(existingProduct.length > 0){
      return res.status(409).json({ ErrorMsg: "Produit déjà existant !" });
    }

    filename = generateFileName(req.file.originalname, req.file.mimetype);

    const { data, error } = await supabaseClient.storage
    .from("items-pictures")
    .upload(filename, req.file.buffer, {contentType: req.file.mimetype})
    if (error) {
      console.error("Supabase Upload Error:", error);
      return res.status(500).json({ ErrorMsg: "Erreur lors du téléchargement de l'image" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is not defined in the environment variables.");
    }

    const pictureUrl = `${supabaseUrl}/storage/v1/object/public/items-pictures/${filename}`
    

    const NewMacBook = await sql`
      insert into imacbook (public_id, computer_name, product_picture, computer_ram, computer_rom, computer_screen_type, computer_screen_size, computer_screen_resolution, computer_touch_screen, computer_chip, computer_core_number, computer_integrated_graphics, computer_gpu_core_number, computer_neural_engine_core, computer_card_slot, computer_hdmi_port, computer_jack_port, computer_magsafe_port, computer_usbc_port, computer_usbc_port_number, computer_battery, computer_battery_autonomy, computer_os, computer_camera, computer_ai_integrated, computer_touch_id, computer_mark, computer_type, computer_model, computer_price, computer_discount, computer_price_discount, computer_release_date)
      values (${random_id}, ${computer_name}, ${pictureUrl}, ${computer_ram}, ${computer_rom}, ${computer_screen_type}, ${Number(computer_screen_size)}, ${computer_screen_resolution}, ${computer_touch_screen}, ${computer_chip}, ${Number(computer_core_number)}, ${computer_integrated_graphics}, ${Number(computer_gpu_core_number)}, ${Number(computer_neural_engine_core)}, ${computer_card_slot}, ${computer_hdmi_port}, ${computer_jack_port}, ${computer_magsafe_port}, ${computer_usbc_port}, ${Number(computer_usbc_port_number)}, ${computer_battery}, ${computer_battery_autonomy}, ${computer_os}, ${Number(computer_camera)}, ${computer_ai_integrated}, ${computer_touch_id}, ${computer_mark}, ${computer_type}, ${computer_model}, ${Number(computer_price)}, ${computer_discount}, ${discountPrice}, ${computer_release_date})
      returning *
    `;
    console.log("new MacBook :", NewMacBook);
    
    return res.status(201).json({ SuccessMsg: "Nouveau MacBook ajouté !"});
  } catch (error) {
    console.error("AddIphone Error:", error);
    if (filename) {
            const { error: deleteError } = await supabaseClient
              .storage
              .from("items-pictures")
              .remove([filename]);
              
            if (deleteError) {
          console.error("Image delete error:", deleteError.message);
        } else {
          console.log("Image successfully deleted after error.");
        }
          }
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const GetAllMacBooks = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const allMacBooks = await sql`select * from imacbook`;
    if(allMacBooks.length === 0) {
      return res.status(404).json({ ErrorMsg: "Aucun MacBook trouvé !" });
    }
    const computerWithoutId = allMacBooks.map(({ computer_id, ...rest }) => rest);
    return res.status(200).json(computerWithoutId);
  } catch (error) {
    console.error("GetAllMacBooks Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const GetMacBookById = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const { id } = req.params;
    const receivedId = id;
    if (!receivedId) {
      return res.status(400).json({ ErrorMsg: "Invalid MacBook ID" });
    }
    const item = await sql`select * from imacbook where public_id = ${receivedId}`;
    if (item.length === 0) {
      return res.status(404).json({ ErrorMsg: "MacBook not found" });
    }
    const receivedItem = item[0];
    const { computer_id, ...rest } = receivedItem;
    return res.status(200).json(rest);
  } catch (error) {
    console.error("GetMacBookById Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}