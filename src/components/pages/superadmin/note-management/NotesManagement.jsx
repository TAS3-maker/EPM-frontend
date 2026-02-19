

import React, { useEffect, useState, useCallback } from "react";
import { useUserContext } from "../../../context/UserContext";
import { Plus, X, Edit, Trash2, ClipboardList } from "lucide-react";
import { useAlert } from "../../../context/AlertContext";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { SaveButton, CancelButton } from "../../../AllButtons/AllButtons";
import { SectionHeader } from '../../../components/SectionHeader';
import { usePermissions } from "../../../context/PermissionContext";
import { useOutsideClick } from "../../../components/useOutsideClick";

export const NotesManagement = () => {
  const { 
    notes, 
    noteLoading, 
    fetchNotes, 
    createNote, 
    updateNote, 
    deleteNote,
    getNote 
  } = useUserContext();
  const { showAlert } = useAlert();
const {permissions}=usePermissions()

  const [showForm, setShowForm] = useState(false);
  const [currentNoteContent, setCurrentNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState(null);

  //  IMPROVED: Direct notes extraction + editing state
  const [editingNote, setEditingNote] = useState(null);

  // Extract notes array
  const getNotesArray = useCallback(() => {
    if (Array.isArray(notes)) return notes;
    if (notes?.data && Array.isArray(notes.data)) return notes.data;
    if (notes?.notes && Array.isArray(notes.notes)) return notes.notes;
    if (notes && typeof notes === 'object') return Object.values(notes);
    return [];
  }, [notes]);

  const safeNotes = getNotesArray();

  useEffect(() => {
    fetchNotes();
  }, []);
 const employeePermission=permissions?.permissions?.[0]?.notes_management
  const canAddEmployee=employeePermission==="2"
  //  FIXED: First try local data, then API call
  const handleEditNote = useCallback(async (noteId) => {
    try {
      // First check if note exists in local safeNotes
      const localNote = safeNotes.find(note => note.id === noteId);
      if (localNote) {
        const content = localNote.notes || localNote.content || localNote.note || localNote.description || "";
        console.log("Found local note:", content); // Debug log
        setCurrentNoteContent(content);
        setEditingNote(localNote);
        setEditingNoteId(noteId);
        setShowForm(true);
        return;
      }

      // If not found locally, fetch from API
      console.log("Fetching note from API:", noteId);
      const note = await getNote(noteId);
      const content = note?.notes || note?.content || note?.note || note?.description || "";
      console.log("API note content:", content); // Debug log
      setCurrentNoteContent(content);
      setEditingNote(note);
      setEditingNoteId(noteId);
      setShowForm(true);
    } catch (error) {
      console.error("Edit note error:", error);
      showAlert({ variant: "error", title: "Error", message: "Failed to load note" });
    }
  }, [safeNotes, getNote, showAlert]);

  const handleAddNote = async () => {
    if (!currentNoteContent.trim()) {
      showAlert({ variant: "error", title: "Error", message: "Note content required" });
      return;
    }
    try {
      await createNote(currentNoteContent.trim());
      setTimeout(() => fetchNotes(), 300);
      setShowForm(false);
      setCurrentNoteContent("");
      setEditingNote(null);
      showAlert({ variant: "success", title: "Success", message: "Note created!" });
    } catch (error) {
      showAlert({ variant: "error", title: "Error", message: "Create failed" });
    }
  };

  const handleSaveEdit = async () => {
    if (!currentNoteContent.trim()) {
      showAlert({ variant: "error", title: "Error", message: "Note content required" });
      return;
    }
    try {
      await updateNote(editingNoteId, currentNoteContent.trim());
      setTimeout(() => fetchNotes(), 300);
      setShowForm(false);
      setEditingNoteId(null);
      setCurrentNoteContent("");
      setEditingNote(null);
      showAlert({ variant: "success", title: "Success", message: "Note updated!" });
    } catch (error) {
      showAlert({ variant: "error", title: "Error", message: "Update failed" });
    }
  };

  const handleSave = () => {
    editingNoteId ? handleSaveEdit() : handleAddNote();
  };

  const handleDelete = (id) => {
    setDeleteNoteId(id);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteNote(deleteNoteId);
      setTimeout(() => fetchNotes(), 300);
      setDeleteConfirm(false);
      setDeleteNoteId(null);
      showAlert({ variant: "success", title: "Success", message: "Note deleted!" });
    } catch (error) {
      showAlert({ variant: "error", title: "Error", message: "Delete failed" });
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setCurrentNoteContent("");
    setEditingNoteId(null);
    setEditingNote(null);
  };


    const handleCloseAddModal = () => {
    setShowForm(false);

  };
  
  const addModalRef = useOutsideClick(showForm, handleCloseAddModal);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md h-[calc(100vh-20px)] flex flex-col overflow-y-auto">
      <SectionHeader icon={ClipboardList} title="Notes Management" subtitle="" />

      <div className="mb-8 mr-3 flex justify-end mt-2">
        {canAddEmployee&&(
        <button
          onClick={() => setShowForm(true)}
          disabled={noteLoading}
          className="add-items-btn text-sm"
        >
          {/* <Plus className="w-5 h-5" /> */}
          Add New Note
        </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {safeNotes.length > 0 ? (
          safeNotes.map((note, index) => (
            <div key={note.id || `note-${index}`} className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800 bg-blue-100 px-3 py-1 rounded-full text-sm">
                  Note:
                </h3>
                {canAddEmployee &&(
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleEditNote(note.id)}
                    className="p-2 rounded-xl bg-blue-200 hover:bg-blue-300 text-blue-700 transition-all"
                    disabled={noteLoading}
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2 rounded-xl bg-red-200 hover:bg-red-300 text-red-700 transition-all"
                    disabled={noteLoading}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                )}
              </div>
              
              <div className="min-h-[100px] mb-4 text-sm leading-relaxed prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(note.notes || note.content || "No content") 
                }} />
              </div>
              
              <div className="text-xs text-gray-500 flex justify-between">
                <span>ID: {note.id || 'N/A'}</span>
                <span>{note.created_at ? new Date(note.created_at).toLocaleDateString() : "New"}</span>
              </div>
            </div>
          ))
        ) : noteLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <div className="text-xl font-semibold text-gray-700 mb-2">Loading Notes...</div>
          </div>
        ) : (
          <div className="col-span-full bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-12 border-2 border-dashed border-gray-300 text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Notes Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Click "Add New Note" to get started</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" ref={addModalRef}>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNoteId ? `Edit Note #${editingNoteId}` : "New Note"}
                </h2>
                <button onClick={closeForm} className="p-2 rounded-2xl hover:bg-gray-100">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-hidden">
              <ReactQuill
                value={currentNoteContent}
                onChange={setCurrentNoteContent}
                placeholder="Write your note here..."
                style={{ height: '350px' }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['clean']
                  ]
                }}
              />
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <CancelButton onClick={closeForm} />
              <SaveButton 
                onClick={handleSave}
                disabled={!currentNoteContent.trim()}
              />
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center mb-6">
              <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Note?</h2>
              <p>Are you sure you want to delete Note #{deleteNoteId}?</p>
            </div>
            <div className="flex gap-3 justify-center">
              <CancelButton 
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteNoteId(null);
                }} 
              />
              <button
                onClick={confirmDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManagement;
