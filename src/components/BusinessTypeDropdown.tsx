import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface BusinessTypeOption {
  value: string;
  label: string;
  emoji: string;
  category: string;
}

export const BUSINESS_TYPES: BusinessTypeOption[] = [
  { value: 'Autowasstraat', label: 'Autowasstraat', emoji: '🚗', category: 'Auto & Transport' },
  { value: 'Bakkerij', label: 'Bakkerij', emoji: '🥐', category: 'Food & Drinks' },
  { value: 'Barbershop', label: 'Barbershop', emoji: '💈', category: 'Beauty & Wellness' },
  { value: 'Bloemist', label: 'Bloemist', emoji: '💐', category: 'Retail' },
  { value: 'Boekhandel', label: 'Boekhandel', emoji: '📚', category: 'Retail' },
  { value: 'Café/Restaurant', label: 'Café/Restaurant', emoji: '☕', category: 'Food & Drinks' },
  { value: 'Fietsenmaker', label: 'Fietsenmaker', emoji: '🚲', category: 'Auto & Transport' },
  { value: 'Fotostudio', label: 'Fotostudio', emoji: '📸', category: 'Dienstverlening' },
  { value: 'Huisartsenpraktijk', label: 'Huisartsenpraktijk', emoji: '🏥', category: 'Gezondheid' },
  { value: 'IJssalon', label: 'IJssalon', emoji: '🍦', category: 'Food & Drinks' },
  { value: 'Kapsalon', label: 'Kapsalon', emoji: '✂️', category: 'Beauty & Wellness' },
  { value: 'Kledingwinkel', label: 'Kledingwinkel', emoji: '👗', category: 'Retail' },
  { value: 'Massage salon', label: 'Massage salon', emoji: '💆', category: 'Beauty & Wellness' },
  { value: 'Nagelstudio', label: 'Nagelstudio', emoji: '💅', category: 'Beauty & Wellness' },
  { value: 'Pet grooming', label: 'Pet grooming', emoji: '🐾', category: 'Dieren' },
  { value: 'Sportschool/Fitness', label: 'Sportschool/Fitness', emoji: '💪', category: 'Sport & Gezondheid' },
  { value: 'Sushi takeaway', label: 'Sushi takeaway', emoji: '🍣', category: 'Food & Drinks' },
  { value: 'Tattoo shop', label: 'Tattoo shop', emoji: '🎨', category: 'Beauty & Wellness' },
  { value: 'Trimsalon', label: 'Trimsalon', emoji: '🐶', category: 'Dieren' },
  { value: 'Wijnbar', label: 'Wijnbar', emoji: '🍷', category: 'Food & Drinks' },
  { value: 'Yoga/Pilates studio', label: 'Yoga/Pilates studio', emoji: '🧘', category: 'Sport & Gezondheid' },
  { value: 'Yoga studio', label: 'Yoga studio', emoji: '🧘‍♀️', category: 'Sport & Gezondheid' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const BusinessTypeDropdown: React.FC<Props> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = BUSINESS_TYPES.find(t => t.value === value);

  const filteredTypes = BUSINESS_TYPES.filter(t =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.emoji.includes(searchQuery)
  );

  // Group by category
  const groupedTypes = filteredTypes.reduce<Record<string, BusinessTypeOption[]>>((acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  }, {});

  const flatFiltered = filteredTypes;

  const handleSelect = useCallback((typeValue: string) => {
    onChange(typeValue);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, flatFiltered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < flatFiltered.length) {
          handleSelect(flatFiltered[highlightedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, highlightedIndex, flatFiltered, handleSelect]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl input-field text-sm text-left flex items-center gap-3 transition-all cursor-pointer ${
          isOpen ? 'ring-2 ring-green-500/30' : ''
        }`}
      >
        {selectedOption ? (
          <>
            <span className="text-base flex-shrink-0">{selectedOption.emoji}</span>
            <span className="text-hero flex-1 font-medium">{selectedOption.label}</span>
            <span className="text-[10px] text-dim px-2 py-0.5 rounded-full bg-white/5">{selectedOption.category}</span>
          </>
        ) : (
          <span className="text-dim flex-1">Selecteer je business type...</span>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={16} className="text-dim" />
        </motion.div>
      </button>

      {/* Clear button */}
      {value && !isOpen && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(''); }}
          className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={10} className="text-dim" />
        </button>
      )}

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-2 z-50 dropdown-panel rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Search input */}
            <div className="p-3 border-b dropdown-border">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setHighlightedIndex(0); }}
                  placeholder="Zoek business type..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl dropdown-search text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setHighlightedIndex(-1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X size={12} className="text-dim hover:text-sub transition-colors" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-dim mt-2 px-1">
                {filteredTypes.length} van {BUSINESS_TYPES.length} types
              </p>
            </div>

            {/* Options list */}
            <div ref={listRef} className="max-h-[280px] overflow-y-auto py-1.5 dropdown-scroll">
              {filteredTypes.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm text-sub font-medium">Geen resultaten</p>
                  <p className="text-[11px] text-dim mt-1">Probeer een andere zoekterm</p>
                </div>
              ) : (
                Object.entries(groupedTypes).map(([category, types]) => (
                  <div key={category}>
                    {/* Category header */}
                    <div className="px-4 pt-3 pb-1.5 sticky top-0 dropdown-category-header z-10">
                      <p className="text-[10px] font-semibold text-dim uppercase tracking-wider">{category}</p>
                    </div>
                    {/* Items */}
                    {types.map((type) => {
                      const globalIndex = flatFiltered.indexOf(type);
                      const isSelected = value === type.value;
                      const isHighlighted = globalIndex === highlightedIndex;
                      return (
                        <button
                          key={type.value}
                          data-option
                          type="button"
                          onClick={() => handleSelect(type.value)}
                          className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-all cursor-pointer dropdown-option ${
                            isSelected ? 'dropdown-option-selected' : ''
                          } ${isHighlighted ? 'dropdown-option-highlighted' : ''}`}
                        >
                          <span className="text-lg flex-shrink-0 w-7 text-center">{type.emoji}</span>
                          <span className={`text-sm flex-1 ${isSelected ? 'font-semibold text-hero' : 'text-sub'}`}>
                            {type.label}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <Check size={14} className="text-green-400 flex-shrink-0" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t dropdown-border">
              <div className="flex items-center justify-between text-[10px] text-dim">
                <span>↑↓ navigeer • Enter selecteer • Esc sluiten</span>
                <span className="font-mono">{BUSINESS_TYPES.length} types</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessTypeDropdown;
