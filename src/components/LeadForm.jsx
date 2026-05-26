import "./LeadForm.css";
import loader from "../loader.svg";
import { CalendarIcon, PhotoIcon, UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function LeadForm({
  formData,
  handleChange,
  handleSubmit,
  loading,
  error,
  isOnline,
}) {
  const [onlySubmitDisabled, setOnlySubmitDisabled] = useState(true);
  const [submitScheduleDisabled, setSubmitScheduleDisabled] = useState(true);

  useEffect(() => {
    const {
      firstName,
      lastName,
      email,
      companyName,
      takenBy,
      dm,
      temperature,
      organizer,
    } = formData;

    const isOnlySubmitDisabled =
      !firstName ||
      !lastName ||
      !email ||
      !companyName ||
      !takenBy ||
      !dm ||
      !temperature;

    // Submit & Schedule requiere conexión + organizer
    const isSubmitScheduleDisabled =
      isOnlySubmitDisabled || organizer === "" || !isOnline;

    setOnlySubmitDisabled(isOnlySubmitDisabled);
    setSubmitScheduleDisabled(isSubmitScheduleDisabled);
  }, [formData, isOnline]);

  return (
    <form onSubmit={handleSubmit} className="lead-form">
      <h2>Lead Data</h2>

      <div className="row">
        <div>
          <label>
            First Name <span className="required-field">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>
            Last Name <span className="required-field">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>
            Email <span className="required-field">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="no-spinner"
          />
        </div>
        <div>
          <label>
            Company Name <span className="required-field">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label>
          Comments <span className="required-field">*</span>
        </label>
        <textarea
          name="comments"
          value={formData.comments}
          onChange={handleChange}
        />
      </div>

      <div className="file-upload">
        <label
          htmlFor="files"
          className={`file-button ${formData.files?.length ? "file-selected" : ""}`}
          style={{
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PhotoIcon className="photo-icon" />
          {formData.files?.length ? "Image selected" : "Upload image"}
        </label>
        <input
          id="files"
          type="file"
          name="files"
          accept="image/*"
          onChange={handleChange}
          hidden
        />
        {formData.files?.length > 0 && (
          <span className="file-name">
            {Array.from(formData.files)
              .map((file) => file.name)
              .join(", ")}
          </span>
        )}
      </div>

      <div className="row">
        <div>
          <label>
            Data taken by <span className="required-field">*</span>
          </label>
          {["Dyna Efraimsky", "Julieta Di Cio", "Malena Brugger"].map(
            (name) => (
              <label key={name} className="radio-label">
                <input
                  type="radio"
                  name="takenBy"
                  value={name}
                  checked={formData.takenBy === name}
                  onChange={handleChange}
                />
                {name}
              </label>
            ),
          )}
        </div>
        <div>
          <label>
            DM <span className="required-field">*</span>
          </label>
          {["A", "B", "C"].map((dm) => (
            <label key={dm} className="radio-label">
              <input
                type="radio"
                name="dm"
                value={dm}
                checked={formData.dm === dm}
                onChange={handleChange}
              />
              {dm}
            </label>
          ))}
        </div>
        <div>
          <label>
            T <span className="required-field">*</span>
          </label>
          {["Hot", "Warm", "Cold"].map((temp) => (
            <label key={temp} className="radio-label">
              <input
                type="radio"
                name="temperature"
                value={temp}
                checked={formData.temperature === temp}
                onChange={handleChange}
              />
              <span className={`temperature-button ${temp}`}></span>
            </label>
          ))}
        </div>
        <div className="appointment-organizer">
          <label>
            Appointment organizer{" "}
            <span className="required-meeting-field">
              *(Required if a meet will be scheduled)
            </span>
          </label>
          {["Estefania Lapenna", "Martina Zajdman"].map((name) => (
            <label key={name} className="radio-label">
              <input
                type="radio"
                name="organizer"
                value={name}
                checked={formData.organizer === name}
                onChange={handleChange}
                disabled={!isOnline}
              />
              {name}
            </label>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loader-container-lead-form">
          <img src={loader} alt="Loading..." className="button-loader" />
        </div>
      ) : (
        <div className="lead-form-button-container">
          <button
            className="transparent-green"
            type="submit"
            name="schedule"
            value="false"
            disabled={loading || onlySubmitDisabled}
          >
            <UserIcon className="user-icon" />
            {isOnline ? "Only Submit" : "Save Offline"}
          </button>
          <button
            className="solid"
            type="submit"
            name="schedule"
            value="true"
            disabled={loading || submitScheduleDisabled}
            title={!isOnline ? "Not available offline" : ""}
          >
            <CalendarIcon className="calendar-icon" /> Submit & Schedule
          </button>
        </div>
      )}

      {!isOnline && (
        <p className="offline-notice">
          You are offline. "Submit & Schedule" is unavailable. Leads submitted
          now will be saved and sent automatically when connection is restored.
        </p>
      )}

      {error && <p className="error">{error}</p>}
    </form>
  );
}
