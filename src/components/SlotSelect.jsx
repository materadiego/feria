import "./SlotSelect.css";
import { useState } from "react";
import loader from "../loader.svg";

const ALL_TIMES = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const N8N_WEBHOOK_URL_SCHEDULE =
  "https://n8n.srv998702.hstgr.cloud/webhook/ibs-schedule-appointment";

export const SlotSelect = ({
  slotsData = [],
  formData,
  loading,
  error,
  success,
  setError,
  setLoading,
  setSuccess,
  setStep,
  setFormData,
  resetForm,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [optionsOpened, setOptionsOpened] = useState(false);
  const [unavailableTimes, setUnavailableTimes] = useState([]);

  /* ---------- HELPERS ---------- */

  const hasMissingSlots = (slot) => {
    if (!Array.isArray(slot.slots)) return true;
    return ALL_TIMES.some((time) => !slot.slots.includes(time));
  };

  const isDateSelected = (slot) => selectedDate?.date === slot.date;

  const selectSlotList = (slot) => {
    setSelectedDate(slot);
    setSelectedTime("");
    setOptionsOpened(false);
  };

  const isTimeAvailable = (time) => {
    if (!selectedDate) return false;
    return (
      selectedDate.slots.includes(time) && !unavailableTimes.includes(time)
    );
  };

  const handleTimeClick = (time) => {
    if (!isTimeAvailable(time)) return;
    setSelectedTime(time);
  };

  /* ---------- SUBMIT ---------- */

  const handleSubmitSlot = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Debes seleccionar una fecha y un horario.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      organizer: formData.organizer,
      email: formData.email,
      name: formData.clientName,
      company: formData.companyName,
      dataTakenBy: formData.takenBy,
      date: selectedDate.date,
      time: selectedTime,
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL_SCHEDULE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("No se pudo confirmar el turno. Intente nuevamente.");
      }

      const data = await response.json();
      console.log("Response data:", data);
      if ("canSchedule" in data && data.canSchedule === false) {
        setUnavailableTimes((prev) => [...prev, selectedTime]);

        throw new Error(
          "The appointment has already been taken by someone else, please select a different time slot",
        );
      }

      console.log("data: ", data);
      setSuccess(true);
      setStep(3);

      setFormData({
        email: "",
        clientName: "",
        companyName: "",
        takenBy: "",
        temperature: "",
        comments: "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error inesperado al confirmar el turno");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- RENDER ---------- */

  return (
    <div className="slot-select">
      <h2>Schedule Appointment</h2>
      <div className="leave">
        <button className="transparent-gray" onClick={() => resetForm()}>
          Leave without scheduling
        </button>
      </div>

      <h3>Select available date:</h3>
      {/* DATE DROPDOWN */}
      {/* DAY HEADERS */}
      <div className="day-headers">
        <span>Monday</span>
        <span>Tuesday</span>
        <span>Wednesday</span>
        <span>Thursday</span>
        <span>Friday</span>
      </div>

      <div className="dropdown-container">
        <div className={`dropdown-options ${optionsOpened ? "appear" : ""}`}>
          {slotsData.map((slot) => {
            const incomplete = hasMissingSlots(slot);
            const selected = isDateSelected(slot);

            return (
              <p
                key={slot.date}
                onClick={() => selectSlotList(slot)}
                className="date-option"
                style={{
                  color: selected ? "#d2f176" : "#e5e7eb",
                  border: selected ? "2px solid #d2f176" : "2px solid #5a5a5a",
                }}
              >
                {slot.date}
                <span>{slot.availability}</span>
              </p>
            );
          })}
        </div>
      </div>

      {/* TIME GRID */}
      <h3>Select available time slot:</h3>

      <ul>
        {ALL_TIMES.map((time) => {
          const available = isTimeAvailable(time);
          const selected = selectedTime === time;

          return (
            <li
              key={time}
              onClick={() => handleTimeClick(time)}
              className="time-option"
              style={{
                opacity: available ? 1 : 0.2,
                cursor: available ? "pointer" : "default",
                color: selected ? "#d2f176" : "#e5e7eb",
                border: selected ? "2px solid #d2f176" : "2px solid #5a5a5a",
              }}
            >
              {time}
            </li>
          );
        })}
      </ul>

      {/* CONFIRMATION */}

      <div className="confirmation">
        <p className="confirmation-value">
          <span>Organizer:</span>
          <span className="value">{formData.organizer}</span>
        </p>
        <p className="confirmation-value">
          <span>Name:</span>
          <span className="value">{formData.clientName}</span>
        </p>
        <p className="confirmation-value">
          <span>Email:</span>
          <span className="value">{formData.email}</span>
        </p>
        <p className="confirmation-value">
          <span>Company:</span>
          <span className="value">{formData.companyName}</span>
        </p>
        <p className="confirmation-value">
          <span>Selected slot:</span>
          <span className="value">
            {selectedDate.date ? selectedDate.date : ""} -{" "}
            {selectedTime ? selectedTime : ""}
          </span>
        </p>
        <div className="slot-select-button-container">
          {loading ? (
            <div className="loader-container-slot-select">
              <img src={loader} alt="Loading..." className="button-loader" />
            </div>
          ) : (
            <button
              className="solid"
              disabled={loading}
              onClick={handleSubmitSlot}
            >
              Schedule Appointment
            </button>
          )}
        </div>
      </div>

      {error && <p className="slot-error">{error}</p>}
    </div>
  );
};
