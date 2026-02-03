import { useState, useEffect } from "react";
import LeadForm from "./LeadForm";
import "./FormContainer.css";
import { SlotSelect } from "./SlotSelect";
import logo from "../worldteams-logo-light.svg";
import { FinishModal } from "./FinishModal";
const N8N_WEBHOOK_URL = "https://n8n.srv998702.hstgr.cloud/webhook/form-ibs-26";

export const FormContainer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = slots
  const [selectModal, setSelectModal] = useState(true);
  const [slotsData, setSlotsData] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    clientName: "",
    companyName: "",
    takenBy: "",
    temperature: "",
    organizer: "",
    comments: "",
    files: null,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const resetForm = () => {
    setFormData({
      email: "",
      clientName: "",
      companyName: "",
      takenBy: "",
      temperature: "",
      organizer: "",
      comments: "",
      files: null,
    });
    setStep(1);
    setSlotsData([]);
    setError(null);
    setSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitter = e.nativeEvent.submitter;
    const scheduleAppointment = submitter?.value === "true";

    // 👉 Validación obligatoria
    if (!formData.email) {
      setError("Email is required");
      return;
    } else if (!formData.clientName) {
      setError("Client name is required");
      return;
    } else if (!formData.takenBy) {
      setError("Data taken by is required");
      return;
    } else if (!formData.temperature) {
      setError("Temperature by is required");
      return;
    }
    // 👉 Validación SOLO para Submit & Schedule
    if (scheduleAppointment && formData.organizer === "") {
      setError(
        "To schedule an appointment, the “Appointment organizer” cannot be empty",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value);
        }
      });

      if (formData.files) {
        Array.from(formData.files).forEach((file) => {
          payload.append("files", file);
        });
      }

      // 👉 NUEVO FLAG
      const containsFiles = !!(formData.files && formData.files.length > 0);
      payload.append("containsFiles", containsFiles);

      payload.append("scheduleAppointment", scheduleAppointment);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Error enviando los datos");
      }

      const result = await response.json();
      console.log("Response from webhook:", result);

      // 👉 SOLO si quiere agendar
      if (scheduleAppointment) {
        const slots = result.availabilty || [];
        setSlotsData(slots);
        setStep(2);
      } else {
        setStep(3);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo enviar el formulario. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    if (step === 1) {
      return (
        <LeadForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          success={success}
          selectModal={selectModal}
          setSelectModal={setSelectModal}
        />
      );
    } else if (step === 2) {
      return (
        <SlotSelect
          slotsData={slotsData}
          formData={formData}
          loading={loading}
          error={error}
          success={success}
          setError={setError}
          setLoading={setLoading}
          setSuccess={setSuccess}
          setStep={setStep}
          setFormData={setFormData}
          resetForm={resetForm}
        />
      );
    } else if (step === 3) {
      return (
        <FinishModal error={error} setStep={setStep} resetForm={resetForm} />
      );
    }
  };
  return (
    <div className="form-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="form-subcontainer">{renderView()}</div>
    </div>
  );
};
