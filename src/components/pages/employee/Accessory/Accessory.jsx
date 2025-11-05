import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Search, Filter, Settings, AlertCircle, CheckCircle, X } from 'lucide-react';

// // Types
// interface Accessory {
//   id: string;
//   name: string;
//   type: string;
//   model: string;
//   serialNumber: string;
//   assignedDate: string;
//   status: 'active' | 'pending' | 'maintenance';
//   image: string;
// }

// interface RequestFormData {
//   accessoryType: string;
//   reason: string;
//   urgency: 'low' | 'medium' | 'high';
//   additionalInfo: string;
// }

// interface ComplaintFormData {
//   accessoryId: string;
//   issue: string;
//   severity: 'minor' | 'moderate' | 'critical';
//   description: string;
// }

// type ToastType = 'success' | 'error' | 'info';

// Mock Data
const accessories = [
  {
    id: '1',
    name: 'MacBook Pro',
    type: 'Laptop',
    model: 'MBP 16" 2023',
    serialNumber: 'SN12345678',
    assignedDate: '2023-05-15',
    status: 'active',
    image: 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '2',
    name: 'Apple Magic Mouse',
    type: 'Peripheral',
    model: 'MM2',
    serialNumber: 'SM98765432',
    assignedDate: '2023-05-15',
    status: 'active',
    image: 'https://images.pexels.com/photos/5082567/pexels-photo-5082567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '3',
    name: 'Apple Studio Display',
    type: 'Monitor',
    model: 'SD 27"',
    serialNumber: 'SD24681357',
    assignedDate: '2023-05-20',
    status: 'active',
    image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '4',
    name: 'iPhone 15 Pro',
    type: 'Mobile',
    model: 'IP15P',
    serialNumber: 'IP13579246',
    assignedDate: '2023-06-10',
    status: 'maintenance',
    image: 'https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '5',
    name: 'iPad Pro',
    type: 'Tablet',
    model: 'IPP 12.9" 2023',
    serialNumber: 'IPP24680135',
    assignedDate: '2023-07-05',
    status: 'active',
    image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '6',
    name: 'AirPods Pro',
    type: 'Audio',
    model: 'APP2',
    serialNumber: 'AP13572468',
    assignedDate: '2023-08-15',
    status: 'pending',
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

// Custom Hook for Modal
const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    toggleModal: () => setIsOpen(prev => !prev)
  };
};

// Components
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ease-out"
        style={{
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

const Toast = ({ type, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'error': return <AlertCircle size={20} className="text-red-500" />;
      case 'info': return <AlertCircle size={20} className="text-blue-500" />;
      default: return null;
    }
  };

  const getStyle = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 max-w-sm w-full p-4 rounded-xl shadow-lg border ${getStyle()} animate-slide-up`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-800">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const AccessoryCard = ({ accessory, onClick }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'pending': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'maintenance': return 'bg-red-100 text-red-800 ring-red-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div 
      onClick={() => onClick(accessory)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={accessory.image} 
          alt={accessory.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="absolute top-3 right-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusStyle(accessory.status)}`}>
          {accessory.status.charAt(0).toUpperCase() + accessory.status.slice(1)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{accessory.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{accessory.type} • {accessory.model}</p>
        <div className="text-xs text-gray-500 mb-3">
          <p>SN: {accessory.serialNumber}</p>
          <p>Assigned: {new Date(accessory.assignedDate).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center text-sm text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <AlertCircle size={16} className="mr-1" />
          <span>Report issue</span>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onNewRequest, searchTerm }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
    {searchTerm ? (
      <>
        <Search size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No accessories found</h3>
        <p className="text-center text-gray-600 mb-4 max-w-md">
          We couldn't find any accessories matching "{searchTerm}". 
          Try using different keywords or request a new accessory.
        </p>
      </>
    ) : (
      <>
        <div className="bg-blue-50 p-4 rounded-full mb-4">
          <PlusCircle size={40} className="text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No accessories assigned</h3>
        <p className="text-center text-gray-600 mb-4 max-w-md">
          You don't have any accessories assigned to your account yet. 
          Request your first accessory to get started.
        </p>
      </>
    )}
    <button
      onClick={onNewRequest}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
    >
      <PlusCircle size={18} />
      <span>Request New Accessory</span>
    </button>
  </div>
);

// Main App Component
function Accessory() {
  const [userAccessories, setUserAccessories] = useState(accessories);
  const [filteredAccessories, setFilteredAccessories] = useState(accessories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  
  const requestModal = useModal();
  const complaintModal = useModal();
  
  const [toast, setToast] = useState({
    type: 'success',
    message: '',
    visible: false,
  });

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAccessories(userAccessories);
    } else {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const filtered = userAccessories.filter(
        accessory =>
          accessory.name.toLowerCase().includes(lowercasedSearchTerm) ||
          accessory.type.toLowerCase().includes(lowercasedSearchTerm) ||
          accessory.model.toLowerCase().includes(lowercasedSearchTerm) ||
          accessory.serialNumber.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredAccessories(filtered);
    }
  }, [searchTerm, userAccessories]);

  const handleAccessoryClick = (accessory) => {
    setSelectedAccessory(accessory);
    complaintModal.openModal();
  };

  const handleRequestSubmit = (data) => {
    setTimeout(() => {
      requestModal.closeModal();
      setToast({
        type: 'success',
        message: 'Accessory request submitted successfully!',
        visible: true,
      });
      
      const newAccessory = {
        id: `new-${Date.now()}`,
        name: `New ${data.accessoryType}`,
        type: data.accessoryType,
        model: 'Pending',
        serialNumber: 'Pending',
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        image: 'https://images.pexels.com/photos/3756879/pexels-photo-3756879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      };
      
      setUserAccessories(prev => [...prev, newAccessory]);
    }, 1000);
  };

  const handleComplaintSubmit = (data) => {
    setTimeout(() => {
      complaintModal.closeModal();
      setToast({
        type: 'success',
        message: 'Your complaint has been submitted!',
        visible: true,
      });
      
      setUserAccessories(prev => 
        prev.map(accessory => 
          accessory.id === data.accessoryId 
            ? { ...accessory, status: 'maintenance' } 
            : accessory
        )
      );
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-800">My Accessories</h1>
              <button
                onClick={requestModal.openModal}
                className="flex items-center text-sm gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <PlusCircle size={18} />
                <span>Request</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search accessories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                />
              </div>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Filter size={18} />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {filteredAccessories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccessories.map(accessory => (
              <AccessoryCard 
                key={accessory.id} 
                accessory={accessory} 
                onClick={handleAccessoryClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            onNewRequest={requestModal.openModal}
            searchTerm={searchTerm.trim() !== '' ? searchTerm : undefined}
          />
        )}
      </main>
      
      {/* Modals */}
      <Modal
        isOpen={requestModal.isOpen}
        onClose={requestModal.closeModal}
        title="Request New Accessory"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleRequestSubmit({
            accessoryType: e.target.accessoryType.value,
            reason: e.target.reason.value,
            urgency: e.target.urgency.value,
            additionalInfo: e.target.additionalInfo.value
          });
        }} 
        className="space-y-4"
        >
          <div>
            <label htmlFor="accessoryType" className="block text-sm font-medium text-gray-700 mb-1">
              Accessory Type
            </label>
            <select
              id="accessoryType"
              name="accessoryType"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an accessory type</option>
              {['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Phone', 'Tablet', 'Other'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Request
            </label>
            <input
              type="text"
              id="reason"
              name="reason"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Why do you need this accessory?"
            />
          </div>

          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low - Within a month</option>
              <option value="medium">Medium - Within 2 weeks</option>
              <option value="high">High - ASAP</option>
            </select>
          </div>

          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific requirements or details"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={requestModal.closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
      
      {selectedAccessory && (
        <Modal
          isOpen={complaintModal.isOpen}
          onClose={complaintModal.closeModal}
          title="Report an Issue"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            handleComplaintSubmit({
              accessoryId: selectedAccessory.id,
              issue: e.target.issue.value,
              severity: e.target.severity.value,
              description: e.target.description.value
            });
          }} 
          className="space-y-4"
          >
            <div className="bg-gray-50 p-3 rounded-lg mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                  <img 
                    src={selectedAccessory.image} 
                    alt={selectedAccessory.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{selectedAccessory.name}</h4>
                  <p className="text-xs text-gray-500">
                    {selectedAccessory.type} • SN: {selectedAccessory.serialNumber}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Type
              </label>
              <select
                id="issue"
                name="issue"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an issue type</option>
                {[
                  'Not working',
                  'Physical damage',
                  'Performance issues',
                  'Connectivity problems',
                  'Battery issues',
                  'Display problems',
                  'Audio issues',
                  'Other'
                ].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                Severity Level
              </label>
              <select
                id="severity"
                name="severity"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="minor">Minor - It's annoying but I can work</option>
                <option value="moderate">Moderate - It's affecting my work</option>
                <option value="critical">Critical - I can't work at all</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Problem Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe the issue in detail..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={complaintModal.closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700"
              >
                Submit Issue
              </button>
            </div>
          </form>
        </Modal>
      )}
      
      {/* Toast */}
      {toast.visible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  );
}

export default Accessory;