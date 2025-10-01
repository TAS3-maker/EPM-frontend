
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import rightsignup from "../aasests/pattern.png";
import logo from "../aasests/logo.png";
// import Alert from "../components/Alerts";
import {
  Loader2,
  Eye, EyeOff
    } from "lucide-react";
const Login = () => {
  const navigate = useNavigate(); // Now it's safe to use here
  const [error, setError] = useState("");
  const { login, isLoading, authMessage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = (e) => {
    e.preventDefault();
    login(email, password, navigate); // Pass navigate to login function
  };

  return (
    <div className="flex flex-col md:flex-row h-screen text-white">
            {/* Left Section */}
            <div id="recaptcha-container"></div>
            <div className="lg:w-2/4 w-full flex flex-col  justify-center p-3 md:p-6">
                <div className="bg-white text-black p-10 rounded-lg min-w-full max-w-md">
                    {/* Logo */}
                    <div className="flex  items-center mb-4 lg:w-full sm:w-[80%] w-full">
                        {/* <img
                            src={logo}
                            alt="Cumulus Logo"
                            className="min-h-8 w-full object-fit "
                        /> */}
                    </div>

                    {/* Dynamic Name */}
                    <h1 className="text-2xl font-bold mb-2 text-left ">
                        Hello,
                    </h1>
                    <p className=" text-gray-600 mb-6">
                        Please enter your password to login.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-">
                    <div className="space-y-2 mb-4">
                            <label htmlFor="email" className="block text-sm font-medium">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2 relative">
      <label htmlFor="password" className="block text-sm font-medium">
        Password
      </label>
      <input
        type={showPassword ? 'text' : 'password'}
        id="password"
        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 pr-10"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required

        
      />
   <span
  className="absolute right-3 top-10 -translate-y-1/2 cursor-pointer text-gray-600"
  onClick={() => setShowPassword(!showPassword)}
>

        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </span>
    </div>
    
                        {authMessage && <p style={{ color: "red" }}>{authMessage}</p>}
                        {/* Forgot Password */}
                        <div className="text-right mb-3">
                           
                                {/* Forgot password? */}
                    
                            <Link to="/updatepassword" className="text-[#e14a16] text-sm">
                              Forgot password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        {isLoading ?  ( <button
                            type="submit"
                            className="cursor-not-allowed flex justify-center  bg-[#2c2b2b] w-full py-2 rounded-md text-white"
                        >
                        <Loader2 className="animate-spin h-6 w-6 font-bold"/>
                        </button>):(<button
                          type="submit"
                          disabled={!email || !password}
                          className={`w-full py-2 rounded-md transition
                            ${!email || !password
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-black text-white hover:bg-[#2c2b2b]'}
                          `}
                        >
                          Login
                        </button>

                        )}
                    </form>

                    {/* <p className="text-center text-gray-500 mt-4">
                        Don&apos;t have an account?{" "}
                        <Link to="/" className="text-[#e14a16]">
                        Register Now
                      </Link>
                    </p> */}
                </div>
            </div>

            {/* Right Section */}
            <div className="w-3/5 h-full hidden lg:block relative">
  {/* Background image */}
  <img
    src={rightsignup}
    alt="Illustration"
    className="h-full w-full object-cover rounded-3xl"
  />

  {/* Centered logo */}
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <img
      src={logo}
      alt="Logo"
      className="w-80 h-80 object-contain"
    />
  </div>
</div>

</div>
  );
};

export default Login;
