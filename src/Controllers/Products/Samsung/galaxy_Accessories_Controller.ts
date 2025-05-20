import { sql } from "../../../Config/ConnectDB.js";
import { Request, Response } from "express";
import supabaseClient from "../../../Config/SupaConnect.js";

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
  try {
    const { samsung_accessories_name, samsung_accessories_description, samsung_accessories_mark, samsung_accessories_price, samsung_accessories_discount, samsung_accessories_price_discount} = req.body;
    if (!samsung_accessories_name || !samsung_accessories_description || !samsung_accessories_mark || !samsung_accessories_price) {
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
      insert into galaxy_accessories (samsung_accessories_name, product_picture, samsung_accessories_description, samsung_accessories_mark, samsung_accessories_price, samsung_accessories_discount, samsung_accessories_price_discoun)
      values (${samsung_accessories_name}, ${pictureUrl}, ${samsung_accessories_description}, ${samsung_accessories_mark}, ${Number(samsung_accessories_price)}, ${samsung_accessories_discount}, ${discountPrice})
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
    return res.status(200).json(allSamsungAccessories);
  } catch (error) {
    console.error("GetAllSamsungAccessories Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const GetSamsungAccessoriesById = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const { id } = req.params;
    const receivedId = Number(id);
    if (isNaN(receivedId)) {
      return res.status(400).json({ ErrorMsg: "Invalid item ID" });
    }
    const item = await sql`select * from galaxy_accessories where samsung_accessories_id = ${receivedId}`;
    if (item.length === 0) {
      return res.status(404).json({ ErrorMsg: "Samsung Accessories not found" });
    }
    return res.status(200).json(item[0]);
  } catch (error) {
    console.error("GetSamsungAccessoriesById Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}