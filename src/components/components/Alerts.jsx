import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";

const Alert = ({ variant, title, message, showLink = false, linkHref = "#", linkText = "Learn more", onClose }) => {
  if (!title || !message) return null;

  const variantClasses = {
    success: {
      container: "border-green-500 bg-gradient-to-r from-green-100 to-green-50 text-green-800",
      icon: <CheckCircle className="text-green-500 w-6 h-6" />,
    },
    error: {
      container: "border-red-500 bg-gradient-to-r from-red-100 to-red-50 text-red-800",
      icon: <XCircle className="text-red-500 w-6 h-6" />,
    },
    warning: {
      container: "border-yellow-500 bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800",
      icon: <AlertTriangle className="text-yellow-500 w-6 h-6" />,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`fixed top-6 right-6 w-96 p-5 rounded-xl shadow-xl border-l-4 z-50 backdrop-blur-md ${variantClasses[variant]?.container}`}
    >
      <div className="flex items-start gap-4">
        <span>{variantClasses[variant]?.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
          {showLink && (
            <Link to={linkHref} className="text-blue-600 underline text-sm font-medium">
              {linkText}
            </Link>
          )}
        </div>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default Alert;