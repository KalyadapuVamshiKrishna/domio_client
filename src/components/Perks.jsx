// src/components/Perks.jsx

import React from "react";
// Import all necessary Lucide icons
import { Wifi, ParkingSquare, UtensilsCrossed, Tv, Wind, PawPrint } from "lucide-react";

// Define the list of perks outside the component to prevent re-creation on render
const perksList = [
  { name: "wifi", icon: <Wifi className="w-5 h-5" />, label: "Wi-Fi" },
  { name: "parking", icon: <ParkingSquare className="w-5 h-5" />, label: "Free parking" },
  { name: "kitchen", icon: <UtensilsCrossed className="w-5 h-5" />, label: "Kitchen" },
  { name: "tv", icon: <Tv className="w-5 h-5" />, label: "TV" },
  { name: "ac", icon: <Wind className="w-5 h-5" />, label: "Air Conditioning" },
  { name: "pets", icon: <PawPrint className="w-5 h-5" />, label: "Pets allowed" },
];

/**
 * Component to display and manage the selection of property perks.
 * @param {object} props
 * @param {string[]} props.selected - Array of currently selected perk names.
 * @param {function} props.onChange - Handler to update the parent state with new selections.
 */
const Perks = ({ selected, onChange }) => {
  function handleCbClick(ev) {
    const { checked, name } = ev.target;
    if (checked) {
      // Add the perk if checked
      onChange([...selected, name]);
    } else {
      // Remove the perk if unchecked
      onChange(selected.filter((selectedName) => selectedName !== name));
    }
  }

  return (
    <>
      {perksList.map((perk) => (
        <label
          key={perk.name}
          className="border p-4 flex rounded-2xl gap-2 items-center cursor-pointer hover:shadow-md transition-shadow"
          // Add Tailwind class to visually indicate selection
          htmlFor={`perk-checkbox-${perk.name}`}
          style={{
            backgroundColor: selected.includes(perk.name)
              ? "rgba(252, 165, 165, 0.2)"
              : "white",
          }}
        >
          <input
            type="checkbox"
            id={`perk-checkbox-${perk.name}`}
            checked={selected.includes(perk.name)}
            name={perk.name}
            onChange={handleCbClick}
            className="w-4 h-4"
          />
          {perk.icon}
          <span>{perk.label}</span>
        </label>
      ))}
    </>
  );
};

export default Perks;
