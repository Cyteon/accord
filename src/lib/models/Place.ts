import mongoose from "mongoose";

export interface PlaceType {
    _id: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    name: string;
    iconUrl: string;
}

const PlaceSchema = new mongoose.Schema<PlaceType>({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    iconUrl: {
        type: String,
        default: "https://rawcdn.githack.com/Cyteon/assets/d7b003f8ba680f25d5719be9415dd839171667b0/images/colors/green.png",
    },
});

export default mongoose.models.Place || mongoose.model<PlaceType>("Place", PlaceSchema);