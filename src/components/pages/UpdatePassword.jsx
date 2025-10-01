import React from 'react'
import rightsignup from "../aasests/pattern.png";
import logo from "../aasests/logo.png";
import { Link , useNavigate} from 'react-router-dom';
import useLoadingStore from "../components/UseLoadingStore";
import { API_URL } from "../utils/ApiConfig";
import axios from "axios";
import { useAlert } from '../context/AlertContext';
import  { useState } from "react";
import {
    Loader2,
      Eye, EyeOff
      } from "lucide-react";
const UpdatePassword = () => {

    const navigate = useNavigate();
    const { isLoading, showLoading, hideLoading } = useLoadingStore();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
      const [showPassword, setShowPassword] = useState(false);

    const { showAlert } = useAlert();
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleOtpChange = (value, index) => {
        if (/^\d?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // console.log("Current OTP:", newOtp.join(""));

            // Move to next box if input is added
            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`).focus();
            }

            // Move to previous box if backspace is pressed
            if (!value && index > 0) {
                document.getElementById(`otp-${index - 1}`).focus();
            }
        }
    };

    const handlePasswordChange = (e) => setNewPassword(e.target.value);

    const handleSendOTP = async () => {

        try {
            showLoading();
            const response = await axios.post(`${API_URL}/api/auth/send-otp`, { email });
            if (response.data.success) {
                // setMessage("OTP sent successfully! Please check your email.");
                showAlert({ variant: "success", title: "Success", message: "OTP sent successfully! Please check your email." });

                setIsOtpSent(true); // This will trigger the OTP input field to appear.
             


            } else {
                setMessage(response.data.message);
                setIsOtpSent(true);
            }
        } catch (error) {
            showAlert({ variant: "error", title: "Failed", message: "Failed to send otp, try again later" });

            // setMessage("An error occurred while sending OTP.");
        }
        finally {
            hideLoading();
        }
    };

    
    const handleVerifyOtp = async (otp) => {
        if (!otp || otp.length !== 6) {
            // setError("Please enter a valid 6-digit OTP.");
                            // setMessage("OTP sent successfully! Please check your email.");
                            showAlert({ variant: "warning", title: "Email is required", message: "OTP sent successfully! Please check your email." });

            return;
        }
    
        try {
            showLoading();
            // console.log("Sending OTP:", otp, "Email:", email);
            const response = await axios.post(`${API_URL}/api/auth/confirm-otp`, {
                email,
                otp,
            });
            if (response.status === 200) {
                // alert('OTP verified successfully!');
                                showAlert({ variant: "success", title: "Success", message: "OTP verified successfully" });

                setIsOtpVerified(true);
                setIsOtpSent(false);
                setError(""); // Clear error message
            } else {
                // setError(response.data.message || "Failed to verify OTP.");
                                showAlert({ variant: "error", title: "failed", message: response.data.message });

            }
        } catch (err) {
            // console.error("Error verifying OTP:", err.response?.data?.message);
            // setError(err.response?.data?.message || 'Error verifying OTP');
                                            showAlert({ variant: "error", title: "failed", message: err.response?.data?.message || 'Error verifying OTP' });

        }
        finally{
            hideLoading();
        }
    };
    


    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setError("");
    
        // Validate email field
        if (!email) {
            showAlert({ variant: "warning", title: "Email is required", message: "Please enter your email" });

            // setError("Email is required.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAlert({ variant: "warning", title: "Invalid Email", message: "Please enter a valid email address." });
            // setError("Please enter a valid email address.");
            return;
        }
    
        const loginRequestBody = { email };
    
        try {

            showLoading();
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginRequestBody),
            });
    
            console.log('Response status:', response.status); // Log response status
    
            if (response.status === 404) {
                // User not found
                const errorData = await response.json();
                // setError(errorData.message || "User not found.");
                                                            showAlert({ variant: "error", title: "failed", message: errorData.message || "User not found.Please check you email" });

                return;
            } 
            if (response.status === 200) {
                                                showAlert({ variant: "success", title: "Success", message: "OTP has been sent to you email, please check." });

                // User exists, proceed with OTP
                console.log("User exists, sending OTP...");
                handleSendOTP();
            } else {
                // Handle other unexpected status codes
                const errorData = await response.json();
                // setError(errorData.message || "Something went wrong. Please try again.");
                            showAlert({ variant: "error", title: "Failed", message: errorData.message ||"Something went wrong. Please try again." });

            }
        } catch (error) {
            console.error("Login error:", error);
            showAlert({ variant: "error", title: "Failed", message: "There was an error. Please try again." });

            
            // setError("There was an error. Please try again.");
        }
        finally{
            hideLoading();
        }
    };
    


        const handlePasswordSubmit = async (e) => {
        e.preventDefault();

const new_password = newPassword;
const new_password_confirmation = newPassword;

        const data = { email, new_password ,new_password_confirmation };
        // console.log("Email:", email);
        // console.log("New Password:", ncewPassword);

console.log("formdata",data);


        try {
            showLoading();
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                // setMessage(result.message || "Password updated successfully!");
                                                                showAlert({ variant: "success", title: "Success", message: "Password updated successfully!" });


                navigate('/'); 
            } else {
                // setMessage(result.message || "An error occurred");
                            showAlert({ variant: "error", title: "Failed", message: result.message || "An error occurred" });

            }
        } catch (error) {
            // console.error("Error updating password:", error);
                                        showAlert({ variant: "error", title: "Failed", message:  "An error occurred,please try later" });

            // setMessage("An error occurred while updating the password");
        }
        finally{
            hideLoading();
        }
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
                            Forgot Password
                        </h1>
                        <p className=" text-gray-600 mb-6">
                            Enter your email to reset your password.
                        </p>
    
                        {/* Form */}
                       <form className="space-y-">
                    <div className="space-y-2 mb-4">
                            <label htmlFor="email" className="block text-sm font-medium">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                                placeholder="Enter your email"
                                // value={email}
                                value={email}
                                onChange={handleEmailChange}
                                readOnly={isOtpVerified}
                                // onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                       
                        {/* Forgot Password */}
                        <div className="text-right mb-3">
                            
                        </div>

                       {/* <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded-md hover:bg-[#2c2b2b] transition "
                        >
                           Send OTP
                        </button> */}
{!isOtpSent && !isOtpVerified && (
  <div className="flex justify-end">
    {isLoading ? (
      <button
        type="submit"
        className="mt-2 cursor-not-allowed flex justify-center bg-blue-400 py-1 px-4 rounded-md text-white"
      >
        <Loader2 className="animate-spin h-6 w-6 font-bold" />
      </button>
    ) : (
      <button
        onClick={handleLogin}
        className="w-full bg-black text-white py-2 rounded-md hover:bg-[#2c2b2b] transition"
      >
        Send OTP
      </button>
    )}
  </div>
)}


                    </form>

                    {/* <div className='mt-8'>
                        <form action="">
                        <h2 className="text-xl font-semi-bold mb-2 text-left">Enter otp here</h2>
                        <div className='flex gap-2 mt-4'>
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                            <input className=' border border-gray-500 w-8 h-8 rounded-lg text-center' />
                        </div>
                        <button className='bg-black my-4 text-white px-2 py-1 rounded-lg font-semi-bold'>Verify OTP</button>
                        </form>
                    </div> */}


{/*  */}

{isOtpSent && (
                        <div className="mt-4">
                            <label htmlFor="otp" className="block text-sm font-medium">Enter OTP</label>
                            <div className="flex gap-2 mt-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, index)}
                                        className="w-10 h-10 border rounded text-center"
                                    />
                                ))}
                            </div>
                            {isLoading ? (<button
                                type="submit"
                                className="cursor-not-allowed flex justify-center  bg-blue-400 w-full  rounded-md text-white mt-2 px-4 py-1"
                            >
                                <Loader2 className="animate-spin h-6 w-6 font-bold" />
                            </button>) : (<button
                                onClick={() => handleVerifyOtp(otp.join(""))} // Pass joined OTP as a string
                                className="bg-black my-4 text-white px-2 py-1 rounded-lg font-semi-bold"
                            >
                                Verify OTP
                            </button>
                            )}

                        </div>
                    )}


{isOtpVerified && (
                        // <div className="mt-4">
                        //     <label htmlFor="newPassword" className="block text-sm font-medium">New Password</label>
                        //     <input
                        //         type="password"
                        //         id="newPassword"
                        //         className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none"
                        //         placeholder="Enter new password"
                        //         value={newPassword}
                        //         onChange={handlePasswordChange}
                        //     />
                        //     <button
                        //         onClick={handlePasswordSubmit}
                        //         className="mt-2 bg-green-500 text-white py-1 px-4 rounded-md hover:bg-green-600"
                        //     >
                        //         Update Password
                        //     </button>
                        // </div>

<div>
                        <div className="space-y-2 relative">
      <label htmlFor="password" className="block text-sm font-medium">
        Password
      </label>
      <input
        type={showPassword ? 'text' : 'password'}
        id="newPassword"
        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-500 pr-10"
        placeholder="Enter your password"
           value={newPassword}
               onChange={handlePasswordChange}
        required

        
      />
   <span
  className="absolute right-3 top-10 -translate-y-1/2 cursor-pointer text-gray-600"
  onClick={() => setShowPassword(!showPassword)}
>

        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </span>
    </div>
  <button
                                onClick={handlePasswordSubmit}
                                className="mt-2 bg-green-500 text-white py-1 px-4 rounded-md hover:bg-green-600"
                            >
                                Update Password
                            </button>
</div>

                    )}


{message && <p className="text-center mt-4 text-green-600">{message}</p>}
{error && <p className="text-center mt-4 text-red-600">{error}</p>}


{/*  */}


    
                        <p className="text-center text-gray-500 mt-4">
                            if you have an account?{" "}
                            <Link to="/" className="text-[#e14a16]">
                            Login Now
                          </Link>
                        </p>
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
  )
}

export default UpdatePassword