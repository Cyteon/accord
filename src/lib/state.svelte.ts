import type { UserType, PartialUser } from "./models/User";
import type { PlaceType } from "./models/Place";
import type { ChannelType } from "./models/Channel";

export interface StateType {
  user: null | UserType;
  places: Record<
    string,
    PlaceType & {
      channels?: ChannelType[];
    }
  >;
  relations: {
    pendingIn?: PartialUser[];
    pendingOut?: PartialUser[];
    friends?: PartialUser[];
  };
}

const state: StateType = $state({
  user: null,
  places: {},
  relations: {},
});

export default state;
