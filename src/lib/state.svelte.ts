import type { UserType } from "./models/User";
import type { PlaceType } from "./models/Place";
import type { ChannelType } from "./models/Channel";

export interface StateType {
    user: null | UserType;
    places: Record<string, PlaceType & {
        channels?: ChannelType[];
    }>;
}

const state: StateType = $state({
    user: null,
    places: {},
})

export default state;