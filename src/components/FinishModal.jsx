import { CheckCircleIcon, CloudIcon } from "@heroicons/react/24/outline";
import "./FinishModal.css";

export const FinishModal = ({ savedOffline, resetForm }) => {
  if (savedOffline) {
    return (
      <div className="FinishModal">
        <CloudIcon className="finish-icon offline" />
        <p className="finish-message">Saved offline</p>
        <p className="finish-submessage">
          This lead has been queued and will be sent to the system automatically
          once your connection is restored. No action needed.
        </p>
        <button className="solid" onClick={() => resetForm()}>
          Create new lead
        </button>
      </div>
    );
  }

  return (
    <div className="FinishModal">
      <CheckCircleIcon className="finish-icon online" />
      <p className="finish-message">Success!</p>
      <button className="solid" onClick={() => resetForm()}>
        Create new lead
      </button>
    </div>
  );
};
