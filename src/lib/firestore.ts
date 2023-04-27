import { collection, getDocs } from "firebase/firestore";
import { db } from "@/db/index";
import { createArray, randomLetter } from "./utils";

export async function generateGameCode() {
  const gameIds = (await getDocs(collection(db, "games"))).docs.map(
    (doc) => doc.id
  );

  let newGameCode = "";
  while (!newGameCode && !gameIds.includes(newGameCode)) {
    newGameCode = createArray(5, randomLetter).join("");
  }

  return newGameCode;
}
