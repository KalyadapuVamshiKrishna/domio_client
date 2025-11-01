// src/components/forms/PlaceFormSection.jsx
import React from 'react';
import { Label } from "@/components/ui/label"; // Assuming you want to keep this UI component

const PlaceFormSection = ({ title, subtitle, children, error }) => {
  return (
    <div>
      <Label className="text-lg font-semibold mb-2 block">
        {title} 
        {subtitle && (
          <span className="text-gray-500 text-sm font-normal"> ({subtitle})</span>
        )}
      </Label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error[0]}</p>}
    </div>
  );
};

export default PlaceFormSection;