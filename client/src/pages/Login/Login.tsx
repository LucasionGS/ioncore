import Link from "../../components/Router/Link";
import logo from "../../assets/logo.svg";
import { useCallback, useState } from "react";
import UserApi from "../../Api/UserApi";
import { useRouter } from "../../components/Router";
import { Button } from "@ioncore/theme/Button";
import { Input } from "@ioncore/theme/Input/Input";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

const inputStyle: React.CSSProperties = {
  width: "50vw",
};

const buttonStyle: React.CSSProperties = {
  width: "50vw",
  backgroundColor: "#4CAF50"
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
            <Input style={inputStyle} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} label="Username" />
            <br />
            <Input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} label="Password" />
            {
              registerMode ? (
                <>
                  <br />
                  <Input style={inputStyle} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </>
              ) : null
            }
            <br />
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
