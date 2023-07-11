import Link from "../../components/Router/Link";
import logo from "../../assets/logo.svg";
import { useCallback, useState } from "react";
import UserApi from "../../Api/UserApi";
import { useRouter } from "../../components/Router";
import { Button } from "@ioncore/theme/Button";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  margin: "5px 0",
  boxSizing: "border-box",
  border: "none",
  borderBottom: "1px solid #ccc",
  fontSize: "16px",
  backgroundColor: "#f1f1f1",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  margin: "5px 0",
  boxSizing: "border-box",
  border: "none",
  fontSize: "16px",
  backgroundColor: "#4CAF50",
  color: "white"
};

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [registerMode, setRegisterMode] = useState(false);
  const router = useRouter();

  const loginHandle = useCallback(async () => {
    setError(null);
    if (registerMode) {
      if (username.length < 3) {
        setError("Username must be at least 3 characters long.");
        return;
      }
      if (password.length < 3) {
        setError("Password must be at least 3 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      UserApi.register(username, password).then(res => {
        router.setPath("/");
      }).catch((err: Error) => setError(err.message));
    }
    else {
      UserApi.login(username, password).then(res => {
        router.setPath("/");
      }).catch((err: Error) => setError(err.message));
    }
  }, [username, password, confirmPassword, registerMode]);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <form onSubmit={(e) => { e.preventDefault(); loginHandle(); }}>
          <h3>
            Login
          </h3>
          <input style={inputStyle} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {
            registerMode ? (
              <input style={inputStyle} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            ) : null
          }

          <Button style={buttonStyle} type="submit">
            {registerMode ? "Register" : "Login"}
          </Button>
          {/* <button style={buttonStyle} type="submit">
            {registerMode ? "Register" : "Login"}
          </button> */}
          <p style={{ color: "red" }}>{error}</p>
          <a className="App-link" onClick={() => setRegisterMode(!registerMode)}>
            {registerMode ? "Already have a user? Login" : "Don't have a user? Register"}
          </a>
          </form>
        </div>
      </header>
    </div>
  );
}

export default LoginPage;
