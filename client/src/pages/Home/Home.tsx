import { Link } from "@ioncore/theme/Link";
import logo from "../../assets/logo.svg";
import BaseApi from "../../Api/BaseApi";
import "./Home.scss";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

function HomePage() {
  const user = BaseApi.getUser();
  return (
    <div style={{ textAlign: "center" }}>
      <div>
        <p>Ioncore React Template</p>
        {user && (
          <h3>{user.username}</h3>
        )}
        <h4>
          <Link className="App-link" href="/login">Login</Link>
        </h4>
      </div>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
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
    </div>
  );
}

export default HomePage;
