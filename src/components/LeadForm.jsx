import "./LeadForm.css";
import loader from "../loader.svg";
import { CalendarIcon, PhotoIcon, UserIcon } from "@heroicons/react/24/outline";

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
          {" "}
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
          {["Camila Brugger", "Camila Malvaso", "Martina Obregón"].map(
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
