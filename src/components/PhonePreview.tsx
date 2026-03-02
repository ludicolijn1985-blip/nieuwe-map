import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessFormData } from '../types';
import {
  Wifi, Battery, Signal, Star, Heart, Search, Home, User,
  MapPin, ChevronRight, Gift, Clock, Bell, ShoppingCart,
  Plus, Minus, Check, ChevronLeft, Settings, CreditCard,
  HelpCircle, LogOut, Award, Zap,
  Phone, Mail, Instagram, Navigation
} from 'lucide-react';

interface PhonePreviewProps {
  data: BusinessFormData;
  currentStep: number;
  isBuilding: boolean;
  interactive?: boolean;
}

type Screen = 'splash' | 'home' | 'menu' | 'rewards' | 'profile' | 'detail' | 'cart' | 'map';

const PhonePreview: React.FC<PhonePreviewProps> = ({ data, currentStep, isBuilding, interactive = false }) => {
  const primaryColor = data.primaryColor || '#22c55e';
  const businessName = data.name || 'Your Business';
  const businessType = data.type || 'Business';
  const features = (data.features || '').split('\n').filter(f => f.trim());
  const city = data.city || 'Amsterdam';

  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [loyaltyPoints, setLoyaltyPoints] = useState(2450);
  const [showToast, setShowToast] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [notifCount, setNotifCount] = useState(3);

  // Determine which screen to show
  const getAutoScreen = (): Screen => {
    if (!isBuilding || currentStep < 1) return 'splash';
    if (currentStep <= 2) return 'splash';
    if (currentStep <= 4) return 'home';
    if (currentStep <= 6) return 'menu';
    if (currentStep <= 8) return 'profile';
    return 'home';
  };

  // If interactive mode or build complete, use user-selected screen; otherwise auto
  const canInteract = interactive || currentStep >= 9;
  const currentScreen = canInteract ? activeScreen : getAutoScreen();

  const triggerToast = useCallback((msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2000);
  }, []);

  const addToCart = useCallback((item: string) => {
    setCartItems(prev => ({ ...prev, [item]: (prev[item] || 0) + 1 }));
    triggerToast(`✅ ${item} added to cart`);
  }, [triggerToast]);

  const removeFromCart = useCallback((item: string) => {
    setCartItems(prev => {
      const n = { ...prev };
      if (n[item] > 1) n[item]--;
      else delete n[item];
      return n;
    });
  }, []);

  const totalCartItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  const navigateTo = useCallback((screen: Screen, tab?: number) => {
    if (!canInteract) return;
    setActiveScreen(screen);
    if (tab !== undefined) setActiveTab(tab);
    setSelectedItem(null);
  }, [canInteract]);

  const getTypeEmoji = () => {
    const map: Record<string, string> = {
      'Autowasstraat': '🚗', 'Bakkerij': '🥐', 'Barbershop': '💈',
      'Bloemist': '💐', 'Boekhandel': '📚', 'Café/Restaurant': '☕',
      'Fietsenmaker': '🚲', 'Fotostudio': '📸', 'Huisartsenpraktijk': '🏥',
      'IJssalon': '🍦', 'Kapsalon': '✂️', 'Kledingwinkel': '👗',
      'Massage salon': '💆', 'Nagelstudio': '💅', 'Pet grooming': '🐾',
      'Sportschool/Fitness': '💪', 'Sushi takeaway': '🍣', 'Tattoo shop': '🎨',
      'Trimsalon': '🐶', 'Wijnbar': '🍷', 'Yoga/Pilates studio': '🧘',
      'Yoga studio': '🧘',
    };
    return map[businessType] || '✨';
  };

  const getMenuItems = () => {
    const menus: Record<string, { name: string; price: string; emoji: string; desc: string }[]> = {
      'Café/Restaurant': [
        { name: 'Espresso', price: '€3.00', emoji: '☕', desc: 'Double shot, bold flavor' },
        { name: 'Cappuccino', price: '€4.50', emoji: '🥤', desc: 'Silky foam, perfect art' },
        { name: 'Croissant', price: '€3.50', emoji: '🥐', desc: 'Butter, flaky, fresh' },
        { name: 'Avocado Toast', price: '€9.50', emoji: '🥑', desc: 'Sourdough, chili flakes' },
        { name: 'Pasta Carbonara', price: '€14.50', emoji: '🍝', desc: 'Creamy Italian classic' },
        { name: 'Tiramisu', price: '€8.50', emoji: '🍰', desc: 'Homemade dessert' },
      ],
      'Kapsalon': [
        { name: 'Heren Knipbeurt', price: '€25.00', emoji: '💇‍♂️', desc: '30 min, incl. styling' },
        { name: 'Dames Knippen', price: '€45.00', emoji: '💇‍♀️', desc: '45 min, wash & cut' },
        { name: 'Baard Trimmen', price: '€15.00', emoji: '🧔', desc: '15 min, hot towel' },
        { name: 'Kleuring', price: '€65.00', emoji: '🎨', desc: 'Full color treatment' },
        { name: 'Bridal Styling', price: '€120.00', emoji: '👰', desc: 'Complete bridal look' },
        { name: 'Kids Knippen', price: '€18.00', emoji: '✂️', desc: 'Ages 3-12' },
      ],
      'Sportschool/Fitness': [
        { name: 'Yoga Class', price: '€12.00', emoji: '🧘', desc: 'Vinyasa flow, 60 min' },
        { name: 'HIIT Training', price: '€15.00', emoji: '🏋️', desc: 'High intensity, 45 min' },
        { name: 'Spinning', price: '€14.00', emoji: '🚴', desc: 'Cardio blast, 50 min' },
        { name: 'Boxing', price: '€18.00', emoji: '🥊', desc: 'Technique + sparring' },
        { name: 'Pilates', price: '€13.00', emoji: '🤸', desc: 'Core strength, 55 min' },
        { name: 'Swimming', price: '€8.00', emoji: '🏊', desc: 'Open swim, per session' },
      ],
      'Bakkerij': [
        { name: 'Vers Brood', price: '€3.50', emoji: '🍞', desc: 'Zuurdesem, dagelijks vers' },
        { name: 'Croissant', price: '€2.50', emoji: '🥐', desc: 'Roomboter, knapperig' },
        { name: 'Appeltaart', price: '€4.00', emoji: '🥧', desc: 'Oma\'s recept' },
        { name: 'Baguette', price: '€2.80', emoji: '🥖', desc: 'Frans, krokant' },
        { name: 'Vlaai', price: '€3.50', emoji: '🍰', desc: 'Limburgse specialiteit' },
        { name: 'Broodje Gezond', price: '€5.50', emoji: '🥪', desc: 'Vol belegd' },
      ],
      'Barbershop': [
        { name: 'Classic Cut', price: '€25.00', emoji: '💈', desc: 'Wash, cut & style' },
        { name: 'Beard Trim', price: '€15.00', emoji: '🧔', desc: 'Shape & oil' },
        { name: 'Hot Towel Shave', price: '€20.00', emoji: '🪒', desc: 'Traditional straight razor' },
        { name: 'Cut + Beard', price: '€35.00', emoji: '✂️', desc: 'Full service combo' },
        { name: 'Kids Cut', price: '€15.00', emoji: '👦', desc: 'Under 12' },
        { name: 'Head Shave', price: '€18.00', emoji: '🧑‍🦲', desc: 'Clean buzz/shave' },
      ],
      'Bloemist': [
        { name: 'Boeket Rozen', price: '€25.00', emoji: '🌹', desc: '12 rode rozen' },
        { name: 'Seizoensboeket', price: '€18.00', emoji: '💐', desc: 'Verse seizoensbloemen' },
        { name: 'Orchidee', price: '€22.00', emoji: '🌸', desc: 'Phalaenopsis, wit' },
        { name: 'Rouwstuk', price: '€55.00', emoji: '🌿', desc: 'Op maat gemaakt' },
        { name: 'Bruidsboeket', price: '€75.00', emoji: '💒', desc: 'Persoonlijk advies' },
        { name: 'Plantenbak', price: '€30.00', emoji: '🪴', desc: 'Binnentuin' },
      ],
      'Boekhandel': [
        { name: 'Bestseller', price: '€22.50', emoji: '📖', desc: 'Top 10 deze week' },
        { name: 'Kinderboek', price: '€14.99', emoji: '📚', desc: 'Prentenboeken' },
        { name: 'Kookboek', price: '€29.95', emoji: '👨‍🍳', desc: 'Populaire recepten' },
        { name: 'Thriller', price: '€18.50', emoji: '🔍', desc: 'Spannend & meeslepend' },
        { name: 'Cadeaubon', price: '€15.00', emoji: '🎁', desc: 'Altijd goed' },
        { name: 'Agenda 2025', price: '€16.95', emoji: '📅', desc: 'Premium design' },
      ],
      'Fietsenmaker': [
        { name: 'Band Plakken', price: '€12.00', emoji: '🔧', desc: 'Voor- of achterband' },
        { name: 'Grote Beurt', price: '€45.00', emoji: '🚲', desc: 'Complete check-up' },
        { name: 'Remmen Afstellen', price: '€15.00', emoji: '⚙️', desc: 'Voor + achter' },
        { name: 'Ketting Vervangen', price: '€25.00', emoji: '🔗', desc: 'Incl. materiaal' },
        { name: 'Licht Reparatie', price: '€10.00', emoji: '💡', desc: 'LED voor/achter' },
        { name: 'E-bike Service', price: '€65.00', emoji: '🔋', desc: 'Accu + motor check' },
      ],
      'Fotostudio': [
        { name: 'Portretfoto', price: '€89.00', emoji: '📸', desc: '30 min sessie, 5 foto\'s' },
        { name: 'Pasfoto Set', price: '€15.00', emoji: '🪪', desc: '4 pasfoto\'s' },
        { name: 'Bruiloft Pakket', price: '€1200.00', emoji: '💒', desc: 'Hele dag, 200+ foto\'s' },
        { name: 'Familie Shoot', price: '€149.00', emoji: '👨‍👩‍👧‍👦', desc: '1 uur, 15 foto\'s' },
        { name: 'Product Foto', price: '€35.00', emoji: '📦', desc: 'Per product, 3 hoeken' },
        { name: 'Baby Shoot', price: '€119.00', emoji: '👶', desc: 'Newborn specialist' },
      ],
      'Huisartsenpraktijk': [
        { name: 'Consult', price: '€0.00', emoji: '🩺', desc: 'Verzekerd, 10 min' },
        { name: 'Griepprik', price: '€0.00', emoji: '💉', desc: 'Seizoensvaccinatie' },
        { name: 'Bloedonderzoek', price: '€0.00', emoji: '🩸', desc: 'Lab doorverwijzing' },
        { name: 'Herhaalrecept', price: '€0.00', emoji: '💊', desc: 'Online aanvragen' },
        { name: 'Telefonisch', price: '€0.00', emoji: '📞', desc: '5 min belconsult' },
        { name: 'Spoedafspraak', price: '€0.00', emoji: '🚨', desc: 'Vandaag nog' },
      ],
      'IJssalon': [
        { name: '1 Bol', price: '€2.50', emoji: '🍦', desc: 'Keuze uit 20+ smaken' },
        { name: '2 Bollen', price: '€4.00', emoji: '🍨', desc: 'Mix & match' },
        { name: 'Sundae', price: '€6.50', emoji: '🍧', desc: 'Met slagroom & topping' },
        { name: 'Milkshake', price: '€5.50', emoji: '🥤', desc: 'Vers gemaakt' },
        { name: 'Sorbet', price: '€3.00', emoji: '🍋', desc: 'Fruitig, vegan' },
        { name: 'Wafel + IJs', price: '€7.50', emoji: '🧇', desc: 'Luikse wafel combo' },
      ],
      'Kledingwinkel': [
        { name: 'T-Shirt', price: '€29.95', emoji: '👕', desc: 'Premium katoen' },
        { name: 'Jeans', price: '€79.95', emoji: '👖', desc: 'Slim fit, stretch' },
        { name: 'Sneakers', price: '€89.95', emoji: '👟', desc: 'Nieuwe collectie' },
        { name: 'Jas', price: '€129.95', emoji: '🧥', desc: 'Wintercollectie' },
        { name: 'Accessoires', price: '€19.95', emoji: '🧢', desc: 'Petten, riemen, tassen' },
        { name: 'Jurk', price: '€59.95', emoji: '👗', desc: 'Seizoen must-have' },
      ],
      'Massage salon': [
        { name: 'Ontspanningsmassage', price: '€55.00', emoji: '💆', desc: '60 min, full body' },
        { name: 'Sportmassage', price: '€45.00', emoji: '💪', desc: '45 min, deep tissue' },
        { name: 'Hot Stone', price: '€65.00', emoji: '🪨', desc: '75 min, warmte therapie' },
        { name: 'Duo Massage', price: '€99.00', emoji: '👫', desc: '60 min, samen genieten' },
        { name: 'Hoofdmassage', price: '€30.00', emoji: '🧠', desc: '30 min, stress relief' },
        { name: 'Voetreflexologie', price: '€40.00', emoji: '🦶', desc: '45 min, balans' },
      ],
      'Nagelstudio': [
        { name: 'Gel Manicure', price: '€35.00', emoji: '💅', desc: '2-3 weken houdbaarheid' },
        { name: 'Acryl Nagels', price: '€50.00', emoji: '✨', desc: 'Nieuwe set' },
        { name: 'Pedicure', price: '€30.00', emoji: '🦶', desc: 'Medisch of cosmetisch' },
        { name: 'Nail Art', price: '€10.00', emoji: '🎨', desc: 'Per nagel, custom design' },
        { name: 'Gel Verwijderen', price: '€15.00', emoji: '🧴', desc: 'Veilig verwijderen' },
        { name: 'Russische Mani', price: '€45.00', emoji: '💎', desc: 'E-file, gel polish' },
      ],
      'Pet grooming': [
        { name: 'Kleine Hond Trim', price: '€35.00', emoji: '🐕', desc: 'Tot 10 kg' },
        { name: 'Grote Hond Trim', price: '€55.00', emoji: '🐕‍🦺', desc: '10+ kg, incl. bad' },
        { name: 'Katten Verzorging', price: '€45.00', emoji: '🐱', desc: 'Ontklitten & knippen' },
        { name: 'Nagels Knippen', price: '€12.00', emoji: '✂️', desc: 'Alle huisdieren' },
        { name: 'Tanden Poetsen', price: '€15.00', emoji: '🦷', desc: 'Tandverzorging' },
        { name: 'Spa Behandeling', price: '€45.00', emoji: '🛁', desc: 'Bad, föhn, parfum' },
      ],
      'Sushi takeaway': [
        { name: 'California Roll', price: '€8.50', emoji: '🍣', desc: '8 stuks, krab & avocado' },
        { name: 'Salmon Nigiri', price: '€9.00', emoji: '🐟', desc: '6 stuks, verse zalm' },
        { name: 'Maki Mix', price: '€12.50', emoji: '🍱', desc: '16 stuks assortiment' },
        { name: 'Ramen Bowl', price: '€13.50', emoji: '🍜', desc: 'Tonkotsu, chashu pork' },
        { name: 'Edamame', price: '€4.50', emoji: '🫛', desc: 'Zeezout' },
        { name: 'Pokébowl', price: '€14.00', emoji: '🥗', desc: 'Zalm, avocado, mango' },
      ],
      'Tattoo shop': [
        { name: 'Klein Tattoo', price: '€80.00', emoji: '🎨', desc: 'Tot 5cm, 30 min' },
        { name: 'Medium Tattoo', price: '€200.00', emoji: '💉', desc: '5-15cm, 2 uur' },
        { name: 'Groot Tattoo', price: '€400.00', emoji: '🖼️', desc: '15cm+, halve dag' },
        { name: 'Cover-up', price: '€250.00', emoji: '🔄', desc: 'Over bestaand tattoo' },
        { name: 'Piercing', price: '€30.00', emoji: '💎', desc: 'Incl. sieraad' },
        { name: 'Consult', price: '€0.00', emoji: '📋', desc: 'Gratis, ontwerp bespreken' },
      ],
      'Trimsalon': [
        { name: 'Kleine Hond', price: '€30.00', emoji: '🐶', desc: 'Tot 10 kg, knippen & bad' },
        { name: 'Grote Hond', price: '€50.00', emoji: '🐕', desc: '10+ kg, volledige trim' },
        { name: 'Puppypakket', price: '€25.00', emoji: '🐾', desc: 'Eerste trim, gewenning' },
        { name: 'Ontvilten', price: '€15.00', emoji: '🧹', desc: 'Extra bij klitten' },
        { name: 'Nagels + Oren', price: '€15.00', emoji: '✂️', desc: 'Verzorging pakket' },
        { name: 'Tanden Poetsen', price: '€10.00', emoji: '🦷', desc: 'Frisse adem' },
      ],
      'Wijnbar': [
        { name: 'Huiswijn Rood', price: '€5.50', emoji: '🍷', desc: 'Italiaans, vol van smaak' },
        { name: 'Prosecco', price: '€6.00', emoji: '🥂', desc: 'Bruisend, feestelijk' },
        { name: 'Wijnproeverij', price: '€25.00', emoji: '🍇', desc: '5 wijnen, uitleg' },
        { name: 'Kaasplank', price: '€15.00', emoji: '🧀', desc: 'Bij de wijn' },
        { name: 'Champagne', price: '€12.00', emoji: '🫧', desc: 'Moët, per glas' },
        { name: 'Fles naar Keuze', price: '€28.00', emoji: '🍾', desc: 'Uit onze selectie' },
      ],
      'Autowasstraat': [
        { name: 'Basis Wasbeurt', price: '€8.00', emoji: '🚗', desc: 'Buiten wassen' },
        { name: 'Premium Wash', price: '€15.00', emoji: '✨', desc: 'Buiten + velgen + wax' },
        { name: 'Interieur Clean', price: '€25.00', emoji: '🧹', desc: 'Stofzuigen + dashboard' },
        { name: 'Full Detail', price: '€75.00', emoji: '💎', desc: 'Totaal pakket in/uit' },
        { name: 'Wasabonnement', price: '€29.00', emoji: '🔄', desc: 'Onbeperkt per maand' },
        { name: 'Motor Wassen', price: '€12.00', emoji: '🏍️', desc: 'Motor & scooter' },
      ],
      'Yoga/Pilates studio': [
        { name: 'Hatha Yoga', price: '€14.00', emoji: '🧘', desc: '60 min, alle niveaus' },
        { name: 'Pilates Mat', price: '€14.00', emoji: '🤸', desc: '55 min, core focus' },
        { name: 'Vinyasa Flow', price: '€15.00', emoji: '💨', desc: '75 min, dynamisch' },
        { name: 'Yin Yoga', price: '€14.00', emoji: '🌙', desc: '60 min, diep stretch' },
        { name: 'Reformer', price: '€20.00', emoji: '🏋️', desc: '50 min, machine' },
        { name: '10-rittenkaart', price: '€120.00', emoji: '🎫', desc: '3 maanden geldig' },
      ],
      'Yoga studio': [
        { name: 'Hatha Yoga', price: '€14.00', emoji: '🧘', desc: '60 min, alle niveaus' },
        { name: 'Vinyasa Flow', price: '€15.00', emoji: '💨', desc: '75 min, dynamisch' },
        { name: 'Yin Yoga', price: '€14.00', emoji: '🌙', desc: '60 min, diep stretch' },
        { name: 'Power Yoga', price: '€16.00', emoji: '💪', desc: '60 min, intensief' },
        { name: 'Meditatie', price: '€10.00', emoji: '🧠', desc: '30 min, mindfulness' },
        { name: 'Maandabonnement', price: '€79.00', emoji: '🎫', desc: 'Onbeperkt yoga' },
      ],
    };
    return menus[businessType] || menus['Café/Restaurant'];
  };

  const rewards = [
    { name: 'Free Coffee', points: 500, emoji: '☕', unlocked: loyaltyPoints >= 500 },
    { name: '10% Discount', points: 1000, emoji: '🏷️', unlocked: loyaltyPoints >= 1000 },
    { name: 'Free Dessert', points: 2000, emoji: '🎂', unlocked: loyaltyPoints >= 2000 },
    { name: 'VIP Status', points: 5000, emoji: '👑', unlocked: loyaltyPoints >= 5000 },
    { name: 'Free Main Dish', points: 3000, emoji: '🍽️', unlocked: loyaltyPoints >= 3000 },
  ];

  return (
    <div className="phone-frame w-[280px] h-[570px] mx-auto relative select-none">
      {/* Dynamic notch */}
      <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[90px] h-[26px] bg-black rounded-b-2xl z-20 flex items-center justify-center">
        <div className="w-[50px] h-[4px] bg-white/5 rounded-full" />
      </div>

      <div className="phone-screen w-full h-full bg-[#0a0a0f] relative overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[9px] text-white/60 relative z-10">
          <span className="font-semibold">9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal size={10} />
            <Wifi size={10} />
            <Battery size={10} />
          </div>
        </div>

        {/* Screen content */}
        <div className="h-[calc(100%-68px)] overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen + (selectedItem || '')}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full overflow-y-auto overflow-x-hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {currentScreen === 'splash' && (
                <SplashScreen
                  name={businessName}
                  color={primaryColor}
                  type={businessType}
                  emoji={getTypeEmoji()}
                  onTap={() => navigateTo('home', 0)}
                  canInteract={canInteract}
                />
              )}
              {currentScreen === 'home' && !selectedItem && (
                <HomeScreen
                  name={businessName}
                  type={businessType}
                  color={primaryColor}
                  features={features}
                  city={city}
                  emoji={getTypeEmoji()}
                  notifCount={notifCount}
                  onNotifTap={() => { setNotifCount(0); triggerToast('📬 All notifications read'); }}
                  onFeatureTap={(f) => {
                    if (f.toLowerCase().includes('menu') || f.toLowerCase().includes('reserv'))
                      navigateTo('menu', 1);
                    else if (f.toLowerCase().includes('loyal') || f.toLowerCase().includes('reward'))
                      navigateTo('rewards', 2);
                    else
                      triggerToast(`🚀 ${f} coming soon!`);
                  }}
                  onHeroTap={() => navigateTo('menu', 1)}
                  onLoyaltyTap={() => navigateTo('rewards', 2)}
                  onMapTap={() => navigateTo('map')}
                  canInteract={canInteract}
                />
              )}
              {currentScreen === 'menu' && !selectedItem && (
                <MenuScreen
                  type={businessType}
                  color={primaryColor}
                  items={getMenuItems()}
                  cartItems={cartItems}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  onItemTap={(name) => canInteract && setSelectedItem(name)}
                  onBack={() => navigateTo('home', 0)}
                  onCartTap={() => navigateTo('cart')}
                  totalCartItems={totalCartItems}
                  canInteract={canInteract}
                />
              )}
              {currentScreen === 'menu' && selectedItem && (
                <ItemDetailScreen
                  item={getMenuItems().find(i => i.name === selectedItem)!}
                  color={primaryColor}
                  onBack={() => setSelectedItem(null)}
                  onAdd={addToCart}
                  qty={cartItems[selectedItem] || 0}
                />
              )}
              {currentScreen === 'rewards' && (
                <RewardsScreen
                  name={businessName}
                  color={primaryColor}
                  points={loyaltyPoints}
                  rewards={rewards}
                  onClaim={(r) => {
                    if (loyaltyPoints >= r.points) {
                      setLoyaltyPoints(prev => prev - r.points);
                      triggerToast(`🎉 ${r.name} claimed!`);
                    } else {
                      triggerToast(`❌ Need ${r.points - loyaltyPoints} more points`);
                    }
                  }}
                  onBack={() => navigateTo('home', 0)}
                  onCheckin={() => {
                    setLoyaltyPoints(prev => prev + 100);
                    triggerToast('✅ +100 points! Daily check-in');
                  }}
                  canInteract={canInteract}
                />
              )}
              {currentScreen === 'profile' && (
                <ProfileScreen
                  name={businessName}
                  color={primaryColor}
                  points={loyaltyPoints}
                  onBack={() => navigateTo('home', 0)}
                  onTap={(item) => triggerToast(`📱 ${item} opened`)}
                  canInteract={canInteract}
                />
              )}
              {currentScreen === 'cart' && (
                <CartScreen
                  items={getMenuItems().filter(i => cartItems[i.name])}
                  cartItems={cartItems}
                  color={primaryColor}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  onBack={() => navigateTo('menu', 1)}
                  onCheckout={() => {
                    const pts = totalCartItems * 50;
                    setLoyaltyPoints(prev => prev + pts);
                    setCartItems({});
                    triggerToast(`🎉 Order placed! +${pts} loyalty points`);
                    navigateTo('home', 0);
                  }}
                />
              )}
              {currentScreen === 'map' && (
                <MapScreen
                  name={businessName}
                  city={city}
                  color={primaryColor}
                  type={businessType}
                  emoji={getTypeEmoji()}
                  onBack={() => navigateTo('home', 0)}
                  onNavigate={() => triggerToast('🗺️ Opening navigation...')}
                  onCall={() => triggerToast('📞 Calling...')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation — always visible */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around px-4 py-2 bg-[#0e0e16]/95 backdrop-blur-md border-t border-white/5 z-10">
          {[
            { icon: <Home size={15} />, label: 'Home', screen: 'home' as Screen },
            { icon: <Search size={15} />, label:
              ['Café/Restaurant', 'Bakkerij', 'IJssalon', 'Sushi takeaway', 'Wijnbar'].includes(businessType) ? 'Menu' :
              ['Kapsalon', 'Barbershop', 'Nagelstudio', 'Massage salon', 'Tattoo shop', 'Fotostudio', 'Fietsenmaker', 'Autowasstraat'].includes(businessType) ? 'Services' :
              ['Sportschool/Fitness', 'Yoga/Pilates studio', 'Yoga studio'].includes(businessType) ? 'Classes' :
              ['Pet grooming', 'Trimsalon'].includes(businessType) ? 'Diensten' :
              ['Huisartsenpraktijk'].includes(businessType) ? 'Afspraak' :
              'Shop', screen: 'menu' as Screen },
            { icon: <Heart size={15} />, label: 'Rewards', screen: 'rewards' as Screen },
            { icon: <User size={15} />, label: 'Profile', screen: 'profile' as Screen },
          ].map((item, idx) => (
            <button
              key={item.label}
              onClick={() => navigateTo(item.screen, idx)}
              className={`flex flex-col items-center gap-0.5 transition-all duration-200 relative ${canInteract ? 'cursor-pointer active:scale-90' : 'cursor-default'}`}
            >
              <span style={{ color: activeTab === idx && canInteract ? primaryColor : '#6b7280' }}>{item.icon}</span>
              <span className="text-[7px] font-medium" style={{ color: activeTab === idx && canInteract ? primaryColor : '#6b7280' }}>{item.label}</span>
              {activeTab === idx && canInteract && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-2 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
              {/* Cart badge on Menu tab */}
              {idx === 1 && totalCartItems > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {totalCartItems}
                </motion.div>
              )}
            </button>
          ))}
        </div>

        {/* Toast notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-14 left-3 right-3 z-30 rounded-xl px-3 py-2.5 text-white text-[10px] font-medium shadow-xl"
              style={{ background: '#1a1a2e', border: `1px solid ${primaryColor}30` }}
            >
              {showToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Home indicator */}
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[80px] h-[3px] bg-white/15 rounded-full z-20" />
      </div>

      {/* Glow effect */}
      {(isBuilding || interactive) && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-4 rounded-[50px] -z-10"
          style={{ background: `radial-gradient(ellipse, ${primaryColor}15, transparent 70%)` }}
        />
      )}

      {/* Interactive badge */}
      {canInteract && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-lg"
          style={{ background: primaryColor, color: '#fff' }}
        >
          <Zap size={8} />
          Interactive
        </motion.div>
      )}
    </div>
  );
};

// ============= SPLASH SCREEN =============
const SplashScreen: React.FC<{ name: string; color: string; type: string; emoji: string; onTap: () => void; canInteract: boolean }> = ({ name, color, type, emoji, onTap, canInteract }) => (
  <div
    className={`h-full flex flex-col items-center justify-center px-6 ${canInteract ? 'cursor-pointer' : ''}`}
    style={{ background: `linear-gradient(180deg, ${color}12 0%, #0a0a0f 100%)` }}
    onClick={onTap}
  >
    <motion.div
      animate={{ scale: [1, 1.08, 1], y: [0, -5, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-6 shadow-xl relative"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, boxShadow: `0 20px 60px ${color}30` }}
    >
      <span className="text-4xl">{emoji}</span>
    </motion.div>
    <h2 className="text-white font-bold text-xl mb-1 text-center">{name}</h2>
    <p className="text-white/30 text-[10px] uppercase tracking-widest">{type}</p>
    {canInteract && (
      <motion.p
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-[9px] mt-6 font-medium"
        style={{ color }}
      >
        Tap anywhere to enter →
      </motion.p>
    )}
    {!canInteract && (
      <div className="flex items-center gap-1.5 mt-6">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    )}
  </div>
);

// ============= HOME SCREEN =============
interface HomeScreenProps {
  name: string; type: string; color: string; features: string[]; city: string;
  emoji: string; notifCount: number;
  onNotifTap: () => void; onFeatureTap: (f: string) => void;
  onHeroTap: () => void; onLoyaltyTap: () => void; onMapTap: () => void;
  canInteract: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  name, type, color, features, city, emoji, notifCount,
  onNotifTap, onFeatureTap, onHeroTap, onLoyaltyTap, onMapTap, canInteract
}) => {
  const displayFeatures = features.length > 0
    ? features.slice(0, 4)
    : ['Online menu', 'Reservations', 'Loyalty rewards', 'Contact us'];
  const iconList = [<Home size={13} key="h" />, <Search size={13} key="s" />, <Gift size={13} key="g" />, <MapPin size={13} key="m" />];

  return (
    <div className="flex flex-col px-3.5 pt-1 pb-4" style={{ background: `linear-gradient(180deg, ${color}06 0%, #0a0a0f 40%)` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] text-white/35">Welcome to</p>
          <h2 className="text-white font-bold text-[13px]">{name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={canInteract ? onNotifTap : undefined} className={`w-7 h-7 rounded-full flex items-center justify-center bg-white/5 relative ${canInteract ? 'active:scale-90' : ''}`}>
            <Bell size={12} className="text-white/40" />
            {notifCount > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ backgroundColor: '#ef4444' }}>
                {notifCount}
              </motion.div>
            )}
          </button>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}25` }}>
            <User size={12} style={{ color }} />
          </div>
        </div>
      </div>

      {/* Hero card */}
      <button onClick={canInteract ? onHeroTap : undefined} className={`rounded-xl p-3 mb-3 relative overflow-hidden text-left w-full ${canInteract ? 'active:scale-[0.98] transition-transform' : ''}`} style={{ background: `linear-gradient(135deg, ${color}18, ${color}05)`, border: `1px solid ${color}20` }}>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-15" style={{ background: color, filter: 'blur(25px)' }} />
        <div className="relative">
          <p className="text-white font-semibold text-[11px] mb-0.5">
            {emoji} {type === 'Restaurant' ? 'Special Today' : type === 'Café' ? 'Daily Special' : type === 'Kapsalon' ? 'Book Now' : 'Featured'}
          </p>
          <p className="text-[9px] text-white/45">Best {type.toLowerCase()} in {city}</p>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={9} fill={color} stroke={color} />)}
            <span className="text-[8px] text-white/35 ml-1">4.9 (247)</span>
          </div>
          {canInteract && <p className="text-[8px] mt-1.5 font-medium" style={{ color }}>Tap to explore →</p>}
        </div>
      </button>

      {/* Quick actions grid */}
      <p className="text-[9px] text-white/35 mb-1.5 font-medium uppercase tracking-wider">Quick Actions</p>
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        {displayFeatures.map((f, i) => (
          <button
            key={f}
            onClick={canInteract ? () => onFeatureTap(f) : undefined}
            className={`rounded-lg p-2 flex items-center gap-2 text-left ${canInteract ? 'active:scale-95 transition-transform' : ''}`}
            style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}12` }}>
              <span style={{ color }}>{iconList[i % 4]}</span>
            </div>
            <span className="text-[9px] text-white/75 font-medium truncate">{f}</span>
          </button>
        ))}
      </div>

      {/* Loyalty */}
      <button onClick={canInteract ? onLoyaltyTap : undefined} className={`rounded-lg p-2.5 flex items-center justify-between w-full ${canInteract ? 'active:scale-[0.98] transition-transform' : ''}`} style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
            <Gift size={12} style={{ color }} />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-white font-medium">Loyalty Rewards</p>
            <p className="text-[7px] text-white/35">Earn points on every visit</p>
          </div>
        </div>
        <ChevronRight size={12} className="text-white/20" />
      </button>

      {/* Location */}
      <button onClick={canInteract ? onMapTap : undefined} className={`rounded-lg p-2.5 flex items-center gap-2 mt-1.5 w-full ${canInteract ? 'active:scale-[0.98] transition-transform' : ''}`} style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
        <MapPin size={12} style={{ color }} />
        <span className="text-[9px] text-white/50">{city}</span>
        <span className="text-[8px] ml-auto" style={{ color }}>View map →</span>
      </button>

      {/* Hours */}
      <div className="rounded-lg p-2.5 flex items-center gap-2 mt-1.5" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
        <Clock size={12} style={{ color }} />
        <span className="text-[9px] text-white/50">Open now</span>
        <span className="text-[9px] text-green-400 ml-auto">● Until 22:00</span>
      </div>
    </div>
  );
};

// ============= MENU / SERVICES SCREEN =============
interface MenuScreenProps {
  type: string; color: string;
  items: { name: string; price: string; emoji: string; desc: string }[];
  cartItems: Record<string, number>;
  onAdd: (item: string) => void; onRemove: (item: string) => void;
  onItemTap: (name: string) => void; onBack: () => void;
  onCartTap: () => void; totalCartItems: number; canInteract: boolean;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ type, color, items, cartItems, onAdd, onRemove, onItemTap, onBack, onCartTap, totalCartItems, canInteract }) => {
  const [activeFilter, setActiveFilter] = useState(0);
  const title = type === 'Restaurant' || type === 'Café' ? 'Menu' : type === 'Kapsalon' ? 'Services' : type === 'Sportschool' ? 'Classes' : 'Products';
  const filters = ['All', 'Popular', 'New', type === 'Restaurant' ? 'Deals' : 'Promo'];

  return (
    <div className="flex flex-col px-3.5 pt-1 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {canInteract && (
            <button onClick={onBack} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center active:scale-90">
              <ChevronLeft size={12} className="text-white/50" />
            </button>
          )}
          <h2 className="text-white font-bold text-[13px]">{title}</h2>
        </div>
        {canInteract && totalCartItems > 0 && (
          <button onClick={onCartTap} className="relative active:scale-90">
            <ShoppingCart size={16} className="text-white/60" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: color }}>
              {totalCartItems}
            </motion.div>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {filters.map((tab, i) => (
          <button
            key={tab}
            onClick={canInteract ? () => setActiveFilter(i) : undefined}
            className={`px-3 py-1 rounded-full text-[8px] font-medium whitespace-nowrap transition-all ${canInteract ? 'active:scale-95' : ''}`}
            style={{
              background: i === activeFilter ? color : '#14141f',
              color: i === activeFilter ? '#fff' : '#9ca3af',
              border: i === activeFilter ? 'none' : '1px solid #2a2a3d',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const qty = cartItems[item.name] || 0;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl p-2 flex items-center gap-2.5 ${canInteract ? 'active:scale-[0.98] transition-transform' : ''}`}
              style={{ background: qty > 0 ? `${color}08` : '#14141f', border: qty > 0 ? `1px solid ${color}20` : '1px solid #2a2a3d30' }}
            >
              <button
                onClick={canInteract ? () => onItemTap(item.name) : undefined}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: `${color}10` }}
              >
                {item.emoji}
              </button>
              <button onClick={canInteract ? () => onItemTap(item.name) : undefined} className="flex-1 min-w-0 text-left">
                <p className="text-white text-[10px] font-medium">{item.name}</p>
                <p className="text-[8px] text-white/30 truncate">{item.desc}</p>
              </button>
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                <p className="text-[9px] font-bold" style={{ color }}>{item.price}</p>
                {canInteract && (
                  <div className="flex items-center gap-1">
                    {qty > 0 && (
                      <>
                        <button onClick={() => onRemove(item.name)} className="w-5 h-5 rounded-md flex items-center justify-center bg-white/10 active:scale-90 transition-transform">
                          <Minus size={9} className="text-white/60" />
                        </button>
                        <span className="text-[9px] font-bold text-white w-3 text-center">{qty}</span>
                      </>
                    )}
                    <button onClick={() => onAdd(item.name)} className="w-5 h-5 rounded-md flex items-center justify-center active:scale-90 transition-transform" style={{ backgroundColor: color }}>
                      <Plus size={9} className="text-white font-bold" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============= ITEM DETAIL SCREEN =============
const ItemDetailScreen: React.FC<{
  item: { name: string; price: string; emoji: string; desc: string };
  color: string; onBack: () => void; onAdd: (name: string) => void; qty: number;
}> = ({ item, color, onBack, onAdd, qty }) => (
  <div className="flex flex-col h-full">
    {/* Big image area */}
    <div className="relative h-40 flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${color}15, #0a0a0f)` }}>
      <button onClick={onBack} className="absolute top-2 left-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center active:scale-90 z-10">
        <ChevronLeft size={14} className="text-white" />
      </button>
      <span className="text-6xl">{item.emoji}</span>
    </div>
    <div className="px-4 pt-3 pb-4 flex-1">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-white font-bold text-sm">{item.name}</h3>
          <p className="text-white/40 text-[10px] mt-0.5">{item.desc}</p>
        </div>
        <p className="text-base font-black" style={{ color }}>{item.price}</p>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill={i <= 4 ? color : 'transparent'} stroke={color} />)}
        <span className="text-[9px] text-white/35 ml-1">4.8 (156 reviews)</span>
      </div>

      <div className="rounded-lg p-2.5 mb-3" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
        <p className="text-[9px] text-white/60 font-medium mb-1">Description</p>
        <p className="text-[8px] text-white/35 leading-relaxed">
          Carefully prepared with the finest ingredients. A customer favorite at our establishment. 
          Allergen info available on request.
        </p>
      </div>

      {qty > 0 && (
        <div className="rounded-lg p-2 mb-3 flex items-center gap-2" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
          <Check size={10} style={{ color }} />
          <span className="text-[9px] font-medium" style={{ color }}>{qty} in cart</span>
        </div>
      )}

      <button
        onClick={() => onAdd(item.name)}
        className="w-full py-2.5 rounded-xl text-white text-[11px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        style={{ backgroundColor: color }}
      >
        <Plus size={12} /> Add to order — {item.price}
      </button>
    </div>
  </div>
);

// ============= REWARDS SCREEN =============
interface RewardsScreenProps {
  name: string; color: string; points: number;
  rewards: { name: string; points: number; emoji: string; unlocked: boolean }[];
  onClaim: (r: { name: string; points: number }) => void; onBack: () => void;
  onCheckin: () => void; canInteract: boolean;
}

const RewardsScreen: React.FC<RewardsScreenProps> = ({ name, color, points, rewards, onClaim, onBack, onCheckin, canInteract }) => (
  <div className="flex flex-col px-3.5 pt-1 pb-4">
    <div className="flex items-center gap-2 mb-3">
      {canInteract && (
        <button onClick={onBack} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center active:scale-90">
          <ChevronLeft size={12} className="text-white/50" />
        </button>
      )}
      <h2 className="text-white font-bold text-[13px]">Rewards</h2>
      <Award size={12} style={{ color }} />
    </div>

    {/* Points balance */}
    <div className="rounded-xl p-3 mb-3 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)`, border: `1px solid ${color}25` }}>
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-20" style={{ background: color, filter: 'blur(20px)' }} />
      <p className="text-[9px] text-white/50 mb-0.5">Your Points Balance</p>
      <p className="text-2xl font-black text-white">{points.toLocaleString()}</p>
      <p className="text-[8px] text-white/30 mt-0.5">{name} Loyalty Member</p>

      {canInteract && (
        <button
          onClick={onCheckin}
          className="mt-2 px-3 py-1.5 rounded-lg text-[9px] font-bold text-white flex items-center gap-1 active:scale-95 transition-transform"
          style={{ backgroundColor: color }}
        >
          <Zap size={9} /> Daily Check-in (+100 pts)
        </button>
      )}
    </div>

    {/* Progress to next reward */}
    <div className="rounded-lg p-2.5 mb-3" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] text-white/60 font-medium">Next Reward</span>
        <span className="text-[8px] font-mono" style={{ color }}>
          {points}/{rewards.find(r => !r.unlocked)?.points || 5000} pts
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (points / (rewards.find(r => !r.unlocked)?.points || 5000)) * 100)}%` }}
          transition={{ duration: 1 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
    </div>

    {/* Rewards list */}
    <p className="text-[9px] text-white/35 mb-1.5 font-medium uppercase tracking-wider">Available Rewards</p>
    <div className="space-y-1.5">
      {rewards.map((r, i) => (
        <motion.div
          key={r.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-xl p-2.5 flex items-center gap-2.5"
          style={{
            background: r.unlocked ? `${color}08` : '#14141f',
            border: r.unlocked ? `1px solid ${color}20` : '1px solid #2a2a3d30',
            opacity: r.unlocked ? 1 : 0.5,
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: `${color}10` }}>
            {r.emoji}
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-white font-medium">{r.name}</p>
            <p className="text-[8px] text-white/30">{r.points} points</p>
          </div>
          {canInteract && r.unlocked && (
            <button
              onClick={() => onClaim(r)}
              className="px-2.5 py-1 rounded-lg text-[8px] font-bold text-white active:scale-90 transition-transform"
              style={{ backgroundColor: color }}
            >
              Claim
            </button>
          )}
          {!r.unlocked && (
            <span className="text-[8px] text-white/20">🔒</span>
          )}
        </motion.div>
      ))}
    </div>
  </div>
);

// ============= PROFILE SCREEN =============
const ProfileScreen: React.FC<{
  name: string; color: string; points: number;
  onBack: () => void; onTap: (item: string) => void; canInteract: boolean;
}> = ({ name, color, points, onBack, onTap, canInteract }) => (
  <div className="flex flex-col px-3.5 pt-1 pb-4">
    <div className="flex items-center gap-2 mb-3">
      {canInteract && (
        <button onClick={onBack} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center active:scale-90">
          <ChevronLeft size={12} className="text-white/50" />
        </button>
      )}
      <h2 className="text-white font-bold text-[13px]">Profile</h2>
    </div>

    <div className="flex flex-col items-center mb-3">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
      >
        <User size={22} className="text-white" />
      </motion.div>
      <p className="text-white font-semibold text-[11px]">Jan de Vries</p>
      <p className="text-white/35 text-[9px]">Premium member since 2024</p>
    </div>

    <div className="grid grid-cols-3 gap-1.5 mb-3">
      {[
        { label: 'Points', value: points.toLocaleString() },
        { label: 'Visits', value: '34' },
        { label: 'Rewards', value: '7' },
      ].map(item => (
        <div key={item.label} className="rounded-lg p-2 text-center" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
          <p className="font-bold text-[11px]" style={{ color }}>{item.value}</p>
          <p className="text-[7px] text-white/35">{item.label}</p>
        </div>
      ))}
    </div>

    <div className="space-y-1">
      {[
        { icon: <ShoppingCart size={11} />, label: 'My Orders' },
        { icon: <CreditCard size={11} />, label: 'Payment Methods' },
        { icon: <Bell size={11} />, label: 'Notifications' },
        { icon: <HelpCircle size={11} />, label: 'Help & Support' },
        { icon: <Settings size={11} />, label: 'Settings' },
        { icon: <LogOut size={11} />, label: 'Sign Out' },
      ].map((item) => (
        <button
          key={item.label}
          onClick={canInteract ? () => onTap(item.label) : undefined}
          className={`rounded-lg p-2.5 flex items-center justify-between w-full ${canInteract ? 'active:scale-[0.98] transition-transform' : ''}`}
          style={{ background: '#14141f', border: '1px solid #2a2a3d20' }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color }}>{item.icon}</span>
            <span className="text-[9px] text-white/70">{item.label}</span>
          </div>
          <ChevronRight size={10} className="text-white/20" />
        </button>
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-3 rounded-lg p-2 flex items-center gap-2"
      style={{ background: `${color}08`, border: `1px solid ${color}15` }}
    >
      <span className="text-sm">👑</span>
      <div>
        <p className="text-[8px] font-medium" style={{ color }}>Premium {name} Member</p>
        <p className="text-[7px] text-white/30">Exclusive rewards unlocked</p>
      </div>
    </motion.div>
  </div>
);

// ============= CART SCREEN =============
const CartScreen: React.FC<{
  items: { name: string; price: string; emoji: string; desc: string }[];
  cartItems: Record<string, number>;
  color: string;
  onAdd: (item: string) => void; onRemove: (item: string) => void;
  onBack: () => void; onCheckout: () => void;
}> = ({ items, cartItems, color, onAdd, onRemove, onBack, onCheckout }) => {
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('€', ''));
    return sum + price * (cartItems[item.name] || 0);
  }, 0);

  return (
    <div className="flex flex-col h-full px-3.5 pt-1 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center active:scale-90">
          <ChevronLeft size={12} className="text-white/50" />
        </button>
        <h2 className="text-white font-bold text-[13px]">Your Order</h2>
        <ShoppingCart size={12} style={{ color }} />
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-3xl mb-2">🛒</span>
          <p className="text-white/40 text-[10px]">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5 flex-1">
            {items.map(item => (
              <div key={item.name} className="rounded-xl p-2.5 flex items-center gap-2" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
                <span className="text-base">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-[10px] text-white font-medium">{item.name}</p>
                  <p className="text-[8px] text-white/30">{item.price} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onRemove(item.name)} className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center active:scale-90">
                    <Minus size={9} className="text-white/60" />
                  </button>
                  <span className="text-[10px] font-bold text-white w-4 text-center">{cartItems[item.name]}</span>
                  <button onClick={() => onAdd(item.name)} className="w-5 h-5 rounded-md flex items-center justify-center active:scale-90" style={{ backgroundColor: color }}>
                    <Plus size={9} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total + checkout */}
          <div className="mt-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/50">Total</span>
              <span className="text-sm font-black" style={{ color }}>€{total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-2.5 rounded-xl text-white text-[11px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: color }}
            >
              <Check size={12} /> Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ============= MAP SCREEN =============
const MapScreen: React.FC<{
  name: string; city: string; color: string; type: string; emoji: string;
  onBack: () => void; onNavigate: () => void; onCall: () => void;
}> = ({ name, city, color, type, emoji, onBack, onNavigate, onCall }) => (
  <div className="flex flex-col h-full">
    {/* Fake map area */}
    <div className="relative h-44 bg-[#1a1a28] overflow-hidden">
      <button onClick={onBack} className="absolute top-2 left-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center active:scale-90 z-10">
        <ChevronLeft size={14} className="text-white" />
      </button>
      {/* Grid lines to simulate map */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <React.Fragment key={i}>
            <div className="absolute h-px bg-white/20" style={{ top: `${i * 14}%`, left: 0, right: 0 }} />
            <div className="absolute w-px bg-white/20" style={{ left: `${i * 14}%`, top: 0, bottom: 0 }} />
          </React.Fragment>
        ))}
      </div>
      {/* Roads */}
      <div className="absolute top-1/3 left-0 right-0 h-2 bg-white/5 transform -rotate-12" />
      <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-white/5 transform rotate-6" />
      {/* Pin */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shadow-lg" style={{ backgroundColor: color, boxShadow: `0 4px 15px ${color}40` }}>
          {emoji}
        </div>
        <div className="w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor: color, opacity: 0.3 }} />
      </motion.div>
    </div>

    <div className="px-3.5 pt-3 pb-4">
      <h3 className="text-white font-bold text-sm mb-0.5">{name}</h3>
      <p className="text-white/40 text-[10px] mb-3">{type} • {city}</p>

      <div className="space-y-1.5 mb-3">
        <div className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
          <MapPin size={11} style={{ color }} />
          <span className="text-[9px] text-white/60">Kerkstraat 42, {city}</span>
        </div>
        <div className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
          <Clock size={11} style={{ color }} />
          <span className="text-[9px] text-white/60">Mon-Sat: 08:00 - 22:00</span>
          <span className="text-[8px] text-green-400 ml-auto">Open</span>
        </div>
        <div className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
          <Mail size={11} style={{ color }} />
          <span className="text-[9px] text-white/60">info@{name.toLowerCase().replace(/\s/g, '')}.nl</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <button onClick={onNavigate} className="rounded-lg p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform" style={{ background: color }}>
          <Navigation size={12} className="text-white" />
          <span className="text-[8px] text-white font-medium">Navigate</span>
        </button>
        <button onClick={onCall} className="rounded-lg p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
          <Phone size={12} style={{ color }} />
          <span className="text-[8px] text-white/60 font-medium">Call</span>
        </button>
        <button className="rounded-lg p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform" style={{ background: '#14141f', border: '1px solid #2a2a3d30' }}>
          <Instagram size={12} style={{ color }} />
          <span className="text-[8px] text-white/60 font-medium">Social</span>
        </button>
      </div>
    </div>
  </div>
);

export default PhonePreview;
