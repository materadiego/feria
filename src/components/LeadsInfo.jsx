import { useState, useEffect } from "react";
import {
  ArrowPathIcon,
  BuildingOffice2Icon,
  CheckIcon,
  EnvelopeIcon,
  RocketLaunchIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import "./LeadsInfo.css";

const N8N_GET_URL =
  "https://n8n.srv998702.hstgr.cloud/webhook/038cbbec-ab2a-41d7-ab50-e59679d312bb";
const N8N_EDIT_URL =
  "https://n8n.srv998702.hstgr.cloud/webhook/02d4c38d-ee56-4f2b-8d33-ea69e58c63dc";
const QUEUE_KEY = "ibs_queue";

const FILTERS = [
  "All",
  "Uploaded",
  "Waiting",
  "Scheduled",
  "Dyna",
  "Male",
  "Juli",
];

const TAKEN_BY_OPTIONS = ["Dyna Efraimsky", "Julieta Di Cio", "Malena Brugger"];
const DM_OPTIONS = ["A", "B", "C"];
const TEMPERATURE_OPTIONS = ["Hot", "Warm", "Cold"];

const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
};

const queueItemToLead = (item) => ({
  _id: item.id,
  _source: "queue",
  email: item.formData.email,
  first_name: item.formData.firstName,
  last_name: item.formData.lastName,
  "Company Name": item.formData.companyName,
  taken_by: item.formData.takenBy,
  scheduled_meet: false,
  _queuedAt: item.queuedAt,
});

// ── Edit form ───────────────────────────────────────────────────────────────
const PillRadioGroup = ({ label, name, options, value, onChange, variant }) => (
  <div className="lead-edit-pill-group">
    <label>{label}</label>
    <div className="lead-edit-pill-row">
      {options.map((opt) => (
        <label key={opt} className="radio-label">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={onChange}
          />
          {variant === "temperature" ? (
            <span className={`temperature-button ${opt}`}></span>
          ) : (
            opt
          )}
        </label>
      ))}
    </div>
  </div>
);

const LeadEditForm = ({ lead, onCancel, onSaved }) => {
  const initialValues = {
    first_name: lead.first_name || "",
    last_name: lead.last_name || "",
    email: lead.email || "",
    company_name: lead["Company Name"] || "",
    taken_by: lead.taken_by || "",
    phone: lead.phone || "",
    comments: lead.comments || "",
    decision_maker: lead.decision_maker || "",
    temperature: lead.temperature || "",
  };

  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const isDirty = Object.keys(initialValues).some(
    (key) => values[key] !== initialValues[key],
  );

  const isValid =
    TAKEN_BY_OPTIONS.includes(values.taken_by) &&
    DM_OPTIONS.includes(values.decision_maker) &&
    TEMPERATURE_OPTIONS.includes(values.temperature);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(N8N_EDIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: lead._id,
          row_number: lead.row_number,
          ...values,
        }),
      });
      if (!response.ok) throw new Error("Could not save changes");
      onSaved({ ...lead, ...values, "Company Name": values.company_name });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lead-edit-form">
      <button className="lead-edit-back transparent-gray" onClick={onCancel}>
        <ArrowLeftIcon className="lead-edit-back-icon" /> Back
      </button>
      <label className="lead-edit-label">
        Email
        <input
          name="email"
          type="email"
          value={values.email}
          className="lead-edit-input"
          readOnly
        />
      </label>
      <label className="lead-edit-label">
        First name
        <input
          name="first_name"
          value={values.first_name}
          onChange={handleChange}
          className="lead-edit-input"
        />
      </label>
      <label className="lead-edit-label">
        Last name
        <input
          name="last_name"
          value={values.last_name}
          onChange={handleChange}
          className="lead-edit-input"
        />
      </label>

      <label className="lead-edit-label">
        Company
        <input
          name="company_name"
          value={values.company_name}
          onChange={handleChange}
          className="lead-edit-input"
        />
      </label>
      <label className="lead-edit-label">
        Phone
        <input
          name="phone"
          value={values.phone}
          onChange={handleChange}
          className="lead-edit-input"
        />
      </label>
      <label className="lead-edit-label">
        Comments
        <textarea
          name="comments"
          value={values.comments}
          onChange={handleChange}
          className="lead-edit-input"
        />
      </label>
      <PillRadioGroup
        label="Taken by"
        name="taken_by"
        options={TAKEN_BY_OPTIONS}
        value={values.taken_by}
        onChange={handleChange}
      />
      <PillRadioGroup
        label="Temperature"
        name="temperature"
        options={TEMPERATURE_OPTIONS}
        value={values.temperature}
        onChange={handleChange}
        variant="temperature"
      />
      <PillRadioGroup
        label="Decision Maker"
        name="decision_maker"
        options={DM_OPTIONS}
        value={values.decision_maker}
        onChange={handleChange}
      />

      {error && <p className="leads-error">{error}</p>}

      <button
        className="lead-edit-submit transparent-green"
        onClick={handleSubmit}
        disabled={saving || !isDirty || !isValid}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
};

export const LeadsInfo = () => {
  const [remoteLeads, setRemoteLeads] = useState([]);
  const [queueLeads, setQueueLeads] = useState([]);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoadingRemote(true);
      setFetchError(null);
      try {
        const response = await fetch(N8N_GET_URL);
        if (!response.ok) throw new Error("Could not fetch leads");
        const json = await response.json();
        setRemoteLeads(json.data || []);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoadingRemote(false);
      }
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    const syncQueue = () => setQueueLeads(getQueue().map(queueItemToLead));
    syncQueue();
    window.addEventListener("storage", syncQueue);
    return () => window.removeEventListener("storage", syncQueue);
  }, []);

  const allLeads = [
    ...queueLeads,
    ...remoteLeads.map((l) => ({ ...l, _source: "remote" })),
  ];

  const filtered = allLeads.filter((lead) => {
    const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase();
    const company = (lead["Company Name"] || "").toLowerCase();
    const matchesSearch =
      !search ||
      fullName.includes(search.toLowerCase()) ||
      company.includes(search.toLowerCase());

    const TAKENBY_FILTER_MAP = {
      Dyna: "Dyna Efraimsky",
      Male: "Malena Brugger",
      Juli: "Julieta Di Cio",
    };

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Waiting" && lead._source === "queue") ||
      (activeFilter === "Uploaded" &&
        lead._source === "remote" &&
        !lead.scheduled_meet) ||
      (activeFilter === "Scheduled" &&
        lead._source === "remote" &&
        lead.scheduled_meet) ||
      (TAKENBY_FILTER_MAP[activeFilter] &&
        lead.taken_by === TAKENBY_FILTER_MAP[activeFilter]);

    return matchesSearch && matchesFilter;
  });
  const totalCount = allLeads.length;
  const filteredCount = filtered.length;

  const handleSaved = (updatedLead) => {
    setRemoteLeads((prev) =>
      prev.map((l) =>
        l.row_number === updatedLead.row_number ? updatedLead : l,
      ),
    );
    setEditingLead(null);
  };

  const renderStatus = (lead) => {
    if (lead._source === "queue") {
      return (
        <p className="lead-status lead-status-waiting">
          <ArrowPathIcon className="lead-system-data-waiting" /> Waiting for
          sync
        </p>
      );
    }
    return (
      <p className="lead-status lead-status-ok">
        <CheckIcon className="lead-system-data-check" /> Uploaded
      </p>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="leads-info-container">
      {editingLead ? (
        <LeadEditForm
          lead={editingLead}
          onCancel={() => setEditingLead(null)}
          onSaved={handleSaved}
        />
      ) : (
        <>
          <div className="leads-info-search">
            <input
              className="leads-info-search-input"
              placeholder="Search lead name or company"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="leads-info-filters">
            {FILTERS.map((f) => (
              <p
                key={f}
                className={activeFilter === f ? "filter-active" : ""}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </p>
            ))}
          </div>
          <div className="leads-count">
            <span>
              {filteredCount}/{totalCount}
            </span>
          </div>

          <div className="lead-info-subcontainer">
            {loadingRemote && (
              <p className="leads-loading">
                <ArrowPathIcon className="spinning" /> Loading...
              </p>
            )}
            {fetchError && (
              <p className="leads-error">
                Could not load remote leads. Showing local data only.
              </p>
            )}
            {!loadingRemote && filtered.length === 0 && (
              <p className="leads-empty">
                <MagnifyingGlassIcon className="leads-empty-icon" /> No leads
                found
              </p>
            )}

            {filtered.map((lead, index) => (
              <div
                className={`lead-card ${lead.temperature?.toLowerCase() || ""}`}
                key={lead._id || lead.row_number || index}
              >
                <div className="lead-data">
                  <p className="lead-name">
                    <UserCircleIcon className="lead-card-user-icon" />
                    {lead.first_name} {lead.last_name}
                  </p>
                  <p className="lead-email">
                    <EnvelopeIcon className="lead-card-email-icon" />
                    {lead.email}
                  </p>
                  <p className="lead-company">
                    <BuildingOffice2Icon className="lead-card-company-icon" />
                    {lead["Company Name"]}
                  </p>
                  <button
                    className="lead-edit-button"
                    onClick={() => setEditingLead(lead)}
                  >
                    Edit
                  </button>
                </div>
                <div className="lead-card-system-data">
                  {renderStatus(lead)}
                  {lead.taken_by && (
                    <p className="lead-taken-by">
                      <RocketLaunchIcon className="lead-system-data-rocket" />
                      By {lead.taken_by}
                    </p>
                  )}
                  {lead.scheduled_meet && (
                    <p className="lead-status-scheduled">
                      <CalendarDaysIcon className="lead-system-data-calendar" />
                      {lead.schedule_date} · {lead.schedule_time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
