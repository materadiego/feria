import { CheckCircleIcon } from "@heroicons/react/24/outline";
import "./FinishModal.css";
export const FinishModal = ({ resetForm }) => {
  return (
    <div className="FinishModal">
      <CheckCircleIcon className="finish-icon" />
      <p className="finish-message">Success! </p>
      <button className="solid" onClick={() => resetForm()}>
        Create new lead
      </button>
    </div>
  );
};
