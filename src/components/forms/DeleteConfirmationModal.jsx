// src/components/modals/DeleteConfirmationModal.jsx

import React from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this place? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;