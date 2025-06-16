import { sql } from "../../../Config/ConnectDB.js";
import {v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import supabaseClient from "../../../Config/SupaConnect.js";
import { Galaxy_Phones } from "../../../Types/all_types.js";

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

export const AddGalaxyPhone = async (req: Request, res: Response): Promise <Response |void> => {
  let filename = "";
  const random_id = uuidv4();
  console.log("Random ID:", random_id);
  try {
    const { phone_name, phone_ram, phone_rom, phone_screen_type, phone_curved_screen, phone_screen_size, phone_screen_resolution, phone_chip, phone_rear_camera_captors_number, phone_rear_camera_captors, phone_front_camera_captors_number, phone_front_camera_captors, phone_recording_video_def, phone_dual_sim, phone_esim, phone_card_slot, phone_dex, phone_fingerprint, phone_stylus, phone_battery, phone_galaxy_ai, phone_wired_charging, phone_wireless_charging, phone_mark, phone_type, phone_model, phone_price, phone_discount, phone_price_discount, phone_available_colors, phone_release_date} = req.body as Galaxy_Phones;
    if (!random_id || !phone_name || !phone_ram || !phone_rom || !phone_screen_type || !phone_curved_screen || !phone_screen_size || !phone_screen_resolution || !phone_chip || !phone_rear_camera_captors_number || !phone_rear_camera_captors || !phone_front_camera_captors_number || !phone_front_camera_captors || !phone_recording_video_def || !phone_dual_sim || !phone_esim || !phone_card_slot || !phone_dex || !phone_fingerprint || !phone_stylus || !phone_battery || !phone_galaxy_ai || !phone_wired_charging || !phone_wireless_charging || !phone_mark || !phone_type || !phone_model || !phone_price || !phone_available_colors || !phone_release_date) {
      console.log("Body:" ,req.body);
      return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
    }

    if (phone_discount === "oui" && !phone_price_discount) {
        return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
      }

    let discountPrice: number | null = null;
    if (phone_discount === "oui" && phone_price_discount.trim() !== "") {
      discountPrice = Number(phone_price_discount);
    }

    if(!req.file) {
      return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
    }

    const existingProduct = await sql`select phone_id from iphones where phone_name = ${phone_name}`;

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
    

    const newGalaxyPhone = await sql`
      insert into galaxy_phones (public_id, phone_name, product_picture, phone_ram, phone_rom, phone_screen_type, phone_curved_screen, phone_screen_size, phone_screen_resolution, phone_chip, phone_rear_camera_captors_number, phone_rear_camera_captors, phone_front_camera_captors_number, phone_front_camera_captors, phone_recording_video_def, phone_dual_sim, phone_esim, phone_card_slot, phone_dex, phone_fingerprint, phone_stylus, phone_battery, phone_galaxy_ai, phone_wired_charging, phone_wireless_charging, phone_mark, phone_type, phone_model, phone_price, phone_discount, phone_price_discount, phone_available_colors, phone_release_date)
      values (${random_id}, ${phone_name}, ${pictureUrl}, ${phone_ram}, ${phone_rom}, ${phone_screen_type}, ${phone_curved_screen}, ${Number(phone_screen_size)}, ${phone_screen_resolution}, ${phone_chip}, ${phone_rear_camera_captors_number}, ${phone_rear_camera_captors}, ${phone_front_camera_captors_number}, ${phone_front_camera_captors}, ${phone_recording_video_def}, ${phone_dual_sim}, ${phone_esim}, ${phone_card_slot}, ${phone_dex}, ${phone_fingerprint}, ${phone_stylus}, ${Number(phone_battery)}, ${phone_galaxy_ai}, ${phone_wired_charging}, ${phone_wireless_charging}, ${phone_mark}, ${phone_type}, ${phone_model}, ${Number(phone_price)}, ${phone_discount}, ${discountPrice}, ${phone_available_colors}, ${phone_release_date})
      returning *
    `;
    console.log("new Samsung :", newGalaxyPhone);
    
    return res.status(201).json({ SuccessMsg: "Nouveau Samsung Galaxy ajouté !"});
  } catch (error) {
    console.error("AddSamsung Error:", error);

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

export const GetAllPhones = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const allPhones = await sql`select * from galaxy_phones`;
    if(allPhones.length === 0) {
      return res.status(404).json({ ErrorMsg: "Aucun Smartphone Trouvé !" });
    }
    const phonesWithoutId = allPhones.map(({ phone_id, ...rest }) => rest);
    return res.status(200).json(phonesWithoutId);
  } catch (error) {
    console.error("GetAllPhones Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const GetPhoneById = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const { id } = req.params;
    const receivedId = id;
    if (!receivedId) {
      return res.status(400).json({ ErrorMsg: "Invalid phone ID" });
    }
    const item = await sql`select * from galaxy_phones where public_id = ${receivedId}`;
    if (item.length === 0) {
      return res.status(404).json({ ErrorMsg: "Smartphone not found" });
    }
    const receivedItem = item[0];
    const { phone_id, ...rest } = receivedItem;
    return res.status(200).json(rest);
  } catch (error) {
    console.error("GetPhoneById Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}