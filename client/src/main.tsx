import React from "react"
import ReactDOM from "react-dom/client"
import "./index.scss"
import Router, { PageBuild } from "./components/Router"

const pages: PageBuild[] = [
  {
    path: /^\/$/,
    title: "Home",
    content: async () => {
      const HomePage = (await import("./pages/Home/Home")).default;
      return <HomePage />
    },
  },
  {
    path: /^\/login$/,
    title: "Login",
    content: async () => {
      const LoginPage = (await import("./pages/Login/Login")).default;
      return <LoginPage />
    },
  },
]

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router pages={pages} />
  </React.StrictMode>,
)
