require("dotenv").config()
import express from "express";
import mongoose from "mongoose";
import { makeBadge, ValidationError } from 'badge-maker'
import cors from "cors";
import { CacheViews, SaveToDB, Views } from "./Views";

const server = express();

mongoose.connect(process.env.DB ?? "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

server.use(cors({
    origin: true,
    credentials: true
}));

server.use(express.urlencoded({ extended: true }));

server.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Tolfix');
    next();
});

server.get("/", async (req, res) => {
    let { id, color, style, label } = req.query;

    if(!id)
        return res.json({
            error: "Provide a id"
        })

    let User = CacheViews.get(id as string);

    if(!User)
        User = (await Views.findOne({ Userid: id }))

    if(!User)
        User = (await new Views({
            Userid: id,
            views: "0"
        }).save());

    if(!User)
        return res.json({
            error: "something went wrong",
        })

    //@ts-ignore
    CacheViews.set(id, {
        views: (parseInt(User.views)+1).toString(),
    })
    
    const format = {
        label: label ?? "Visitors",
        color: color ?? "green",
        message: (parseInt(User?.views)).toLocaleString("en"),
        style: style ?? "flat",
    }

    //@ts-ignore
    const svg = makeBadge(format);
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "max-age=0, no-cache, no-store, must-revalidate")
    return res.send(svg);
});

server.listen(8080);

setTimeout(() => {

    process.exit()
}, 15*1000)