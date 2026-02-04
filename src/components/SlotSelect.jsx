import "./SlotSelect.css";
import { useState } from "react";
import loader from "../loader.svg";
import {
  ArrowUturnLeftIcon,
  BarsArrowDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const ALL_TIMES = [
  "09:30",
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
  "17:30",
];

const TIMEZONES = [
  {
    region: "Argentina",
    name: "Argentina (UTC-3)",
    utc: "UTC-3",
    utcOffset: -3,
    diffWithArgentina: 0,
  },
  {
    region: "USA / Canada",
    name: "Eastern, US/Canada (UTC-5)",
    utc: "UTC-5",
    utcOffset: -5,
    diffWithArgentina: -2,
  },
  {
    region: "USA / Canada",
    name: "Central, US/Canada (UTC-6)",
    utc: "UTC-6",
    utcOffset: -6,
    diffWithArgentina: -3,
  },
  {
    region: "USA / Canada",
    name: "Mountain, US/Canada (UTC-7)",
    utc: "UTC-7",
    utcOffset: -7,
    diffWithArgentina: -4,
  },
  {
    region: "USA / Canada",
    name: "Pacific, US/Canada (UTC-8)",
    utc: "UTC-8",
    utcOffset: -8,
    diffWithArgentina: -5,
  },
  {
    region: "USA",
    name: "Alaska, US (UTC-9)",
    utc: "UTC-9",
    utcOffset: -9,
    diffWithArgentina: -6,
  },
  {
    region: "USA",
    name: "Hawaii-Aleutian, US (UTC-10)",
    utc: "UTC-10",
    utcOffset: -10,
    diffWithArgentina: -7,
  },
  {
    region: "Canada",
    name: "Atlantic, Canada (UTC-4)",
    utc: "UTC-4",
    utcOffset: -4,
    diffWithArgentina: -1,
  },
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
  const [selectedTimeArg, setSelectedTimeArg] = useState("");
  const [optionsOpened, setOptionsOpened] = useState(false);
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [openTimezoneOptions, setOpenTimezoneOptions] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState({
    region: "USA / Canada",
    name: "Eastern, US/Canada (UTC-5)",
    utc: "UTC-5",
    utcOffset: -5,
    diffWithArgentina: -2,
  });
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

  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  // Convierte hora ARG (UTC-3) → timezone seleccionado
  const convertFromArgentina = (time, diff) => {
    return minutesToTime(timeToMinutes(time) + diff * 60);
  };

  // Convierte hora timezone → ARG (UTC-3)
  const convertToArgentina = (time, diff) => {
    return minutesToTime(timeToMinutes(time) - diff * 60);
  };

  const formatDateForDisplay = (date) => {
    // Espera formato DD/MM/YYYY
    if (!date) return "";
    const [day, month] = date.split("/");
    return `${day}/${month}`;
  };

  /* ---------- SUBMIT ---------- */

  const handleSubmitSlot = async () => {
    if (!selectedDate || !selectedTime) {
      setError("You must select a date and time");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      organizer: formData.organizer,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.companyName,
      dataTakenBy: formData.takenBy,
      date: selectedDate.date,
      time: selectedTimeArg,
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
        firstName: "",
        lastName: "",
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
          <ArrowUturnLeftIcon className="arrow-icon" /> Leave without scheduling
        </button>
      </div>
      <div className="dropdown-container">
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
                {formatDateForDisplay(slot.date)}
                <span>{slot.availability}</span>
              </p>
            );
          })}
        </div>
      </div>

      {/* TIME GRID */}
      <div className="timeslot-container">
        <h3>Select available time slot:</h3>
        <div className="timezone-container">
          <p className="timezone-label">Timezone:</p>
          <div className="timezone-subcontainer">
            <p
              className={`selected-timezone `}
              onClick={() => setOpenTimezoneOptions(!openTimezoneOptions)}
            >
              {selectedTimezone.name}{" "}
              <BarsArrowDownIcon
                className={`time-zone-icon ${openTimezoneOptions ? "opened" : ""}`}
              />
            </p>
            {openTimezoneOptions && (
              <div className="timezone-options">
                {TIMEZONES.map((tz) => (
                  <p
                    key={tz.name}
                    className={`timezone-option ${selectedTimezone.name === tz.name ? "timezone-option-selected" : ""}`}
                    onClick={() => {
                      setSelectedTimezone(tz);
                      setOpenTimezoneOptions(false);
                      setSelectedTime("");
                      setSelectedTimeArg("");
                    }}
                  >
                    {tz.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <ul>
          {ALL_TIMES.map((argTime) => {
            const visualTime = convertFromArgentina(
              argTime,
              selectedTimezone.diffWithArgentina,
            );

            const available = isTimeAvailable(argTime);
            const selected = selectedTime === visualTime;

            return (
              <li
                key={argTime}
                onClick={() => {
                  if (!available) return;

                  setSelectedTime(visualTime); // timezone aplicado
                  setSelectedTimeArg(argTime); // hora real ARG
                }}
                className="time-option"
                style={{
                  opacity: available ? 1 : 0.2,
                  cursor: available ? "pointer" : "default",
                  color: selected ? "#d2f176" : "#e5e7eb",
                  border: selected ? "2px solid #d2f176" : "2px solid #5a5a5a",
                }}
              >
                {visualTime}
              </li>
            );
          })}
        </ul>
      </div>
      {/* CONFIRMATION */}

      <div className="confirmation">
        <p className="confirmation-value">
          <span>Organizer:</span>
          <span className="value">{formData.organizer}</span>
        </p>
        <p className="confirmation-value">
          <span>Name:</span>
          <span className="value">
            {formData.firstName} {formData.lastName}
          </span>
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
        <p className="confirmation-value">
          <span>Selected slot arg:</span>
          <span className="value">
            {selectedDate.date ? selectedDate.date : ""} -{" "}
            {selectedTimeArg ? selectedTimeArg : ""}
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
              <CalendarIcon className="calendar-icon" /> Schedule Appointment
            </button>
          )}
        </div>
      </div>

      {error && <p className="slot-error">{error}</p>}
    </div>
  );
};
