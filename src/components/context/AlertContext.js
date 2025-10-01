import { createContext, useState, useContext } from "react";
import Alert from "../components/Alerts";
const AlertContext = createContext();
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const showAlert = ({ variant, title, message }) => {
    setAlert({ variant, title, message });
    setTimeout(() => setAlert(null), 3000); 
  };
  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </AlertContext.Provider>
  );
};
export const useAlert = () => useContext(AlertContext);










