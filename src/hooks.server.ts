import { MONGODB_URI } from "$env/static/private";
import mongoose from "mongoose";

mongoose.connect(MONGODB_URI);