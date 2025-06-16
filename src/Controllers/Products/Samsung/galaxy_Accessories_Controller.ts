import { sql } from "../../../Config/ConnectDB.js";
import {v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import supabaseClient from "../../../Config/SupaConnect.js";
import { Samsung_Accessories_Types } from "../../../Types/all_types.js";

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

export const AddSamsungAccessories = async (req: Request, res: Response): Promise <Response |void> => {
  let filename = "";
  const random_id = uuidv4();
  console.log("Random ID:", random_id);
  try {
    const { samsung_accessories_name, samsung_accessories_description, samsung_accessories_mark, samsung_accessories_type, samsung_accessories_price, samsung_accessories_discount, samsung_accessories_price_discount, samsung_accessories_release_date} = req.body as Samsung_Accessories_Types;
    if (!random_id || !samsung_accessories_name || !samsung_accessories_description || !samsung_accessories_mark || !samsung_accessories_type || !samsung_accessories_price || !samsung_accessories_release_date) {
      console.log("Body:" ,req.body);
      return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
    }

    if (samsung_accessories_discount === "oui" && !samsung_accessories_price_discount) {
        return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
      }

    let discountPrice: number | null = null;
    if (samsung_accessories_discount === "oui" && samsung_accessories_price_discount.trim() !== "") {
      discountPrice = Number(samsung_accessories_price_discount);
    }

    if(!req.file) {
      return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
    }

    const existingProduct = await sql`select samsung_accessories_id from galaxy_accessories where samsung_accessories_name = ${samsung_accessories_name}`;

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
    

    const NewSamsungAccessories = await sql`
      insert into galaxy_accessories (public_id, samsung_accessories_name, product_picture, samsung_accessories_description, samsung_accessories_mark, samsung_accessories_type, samsung_accessories_price, samsung_accessories_discount, samsung_accessories_price_discount, samsung_accessories_release_date)
      values (${random_id}, ${samsung_accessories_name}, ${pictureUrl}, ${samsung_accessories_description}, ${samsung_accessories_mark}, ${samsung_accessories_type}, ${Number(samsung_accessories_price)}, ${samsung_accessories_discount}, ${discountPrice}, ${samsung_accessories_release_date})
      returning *
    `;
    console.log("new Samsung Accessory :", NewSamsungAccessories);
    
    return res.status(201).json({ SuccessMsg: "Nouvel accessoire Samsung ajouté !"});
  } catch (error) {
    console.error("AddSamsungAccessories Error:", error);
    if (filename) {
      console.log("Filo :", filename);
      
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

export const GetAllSamsungAccessories = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const allSamsungAccessories = await sql`select * from galaxy_accessories`;
    if(allSamsungAccessories.length === 0) {
      return res.status(404).json({ ErrorMsg: "Aucun Accessoire trouvé !" });
    }
    const samsungAccessoriesWithoutId = allSamsungAccessories.map(({ samsung_accessories_id, ...rest }) => rest);
    return res.status(200).json(samsungAccessoriesWithoutId);
  } catch (error) {
    console.error("GetAllSamsungAccessories Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const GetSamsungAccessoriesById = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const { id } = req.params;
    const receivedId = id;
    if (!receivedId) {
      return res.status(400).json({ ErrorMsg: "Invalid tablet ID" });
    }
    const item = await sql`select * from galaxy_accessories where public_id = ${receivedId}`;
    if (item.length === 0) {
      return res.status(404).json({ ErrorMsg: "Samsung Accessories not found" });
    }
    const receivedItem = item[0];
    const { samsung_accessories_id, ...rest } = receivedItem;
    return res.status(200).json(rest);
  } catch (error) {
    console.error("GetSamsungAccessoriesById Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const GetSamsungAccessoriesByQuery = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const accessoryquery = req.query.accessoryquery;
    const receivedQuery = typeof accessoryquery === "string" ? accessoryquery : "";
    if (receivedQuery === undefined || receivedQuery === "") {
      return res.status(400).json({ ErrorMsg: "Query parameter is required" });
    }
    const item = await sql`select * from galaxy_accessories where samsung_accessories_type ilike ${`%${receivedQuery}%`}`;
    if (item.length === 0) {
      return res.status(404).json({ ErrorMsg: "Samsung Accessories not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    console.error("GetSamsungAccessoriesById Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}