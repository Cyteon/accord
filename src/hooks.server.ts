import { MONGODB_URI } from "$env/static/private";
import mongoose from "mongoose";

mongoose.connect(MONGODB_URI);

// to init schemas
import User from "$lib/models/User";
import Place from "$lib/models/Place";