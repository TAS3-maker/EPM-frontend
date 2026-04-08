import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../../utils/ApiConfig';

const timeToMinutes = (time = '00:00') => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};
const addTimes = (times = []) => {
  let totalMinutes = 0;
  times.forEach((time) => {
    if (!time) return;
    totalMinutes += timeToMinutes(time);
  });
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const getCurrentMonthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1)
    .toISOString()
    .split('T')[0];
};

const getPercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};
const timeToDays = (time = '00:00') => {
  const [h, m] = time.split(':').map(Number);
  const totalHours = h + m / 60;
return Math.floor((totalHours / 8.5) * 10) / 10;
};
// ✅ REUSABLE COMPONENT
const TotalWorkingHoursCard = ({
  userIdProp = null,
  showViewButton = false,
  containerClass = "bg-white rounded-2xl shadow-md border w-full"
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userToken = localStorage.getItem('userToken');
  const userRole = localStorage.getItem("user_name");

  // ✅ Decide userId dynamically
  const userId = userIdProp || id;

  const [workingStartDate, setWorkingStartDate] = useState('');
  const [workingEndDate, setWorkingEndDate] = useState('');
  const [isWorkingDateFilterOpen, setIsWorkingDateFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [hoursData, setHoursData] = useState({
    expected: '00:00',
    total: '00:00',
    billable: '00:00',
    inHouse: '00:00',
    noWork: '00:00',
    leave: '00:00',
    percentages: {},
  });

  const activityDateFilterRef = useRef(null);

  const fetchWorkingHours = useCallback(async (startDate, endDate) => {
    if (!userToken || !userId) return;

    try {
      setLoading(true);

      const params = {
        user_id: userId,
        start_date: startDate ||'2000-01-01',
        end_date: endDate || getTodayDate(),
      };

      const response = await axios.get(
        `${API_URL}/api/get-user-performa-data`,
        {
          params,
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.data?.success) {
        const { activities, leave_hours,actual_hours, expected_hours } = response.data.data;

        const billable = activities?.Billable || '00:00';
        const inHouse = activities?.['In-House'] || '00:00';
        const noWork = activities?.['No Work'] || '00:00';
        const offline = activities?.['offline'] || '00:00';
        const leave = leave_hours || '00:00';
        const actual = actual_hours || '00:00';
const total = addTimes([billable, inHouse, noWork,leave]);
        const totalMinutes = timeToMinutes(total);

        setHoursData({
          expected: expected_hours,
          actual,
          billable,
          inHouse,
          noWork,
          leave,
          offline,
          percentages: {
            actual:getPercentage(timeToMinutes(actual), totalMinutes),
            billable: getPercentage(timeToMinutes(billable), totalMinutes),
            inHouse: getPercentage(timeToMinutes(inHouse), totalMinutes),
            noWork: getPercentage(timeToMinutes(noWork), totalMinutes),
            leave: getPercentage(timeToMinutes(leave), totalMinutes),
            offline: getPercentage(timeToMinutes(offline), totalMinutes),
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, userToken]);

  useEffect(() => {
    if (userId) {
      fetchWorkingHours();
    }
  }, [userId, fetchWorkingHours]);

  const handleApplyDateFilter = () => {
    if (!workingStartDate || !workingEndDate) return;
    setIsWorkingDateFilterOpen(false);
    fetchWorkingHours(workingStartDate, workingEndDate);
  };

  const handleClearFilter = () => {
    setWorkingStartDate('');
    setWorkingEndDate('');
    setIsWorkingDateFilterOpen(false);
    fetchWorkingHours();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activityDateFilterRef.current &&
        !activityDateFilterRef.current.contains(event.target)
      ) {
        setIsWorkingDateFilterOpen(false);
      }
    };
    if (isWorkingDateFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWorkingDateFilterOpen]);

  const handleViewClick = () => {
    navigate(`/${userRole}/users/${userId}`);
  };

  return (
    <div className={containerClass}>
      <div className="px-5 py-2 flex justify-between items-center bg-gradient-to-br from-indigo-600 to-blue-500 rounded-t-xl">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Total Working Hours
        </h3>

        <div className="flex gap-2 items-center">

          {/* ✅ OPTIONAL BUTTON */}
          {showViewButton && (
            <button
              className='shadow-sm border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg px-2 py-1 text-black text-xs'
              onClick={handleViewClick}
            >
              View more
            </button>
          )}

          <div className="relative" ref={activityDateFilterRef}>
            <button
              onClick={() => setIsWorkingDateFilterOpen(!isWorkingDateFilterOpen)}
              disabled={loading}
              className="flex items-center gap-2 bg-white/20 rounded-lg px-2 py-1 text-white text-xs"
            >
              📅 {workingStartDate && workingEndDate
                ? `${workingStartDate} - ${workingEndDate}`
                : 'This Month'
              }
              <ChevronDown className={`w-3 h-3 ${isWorkingDateFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isWorkingDateFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white p-4 rounded-xl shadow-xl z-50 border">
                <div className="space-y-3">
                  <input type="date" value={workingStartDate} onChange={(e) => setWorkingStartDate(e.target.value)} className="w-full border rounded-lg px-2 py-1" />
                  <input type="date" value={workingEndDate} onChange={(e) => setWorkingEndDate(e.target.value)} className="w-full border rounded-lg px-2 py-1" />
                  <button onClick={handleApplyDateFilter} className="w-full bg-indigo-600 text-white py-1 rounded">Apply</button>
                  <button onClick={handleClearFilter} className="w-full bg-gray-200 py-1 rounded">Clear</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-sm p-5">

        <HourCard
  title="Expected Hours"
  value={hoursData.expected}
  percentage={100}
  color="blue"
  showDays={true}
/>

<HourCard
  title="Actual Hours"
  value={hoursData.actual}
  percentage={hoursData.percentages.actual}
  color="darkGreen"
/>

<HourCard
  title="Billable Hours"
  value={hoursData.billable}
  percentage={hoursData.percentages.billable}
  color="green"
/>

<HourCard
  title="No Work Hours"
  value={hoursData.noWork}
  percentage={hoursData.percentages.noWork}
  color="gray"
/>

<HourCard
  title="In House Hours"
  value={hoursData.inHouse}
  percentage={hoursData.percentages.inHouse}
  color="purple"
/>

<HourCard
  title="Leave Hours"
  value={hoursData.leave}
  percentage={hoursData.percentages.leave}
  color="orange"
  showDays={true}
/>

        </div>
      )}
    </div>
  );
};

// SAME
const COLOR_MAP = {
  blue: { bg: 'from-blue-50 to-indigo-50 border-blue-200', text: 'text-blue-600', bar: 'from-blue-500 to-indigo-500' },
  green: { bg: 'from-green-50 to-emerald-50 border-green-200', text: 'text-green-600', bar: 'from-green-500 to-emerald-500' },
darkGreen: {
  bg: 'from-pink-50 to-pink-100 border-pink-200',
  text: 'text-pink-700',
  bar: 'from-pink-500 to-pink-600',
},
 gray: { bg: 'from-gray-50 to-gray-100 border-gray-300', text: 'text-gray-600', bar: 'from-gray-400 to-gray-500' },
  purple: { bg: 'from-purple-50 to-violet-50 border-purple-200', text: 'text-purple-600', bar: 'from-purple-500 to-violet-500' },
  orange: { bg: 'from-orange-50 to-yellow-50 border-orange-200', text: 'text-orange-600', bar: 'from-orange-500 to-yellow-500' },
};

const HourCard = ({ title, value, percentage, color, showDays }) => {
  const c = COLOR_MAP[color];

  return (
    <div className={`relative bg-gradient-to-br ${c.bg} p-2 rounded-lg border`}>

      {/* ✅ TOP RIGHT DAYS BADGE */}
      {showDays && (
       <span
  className={`absolute  right-2 text-[11px] px-1.5 py-0.5 rounded font-medium ${c.text} bg-white/20 backdrop-blur-sm`}
>
        (  {timeToDays(value)}d )
        </span>
      )}

      <div className={`text-lg font-bold ${c.text}`}>{value}</div>
      <div className="text-gray-600 text-[10px]">{title}</div>

      <div className="w-full bg-gray-200 h-1.5 mt-2">
        <div
          className={`bg-gradient-to-r ${c.bar} h-1.5`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className={`text-[10px] ${c.text}`}>{percentage}%</div>
    </div>
  );
};

export default TotalWorkingHoursCard;