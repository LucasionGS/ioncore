import React from "react"
import ReactDOM from "react-dom/client"
import "./index.scss"
import { Router, Route } from "@ioncore/theme/Router"
import { IoncoreProvider } from "@ioncore/theme"
import IoncoreLoader from "./components/IoncoreLoader/IoncoreLoader"
const pages: Route[] = [
  {
    path: /^\/$/,
    title: "Home",
    component: async () => {
      const HomePage = (await import("./pages/Home/Home")).default;
      return <HomePage />
    },
  },
  {
    path: /^\/login$/,
    title: "Login",
    component: async () => {
      const LoginPage = (await import("./pages/Login/Login")).default;
      return <LoginPage />
    },
  },
  {
    path: /^\/admin(\/|$)/,
    title: "Admin",
    component: async () => {
      const AdminPage = (await import("./pages/Admin/Admin")).default;
      return <AdminPage />
    },
  },
]

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <IoncoreProvider theme={{ scheme: "dark" }}>
      <Router pages={pages} loadingPage={() => <IoncoreLoader centered />} />
    </IoncoreProvider>
  </React.StrictMode>,
);

