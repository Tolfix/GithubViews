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



new CronJob("*/15 * * * *", () => {
    // Save Discord users level.
    for(const [key, value] of CacheViews.entries())
    {
        //@ts-ignore
        Views.findOne({ Userid: key }).then((user) => {
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
        });
    }

}, null, true, "Europe/Stockholm");
