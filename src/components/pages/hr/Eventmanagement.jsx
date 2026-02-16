import React, { useEffect, useState } from "react";
import { useEvent } from "../../context/EventContext";
import { useAlert } from "../../context/AlertContext";
import { BarChart, X, Edit } from "lucide-react";
import { SectionHeader } from "../../components/SectionHeader";

export const Eventmanagement = () => {
  const { hrLeave, fetchLeaves, addLeave, deleteLeave, updateLeave } =
    useEvent();
  const { showAlert } = useAlert();

  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    type: "",
    description: "",
    halfday_period: "",
    start_time: "",
    end_time: "",
    timezone: "Asia/Kolkata",
  });

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditingLeaveId(null);
    setFormData({
      start_date: "",
      end_date: "",
      type: "",
      description: "",
      halfday_period: "",
      start_time: "",
      end_time: "",
      timezone: "Asia/Kolkata",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.start_date || !formData.type || !formData.description) {
      showAlert({
        variant: "warning",
        title: "Warning",
        message: "Start Date, Type and Description required",
      });
      return;
    }

    const payload = {
      start_date: formData.start_date,
      end_date: formData.end_date || formData.start_date,
      type: formData.type,
      description: formData.description,
    };

    if (formData.type === "Half Holiday")
      payload.halfday_period = formData.halfday_period;

    if (formData.type === "Short Holiday") {
      payload.start_time = formData.start_time;
      payload.end_time = formData.end_time;
      payload.timezone = formData.timezone;
    }

    try {
      if (editingLeaveId) await updateLeave(editingLeaveId, payload);
      else await addLeave(payload);

      showAlert({
        variant: "success",
        title: "Success",
        message: editingLeaveId ? "Event updated" : "Event added",
      });

      resetForm();
      setIsModalOpen(false);
      fetchLeaves();
    } catch {
      showAlert({
        variant: "error",
        title: "Error",
        message: "Failed to save event",
      });
    }
  };

  const handleEdit = (leave) => {
    setEditingLeaveId(leave.id);
    setFormData({
      start_date: leave.start_date,
      end_date: leave.end_date,
      type: leave.type,
      description: leave.description,
      halfday_period: leave.halfday_period || "",
      start_time: leave.start_time || "",
      end_time: leave.end_time || "",
      timezone: leave.timezone || "Asia/Kolkata",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await deleteLeave(id);
    fetchLeaves();
  };

  /* ---------------- EVENT DESIGN LOGIC ---------------- */

  const sortedEvents = (hrLeave || [])
    .slice()
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // group by month
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const month = new Date(event.start_date).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  const formatDay = (date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric" });

  const formatMonthShort = (date) =>
    new Date(date).toLocaleDateString("en-IN", { month: "short" });

  const getEventColor = (type) => {
    if (type === "Full Holiday") return "bg-blue-500";
    if (type === "Half Holiday") return "bg-amber-500";
    if (type === "Short Holiday") return "bg-emerald-500";
    return "bg-gray-500";
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen relative text-gray-900">

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-slate-100" />

      <SectionHeader
        icon={BarChart}
        title="Event Management"
        subtitle="View and manage events"
      />

      {/* Timeline Container */}
      <div className="max-w-4xl mx-auto px-6 pb-20">

        {sortedEvents.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            No events available
          </div>
        )}

        {Object.entries(groupedEvents).map(([month, events]) => (
          <div key={month} className="mb-12">

            {/* Month Header */}
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {month}
            </h2>

            <div className="space-y-5 mb-12">

              {events.map((leave) => (
                <div
                  key={leave.id}
                  className="flex gap-5 items-start bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition"
                >
                  {/* Date Pill */}
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-100">
                    <div className="text-lg font-bold">
                      {formatDay(leave.start_date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatMonthShort(leave.start_date)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">

                    <div className="flex justify-between items-start">

                      <div>
                        <div className="flex items-center gap-3">

                          <span
                            className={`w-2.5 h-2.5 rounded-full ${getEventColor(
                              leave.type
                            )}`}
                          />

                          <h3 className="font-semibold text-gray-900">
                            {leave.type}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-600 mt-2">
                          {leave.description}
                        </p>

                        {leave.halfday_period && (
                          <p className="text-xs text-gray-500 mt-1">
                            {leave.halfday_period}
                          </p>
                        )}

                        {leave.start_time && (
                          <p className="text-xs text-gray-500 mt-1">
                            {leave.start_time} → {leave.end_time}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(leave)}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(leave.id)}
                          className="p-2 rounded-lg hover:bg-gray-100"
                        >
                          <X size={16} />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 flex items-center justify-center rounded-full text-2xl text-white shadow-lg hover:scale-105 transition"
        style={{ backgroundColor: "#2762eb" }}
      >
        +
      </button>

      {/* Modal (unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md p-6 rounded-2xl bg-white">

            <div className="flex justify-between mb-5">
              <h3 className="text-lg font-semibold">
                {editingLeaveId ? "Edit Event" : "Add Event"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border"
              >
                <option value="">Select Type</option>
                <option value="Full Holiday">Full Holiday</option>
                <option value="Half Holiday">Half Holiday</option>
                <option value="Short Holiday">Short Holiday</option>
              </select>

              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border"
              />

              {formData.type === "Half Holiday" && (
                <div className="flex gap-3">
                  {["First Half", "Second Half"].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() =>
                        setFormData({ ...formData, halfday_period: p })
                      }
                      className={`flex-1 p-2 rounded-lg border ${
                        formData.halfday_period === p
                          ? "bg-[#2762eb] text-white"
                          : ""
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {formData.type === "Short Holiday" && (
                <>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border"
                  />

                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border"
                  />
                </>
              )}

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e =>
                  setFormData({ ...formData, description: e.target.value })
                )}
                className="w-full p-3 rounded-lg border"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: "#2762eb" }}
              >
                {editingLeaveId ? "Update Event" : "Add Event"}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
