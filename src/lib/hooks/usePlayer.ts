import { useContext, useEffect, useState } from "react";
import PlayerContext, { PlayerState } from "@/contexts/PlayerContext";
import {
  DocumentReference,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { getFromLocal } from "../utils";
import { db } from "@/db";
import { useNavigate } from "react-router-dom";

export default function usePlayer(gameRef?: DocumentReference | null) {
  const context = useContext(PlayerContext);
  const navigate = useNavigate();
  const { dispatch, playerRef, ...player } = context;

  useEffect(() => {
    if (gameRef && !playerRef) {
      const savedPlayer =
        getFromLocal<Pick<PlayerState, "id" | "name">>("player");
      if (savedPlayer) {
        (async () => {
          const playerDoc = await getDoc(
            doc(gameRef, "players", savedPlayer.id)
          );
          if (playerDoc.exists()) {
            // If the player is part of the game
            dispatch({
              type: "ADD_PLAYER",
              payload: playerDoc.data() as PlayerState,
            });
          } else {
            navigate("/");
          }
        })();
      }
    }
  }, [gameRef, playerRef]);

  // Subscribe to player doc
  useEffect(() => {
    let unsubscribe;
    if (playerRef) {
      unsubscribe = onSnapshot(playerRef, (doc) => {
        if (doc.exists()) {
          dispatch({ type: "UPDATE_PLAYER", payload: doc.data() });
        }
      });
    }

    return unsubscribe;
  }, [playerRef]);

  async function addPlayer(
    gameRef: DocumentReference,
    { id, name }: Pick<PlayerState, "id" | "name">
  ) {
    const newPlayerRef = doc(gameRef, "players", id);

    const initialState: Partial<PlayerState> = {
      playerRef: newPlayerRef,
      ...player,
      id,
      name,
      joined: new Date(),
    };

    await setDoc(newPlayerRef, initialState);
    dispatch({ type: "ADD_PLAYER", payload: initialState });

    return initialState;
  }

  async function updatePlayer(player: Partial<PlayerState>) {
    try {
      if (!playerRef) {
        throw "`updatePlayer` didn't receive a playerRef!";
      }
      await runTransaction(db, async (transaction) => {
        const playerDoc = await transaction.get(playerRef);
        if (!playerDoc.exists()) {
          throw "Player isn't in this game!";
        }

        transaction.update(playerRef, { ...player });
      });
      console.log(`Player successfully updated`);
    } catch (e) {
      console.log(`Failed to update player: `, e);
    }
  }

  return {
    player,
    playerRef,
    addPlayer,
    updatePlayer,
  };
}
