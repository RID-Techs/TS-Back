import Jwt from 'jsonwebtoken';
import 'express';
import { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const cookies_Auth = (req: Request, res: Response, next: NextFunction): void => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const { access_token } = req.cookies;
  if(!access_token) {
    res.status(401).json({ ErrorMsg: "Accès non autorisé" });
    return;
  } else {
    if(!JWT_SECRET) {
      res.status(500).json({ ErrorMsg: "Token missing !" });
      return;
    }
    Jwt.verify(access_token, JWT_SECRET, (err: any, decoded: any) => {
      if(err) {
        console.log("Error: ", err);
        if(err.name === "TokenExpiredError") {
          return res.status(401).json({ ErrorMsg: "Token expired" });
        }
        if(err.name === "JsonWebTokenError") {
          return res.status(401).json({ ErrorMsg: "Invalid token" });
        }
        if(err.name === "NotBeforeError") {
          return res.status(401).json({ ErrorMsg: "Token not active" });
        }
        if(err.name === "SyntaxError") {
          return res.status(401).json({ ErrorMsg: "Token malformed" });
        }
        if(err.name === "TokenInvalidError") {
          return res.status(401).json({ ErrorMsg: "Invalid Token" });
        }
      } else {
        console.log("Decoded token: ", decoded);
        req.user = decoded;
        next();
      }
    })
  }
}