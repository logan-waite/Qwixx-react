import { Dispatch, ReactNode, createContext, useReducer } from "react";
import { assertNever } from "../lib/utils";
import { DocumentReference, doc } from "firebase/firestore";
import { db } from "@/db";
import { Score } from "@/lib/types";

type PlayerStatus = "not ready" | "ready";

export type PlayerState = {
  playerRef: DocumentReference | null;
  id: string;
  name: string;
  joined: Date;
  // status: PlayerStatus;
  ready: boolean;
  score: Score;
};

type AddPlayerAction = {
  type: "ADD_PLAYER";
  payload: Partial<PlayerState>;
};

type UpdatePlayerAction = {
  type: "UPDATE_PLAYER";
  payload: Partial<PlayerState>;
};

type PlayerAction = UpdatePlayerAction | AddPlayerAction;

type PlayerContext = PlayerState & { dispatch: Dispatch<PlayerAction> };

const initialState: PlayerState = {
  playerRef: null,
  id: "",
  name: "",
  joined: new Date(),
  ready: false,
  score: {
    passedTurns: 0,
    scoreRows: [
      { color: "red", selectedNumbers: [], locked: false },
      { color: "yellow", selectedNumbers: [], locked: false },
      { color: "green", selectedNumbers: [], locked: false },
      { color: "blue", selectedNumbers: [], locked: false },
    ],
  },
};

const Context = createContext<PlayerContext>(initialState as PlayerContext);

const { Provider } = Context;

export function PlayerProvider({ children }: { children: ReactNode }) {
  function reducer(state: PlayerState, action: PlayerAction) {
    const { type } = action;
    switch (type) {
      case "UPDATE_PLAYER":
        const { playerRef, ...payload } = action.payload;
        return { ...state, ...payload };

      case "ADD_PLAYER":
        return { ...state, ...action.payload };

      default: {
        const _exhaustiveCheck: never = action;
        console.error("Unknown action: ", _exhaustiveCheck);
        return state;
      }
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  return <Provider value={{ ...state, dispatch }}>{children}</Provider>;
}

export default Context;
