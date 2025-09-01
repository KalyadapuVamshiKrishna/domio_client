import { Checkbox } from "@/components/ui/checkbox";

const perksList = [
  { name: 'wifi', label: 'Wifi' },
  { name: 'parking', label: 'Free parking' },
  { name: 'tv', label: 'TV' },
  { name: 'radio', label: 'Radio' },
  { name: 'pets', label: 'Pets allowed' },
  { name: 'entrance', label: 'Private entrance' },
];

export default function Perks({ selected, onChange }) {
  function togglePerk(name) {
    if (selected.includes(name)) {
      onChange(selected.filter(p => p !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {perksList.map(perk => (
        <label key={perk.name} className="flex items-center gap-2 border rounded-xl p-3 cursor-pointer">
          <Checkbox
            checked={selected.includes(perk.name)}
            onCheckedChange={() => togglePerk(perk.name)}
          />
          <span>{perk.label}</span>
        </label>
      ))}
    </div>
  );
}
