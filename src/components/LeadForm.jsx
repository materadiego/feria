import "./LeadForm.css";
import loader from "../loader.svg";
import {
  CalendarIcon,
  PhotoIcon,
  UserIcon,
  MicrophoneIcon,
  StopCircleIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

const WHISPER_WEBHOOK_URL =
  "https://n8n.srv998702.hstgr.cloud/webhook/f7ba1d3f-3d63-4415-8a5c-80ada7d137f3";

const MAX_RECORDING_SECONDS = 60;

// MediaRecorder sí funciona en Safari/iOS 14.3+
const isRecordingSupported =
  typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

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

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(MAX_RECORDING_SECONDS);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

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
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  /* ---------- VOICE ---------- */

  const startRecording = async () => {
    setVoiceError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Safari graba en audio/mp4, Chrome en audio/webm — detectamos el disponible
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Detener tracks del micrófono
        stream.getTracks().forEach((t) => t.stop());
        clearTimeout(timerRef.current);
        clearInterval(countdownRef.current);
        setIsRecording(false);
        setSecondsLeft(MAX_RECORDING_SECONDS);

        await sendAudioToWebhook(mimeType);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Countdown visual
      setSecondsLeft(MAX_RECORDING_SECONDS);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-stop a los 60s
      timerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_SECONDS * 1000);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setVoiceError(
          "Microphone access denied. Please allow it in your browser settings.",
        );
      } else {
        setVoiceError(`Could not access microphone: ${err.message}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const sendAudioToWebhook = async (mimeType) => {
    setIsTranscribing(true);
    setVoiceError(null);

    try {
      const blob = new Blob(chunksRef.current, { type: mimeType });

      // Convertir a base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const response = await fetch(WHISPER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, mimeType }),
      });

      if (!response.ok) throw new Error("Transcription failed");

      const data = await response.json();
      const transcript = data.transcript || "";

      // Append al texto existente en comments
      const current = formData.comments;
      handleChange({
        target: {
          name: "comments",
          value: current ? `${current} ${transcript}` : transcript,
        },
      });
    } catch (err) {
      console.error(err);
      setVoiceError("Could not transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
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
          <label>Comments</label>

          {isRecordingSupported && (
            <div className="mic-controls">
              <button
                type="button"
                className={`mic-button ${isRecording ? "mic-button-active" : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isOnline || isTranscribing}
                title={
                  !isOnline
                    ? "Not available offline"
                    : isRecording
                      ? "Stop recording"
                      : "Voice note"
                }
              >
                {isRecording ? (
                  <StopCircleIcon className="stop-icon" />
                ) : isTranscribing ? (
                  <ArrowPathRoundedSquareIcon
                    className={`slot-select-calendar-icon  spin`}
                  />
                ) : (
                  <MicrophoneIcon className="mic-icon" />
                )}
                {isRecording && secondsLeft}
              </button>
            </div>
          )}
        </div>

        <textarea
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          className={isRecording ? "textarea-listening" : ""}
        />
        {isRecording && (
          <p className="listening-indicator">
            <span className="listening-dot" /> Recording...
          </p>
        )}
        {isTranscribing && (
          <p className="listening-indicator transcribing">Transcribing...</p>
        )}
        {voiceError && <p className="speech-error">{voiceError}</p>}
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
              .map((f) => f.name)
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
