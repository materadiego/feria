export const AppInformation = () => {
  return (
    <>
      <div className="info-section-container">
        <h3>Lead Form</h3>
        <h6>Destino de los datos</h6>
        <p>
          La información cargada en el formulario se almacenará en un{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1tZGl1kBD3iVT_JicWh9JN5LnniiaCm3OVjW-uXEkEZM/edit?gid=0#gid=0"
            rel="noreferrer"
            target="_blank"
          >
            documento interno de google sheets
          </a>
          . Una vez que la información ingresa en Google Sheets, se crea
          automáticamente el contacto y la compañía en HubSpot.
        </p>
        <h6>Carga de imagen</h6>
        <p>
          Se puede cargar una imagen por cada lead (opcional). Esta imagen se
          almacenará en una{" "}
          <a
            href="https://drive.google.com/drive/folders/1ELnk3dF1pUDHL4pevTWLeP60TFlUloBK"
            rel="noreferrer"
            target="_blank"
          >
            carpeta de Google Drive
          </a>{" "}
          con el nombre y apellido del lead como nombre de archivo. Dentro del{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1tZGl1kBD3iVT_JicWh9JN5LnniiaCm3OVjW-uXEkEZM/edit?gid=0#gid=0"
            rel="noreferrer"
            target="_blank"
          >
            sheet
          </a>
          , figurará el enlace al archivo. Ten en cuenta que si la app se
          recarga o se pierde la conexión antes de hacer submit,{" "}
          <span className="info-span-orange">
            la imagen deberá cargarse nuevamente
          </span>
          , ya que los archivos no pueden guardarse en sesión por limitaciones
          del navegador. El resto de los campos del formulario sí se conservan.
        </p>
        <h6>Campo DM</h6>
        <p>
          Para el campo DM, se detalla a qué tipo de rol corresponde cada
          opción: <br />
          <span className="info-span-green">A:</span> Principal <br />
          <span className="info-span-green">B:</span> Manager <br />
          <span className="info-span-green">C:</span> Coordinator
        </p>
        <h6>Campo Temperature</h6>
        <p>
          Para el campo T, se detalla a qué tipo de temperatura corresponde cada
          opción:
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
          Este campo será obligatorio únicamente si se va a agendar una reunión
          (utilizando el botón{" "}
          <span className="info-span-green">Submit & Schedule</span>).
        </p>
        <h6>Botón Only Submit</h6>
        <p>
          Al hacer click en este botón, toda la información recopilada en el
          formulario se enviará a Google Sheets y termina el flujo. Si la app se
          encuentra sin conexión al momento de hacer click, el lead se guardará
          localmente y se enviará de forma automática en cuanto se restaure la
          conexión (ver sección{" "}
          <span className="info-span-green">Modo Offline</span>).
        </p>
        <h6>Botón Submit & Schedule</h6>
        <p>
          Al hacer click en este botón, primero se almacenará toda la
          información del formulario en Google Sheets y luego el formulario
          pasará a una segunda pantalla para seleccionar el día y horario del
          agendamiento.{" "}
          <span className="info-span-orange">
            Este botón solo está disponible con conexión a internet.
          </span>{" "}
          Si no hay conexión, el botón aparecerá deshabilitado.
        </p>
        <h6>Botón Reset Session</h6>
        <p>
          El botón <span className="info-span-green">Reset Session</span>{" "}
          ubicado en el header limpia todos los datos del formulario y la sesión
          activa. No elimina leads que ya hayan sido enviados ni los que estén
          en cola offline esperando sincronización.
        </p>
      </div>

      <div className="info-section-container">
        <h3>Modo Offline</h3>
        <h6>Indicador de conexión</h6>
        <p>
          En el header de la app se muestra en todo momento el estado de la
          conexión: <span className="info-span-green">Online</span> cuando hay
          conectividad, y <span className="info-span-orange">Offline</span>{" "}
          cuando no la hay. El estado se verifica automáticamente cada 10
          segundos mediante un chequeo activo, por lo que puede haber una demora
          de hasta 10 segundos en reflejar un cambio de conectividad.
        </p>
        <h6>Submit sin conexión</h6>
        <p>
          Si se completa el formulario y se presiona{" "}
          <span className="info-span-green">Only Submit</span> (que en modo
          offline aparece como{" "}
          <span className="info-span-green">Save Offline</span>) sin conexión,
          el lead se guarda localmente en el dispositivo. La pantalla de
          confirmación indicará que el lead fue guardado offline y será enviado
          automáticamente cuando se restaure la conexión.
        </p>
        <h6>Sincronización automática</h6>
        <p>
          Cuando la app detecta que volvió la conexión, comienza a enviar los
          leads pendientes de forma automática, de a uno por vez, con un
          intervalo de 10 segundos entre cada envío. Esto se realiza en segundo
          plano y no interrumpe el uso del formulario. El indicador del header
          mostrará{" "}
          <span className="info-span-green">Online · syncing N pending</span>{" "}
          mientras haya leads en cola. Cada lead se elimina de la cola local
          únicamente cuando el servidor confirma la recepción con una respuesta
          exitosa.
        </p>
        <h6>Persistencia de sesión</h6>
        <p>
          Los datos ingresados en el formulario se guardan automáticamente en
          sesión ante cualquier cambio. Si la app se recarga o se pierde la
          conexión, los campos de texto, radios y selecciones se recuperan
          automáticamente al volver a abrir la app. La sesión se limpia al
          completar el flujo (submit exitoso o agendamiento) y también al
          presionar <span className="info-span-green">Reset Session</span>.
        </p>
      </div>

      <div className="info-section-container">
        <h3>Schedule Appointment</h3>
        <h6>Leave without scheduling</h6>
        <p>
          En la parte superior se encuentra el botón{" "}
          <span className="info-span-green">Leave without scheduling</span>, que
          permite volver a la pantalla principal en caso de haber llegado a esta
          sección pero finalmente no realizar un agendamiento. En este punto,
          todos los datos del lead ya se encuentran guardados en Google Sheets,
          por lo que no se perderá información.
        </p>
        <h6>Select available date</h6>
        <p>
          En esta sección se mostrarán los días disponibles para agendar con la
          persona seleccionada (staff interno). Dentro del recuadro figurará el
          día y, en la esquina superior derecha, un número en color verde
          indicará cuántos slots disponibles quedan para ese día. Al seleccionar
          un día, se mostrarán en la sección inferior (Select available time
          slot) los horarios disponibles para el agendamiento.
        </p>
        <h6>Select available time slot</h6>
        <p>
          En esta sección es posible seleccionar distintos timezones (USA,
          Canadá y Argentina) según el huso horario del lead, para brindarle
          información más precisa. Esto no modifica los horarios en el
          calendario del staff interno; se utiliza únicamente para comunicar al
          lead el horario de la videollamada en su propio huso horario. Todas
          las conversiones se realizan automáticamente.
          <br />
          <br />
          El timezone que aparecerá por defecto es{" "}
          <span className="info-span-green">Eastern, US/Canada (UTC-5)</span>,
          correspondiente a Orlando.
          <br />
          <br />
          Una vez agendada la reunión, la data de la misma será actualizada en
          el registro del lead en el{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1tZGl1kBD3iVT_JicWh9JN5LnniiaCm3OVjW-uXEkEZM/edit?gid=0#gid=0"
            rel="noreferrer"
            target="_blank"
          >
            documento interno de google sheets
          </a>{" "}
          y luego se actualizará automáticamente en HubSpot. Pasadas algunas
          horas, saldrá automáticamente un email de bienvenida para el nuevo
          lead.
        </p>
      </div>

      <div className="info-section-container">
        <h3>Leads Info</h3>
        <h6>Visualización de leads</h6>
        <p>
          La pantalla de Leads Info muestra todos los leads cargados. Se
          combinan dos fuentes de datos: los leads ya sincronizados con el
          servidor (obtenidos en tiempo real) y los leads guardados localmente
          que aún están esperando sincronización, los cuales aparecen con el
          estado <span className="info-span-orange">Waiting for sync</span> al
          inicio de la lista.
        </p>
        <h6>Filtros</h6>
        <p>
          Es posible filtrar los leads por estado o por responsable. Los filtros
          disponibles son:
          <br />
          <br />
          <span className="info-span-green">All:</span> muestra todos los leads.
          <br />
          <span className="info-span-green">Uploaded:</span> leads ya enviados
          al servidor sin reunión agendada.
          <br />
          <span className="info-span-green">Waiting:</span> leads guardados
          localmente pendientes de sincronización.
          <br />
          <span className="info-span-green">Scheduled:</span> leads con reunión
          agendada.
          <br />
          <span className="info-span-green">Dyna / Male / Juli:</span> filtra
          por la persona que tomó el dato, independientemente del estado del
          lead.
          <br />
          <br />
          Solo se puede aplicar un filtro a la vez. El filtro se puede combinar
          con la búsqueda por nombre o empresa.
        </p>
        <h6>Búsqueda</h6>
        <p>
          El campo de búsqueda filtra en tiempo real por nombre completo o
          nombre de empresa. Se puede usar en combinación con cualquier filtro
          activo.
        </p>
      </div>
    </>
  );
};
