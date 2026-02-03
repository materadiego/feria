import "./LeadForm.css";
import loader from "../loader.svg";
import { CalendarIcon, UserIcon } from "@heroicons/react/24/outline";

export default function LeadForm({
  formData,
  handleChange,
  handleSubmit,
  loading,
  error,
  selectModal,
  setSelectModal,
}) {
  return (
    <form onSubmit={handleSubmit} className="lead-form">
      <h2>Lead Data</h2>

      <div className="row">
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row">
        <div>
          <label>Data taken by</label>
          {["Camila Brugger", "Camila Malvaso", "Martina Obregon"].map(
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
          <label>Temperature</label>
          {["Cold", "Warm", "Hot"].map((temp) => (
            <label key={temp} className="radio-label">
              <input
                type="radio"
                name="temperature"
                value={temp}
                checked={formData.temperature === temp}
                onChange={handleChange}
              />
              {temp}
            </label>
          ))}
        </div>
        <div className="appointment-organizer">
          <label>Appointment organizer</label>
          {["Malena Brugger", "Martina Zajdman"].map((temp) => (
            <label key={temp} className="radio-label">
              <input
                type="radio"
                name="organizer"
                value={temp}
                checked={formData.organizer === temp}
                onChange={handleChange}
              />
              {temp}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label>Comments</label>
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
            disabled={loading}
          >
            <UserIcon className="user-icon" /> Only Submit
          </button>
          <button
            className="solid"
            type="submit"
            name="schedule"
            value="true"
            disabled={loading}
          >
            <CalendarIcon className="calendar-icon" /> Submit & Schedule
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </form>
  );
}
