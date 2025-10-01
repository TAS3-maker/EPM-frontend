import React, { useState, useEffect } from 'react';
import { Camera, Check, Plus, Pencil } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useEmployees } from "../../context/EmployeeContext";
import defaultpic from "../../aasests/default.png"
const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    imageFile: null, // New: To store the actual File object for submission
    imageUrl: null,  // New: To store the URL for displaying the image
    role: '',
    team: '',
  });

  const [isEditable, setIsEditable] = useState(false);
    const { updateEmployee} = useEmployees();
  const { profile, fetchProfile } = useProfile();
  const [originalProfileData, setOriginalProfileData] = useState(null);

  useEffect(() => {
    if (profile && profile.data) {
      const data = {
        name: profile.data.name || '',
        email: profile.data.email || '',
        phone: profile.data.phone_num || '',
        emergencyPhone: profile.data.emergency_phone_num || '',
        address: profile.data.address || '',
        image: profile.data.profile_pic
          ? `http://13.60.180.240/api/storage/profile_pics/${profile.data.profile_pic}`
          : null,
        imageFile: null,
        role: profile.data.role?.name || '',
        team: profile.data.team?.name || '',
      };
      setProfileData(data);
      setOriginalProfileData(data); // Store original
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
        imageFile: file, // Store the actual File object for submission
        imageUrl: URL.createObjectURL(file), // Store the temporary URL for immediate preview
      }));
    }
  };

  const userId = localStorage.getItem("user_id");

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

    // Save image to localStorage if changed
    if (profileData.imageFile) {
      const reader = new FileReader();
      reader.onloadend = function () {
        localStorage.setItem("profile_image_base64", reader.result);
      };
      reader.readAsDataURL(profileData.imageFile);
    }

    // ✅ Close edit mode
    setIsEditable(false);

    // ✅ Refresh profile from backend
    await fetchProfile();

  } catch (error) {
    console.error('Failed to update profile:', error);
    alert('Something went wrong!');
  }
};


  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Profile</h1>
              <p className="text-gray-600 text-sm">View or edit your personal information</p>
            </div>
            <button
  type="button"
  onClick={() => {
    if (isEditable && originalProfileData) {
      setProfileData(originalProfileData); // Reset to original on cancel
    }
    setIsEditable(!isEditable);
  }}
  className="ml-auto inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow transition"
>
  <Pencil className="w-4 h-4 mr-2" />
  {isEditable ? 'Cancel' : 'Edit'}
</button>

          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <img
                 src={
  profileData.imageUrl ||
  profileData.image ||
{defaultpic}}
/>


   {/* <img
                      src={
                        profileData.image ||
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80'
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    /> */}


                    {isEditable && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {isEditable && (
                    <label className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Plus className="w-4 h-4" />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Full Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      readOnly={!isEditable}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditable
                          ? 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-gray-50 focus:bg-white'
                          : 'border-gray-200 bg-gray-100 text-gray-600'
                      } transition-all duration-200`}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      readOnly={!isEditable}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isEditable
                          ? 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-gray-50 focus:bg-white'
                          : 'border-gray-200 bg-gray-100 text-gray-600'
                      } transition-all duration-200`}
                      required
                    />
                  </div>
                </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      Phone Number
    </label>
    <input
      type="tel"
      name="phone"
      value={profileData.phone}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 10 && isEditable) {
          setProfileData((prev) => ({
            ...prev,
            phone: value,
          }));
        }
      }}
      placeholder="(555) 000-0000"
      readOnly={!isEditable}
      maxLength={10}
      className={`w-full px-4 py-3 rounded-xl border ${
        isEditable
          ? 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-gray-50 focus:bg-white'
          : 'border-gray-200 bg-gray-100 text-gray-600'
      } transition-all duration-200`}
    />
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      Emergency Contact
    </label>
    <input
      type="tel"
      name="emergencyPhone"
      value={profileData.emergencyPhone}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 10 && isEditable) {
          setProfileData((prev) => ({
            ...prev,
            emergencyPhone: value,
          }));
        }
      }}
      placeholder="(555) 000-0000"
      readOnly={!isEditable}
      maxLength={10}
      className={`w-full px-4 py-3 rounded-xl border ${
        isEditable
          ? 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-gray-50 focus:bg-white'
          : 'border-gray-200 bg-gray-100 text-gray-600'
      } transition-all duration-200`}
    />
  </div>
</div>


                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Address</label>
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    placeholder="Enter your complete address"
                    readOnly={!isEditable}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isEditable
                        ? 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-gray-50 focus:bg-white'
                        : 'border-gray-200 bg-gray-100 text-gray-600'
                    } transition-all duration-200 resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Role</label>
                    <input
                      type="text"
                      value={profileData.role}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Team</label>
                    <input
                      type="text"
                      value={profileData.team}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>

                {isEditable && (
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-50"
                    >
                      <span className="flex items-center justify-center">
                        <Check className="w-5 h-5 mr-2" />
                        Save Changes
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
