import { Link } from "@ioncore/theme/Link";
import logo from "../../assets/logo.svg";
import BaseApi from "../../Api/BaseApi";
import "./Home.scss";
import React from "react";
import SocketApi from "../../Api/SocketApi";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

function HomePage() {
  const user = BaseApi.getUser();

  React.useEffect(() => {
    const [send, unsub] = SocketApi.subscribe("__echo", (data) => {
      console.log(data);
    });

    send("Test Data Echo!");
    return unsub;
  }, []);

  return (
    <div className="home-page" style={{ textAlign: "center" }}>
      <div>
        <p>Ioncore React Template</p>
        {user ? (
          <>
            <h3>{user.username}</h3>
            {user.isAdmin && (
              <h4>
                <a href="/admin">Admin Dashboard</a>
              </h4>
            )}
          </>
        ) : (
          <h4>
            <Link href="/login">Login</Link>
          </h4>
        )}
      </div>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <span>
        <a
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> | <a
          href="https://www.npmjs.com/package/@ioncore/theme"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Ioncore
        </a>
      </span>
    </div>
  );
}

export default HomePage;
