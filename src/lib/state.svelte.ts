import type { UserType } from "./models/User";
import type { PlaceType } from "./models/Place";

export interface StateType {
    user: null | UserType;
    places: PlaceType[];
}

const state: StateType = $state({
    user: null,
    places: [],
})

export default state;