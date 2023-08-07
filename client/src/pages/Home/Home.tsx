import Link from "../../components/Router/Link";
import logo from "../../assets/logo.svg";
import BaseApi from "../../Api/BaseApi";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

function HomePage() {
  const user = BaseApi.getUser();
  return (
    <div className="App">
      <header className="App-header">
        <div>
          {user && (
            <h3>{user.username}</h3>
          )}
          <h4>
            <Link className="App-link" href="/login">Login</Link>
          </h4>
        </div>
        <img src={logo} className="App-logo" alt="logo" />
        <p>Ioncore React Template</p>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default HomePage;
