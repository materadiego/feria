import "./SlotSelect.css";
import { useState } from "react";
import loader from "../loader.svg";
import {
  ArrowPathRoundedSquareIcon,
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

const ORGANIZER_PAIR = ["Estefania Lapenna", "Martina Zajdman"];

const getOtherOrganizer = (current) =>
  ORGANIZER_PAIR.find((o) => o !== current) || "";

const N8N_WEBHOOK_URL_SCHEDULE =
  "https://n8n.srv998702.hstgr.cloud/webhook/ibs-schedule-appointment";

const N8N_WEBHOOK_URL_OTHER_CALENDAR =
  "https://n8n.srv998702.hstgr.cloud/webhook/9593d9bf-7403-4295-88ec-958c6afb2170";

export const SlotSelect = ({
  slotsData: initialSlotsData = [],
  formData,
  loading,
  error,
  setError,
  setLoading,
  setSuccess,
  setStep,
  setFormData,
  resetForm,
}) => {
  const [slotsData, setSlotsData] = useState(initialSlotsData);
  const [activeOrganizer, setActiveOrganizer] = useState(formData.organizer);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTimeArg, setSelectedTimeArg] = useState("");
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [openTimezoneOptions, setOpenTimezoneOptions] = useState(false);
  const [loadingOtherCalendar, setLoadingOtherCalendar] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState({
    region: "USA / Canada",
    name: "Pacific, US/Canada (UTC-8)",
    utc: "UTC-8",
    utcOffset: -8,
    diffWithArgentina: -5,
  });

  const otherOrganizer = getOtherOrganizer(activeOrganizer);

  /* ---------- HELPERS ---------- */

  const isDateSelected = (slot) => selectedDate?.date === slot.date;

  const selectSlotList = (slot) => {
    setSelectedDate(slot);
    setSelectedTime("");
  };

  const isTimeAvailable = (time) => {
    if (!selectedDate) return false;
    return (
      selectedDate.slots.includes(time) && !unavailableTimes.includes(time)
    );
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

  const convertFromArgentina = (time, diff) =>
    minutesToTime(timeToMinutes(time) + diff * 60);

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const [day, month] = date.split("/");
    return `${day}/${month}`;
  };

  /* ---------- SWITCH CALENDAR ---------- */

  const handleSwitchCalendar = async () => {
    setLoadingOtherCalendar(true);
    setError(null);

    try {
      const response = await fetch(N8N_WEBHOOK_URL_OTHER_CALENDAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizer: otherOrganizer }),
      });

      if (!response.ok) throw new Error("Could not load calendar");

      const result = await response.json();
      const slots = result.availabilty || [];

      // Switch al otro organizador y reemplazar slots
      setActiveOrganizer(otherOrganizer);
      setSlotsData(slots);

      // Resetear selección — los slots son de otra agenda
      setSelectedDate("");
      setSelectedTime("");
      setSelectedTimeArg("");
      setUnavailableTimes([]);
    } catch (err) {
      console.error(err);
      setError(
        "Could not load the other organizer's calendar. Please try again.",
      );
    } finally {
      setLoadingOtherCalendar(false);
    }
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
      organizer: activeOrganizer, // usa el organizador activo (puede haber cambiado)
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.companyName,
      dataTakenBy: formData.takenBy,
      date: selectedDate.date,
      time: selectedTimeArg,
      userTime: selectedTime,
      userTimezone: selectedTimezone.name,
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL_SCHEDULE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo confirmar el turno. Intente nuevamente.");
      }

      const data = await response.json();

      if ("canSchedule" in data && data.canSchedule === false) {
        setUnavailableTimes((prev) => [...prev, selectedTime]);
        throw new Error(
          "The appointment has already been taken by someone else, please select a different time slot",
        );
      }

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

      {/* Header actions */}
      {/* Active organizer indicator */}
      <p className="active-organizer-label">
        Viewing calendar of{" "}
        <span className="active-organizer-name">{activeOrganizer}</span>
      </p>
      <div className="slot-select-change-calendar">
        <button
          className={` ${loadingOtherCalendar ? "transparent-gray" : "transparent-green"}`}
          onClick={handleSwitchCalendar}
          disabled={loadingOtherCalendar}
        >
          {loadingOtherCalendar ? (
            <ArrowPathRoundedSquareIcon
              className={`slot-select-calendar-icon  spin`}
            />
          ) : (
            <CalendarIcon className={`slot-select-calendar-icon `} />
          )}
          View {otherOrganizer.split(" ")[0]}'s calendar
        </button>
      </div>

      {/* Date grid */}
      <div className="dropdown-container">
        <h3>Select available date:</h3>
        <div className="day-headers">
          <span>Monday</span>
          <span>Tuesday</span>
          <span>Wednesday</span>
          <span>Thursday</span>
          <span>Friday</span>
        </div>
        <div className="dropdown-options">
          {slotsData.map((slot) => {
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

      {/* Time grid */}
      <div className="timeslot-container">
        <h3>Select available time slot:</h3>
        <div className="timezone-container">
          <p className="timezone-label">Timezone:</p>
          <div className="timezone-subcontainer">
            <p
              className="selected-timezone"
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
                  setSelectedTime(visualTime);
                  setSelectedTimeArg(argTime);
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

      {/* Confirmation */}
      <div className="confirmation">
        <p className="confirmation-value">
          <span>Organizer:</span>
          <span className="value">{activeOrganizer}</span>
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
            {selectedDate.date ? selectedDate.date : ""}
            {selectedTime ? ` - ${selectedTime}` : ""}
            {selectedTime && ` ${selectedTimezone.name}`}
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
              disabled={loading || !selectedDate || !selectedTime}
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
