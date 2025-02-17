import { AuthenticatedUser } from "../interface/auth.interface";
import jwt from "jsonwebtoken";

export const authenticateJWT = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid Token" });
    }
};