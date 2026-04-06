import React from 'react';
import TotalWorkingHoursCard from '../../superadmin/employeedetail/TotalWorkingHoursCard.jsx';

function DashTotalWorkingCard() {
  const userId = localStorage.getItem("user_id");

  return (
    <TotalWorkingHoursCard 
      userIdProp={userId}
      showViewButton={true}
      containerClass="col-span-full xl:col-span-12 bg-white border border-gray-100 rounded-2xl shadow-xl hover:shadow-2xl"
    />
  );
}

export default DashTotalWorkingCard;