import type { UserType } from "./models/User";

export interface StateType {
    user: null | UserType;
}

const state: StateType = $state({
    user: null
})

export default state;