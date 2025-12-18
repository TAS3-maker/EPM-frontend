import React, { useState, useEffect } from 'react';
import { Camera, Check, Plus, Pencil, X, Eye, EyeOff } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useEmployees } from "../../context/EmployeeContext";
import defaultpic from "../../aasests/default.png"
import { API_URL } from '../../utils/ApiConfig';

import { useAlert } from "../../context/AlertContext";



const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    imageFile: null,
    imageUrl: null,
    role: '',
    team: '',
  });

  const [isEditable, setIsEditable] = useState(false);
  const { updateEmployee } = useEmployees();
  const { profile, fetchProfile } = useProfile();
  const [originalProfileData, setOriginalProfileData] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false); // NEW
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: ""
  }); // NEW
  const { showAlert } = useAlert();
  const userId = localStorage.getItem("user_id");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  useEffect(() => {
    if (profile && profile.data) {
      const data = {
        name: profile.data.name || '',
        email: profile.data.email || '',
        phone: profile.data.phone_num || '',
        emergencyPhone: profile.data.emergency_phone_num || '',
        address: profile.data.address || '',
        image: profile.data.profile_pic
          ? `${API_URL}/storage/profile_pics/${profile.data.profile_pic}`
          : null,
        imageFile: null,
        role: profile.data.role?.name || '',
        team: profile.data.team?.name || '',
      };
      setProfileData(data);
      setOriginalProfileData(data);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEditable) {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && isEditable) {
      setProfileData((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateEmployee(userId, {
        name: profileData.name,
        email: profileData.email,
        phone_num: profileData.phone,
        emergency_phone_num: profileData.emergencyPhone,
        address: profileData.address,
        profile_pic: profileData.imageFile,
        role_id: profile.data.role_id,
        team_id: profile.data.team_id,
        pm_id: profile.data.pm_id,
      });

      localStorage.setItem("name", profileData.name);
// Update userData so Sidebar refreshes
let userObj = JSON.parse(localStorage.getItem("userData")) || {};
userObj.name = profileData.name;


 if (profileData.imageFile) {
  const reader = new FileReader();
  reader.onloadend = function () {
    userObj.profile_pic = reader.result; // base64 image for sidebar
    localStorage.setItem("profile_image_base64", reader.result);
    localStorage.setItem("userData", JSON.stringify(userObj));
    window.dispatchEvent(new Event("profile-updated"));

  };
  reader.readAsDataURL(profileData.imageFile);
} else {
  // No image updated → keep existing pic
  localStorage.setItem("userData", JSON.stringify(userObj));
  window.dispatchEvent(new Event("profile-updated"));


}

      setIsEditable(false);
      await fetchProfile();

    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Something went wrong!');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -------------------------------------------
  // CHANGE PASSWORD API FUNCTION (NEW)
  // -------------------------------------------
  const handlePasswordChange = async () => {
    try {
      const userToken = localStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/api/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (!response.ok) {
        showAlert({
          variant: "error",
          title: "Error",
          message: result.message || "Password change failed!"
        });
        return;
      }

      // SUCCESS ALERT
      showAlert({
        variant: "success",
        title: "Success",
        message: "Password updated successfully!"
      });

      // Close modal
      setShowPasswordModal(false);

      // Reset fields
      setPasswordData({
        old_password: "",
        new_password: "",
        new_password_confirmation: ""
      });

    } catch (error) {
      console.error("Password update error:", error);

      showAlert({
        variant: "error",
        title: "Error",
        message: "Something went wrong!"
      });
    }
  };



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Profile</h1>
              <p className="text-gray-600 text-sm">View or edit your personal information</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isEditable && originalProfileData) {
                  setProfileData(originalProfileData);
                }
                setIsEditable(!isEditable);
              }}
              className="ml-auto inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow transition"
            >
              <Pencil className="w-4 h-4 mr-2" />
              {isEditable ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* BODY */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>

              {/* PROFILE IMAGE */}
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={profileData.imageUrl || profileData.image || defaultpic}
                      alt="Profile"
                      className="w-full h-full object-cover object-center rounded-full"
                      onError={(e) => (e.target.src = defaultpic)}
                    />

                    {isEditable && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    )}
                  </div>

                  {isEditable && (
                    <label className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      <Plus className="w-4 h-4" />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-6">

                {/* FULL NAME + EMAIL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Full Name<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      readOnly={!isEditable}
                      className={`w-full px-4 py-3 rounded-xl border ${isEditable ? 'border-gray-200 bg-gray-50' : 'bg-gray-100 text-gray-600'}`}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Email<span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      readOnly={!isEditable}
                      className={`w-full px-4 py-3 rounded-xl border ${isEditable ? 'border-gray-200 bg-gray-50' : 'bg-gray-100 text-gray-600'}`}
                      required
                    />
                  </div>
                </div>

                {/* PHONE + EMERGENCY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      readOnly={!isEditable}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10 && isEditable) {
                          setProfileData((prev) => ({ ...prev, phone: value }));
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-xl border ${isEditable ? 'border-gray-200 bg-gray-50' : 'bg-gray-100 text-gray-600'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Emergency Contact</label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={profileData.emergencyPhone}
                      readOnly={!isEditable}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10 && isEditable) {
                          setProfileData((prev) => ({ ...prev, emergencyPhone: value }));
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-xl border ${isEditable ? 'border-gray-200 bg-gray-50' : 'bg-gray-100 text-gray-600'}`}
                    />
                  </div>

                </div>

                {/* ADDRESS */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Address</label>
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    readOnly={!isEditable}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border ${isEditable ? 'border-gray-200 bg-gray-50' : 'bg-gray-100 text-gray-600'}`}
                  ></textarea>
                </div>

                

                {/* ROLE + TEAM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Role</label>
                    <input value={profileData.role} disabled className="w-full px-4 py-3 rounded-xl border bg-gray-100 text-gray-600" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Team</label>
                    <input value={profileData.team} disabled className="w-full px-4 py-3 rounded-xl border bg-gray-100 text-gray-600" />
                  </div>
                </div>

                {/*CHANGE PASSWORD BUTTON (NEW) */}
                {!isEditable && (
                  <div className='flex justify-end'>
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-fit bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg"
                    >
                      Change Password
                    </button>
                  </div>
                )}

                {/* SAVE CHANGES */}
                {isEditable && (
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg"
                    >
                      <Check className="inline-block w-5 h-5 mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}

              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --------------------------------- */}
      {/* PASSWORD CHANGE MODAL (NEW) */}
      {/* --------------------------------- */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">

            {/* Close Button */}
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h2>

            {/* PASSWORD FIELDS */}
            <div className="space-y-4">

              {/* OLD PASSWORD */}
              <div>
                <label className="block text-sm font-semibold mb-1">Previous Password</label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={passwordData.old_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, old_password: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-3 text-gray-600"
                  >
                    {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div>
                <label className="block text-sm font-semibold mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new_password: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-3 text-gray-600"
                  >
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-semibold mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={passwordData.new_password_confirmation}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-gray-50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Save */}
              <div className="pt-4">
                <button
                  onClick={handlePasswordChange}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Save Password
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Profile;
