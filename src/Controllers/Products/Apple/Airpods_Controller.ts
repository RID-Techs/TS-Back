import { sql } from "../../../Config/ConnectDB.js";
import {v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import supabaseClient from "../../../Config/SupaConnect.js";
import { Airpods_Types } from "../../../Types/all_types.js";

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

export const AddAirPods = async (req: Request, res: Response): Promise <Response |void> => {
  let filename = "";
  const random_id = uuidv4();
  console.log("Random ID:", random_id);
  try {
    const { airpods_name, airpods_mark, airpods_type, airpods_model, airpods_voice_isolation, airpods_active_noise_cancellation, airpods_listening_time, airpods_conversation_time, airpods_listening_time_anc, airpods_conversation_time_anc, airpods_bluetooth_version, airpods_price, airpods_discount, airpods_price_discount, airpods_release_date } = req.body as Airpods_Types;
    if (!random_id || !airpods_name || !airpods_mark || !airpods_type || !airpods_model || !airpods_voice_isolation || !airpods_active_noise_cancellation || !airpods_listening_time || !airpods_conversation_time || !airpods_listening_time_anc || !airpods_conversation_time_anc || !airpods_bluetooth_version || !airpods_price || !airpods_release_date) {
      console.log("Body:" ,req.body);
      return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
    }

    if (airpods_discount === "oui" && !airpods_price_discount) {
        return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
      }

    let discountPrice: number | null = null;
    if (airpods_discount === "oui" && airpods_price_discount.trim() !== "") {
      discountPrice = Number(airpods_price_discount);
    }

    if(!req.file) {
      return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
    }

    const existingProduct = await sql`select airpods_id from ipods where airpods_name = ${airpods_name}`;

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
    

    const NewAirPods = await sql`
      insert into ipods (public_id, airpods_name, product_picture, airpods_mark, airpods_type, airpods_model, airpods_voice_isolation, airpods_active_noise_cancellation, airpods_listening_time, airpods_conversation_time, airpods_listening_time_anc, airpods_conversation_time_anc, airpods_bluetooth_version, airpods_price, airpods_discount, airpods_price_discount, airpods_release_date)
      values (${random_id}, ${airpods_name}, ${pictureUrl}, ${airpods_mark}, ${airpods_type}, ${airpods_model}, ${airpods_voice_isolation}, ${airpods_active_noise_cancellation}, ${airpods_listening_time}, ${airpods_conversation_time}, ${airpods_listening_time_anc}, ${airpods_conversation_time_anc}, ${airpods_bluetooth_version}, ${Number(airpods_price)}, ${airpods_discount}, ${discountPrice}, ${airpods_release_date})
      returning *
    `;
    console.log("new Airpods :", NewAirPods);
    
    return res.status(201).json({ SuccessMsg: "Nouveau AirPods ajouté !"});
  } catch (error) {
    console.error("AddAirPods Error:", error);
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

export const GetAllAirpods = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const allAirpods = await sql`select * from ipods`;
    if(allAirpods.length === 0) {
      return res.status(404).json({ ErrorMsg: "Aucun Airpods trouvé !" });
    }
    const airpodsWithoutId = allAirpods.map(({ airpods_id, ...rest }) => rest);
    return res.status(200).json(airpodsWithoutId);
  } catch (error) {
    console.error("GetAllAirpods Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const GetAirpodsById = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const { id } = req.params;
    const receivedId = id;
    if (!receivedId) {
      return res.status(400).json({ ErrorMsg: "Invalid Airpods ID" });
    }
    const item = await sql`select * from ipods where public_id = ${receivedId}`;
    if (item.length === 0) {
      return res.status(404).json({ ErrorMsg: "Airpods not found" });
    }
    const receivedItem = item[0];
    const { airpods_id, ...rest } = receivedItem;
    return res.status(200).json(rest);
  } catch (error) {
    console.error("GetAirpodsById Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}