import React, { useEffect, useState,useRef } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../../utils/ApiConfig';



const getMonthStartDate = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1)
    .toISOString()
    .split('T')[0];
};

const getToday = () => new Date().toISOString().split('T')[0];

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

const getPercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};
 



const TotalWorkingHoursCard = () => {
  const { id } = useParams();
  const userToken = localStorage.getItem('userToken');

  const [workingStartDate, setWorkingStartDate] = useState(getMonthStartDate());
  const [workingEndDate, setWorkingEndDate] = useState(getToday());
  const [isWorkingDateFilterOpen, setIsWorkingDateFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [hoursData, setHoursData] = useState({
    total: '00:00',
    billable: '00:00',
    inHouse: '00:00',
    noWork: '00:00',
    leave: '00:00',
    percentages: {},
  });

     const activityDateFilterRef = useRef(null);
  
    useEffect(()=>{
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
    },[isWorkingDateFilterOpen])

  

  const fetchWorkingHours = async () => {
    if (!userToken || !id) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/get-user-performa-data`,
        {
          params: {
            user_id: id,
            start_date: workingStartDate,
            end_date: workingEndDate,
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data?.success) {
        const { activities, leave_hours } = response.data.data;

        const billable = activities?.Billable || '00:00';
        const inHouse = activities?.['In-House'] || '00:00';
        const noWork = activities?.['No Work'] || '00:00';
        const offline = activities?.Offline || '00:00';
        const leave = leave_hours || '00:00';

        const total = addTimes([
          billable,
          inHouse,
          noWork,
          offline,
          leave,
        ]);

        const totalMinutes = timeToMinutes(total);

        setHoursData({
          total,
          billable,
          inHouse,
          noWork,
          leave,
          percentages: {
            total: 100,
            billable: getPercentage(timeToMinutes(billable), totalMinutes),
            inHouse: getPercentage(timeToMinutes(inHouse), totalMinutes),
            noWork: getPercentage(timeToMinutes(noWork), totalMinutes),
            leave: getPercentage(timeToMinutes(leave), totalMinutes),
          },
        });
      }
    } catch (error) {
      console.error('Working hours error:', error);
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    fetchWorkingHours();
  }, [id]);

  

  return (
    <div className="bg-white rounded-2xl shadow-md border w-full">
      
      <div className="px-5 py-2 flex justify-between items-center bg-gradient-to-br from-indigo-600 to-blue-500 rounded-t-xl">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Total Working Hours
        </h3>

        <div className="relative" ref={activityDateFilterRef}>
          <button
            onClick={() => setIsWorkingDateFilterOpen(!isWorkingDateFilterOpen)}
            className="flex items-center gap-2 bg-white/20 rounded-lg px-2 py-1 text-white text-xs"
          >
            {workingStartDate} - {workingEndDate}
            <ChevronDown className="w-3 h-3" />
          </button>

          {isWorkingDateFilterOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white p-4 rounded-xl shadow-xl z-50">
              <div className="space-y-3">
                <input
                  type="date"
                  value={workingStartDate}
                  onChange={(e) => setWorkingStartDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />

                <input
                  type="date"
                  value={workingEndDate}
                  min={workingStartDate}
                  onChange={(e) => setWorkingEndDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />

                <button
                  onClick={() => {
                    setIsWorkingDateFilterOpen(false);
                    fetchWorkingHours();
                  }}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm"
                >
                  Apply Dates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm p-5 pb-8">
        <HourCard
          title="Total Hours"
          value={hoursData.total}
          percentage={100}
          loading={loading}
          color="blue"
        />
        <HourCard
          title="Billable Hours"
          value={hoursData.billable}
          percentage={hoursData.percentages.billable}
          loading={loading}
          color="green"
        />
        <HourCard
          title="No Work Hours"
          value={hoursData.noWork}
          percentage={hoursData.percentages.noWork}
          loading={loading}
          color="gray"
        />
        <HourCard
          title="In House Hours"
          value={hoursData.inHouse}
          percentage={hoursData.percentages.inHouse}
          loading={loading}
          color="purple"
        />
        <HourCard
          title="Leave Hours"
          value={hoursData.leave}
          percentage={hoursData.percentages.leave}
          loading={loading}
          color="orange"
        />
      </div>
    </div>
  );
};



const COLOR_MAP = {
  blue: {
    bg: 'from-blue-50 to-indigo-50 border-blue-200',
    text: 'text-blue-600',
    bar: 'from-blue-500 to-indigo-500',
  },
  green: {
    bg: 'from-green-50 to-emerald-50 border-green-200',
    text: 'text-green-600',
    bar: 'from-green-500 to-emerald-500',
  },
  gray: {
    bg: 'from-gray-50 to-gray-100 border-gray-300',
    text: 'text-gray-600',
    bar: 'from-gray-400 to-gray-500',
  },
  purple: {
    bg: 'from-purple-50 to-violet-50 border-purple-200',
    text: 'text-purple-600',
    bar: 'from-purple-500 to-violet-500',
  },
  orange: {
    bg: 'from-orange-50 to-yellow-50 border-orange-200',
    text: 'text-orange-600',
    bar: 'from-orange-500 to-yellow-500',
  },
};

const HourCard = ({ title, value, percentage, loading, color }) => {
  const c = COLOR_MAP[color];

  return (
    <div
      className={`bg-gradient-to-br ${c.bg} p-3 rounded-xl shadow-sm border hover:shadow-md transition-all duration-300`}
    >
      <div className={`text-xl font-bold ${c.text}`}>
        {loading ? '...' : value}
      </div>

      <div className="text-gray-600 text-xs uppercase tracking-wider mt-1">
        {title}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className={`bg-gradient-to-r ${c.bar} h-2 rounded-full`}
          style={{ width: `${percentage || 0}%` }}
        />
      </div>

      <div className={`text-xs font-semibold mt-1 ${c.text}`}>
        {percentage || 0}%
      </div>
    </div>
  );
};

export default TotalWorkingHoursCard;

