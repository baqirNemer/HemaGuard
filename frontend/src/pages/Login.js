import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import ResponsiveAppBar from './components/Navbar';
import ContainedButtons from './components/Button';

function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate(); // Use useNavigate hook to manage navigation


  
  useEffect(() => {
    const storedEmail = localStorage.getItem('NewuserEmail');
    if (storedEmail) {
      setEmail(storedEmail); // Set email state with stored email from localStorage
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle password visibility state
  };

  const getButtonLabel = () => {
    return showPassword ? 'Hide' : 'Show';
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/login', { email, pass });
      localStorage.setItem('useremail', email);

      const rememberMeChecked = document.getElementById('rememberMe').checked;
      if (rememberMeChecked) {
        localStorage.setItem('rememberMe', 'true'); // Set rememberMe flag to true in localStorage
        console.log(localStorage.getItem('rememberMe'));
      } else {
        localStorage.removeItem('rememberMe'); // Remove rememberMe flag from localStorage if not checked
      }
      
      setMessage('Successfully logged in. Redirecting to homepage...');
      navigate('/');
    } catch (error) {
      setMessage('Login failed. Please check your credentials.');
    }
  };
  const handleRememberMeChange = (e) => {
    // This function is called when the "Remember me" checkbox is toggled
    // No need to implement anything here as we handle the checkbox state directly in handleLogin
  };

  return (
    <div>
      <ResponsiveAppBar />
      <div className="container-fluid d-flex align-items-center justify-content-center vh-100">
        <div className="card w-50">
          <div className="card-body">
            <h5 className="card-title mb-4 text-center">Login</h5>
            {message && <div className="alert alert-info text-center">{message}</div>}
            <form>
              <div className="form-group">
                <label>Email address:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'} // Toggle input type based on showPassword state
                    className="form-control"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {getButtonLabel()} {/* Use dynamic button label */}
                  </button>
                </div>
              </div>

              <div className="form-row mb-4">
                <div className="col d-flex justify-content-center">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      onChange={handleRememberMeChange} // Handle checkbox change
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me?
                    </label>
                  </div>
                </div>

                <div className="col text-center">
                  <a href="#!">Forgot password?</a>
                </div>
              </div>

              <div className="text-center">
                <ContainedButtons
                  text="Sign in"
                  className="btn btn-primary btn-block"
                  onClick={handleLogin}
                />
              </div>

              <div className="text-center mt-3">
                <p>
                  Not a member? <Link to="/signup">Register</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
