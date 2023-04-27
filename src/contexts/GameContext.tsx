import { Dispatch, ReactNode, createContext, useReducer } from "react";
import { assertNever } from "../lib/utils";
import { DocumentReference, doc } from "firebase/firestore";
import { db } from "@/db";
import { PlayerState } from "./PlayerContext";
import { Die } from "@/lib/types";

type GameStatus = "not created" | "in lobby" | "in progress" | "ended";

export type GameState = {
  gameRef: DocumentReference | null;
  gameCode: string;
  status: GameStatus;
  players: PlayerState[];
  diceRoll: Die[];
  currentTurnIndex: number;
  diceRolled: boolean;
};

type SetupGameAction = {
  type: "SETUP_GAME";
  payload: Partial<GameState>;
};

type UpdateGameAction = {
  type: "UPDATE_GAME";
  payload: Partial<GameState>;
};

type UpdatePlayersAction = {
  type: "UPDATE_PLAYERS";
  payload: PlayerState[];
};

type GameAction = SetupGameAction | UpdateGameAction | UpdatePlayersAction;

type GameContext = GameState & { dispatch: Dispatch<GameAction> };

const initialState: GameState = {
  gameRef: null,
  gameCode: "",
  status: "not created",
  players: [],
  diceRoll: [
    { value: 1, color: "white", pipColor: "black", locked: false },
    { value: 2, color: "white", pipColor: "black", locked: false },
    { value: 3, color: "yellow", pipColor: "black", locked: false },
    { value: 4, color: "red", pipColor: "white", locked: false },
    { value: 5, color: "green", pipColor: "white", locked: false },
    { value: 6, color: "blue", pipColor: "white", locked: false },
  ],
  currentTurnIndex: 0,
  diceRolled: false,
};

const Context = createContext<GameContext>(initialState as GameContext);

const { Provider } = Context;

export function GameProvider({ children }: { children: ReactNode }) {
  function reducer(state: GameState, action: GameAction) {
    const { type } = action;
    switch (type) {
      case "SETUP_GAME": {
        return { ...state, ...action.payload };
      }
      case "UPDATE_PLAYERS": {
        return { ...state, players: action.payload };
      }
      case "UPDATE_GAME":
        const { gameRef, ...payload } = action.payload;
        return { ...state, ...payload };

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
