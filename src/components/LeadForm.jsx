import "./LeadForm.css";
import loader from "../loader.svg";
import {
  CalendarIcon,
  PhotoIcon,
  UserIcon,
  MicrophoneIcon,
  StopCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

// Web Speech API está disponible en Chrome y Edge (no Firefox, no Safari)
const isSpeechSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

const SpeechRecognitionAPI = isSpeechSupported
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

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
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);

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

    const isSubmitScheduleDisabled =
      isOnlySubmitDisabled || organizer === "" || !isOnline;

    setOnlySubmitDisabled(isOnlySubmitDisabled);
    setSubmitScheduleDisabled(isSubmitScheduleDisabled);
  }, [formData, isOnline]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /* ---------- SPEECH ---------- */

  const startListening = () => {
    setSpeechError(null);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "es-ES"; // cambiá a "en-US" si el evento es en inglés
    recognition.continuous = true; // sigue escuchando sin cortar
    recognition.interimResults = true; // muestra texto mientras habla

    let finalTranscript = formData.comments;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + transcript;
        } else {
          interim = transcript;
        }
      }
      // Synthetic event para reutilizar handleChange del padre
      handleChange({
        target: {
          name: "comments",
          value: finalTranscript + (interim ? " " + interim : ""),
        },
      });
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setSpeechError(
          "Microphone access denied. Please allow it in your browser settings.",
        );
      } else if (event.error !== "aborted") {
        setSpeechError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // Cuando termina, aseguramos que comments quede con el transcript final limpio
      handleChange({
        target: { name: "comments", value: finalTranscript },
      });
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  /* ---------- RENDER ---------- */

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

      {/* Comments + voice */}
      <div className="comments-container">
        <div className="comments-label-row">
          <label>
            Comments <span className="required-field">*</span>
          </label>
          {isSpeechSupported && (
            <button
              type="button"
              className={`mic-button ${isListening ? "mic-button-active" : ""}`}
              onClick={isListening ? stopListening : startListening}
              disabled={!isOnline}
              title={isListening ? "Stop recording" : "Voice to text"}
            >
              {isListening ? (
                <>
                  <StopCircleIcon className="stop-icon" />
                </>
              ) : (
                <>
                  <MicrophoneIcon className="mic-icon" />
                </>
              )}
            </button>
          )}
        </div>

        <textarea
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          className={isListening ? "textarea-listening" : ""}
        />

        {speechError && <p className="speech-error">{speechError}</p>}
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
            <label
              key={name}
              className={`radio-label ${!isOnline ? "radio-label-disabled" : ""}`}
            >
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
