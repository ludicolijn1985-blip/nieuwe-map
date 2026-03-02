import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Star, Zap, Eye } from 'lucide-react';
import { BusinessFormData } from '../types';

interface TemplateGalleryProps {
  onSelectTemplate: (data: Partial<BusinessFormData>) => void;
  onClose: () => void;
}

const templates = [
  {
    id: 'cafe-amsterdam',
    name: 'Amsterdam Café',
    type: 'Café/Restaurant',
    city: 'Amsterdam',
    postcode: '1012 AB',
    description: 'Cozy café with artisan coffee and fresh pastries',
    features: 'Online menu\nTable reservations\nLoyalty rewards\nPush notifications\nOrder & pay',
    primaryColor: '#D97706',
    emoji: '☕',
    rating: 4.9,
    category: 'Food & Drinks',
    preview: ['Home with warm tones', 'Menu with categories', 'Rewards system'],
  },
  {
    id: 'kapsalon-rotterdam',
    name: 'Salon Luxe',
    type: 'Kapsalon',
    city: 'Rotterdam',
    postcode: '3011 AA',
    description: 'Premium hair salon with expert stylists',
    features: 'Online booking\nService menu\nLoyalty points\nPhoto gallery\nPush reminders',
    primaryColor: '#EC4899',
    emoji: '✂️',
    rating: 4.8,
    category: 'Beauty',
    preview: ['Booking screen', 'Service list', 'Stylist profiles'],
  },
  {
    id: 'fitness-utrecht',
    name: 'PowerFit Gym',
    type: 'Sportschool/Fitness',
    city: 'Utrecht',
    postcode: '3511 BK',
    description: 'State-of-the-art fitness with group classes',
    features: 'Class schedule\nMembership plans\nProgress tracker\nPersonal training\nNutrition tips',
    primaryColor: '#EF4444',
    emoji: '💪',
    rating: 4.7,
    category: 'Sport',
    preview: ['Class timetable', 'Workout log', 'Membership card'],
  },
  {
    id: 'bakkerij-denhaag',
    name: 'Bakkerij Van Dijk',
    type: 'Bakkerij',
    city: 'Den Haag',
    postcode: '2511 AB',
    description: 'Artisan bakery with daily fresh bread and pastries',
    features: 'Product catalog\nPre-order system\nDaily specials\nLoyalty stamps\nDelivery tracking',
    primaryColor: '#92400E',
    emoji: '🥐',
    rating: 4.9,
    category: 'Food & Drinks',
    preview: ['Daily specials', 'Pre-order flow', 'Stamp card'],
  },
  {
    id: 'sushi-eindhoven',
    name: 'Sushi Master',
    type: 'Sushi takeaway',
    city: 'Eindhoven',
    postcode: '5611 AA',
    description: 'Fresh sushi rolls and Japanese cuisine for takeaway',
    features: 'Order online\nMenu with photos\nFavorites list\nOrder tracking\nRewards program',
    primaryColor: '#DC2626',
    emoji: '🍣',
    rating: 4.8,
    category: 'Food & Drinks',
    preview: ['Visual menu', 'Cart + checkout', 'Order status'],
  },
  {
    id: 'yoga-groningen',
    name: 'Zen Studio',
    type: 'Yoga/Pilates studio',
    city: 'Groningen',
    postcode: '9711 AA',
    description: 'Peaceful yoga and pilates studio in the heart of Groningen',
    features: 'Class booking\nInstructor profiles\nMeditation timer\nProgress tracking\nMembership',
    primaryColor: '#7C3AED',
    emoji: '🧘',
    rating: 5.0,
    category: 'Sport',
    preview: ['Class calendar', 'Instructor bios', 'Meditation mode'],
  },
];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const categories = ['All', 'Food & Drinks', 'Beauty', 'Sport'];

  const filtered = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="glass-card rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-400" />
              <h2 className="text-xl font-bold text-hero">Template Gallery</h2>
            </div>
            <p className="text-sub text-sm">Start from a pre-built template and customize it</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all">
            <X size={16} className="text-sub" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                  : 'card-surface text-sub hover:text-hero'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((template, idx) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
                onClick={() => {
                  onSelectTemplate({
                    name: template.name,
                    type: template.type,
                    city: template.city,
                    postcode: template.postcode,
                    description: template.description,
                    features: template.features,
                    primaryColor: template.primaryColor,
                  });
                  onClose();
                }}
              >
                {/* Preview header */}
                <div 
                  className="h-28 flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${template.primaryColor}22, ${template.primaryColor}08)` }}
                >
                  <span className="text-5xl">{template.emoji}</span>
                  <AnimatePresence>
                    {hoveredId === template.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
                      >
                        <Eye size={16} className="text-white" />
                        <span className="text-white text-sm font-medium">Use Template</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
                    <Star size={10} fill="#fbbf24" stroke="#fbbf24" />
                    <span className="text-white text-[10px] font-bold">{template.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-hero">{template.name}</h3>
                    <span className="text-[9px] text-dim bg-white/5 px-2 py-0.5 rounded-full">{template.type}</span>
                  </div>
                  <p className="text-[11px] text-sub mb-3">{template.city} • {template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.preview.map(p => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-dim">{p}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-green-400 text-xs font-medium group-hover:gap-2 transition-all">
                    <Zap size={12} />
                    <span>Use this template</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemplateGallery;
