import GameContext, { GameState } from "@/contexts/GameContext";
import { useContext, useEffect, useState } from "react";
import { generateGameCode } from "../firestore";
import { db } from "@/db";
import {
  setDoc,
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
  collection,
  query,
  orderBy,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { PlayerState } from "@/contexts/PlayerContext";
import { Die } from "../types";
import { randomDieNumber, randomNumber } from "../utils";

export default function useGame(gameCode?: string) {
  // const [gameRef, setGameRef] = useState<DocumentReference | null>(null);
  const { dispatch, gameRef, ...game } = useContext(GameContext);

  useEffect(() => {
    if (!gameRef && gameCode) {
      joinGame(gameCode);
    }
  }, []);

  useEffect(() => {
    let unsubscribeFromGame: Unsubscribe;
    let unsubscribeFromPlayers: Unsubscribe;

    if (gameRef) {
      unsubscribeFromGame = onSnapshot(gameRef, (doc) => {
        if (doc.exists()) {
          dispatch({ type: "UPDATE_GAME", payload: doc.data() });
        }
      });

      const orderedPlayersQuery = query(
        collection(gameRef, "players"),
        orderBy("joined")
      );

      unsubscribeFromPlayers = onSnapshot(orderedPlayersQuery, (collection) => {
        dispatch({
          type: "UPDATE_PLAYERS",
          payload: collection.docs.map((doc) => doc.data() as PlayerState),
        });
      });
    }

    return () => {
      unsubscribeFromGame?.();
      unsubscribeFromPlayers?.();
    };
  }, [gameRef]);

  async function createGame() {
    const newGameCode = await generateGameCode();
    const newGameRef = doc(db, "games", newGameCode);
    const { players, ...gameState } = game;

    const initialState: Partial<GameState> = {
      ...gameState,
      gameRef: newGameRef,
      gameCode: newGameCode,
      status: "in lobby",
    };

    setDoc(newGameRef, initialState);
    dispatch({ type: "SETUP_GAME", payload: initialState });

    return newGameCode;
  }

  async function joinGame(gameCode: string) {
    const joinedGameRef = doc(db, "games", gameCode);
    console.log("getting doc");
    console.log({ joinedGameRef });
    const docSnap = await getDoc(joinedGameRef);
    console.log("got doc");
    if (docSnap.exists()) {
      const gameData = docSnap.data();
      dispatch({
        type: "SETUP_GAME",
        payload: { ...gameData, gameRef: joinedGameRef },
      });
    } else {
      // fail state
      // redirect back? Or create a new game with the code?
    }
  }

  async function updateGame(gameUpdate: Partial<GameState>) {
    try {
      if (!gameRef) {
        throw "`updateGame` didn't receive a gameRef!";
      }
      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) {
          throw "Player isn't in this game!";
        }

        transaction.update(gameRef, { ...gameUpdate });
      });
      console.log(`Game successfully updated`);
    } catch (e) {
      console.log(`Failed to update game: `, e);
    }
  }

  async function rollDice() {
    try {
      if (!gameRef) {
        throw "`rollDice` didn't receive a gameRef!";
      }
      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) {
          throw "Game doesn't exist!";
        }
        const newDiceRoll = gameDoc
          .data()
          .diceRoll.map((die: Die) => ({ ...die, value: randomDieNumber() }));

        transaction.update(gameRef, {
          diceRoll: newDiceRoll,
          diceRolled: true,
          // status: 'turn started'
        });
      });
      console.log(`Dice Rolled Successfully`);
    } catch (e) {
      console.log(`Dice failed to roll! `, e);
    }
  }

  return {
    game,
    gameRef,
    createGame,
    joinGame,
    updateGame,
    rollDice,
  };
}
