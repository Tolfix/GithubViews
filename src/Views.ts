import { model, Schema } from "mongoose"
import { CronJob } from "cron";

export const CacheViews = new Map<string, { views: string }>()

const ViewsSchema = new Schema({
    Userid: {
        type: String,
    },
    views: {
        type: String,
    }
});

export const Views = model("views", ViewsSchema);

export async function SaveToDB()
{
    console.log("Saving to DB")
    // Save Discord users level.
    for await(const [key, value] of CacheViews.entries())
    {
        //@ts-ignore
        let user = await Views.findOne({ Userid: key })
        if(!user)
        {
            new Views({
                Userid: key,
                views: value.views,
            }).save();

            return;
        }

        user.views = value.views;

        //@ts-ignore
        user.save();
        return;
    }
    Promise.resolve(true)
}

new CronJob("*/15 * * * *", SaveToDB, null, true, "Europe/Stockholm");
