import { XCircleIcon } from "@heroicons/react/24/outline";
import "./InfoModal.css";

export const InfoModal = ({ setInfoModal }) => {
  return (
    <div className="info-modal">
      <div className="info-modal-overlay">
        <XCircleIcon
          className="info-modal-close-icon"
          onClick={() => setInfoModal(false)}
        />
        <div className="info-modal-container">
          <h2>App Information</h2>
          <div className="info-section-container">
            <h3>Lead Form</h3>
            <h6>Destino de los datos</h6>
            <p>
              La información cargada en el formulario se almacenará en un{" "}
              <a
                href="https://docs.google.com/spreadsheets/d/16h5HDvdivo-RDi4Vg3_gbVOHYLEB4ZRPoU5f_ESDMT0/edit?gid=0#gid=0"
                rel="noreferrer"
                target="_blank"
                className=""
              >
                documento interno de google sheets
              </a>
              . Una vez que la información ingresa en Google Sheets, se crea
              automáticamente el contacto y la compañía en HubSpot.
            </p>
            <h6>Carga de imagen</h6>
            <p>
              Se puede cargar una imagen por cada lead (opcional). Esta imagen
              se almacenará en una{" "}
              <a
                href="https://docs.google.com/spreadsheets/d/16h5HDvdivo-RDi4Vg3_gbVOHYLEB4ZRPoU5f_ESDMT0/edit?gid=0#gid=0"
                rel="noreferrer"
                target="_blank"
                className=""
              >
                carpeta de Google Drive{" "}
              </a>{" "}
              con el nombre y apellido del lead como nombre de archivo.Dentro
              del
              <a
                href="https://docs.google.com/spreadsheets/d/16h5HDvdivo-RDi4Vg3_gbVOHYLEB4ZRPoU5f_ESDMT0/edit?gid=0#gid=0"
                rel="noreferrer"
                target="_blank"
                className=""
              >
                sheet
              </a>
              , figurará el enlace al archivo.
            </p>
            <h6>Campo DM</h6>
            <p>
              Para el campo DM, se detalla a qué tipo de rol corresponde cada
              opción: <br />
              <span className="info-span-green">A:</span> Principal <br />
              <span className="info-span-green"> B:</span> Manager <br />
              <span className="info-span-green"> C:</span> Coordinator
            </p>

            <h6>Campo Temperature</h6>
            <p>
              Para el campo T, se detalla a qué tipo de temperatura corresponde
              cada opción:
              <br />
              <br />
              <span className="info-span-temperature red"></span> Hot <br />
              <br />
              <span className="info-span-temperature orange"></span> Warm <br />
              <br />
              <span className="info-span-temperature blue"></span> Cold <br />
              <br />
            </p>
            <h6>Campo Appointment Organizer</h6>
            <p>
              Este campo será obligatorio únicamente si se va a agendar una
              reunión (utilizando el botón{" "}
              <span className="info-span-green">Submit & Schedule</span>).
            </p>
            <h6>Botón Only Submit</h6>
            <p>
              {" "}
              Al hacer click en este botón, toda la información recopilada en el
              formulario se almacenará en Google Sheets y termina el flujo.
            </p>
            <h6>Botón Submit & Schedule</h6>
            <p>
              Al hacer click en este botón, primero se almacenará toda la
              información del formulario en Google Sheets y luego el formulario
              pasará a una segunda pantalla para seleccionar el día y horario
              del agendamiento.
            </p>
          </div>
          <div className="info-section-container">
            <h3>Schedule Appointment</h3>
            <h6>Leave without scheduling</h6>
            <p>
              En la parte superior derecha se encuentra el botón{" "}
              <span className="info-span-green">Leave without scheduling</span>,
              que permite volver a la pantalla principal en caso de haber
              llegado a esta sección pero finalmente no realizar un
              agendamiento. En este punto, todos los datos del lead ya se
              encuentran guardados en Google Sheets, por lo que no se perderá
              información.
            </p>
            <h6>Select available date</h6>
            <p>
              En esta sección se mostrarán los días disponibles para agendar con
              la persona seleccionada (staff interno). Dentro del recuadro
              figurará el día y, en la esquina superior derecha, un número en
              color verde indicará cuántos slots disponibles quedan para ese
              día. Al seleccionar un día, se mostrarán en la sección inferior
              (Select available time slot) los horarios disponibles para el
              agendamiento.
            </p>
            <h6>Select available time slot</h6>
            <p>
              En esta sección es posible seleccionar distintos timezones (USA,
              Canadá y Argentina) según el huso horario del lead, para brindarle
              información más precisa. Esto no modifica los horarios en el
              calendario del staff interno; se utiliza únicamente para comunicar
              al lead el horario de la videollamada en su propio huso horario.
              Todas las conversiones se realizan automáticamente. <br />
              <br></br>
              El timezone que aparecerá por defecto es{" "}
              <span className="info-span-green">
                Eastern, US/Canada (UTC-5)
              </span>
              , correspondiente a Orlando.
              <br />
              <br />
              Una vez agendada la reunion, la data de la misma será actualizada
              en el registro de lead del{" "}
              <a
                href="https://docs.google.com/spreadsheets/d/16h5HDvdivo-RDi4Vg3_gbVOHYLEB4ZRPoU5f_ESDMT0/edit?gid=0#gid=0"
                rel="noreferrer"
                target="_blank"
                className=""
              >
                documento interno de google sheets
              </a>{" "}
              creado en el paso anterior y luego se actualiza automáticamente en
              hubspot. Luego se esperará determiando tiempo (un par de horas), y
              saldrá automáticamente un email de bienvenida para el nuevo lead.
            </p>
          </div>
          <button
            className="close-button transparent-gray"
            onClick={() => {
              setInfoModal(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
