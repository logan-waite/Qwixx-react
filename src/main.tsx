import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./lib/icon-library";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { GameProvider } from "./contexts/GameContext";
import { PlayerProvider } from "./contexts/PlayerContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GameProvider>
      <PlayerProvider>
        <RouterProvider router={router} />
      </PlayerProvider>
    </GameProvider>
  </React.StrictMode>
);
