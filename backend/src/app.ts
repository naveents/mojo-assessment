import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import jwt from "jsonwebtoken";
import axios from "axios";
import fs from "fs";
import https from "https";
import { authenticateJWT } from "./middleware/auth";
import { AuthenticatedUser } from "./interface/auth.interface";

dotenv.config();
const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "https://localhost:3000";
const SERVER_URL = process.env.SERVER_URL || "https://localhost:5000";
app.use(cors({ origin: CLIENT_URL , credentials: true }));
app.use(express.json());

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID!,
            clientSecret: process.env.FACEBOOK_APP_SECRET!,
            callbackURL: `${process.env.SERVER_URL}/auth/facebook/callback`,
            profileFields: ["id", "displayName", "photos", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            // Generate a JWT token
            const token = jwt.sign(
                { id: profile.id, name: profile.displayName, accessToken },
                process.env.JWT_SECRET!,
                { expiresIn: "7d" }
            );
            return done(null, { token });
        }
    )
);

app.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: ["email", "public_profile", "pages_show_list"] })
);

app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { session: false }),
    async (req: any, res) => {
        const { token } = req.user;
        res.redirect(`${CLIENT_URL}/dashboard?token=${token}`);
    }
);


app.get("/api/user", authenticateJWT, async (req, res) => {
    try {
        const { accessToken } = req.user as AuthenticatedUser;
        const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});

// Fetch User Pages
app.get("/api/pages", authenticateJWT, async (req, res) => {
    try {
        const { accessToken } = req.user as AuthenticatedUser;
        const response = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${accessToken}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pages" });
    }
});

// Fetch Page Insights
app.get("/api/page-insights", authenticateJWT, async (req, res) => {
    const { pageId, since, until } = req.query;
    try {
        const { accessToken } = req.user as AuthenticatedUser;
        const metrics = "page_fan_adds,page_fan_removes,page_engaged_users,page_impressions,page_reactions_total";
        const url = `https://graph.facebook.com/${pageId}/insights?metric=${metrics}&since=${since}&until=${until}&period=total_over_range&access_token=${accessToken}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch insights" });
    }
});


const options = {
    key: fs.readFileSync("./localhost-key.pem"),
    cert: fs.readFileSync("./localhost.pem"),
};

https.createServer(options, app).listen(5000, () => {
    console.log(`Server running on ${SERVER_URL}`);
});