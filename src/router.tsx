import { createBrowserRouter, redirect } from "react-router-dom";
import HomeView from "@/views/Home";
import GameView from "@/views/Game";
import LobbyView from "./views/Lobby";
import GameEnd from "./views/GameEnd";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeView />,
  },
  {
    path: "/game",
    loader: () => {
      return redirect("/");
    },
  },
  {
    path: "/lobby",
    loader: () => {
      return redirect("/");
    },
  },
  {
    path: "/lobby/:gameCode",
    element: <LobbyView />,
  },
  {
    path: "/game/:gameCode",
    element: <GameView />,
  },
  {
    path: "/game/:gameCode/end",
    element: <GameEnd />,
  },
]);
