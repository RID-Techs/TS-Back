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

export const AddGalaxyBuds = async (req: Request, res: Response): Promise <Response |void> => {
  let filename = "";
  try {
    const { galaxybuds_name, galaxybuds_mark, galaxybuds_type, galaxybuds_model, galaxybuds_voice_isolation, galaxybuds_active_noise_cancellation, galaxybuds_listening_time, galaxybuds_conversation_time, galaxybuds_listening_time_anc, galaxybuds_conversation_time_anc, galaxybuds_bluetooth_version, galaxybuds_price, galaxybuds_discount, galaxybuds_price_discount } = req.body;
    if (!galaxybuds_name || !galaxybuds_mark || !galaxybuds_type || !galaxybuds_model || !galaxybuds_voice_isolation || !galaxybuds_active_noise_cancellation || !galaxybuds_listening_time || !galaxybuds_conversation_time || !galaxybuds_listening_time_anc || !galaxybuds_conversation_time_anc || !galaxybuds_bluetooth_version || !galaxybuds_price) {
      console.log("Body:" ,req.body);
      return res.status(400).json({ ErrorMsg: "Veuillez remplir tous les champs !" });
    }

    if (galaxybuds_discount === "oui" && !galaxybuds_price_discount) {
        return res.status(400).json({ ErrorMsg: "Veuillez renseigner le prix promotionnel." });
      }

    let discountPrice: number | null = null;
    if (galaxybuds_discount === "oui" && galaxybuds_price_discount.trim() !== "") {
      discountPrice = Number(galaxybuds_price_discount);
    }

    if(!req.file) {
      return res.status(400).json({ ErrorMsg: "Veuillez ajouter une image !" });
    }

    const existingProduct = await sql`select galaxybuds_id from galaxy_buds where galaxybuds_name = ${galaxybuds_name}`;

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
    

    const NewGalaxyBuds = await sql`
      insert into galaxy_buds (galaxybuds_name, product_picture, galaxybuds_mark, galaxybuds_type, galaxybuds_model, galaxybuds_voice_isolation, galaxybuds_active_noise_cancellation, galaxybuds_listening_time, galaxybuds_conversation_time, galaxybuds_listening_time_anc, galaxybuds_conversation_time_anc, galaxybuds_bluetooth_version, galaxybuds_price, galaxybuds_discount, galaxybuds_price_discount)
      values (${galaxybuds_name}, ${pictureUrl}, ${galaxybuds_mark}, ${galaxybuds_type}, ${galaxybuds_model}, ${galaxybuds_voice_isolation}, ${galaxybuds_active_noise_cancellation}, ${galaxybuds_listening_time}, ${galaxybuds_conversation_time}, ${galaxybuds_listening_time_anc}, ${galaxybuds_conversation_time_anc}, ${galaxybuds_bluetooth_version}, ${Number(galaxybuds_price)}, ${galaxybuds_discount}, ${discountPrice})
      returning *
    `;
    console.log("new Galaxy Buds :", NewGalaxyBuds);
    
    return res.status(201).json({ SuccessMsg: "Nouveau Galaxy Buds ajouté !"});
  } catch (error) {
    console.error("AddGalaxyBuds Error:", error);
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

export const GetAllBuds = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const allBuds = await sql`select * from galaxy_buds`;
    if(allBuds.length === 0) {
      return res.status(404).json({ ErrorMsg: "Aucun Buds trouvé !" });
    }
    return res.status(200).json(allBuds);
  } catch (error) {
    console.error("GetAllBuds Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}

export const GetBudsById = async (req: Request, res: Response): Promise <Response | void> => {
  try {
    const { id } = req.params;
    const receivedId = Number(id);
    if (isNaN(receivedId)) {
      return res.status(400).json({ ErrorMsg: "Invalid phone ID" });
    }
    const item = await sql`select * from galaxy_buds where galaxybuds_id = ${receivedId}`;
    if (item.length === 0) {
      return res.status(404).json({ ErrorMsg: "Buds not found" });
    }
    return res.status(200).json(item[0]);
  } catch (error) {
    console.error("GetPhoneById Error:", error);
    return res.status(500).json({ ErrorMsg: "Server error" });
  }
}