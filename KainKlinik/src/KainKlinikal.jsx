import { useState, useRef, useEffect } from "react";

// ============================================
// GLOBAL STYLES
// ============================================
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0D1F15; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #A8DFBF; border-radius: 4px; }
  input, button, select, textarea { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
  @keyframes popIn    { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
  @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes shimmer  { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes float    { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
  @keyframes gradShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes checkPop { 0% { transform:scale(0) rotate(-15deg); } 60% { transform:scale(1.2) rotate(3deg); } 100% { transform:scale(1) rotate(0deg); } }
`;

// ============================================
// CONSTANTS
// ============================================
const CONDITIONS = [
  { id: "diabetes",     label: "Diabetes",     sublabel: "Mataas na Asukal",    emoji: "🩸", color: "#E05252", bg: "#FDECEA", border: "#F1948A" },
  { id: "anemia",       label: "Anemia",       sublabel: "Mababang Hemoglobin", emoji: "💉", color: "#8E44AD", bg: "#F5EEF8", border: "#C39BD3" },
  { id: "arthritis",    label: "Arthritis",    sublabel: "Masakit na Kasukasuan",emoji: "🦴", color: "#D35400", bg: "#FEF9E7", border: "#F0B27A" },
  { id: "hypertension", label: "Hypertension", sublabel: "Mataas na Presyon",   emoji: "❤️", color: "#C0392B", bg: "#FDEDEC", border: "#F1948A" },
];

const VERDICT_CFG = {
  kainin:    { label: "PWEDE ✅",    tagline: "Mainam para sa iyo",               color: "#1A7A4A", bg: "#E8F8F0", border: "#6FCF97", icon: "✅", dot: "#2D9E6B" },
  limitahan: { label: "LIMITADO ⚠️", tagline: "Pwede pero katamtaman lang",      color: "#B8620A", bg: "#FEF8EC", border: "#F6C86A", icon: "⚠️", dot: "#E67E22" },
  iwasan:    { label: "IWASAN ❌",   tagline: "Hindi mainam para sa iyo",         color: "#A93226", bg: "#FDECEA", border: "#F1948A", icon: "❌", dot: "#E05252" },
  depende:   { label: "DEPENDE 🔄",  tagline: "Iba ang sagot sa bawat kalagayan", color: "#6C3483", bg: "#F5EEF8", border: "#C39BD3", icon: "🔄", dot: "#9B59B6" },
};

const BADGE_COLORS = {
  FNRI: { bg: "#EBF5FB", text: "#1A5276" },
  DOH:  { bg: "#E9F7EF", text: "#1E8449" },
  PRA:  { bg: "#FEF9E7", text: "#7D6608" },
  PHA:  { bg: "#FDEDEC", text: "#922B21" },
};

// ============================================
// FOOD DATABASE
// ============================================
const FOOD_DATABASE = [
  { food_id:"galunggong_001", name:"Galunggong", aliases:["galunggong","round scad","bilong-bilong"], emoji:"🐟", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",   reason:"Mataas sa protina, walang carbohydrates. Hindi nagpapataas ng blood sugar.", badge:"FNRI"},
      anemia:      {verdict:"kainin",   reason:"Mayaman sa iron at B12 na tumutulong sa paggawa ng pulang selula ng dugo.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",   reason:"May omega-3 fatty acids na tumutulong na bawasan ang pamamaga ng kasukasuan.", badge:"PRA"},
      hypertension:{verdict:"limitahan",reason:"Kung pinirito o binudburan ng asin, mataas sa sodium. Mas mainam na inihaw o nilaga.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱80–120 / kilo", cooking_tip:"Inihaw o nilaga — iwasan ang pagpiprito kung may hypertension",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"sardinas_001", name:"Sardinas", aliases:["sardinas","sardines","de lata"], emoji:"🐟", category:"Isda",
    conditions:{
      diabetes:    {verdict:"kainin",   reason:"Mataas sa protina at omega-3. Hindi nagpapataas ng blood sugar.", badge:"FNRI"},
      anemia:      {verdict:"kainin",   reason:"Mataas sa iron at B12 — isa sa pinakamadaling paraan para makakuha ng iron.", badge:"FNRI"},
      arthritis:   {verdict:"iwasan",   reason:"Mataas sa purines ang sardinas na nagpapataas ng uric acid at nagpapalala ng arthritis.", badge:"PRA"},
      hypertension:{verdict:"limitahan",reason:"Ang de latang sardinas ay mataas sa sodium. Hugasan muna bago lutuin.", badge:"PHA"},
    }, safe_alternative:"Inihaw na galunggong — mas mababa sa purines at sodium", price_estimate:"₱20–35 / lata", cooking_tip:"Hugasan ng tubig para mabawasan ang sodium",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"manok_001", name:"Manok (walang balat)", aliases:["manok","chicken","walang balat"], emoji:"🍗", category:"Karne",
    conditions:{
      diabetes:    {verdict:"kainin",reason:"Mataas sa protina, walang carbohydrates. Tumutulong sa pakiramdam ng pagkabusog.", badge:"FNRI"},
      anemia:      {verdict:"kainin",reason:"May iron at B12 na tumutulong sa paggawa ng pulang selula ng dugo.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",reason:"Mababa sa purines kumpara sa ibang karne. Ligtas para sa kasukasuan.", badge:"PRA"},
      hypertension:{verdict:"kainin",reason:"Mababa sa taba kung walang balat. Inihaw o nilaga — hindi pinirito.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱180–220 / kilo", cooking_tip:"Alisin ang balat bago lutuin para mabawasan ang taba ng hanggang 50%",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"atay_001", name:"Atay ng Manok", aliases:["atay","liver","chicken liver","atay ng manok"], emoji:"🫀", category:"Karne",
    conditions:{
      diabetes:    {verdict:"kainin",   reason:"Mataas sa protina at mababa sa carbohydrates. Hindi nagpapataas ng blood sugar.", badge:"FNRI"},
      anemia:      {verdict:"kainin",   reason:"Pinakamataas na iron content sa lahat ng pagkain — 3x mas mataas kaysa pula ng karne.", badge:"FNRI"},
      arthritis:   {verdict:"iwasan",   reason:"Sobrang taas ng purines ng atay — isa sa pinaka-mapanganib na pagkain para sa arthritis.", badge:"PRA"},
      hypertension:{verdict:"limitahan",reason:"Mataas sa cholesterol. Hindi hihigit sa isang beses sa linggo.", badge:"PHA"},
    }, safe_alternative:"Kangkong o pechay — mataas din sa iron pero ligtas sa arthritis", price_estimate:"₱80–120 / kilo", cooking_tip:"Para sa anemia na walang arthritis: igisa sa bawang at sibuyas",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"},{label:"Philippine Rheumatology Association",url:"https://philippinerheumatology.org",badge:"PRA"}]},

  { food_id:"lechon_001", name:"Lechon", aliases:["lechon","lechon baboy","roast pig","litson"], emoji:"🍖", category:"Karne",
    conditions:{
      diabetes:    {verdict:"iwasan",reason:"Sobrang taba ng lechon ang nagpapabagal ng insulin at nagpapataas ng blood sugar.", badge:"FNRI"},
      anemia:      {verdict:"limitahan",reason:"May iron pero ang mataas na taba ay mas nakakasama kaysa nakakabuti.", badge:"FNRI"},
      arthritis:   {verdict:"iwasan",reason:"Napakataas sa saturated fat at purines — pinaka-mapanganib para sa arthritis.", badge:"PRA"},
      hypertension:{verdict:"iwasan",reason:"Mataas sa sodium at saturated fat — direktang nagpapataas ng blood pressure.", badge:"PHA"},
    }, safe_alternative:"Inihaw na manok na walang balat — may lasa pa rin pero mas ligtas", price_estimate:"₱350–500 / kilo", cooking_tip:null,
    sources:[{label:"DOH Healthy Diet Guidelines",url:"https://doh.gov.ph/node/7771",badge:"DOH"}]},

  { food_id:"baboy_001", name:"Baboy", aliases:["baboy","pork","adobo","humba"], emoji:"🥩", category:"Karne",
    conditions:{
      diabetes:    {verdict:"limitahan",reason:"Ang mataba na parte ng baboy ay nagpapabagal ng insulin. Pwede ang payat na parte minsan.", badge:"FNRI"},
      anemia:      {verdict:"kainin",   reason:"May iron ang pula ng karne ng baboy na tumutulong sa hemoglobin.", badge:"FNRI"},
      arthritis:   {verdict:"iwasan",   reason:"Mataas sa saturated fat at purines ang baboy — nagpapalala ng inflammation at uric acid.", badge:"PRA"},
      hypertension:{verdict:"iwasan",   reason:"Mataas sa sodium at saturated fat ang karamihan sa lutong baboy.", badge:"PHA"},
    }, safe_alternative:"Manok na walang balat o isda — mas ligtas para sa lahat ng kalagayan", price_estimate:"₱220–320 / kilo", cooking_tip:"Kung kakain, piliin ang kasim at lutuin na nilaga",
    sources:[{label:"DOH Clinical Practice Guidelines",url:"https://doh.gov.ph/node/7771",badge:"DOH"}]},

  { food_id:"kangkong_001", name:"Kangkong", aliases:["kangkong","water spinach","kang kong"], emoji:"🥬", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",reason:"Halos walang carbohydrates. Puno ng fiber na nagpapabagal ng pagsipsip ng asukal.", badge:"FNRI"},
      anemia:      {verdict:"kainin",reason:"Mataas sa iron at Vitamin C na tumutulong sa pagsipsip ng iron sa katawan.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",reason:"May antioxidants na tumutulong na labanan ang pamamaga ng kasukasuan.", badge:"PRA"},
      hypertension:{verdict:"kainin",reason:"Mataas sa potassium na tumutulong sa pagbaba ng blood pressure.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱15–25 / bigkis", cooking_tip:"Igisa sa bawang — piga ng dayap para mas masipsip ang iron",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"malunggay_001", name:"Malunggay", aliases:["malunggay","moringa","kamunggay"], emoji:"🌿", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",reason:"May mga compound ang malunggay na tumutulong sa pagpapababa ng blood sugar.", badge:"FNRI"},
      anemia:      {verdict:"kainin",reason:"Napakataas sa iron at Vitamin C — isa sa pinakamainam na gulay para sa anemia.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",reason:"May anti-inflammatory properties na tumutulong na bawasan ang pamamaga.", badge:"PRA"},
      hypertension:{verdict:"kainin",reason:"May potassium at antioxidants na tumutulong sa blood pressure control.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱10–20 / sanga", cooking_tip:"Ihalo sa sinigang, tinola, o lugaw — lutuin ng maikli",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"},{label:"DOH Nutritional Guidelines",url:"https://doh.gov.ph/node/7771",badge:"DOH"}]},

  { food_id:"ampalaya_001", name:"Ampalaya", aliases:["ampalaya","bitter gourd","bitter melon","amplaya"], emoji:"🥒", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",reason:"Kilala ang ampalaya sa kakayahang natural na magpababa ng blood sugar.", badge:"DOH"},
      anemia:      {verdict:"kainin",reason:"May iron at Vitamin C na tumutulong sa paggawa ng hemoglobin.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",reason:"May anti-inflammatory properties. Tumutulong na bawasan ang pamamaga.", badge:"PRA"},
      hypertension:{verdict:"kainin",reason:"Mababa sa sodium at may potassium na tumutulong sa blood pressure.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱40–80 / kilo", cooking_tip:"Igisa o ihalo sa itlog — asin muna at pisilin para mabawasan ang pait",
    sources:[{label:"DOH Medicinal Plant Program",url:"https://doh.gov.ph/traditional-alternative-medicine",badge:"DOH"}]},

  { food_id:"kamote_001", name:"Kamote", aliases:["kamote","sweet potato","camote","camote tops"], emoji:"🍠", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",   reason:"Mas mababa sa glycemic index kaysa puting kanin. Mataas sa fiber.", badge:"FNRI"},
      anemia:      {verdict:"kainin",   reason:"May iron at Vitamin C na tumutulong sa paggawa ng hemoglobin.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",   reason:"Mataas sa beta-carotene at antioxidants na nagbabawas ng inflammation.", badge:"PRA"},
      hypertension:{verdict:"kainin",   reason:"Napakataas sa potassium at mababa sa sodium.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱30–50 / kilo", cooking_tip:"Nilaga o inihaw — mas mababa sa glycemic index",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"pechay_001", name:"Pechay", aliases:["pechay","bok choy","petsay"], emoji:"🥬", category:"Gulay",
    conditions:{
      diabetes:    {verdict:"kainin",reason:"Halos walang carbohydrates at mataas sa fiber.", badge:"FNRI"},
      anemia:      {verdict:"kainin",reason:"Mataas sa iron at folate na kailangan sa paggawa ng bagong pulang selula ng dugo.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",reason:"May Vitamin K at antioxidants na tumutulong sa kalusugan ng kasukasuan.", badge:"PRA"},
      hypertension:{verdict:"kainin",reason:"Mababa sa sodium at mataas sa potassium.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱20–40 / kilo", cooking_tip:"Nilaga o igisa sa bawang — lutuin ng maikli",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"tokwa_001", name:"Tokwa", aliases:["tokwa","tofu","bean curd"], emoji:"🧊", category:"Protina",
    conditions:{
      diabetes:    {verdict:"kainin",reason:"Mataas sa protina at walang carbohydrates. Hindi nagpapataas ng blood sugar.", badge:"FNRI"},
      anemia:      {verdict:"kainin",reason:"Mataas sa plant-based iron — mainam para sa mga hindi kumakain ng karne.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",reason:"Mababa sa purines. Ligtas at mainam na protina para sa arthritis.", badge:"PRA"},
      hypertension:{verdict:"kainin",reason:"Mababa sa sodium kung hindi pa niluto.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱15–25 / piraso", cooking_tip:"Igisa o iprito nang kaunti — huwag labisan ng toyo",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"itlog_001", name:"Itlog", aliases:["itlog","egg","eggs","boiled egg","scrambled egg","pritong itlog"], emoji:"🥚", category:"Protina",
    conditions:{
      diabetes:    {verdict:"kainin",   reason:"Hindi nagpapataas ng blood sugar. Mataas sa protina na nagpapabusog ng mas matagal.", badge:"FNRI"},
      anemia:      {verdict:"kainin",   reason:"May iron at B12 na kailangan sa paggawa ng hemoglobin.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",   reason:"Mababa sa purines. Ligtas na protina para sa arthritis.", badge:"PRA"},
      hypertension:{verdict:"limitahan",reason:"May cholesterol ang pula ng itlog. 1 itlog lang bawat araw.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱7–10 / piraso", cooking_tip:"Pinakuluan o scrambled na walang mantika",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"},{label:"Philippine Heart Association",url:"https://www.pha.org.ph",badge:"PHA"}]},

  { food_id:"monggo_001", name:"Monggo", aliases:["monggo","mung beans","munggo","ginisang monggo"], emoji:"🫘", category:"Protina",
    conditions:{
      diabetes:    {verdict:"kainin",reason:"Mababa sa glycemic index at mataas sa fiber at protina.", badge:"FNRI"},
      anemia:      {verdict:"kainin",reason:"Isa sa pinakamataas sa iron sa mga gulay.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",reason:"Mababa sa purines at may anti-inflammatory properties.", badge:"PRA"},
      hypertension:{verdict:"kainin",reason:"Mataas sa potassium at mababa sa sodium.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱80–120 / kilo", cooking_tip:"Ginisang monggo na may dahon ng ampalaya o malunggay",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"puting_kanin_001", name:"Puting Kanin", aliases:["kanin","rice","puting kanin","white rice","bigas","sinangag"], emoji:"🍚", category:"Kanin",
    conditions:{
      diabetes:    {verdict:"limitahan",reason:"Mataas sa glycemic index ang puting kanin. Pwede pero 3/4 tasa lang bawat kain.", badge:"FNRI"},
      anemia:      {verdict:"kainin",   reason:"Walang direktang epekto sa anemia. Okay lang kumain.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",   reason:"Walang purines. Hindi nagpapalala ng arthritis.", badge:"PRA"},
      hypertension:{verdict:"kainin",   reason:"Walang sodium. Okay lang basta hindi labis ang dami.", badge:"PHA"},
    }, safe_alternative:"Brown rice o kamote — mas mababa sa glycemic index para sa diabetes", price_estimate:"₱45–55 / kilo", cooking_tip:"Para sa diabetes: 3/4 tasa lang bawat kain kasama ng protina o gulay",
    sources:[{label:"FNRI Dietary Reference Intakes",url:"https://fnri.dost.gov.ph",badge:"FNRI"},{label:"DOH Diabetes Guidelines",url:"https://doh.gov.ph/node/7771",badge:"DOH"}]},

  { food_id:"softdrinks_001", name:"Softdrinks", aliases:["softdrinks","soda","cola","coke","pepsi","sprite","royal","rc cola"], emoji:"🥤", category:"Inumin",
    conditions:{
      diabetes:    {verdict:"iwasan",reason:"Isang baso ay may katumbas na 10 kutsara ng asukal — pinaka-mapanganib na inumin para sa diabetes.", badge:"DOH"},
      anemia:      {verdict:"iwasan",reason:"Walang nutritional value. Ang phosphoric acid nito ay pumipigil pa sa iron absorption.", badge:"FNRI"},
      arthritis:   {verdict:"iwasan",reason:"Ang fructose sa softdrinks ay nagpapataas ng uric acid — nagpapalala ng arthritis.", badge:"PRA"},
      hypertension:{verdict:"iwasan",reason:"Direktang nagpapataas ng blood pressure.", badge:"PHA"},
    }, safe_alternative:"Tubig na may piga ng kalamansi — libre, masustansya, at mas masarap pa", price_estimate:"₱15–25 / bote", cooking_tip:null,
    sources:[{label:"DOH Healthy Diet Campaign",url:"https://doh.gov.ph/node/7771",badge:"DOH"}]},

  { food_id:"kape_001", name:"Kape", aliases:["kape","coffee","3-in-1","kapeng barako","nescafe","kopiko"], emoji:"☕", category:"Inumin",
    conditions:{
      diabetes:    {verdict:"limitahan",reason:"Ang black coffee ay okay pero ang 3-in-1 na may asukal at creamer ay mapanganib sa diabetes.", badge:"DOH"},
      anemia:      {verdict:"limitahan",reason:"Ang tannins ng kape ay pumipigil sa iron absorption. Huwag uminom 1 oras bago o pagkatapos kumain.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",   reason:"May antioxidants ang kape na maaaring makatulong sa inflammation.", badge:"PRA"},
      hypertension:{verdict:"limitahan",reason:"Ang caffeine ay pansamantalang nagpapataas ng blood pressure. 1 tasa lang bawat araw.", badge:"PHA"},
    }, safe_alternative:"Salabat (luya tea) — mas mainam para sa lahat ng kalagayan", price_estimate:"₱5–10 / sachet", cooking_tip:"Mag-black coffee lang — iwasan ang 3-in-1",
    sources:[{label:"DOH Dietary Guidelines",url:"https://doh.gov.ph/node/7771",badge:"DOH"}]},

  { food_id:"instant_noodles_001", name:"Instant Noodles", aliases:["lucky me","payless","instant noodles","noodles","pancit canton","mami"], emoji:"🍜", category:"Processed",
    conditions:{
      diabetes:    {verdict:"iwasan",   reason:"Napakataas sa refined carbohydrates na mabilis na nagpapataas ng blood sugar.", badge:"DOH"},
      anemia:      {verdict:"limitahan",reason:"Walang iron. Ang sodium nito ay nakakasagabal pa sa iron absorption.", badge:"FNRI"},
      arthritis:   {verdict:"iwasan",   reason:"Mataas sa sodium at preservatives na nagpapalala ng inflammation.", badge:"PRA"},
      hypertension:{verdict:"iwasan",   reason:"Isang pack ay may halos 2000mg na sodium — halos isang araw na limitasyon.", badge:"PHA"},
    }, safe_alternative:"Lugaw na may itlog at malunggay — mas mura, mas masustansya, mas ligtas", price_estimate:"₱8–15 / pack", cooking_tip:"Kung kakain: huwag gamitin ang buong seasoning packet",
    sources:[{label:"DOH Healthy Diet Campaign",url:"https://doh.gov.ph/node/7771",badge:"DOH"}]},

  { food_id:"dayap_001", name:"Kalamansi / Dayap", aliases:["kalamansi","dayap","calamansi","lime","lemon"], emoji:"🍋", category:"Prutas",
    conditions:{
      diabetes:    {verdict:"kainin",reason:"Napakababa ng sugar content. Ang Vitamin C nito ay nagpapabuti pa ng insulin sensitivity.", badge:"FNRI"},
      anemia:      {verdict:"kainin",reason:"Ang Vitamin C ng dayap ay nagpapalakas ng pagsipsip ng iron ng hanggang 3x.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",reason:"Mataas sa Vitamin C na antioxidant na nagbabawas ng inflammation.", badge:"PRA"},
      hypertension:{verdict:"kainin",reason:"Tumutulong sa blood vessel health at walang sodium.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱10–20 / daan", cooking_tip:"Pigain sa isda, gulay, o inumin na may tubig",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},

  { food_id:"saging_001", name:"Saging na Saba", aliases:["saging","banana","saba","lakatan","saging na saba"], emoji:"🍌", category:"Prutas",
    conditions:{
      diabetes:    {verdict:"limitahan",reason:"Mas mababa sa sugar kaysa lakatan pero may carbohydrates pa rin. 1 piraso lang bawat araw.", badge:"FNRI"},
      anemia:      {verdict:"kainin",   reason:"May iron at B6 na tumutulong sa paggawa ng hemoglobin.", badge:"FNRI"},
      arthritis:   {verdict:"kainin",   reason:"Mataas sa potassium at Vitamin B6 na anti-inflammatory.", badge:"PRA"},
      hypertension:{verdict:"kainin",   reason:"Napakataas sa potassium na tumutulong na i-balance ang sodium sa katawan.", badge:"PHA"},
    }, safe_alternative:null, price_estimate:"₱5–10 / piraso", cooking_tip:"Nilaga o inihaw — mas mababa sa glycemic index kaysa hilaw",
    sources:[{label:"FNRI Food Composition Tables",url:"https://fnri.dost.gov.ph/index.php/databases/food-composition-table",badge:"FNRI"}]},
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function findFoodInDB(query) {
  const q = query.toLowerCase().trim();
  return FOOD_DATABASE.find(f =>
    f.aliases.some(a => q.includes(a) || a.includes(q)) ||
    f.name.toLowerCase().includes(q) || q.includes(f.name.toLowerCase())
  ) || null;
}

function getCombinedVerdict(food, conditions) {
  const verdicts = conditions.filter(c => food.conditions[c]).map(c => food.conditions[c].verdict);
  if (verdicts.includes("iwasan")) return "iwasan";
  if (verdicts.includes("limitahan")) return "limitahan";
  if (verdicts.length > 0 && verdicts.every(v => v === "kainin")) return "kainin";
  return "depende";
}

function getFoodsByVerdict(verdict, conditions) {
  return FOOD_DATABASE.filter(f => getCombinedVerdict(f, conditions) === verdict);
}

const QUICK_SUGGESTIONS = {
  diabetes:     ["Kanin","Kamote","Ampalaya","Softdrinks","Kape","Itlog","Lechon"],
  anemia:       ["Kangkong","Atay","Itlog","Sardinas","Kape","Tokwa","Malunggay"],
  arthritis:    ["Lechon","Sardinas","Manok","Softdrinks","Atay","Kangkong","Baboy"],
  hypertension: ["Baboy","Instant Noodles","Itlog","Kanin","Softdrinks","Tokwa","Adobo"],
};

// ============================================
// CLAUDE API
// ============================================
const SYSTEM_PROMPT = `Ikaw si NutriNena — isang mapagkakatiwalaang nutritionist ng DOH Pilipinas. Sumasagot ka sa simpleng Filipino.

KALAGAYAN:
- DIABETES: Iwasan refined carbs, asukal. Kainin: gulay, isda, manok, mababang glycemic index.
- ANEMIA: Kainin: iron-rich (atay, kangkong, tokwa) + Vitamin C (dayap). Limitahan: kape pagkatapos kumain.
- ARTHRITIS: Iwasan: purines (atay, sardinas, hipon), inflammatory foods. Kainin: omega-3, luya, bawang, gulay.
- HYPERTENSION: Iwasan: sodium (toyo, patis, instant noodles). Kainin: potassium (saging, kamote, gulay).

JSON FORMAT LANG — walang iba:
{
  "food_name": "pangalan sa Filipino",
  "overall_verdict": "kainin"|"limitahan"|"iwasan"|"depende",
  "overall_reason": "isang pangungusap sa Filipino",
  "per_condition": [{"condition":"...","verdict":"...","reason":"2-3 pangungusap","portion_tip":"...o null"}],
  "safe_alternative": "konkretong kapalit na available sa palengke, o null",
  "confidence": "mataas"|"katamtaman"|"mababa",
  "disclaimer_needed": true|false
}

PANUNTUNAN: Iwasan sa kahit isa = overall iwasan. Hindi sigurado = confidence mababa + disclaimer true. Simpleng Filipino palagi. Konkretong dami kung limitahan. Kapalit na mabibili sa probinsya lang.`;

async function callClaude(foodName, conditions) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM_PROMPT,
      messages:[{role:"user", content:`Pagkain: ${foodName}\nKalagayan: ${conditions.join(", ")}\n\nJSON format lang ang sagot.`}]
    })
  });
  const data = await res.json();
  const raw = data.content.map(b => b.type==="text"?b.text:"").join("");
  const parsed = JSON.parse(raw.replace(/```json/g,"").replace(/```/g,"").trim());
  if (parsed.per_condition?.some(c => c.verdict==="iwasan")) parsed.overall_verdict = "iwasan";
  return parsed;
}

// ============================================
// SCREEN 1 — WELCOME
// ============================================
function ScreenWelcome({ onStart, onBHW }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const features = [
    { icon:"🩺", text:"Para sa diabetes, anemia, at arthritis" },
    { icon:"🇵🇭", text:"Mga pagkaing makukuha sa palengke" },
    { icon:"📚", text:"Batay sa datos ng FNRI at DOH" },
    { icon:"💬", text:"Sa Filipino — libre at offline-friendly" },
  ];

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(160deg, #0A1F13 0%, #0D2B1A 40%, #1A4731 100%)",
      display:"flex", flexDirection:"column", position:"relative", overflow:"hidden",
      fontFamily:"'DM Sans', sans-serif",
    }}>
      {/* Decorative orbs */}
      {[
        {top:"-60px",right:"-40px",size:200,opacity:0.06},
        {top:"30%",left:"-60px",size:180,opacity:0.04},
        {bottom:"20%",right:"-20px",size:140,opacity:0.05},
      ].map((orb,i) => (
        <div key={i} style={{
          position:"absolute", width:orb.size, height:orb.size, borderRadius:"50%",
          background:`radial-gradient(circle, rgba(45,158,107,${orb.opacity*3}) 0%, transparent 70%)`,
          top:orb.top, left:orb.left, right:orb.right, bottom:orb.bottom,
          animation:`float ${4+i}s ease-in-out infinite ${i*0.8}s`,
        }}/>
      ))}

      {/* Grain texture */}
      <div style={{
        position:"absolute", inset:0, opacity:0.03, pointerEvents:"none",
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      }}/>

      <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"40px 28px 20px", position:"relative", zIndex:1}}>
        {/* App badge */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(45,158,107,0.15)", border:"1px solid rgba(45,158,107,0.3)",
          borderRadius:30, padding:"6px 14px", marginBottom:28, alignSelf:"flex-start",
        }}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#2D9E6B",display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:11,fontWeight:700,color:"#6FCF97",letterSpacing:1,textTransform:"uppercase"}}>
            Libreng Gabay sa Pagkain
          </span>
        </div>

        {/* Headline */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.6s 0.1s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{fontSize:52, marginBottom:4, animation:"float 4s ease-in-out infinite"}}>🥗</div>
          <h1 style={{
            fontSize:38, fontWeight:900, lineHeight:1.1, marginBottom:8,
            fontFamily:"'Playfair Display', Georgia, serif",
            background:"linear-gradient(135deg, #FFFFFF 0%, #A8DFBF 60%, #6FCF97 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text",
          }}>
            Kain<span style={{fontStyle:"italic"}}>Klinikal</span>
          </h1>
          <p style={{fontSize:16, color:"rgba(255,255,255,0.65)", lineHeight:1.6, marginBottom:32, maxWidth:320}}>
            Ang tamang pagkain para sa iyong katawan — sa Filipino, para sa mga Pilipino.
          </p>
        </div>

        {/* Feature list */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.6s 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          marginBottom:36,
        }}>
          {features.map((f,i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12, marginBottom:12,
              animation:`fadeUp 0.5s ${0.3+i*0.08}s both`,
            }}>
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:"rgba(45,158,107,0.15)", border:"1px solid rgba(45,158,107,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
              }}>{f.icon}</div>
              <span style={{fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.4}}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          display:"flex", flexDirection:"column", gap:10,
        }}>
          <button onClick={onStart} style={{
            width:"100%", padding:"18px", borderRadius:16, border:"none",
            background:"linear-gradient(135deg, #1A6644 0%, #2D9E6B 50%, #3DBEA0 100%)",
            backgroundSize:"200% 200%", animation:"gradShift 4s ease infinite",
            color:"#fff", fontSize:17, fontWeight:800, cursor:"pointer",
            letterSpacing:0.3, boxShadow:"0 8px 32px rgba(45,158,107,0.4)",
            transition:"transform 0.15s, box-shadow 0.15s",
            fontFamily:"'DM Sans', sans-serif",
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(45,158,107,0.55)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 32px rgba(45,158,107,0.4)";}}>
            Magsimula Na →
          </button>

          <button onClick={onBHW} style={{
            width:"100%", padding:"14px", borderRadius:16,
            border:"1.5px solid rgba(45,158,107,0.4)",
            background:"rgba(45,158,107,0.08)", backdropFilter:"blur(10px)",
            color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, cursor:"pointer",
            transition:"all 0.15s", fontFamily:"'DM Sans', sans-serif",
          }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(45,158,107,0.18)";e.currentTarget.style.borderColor="rgba(45,158,107,0.6)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(45,158,107,0.08)";e.currentTarget.style.borderColor="rgba(45,158,107,0.4)";}}>
            👩‍⚕️ Para sa Barangay Health Worker
          </button>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div style={{
        padding:"16px 28px 32px", textAlign:"center", position:"relative", zIndex:1,
        opacity: visible ? 1 : 0, transition:"opacity 0.6s 0.6s",
      }}>
        <p style={{fontSize:10, color:"rgba(255,255,255,0.3)", lineHeight:1.6}}>
          Para sa kaalaman lamang. Hindi kapalit ng medikal na payo. Kumonsulta sa iyong doktor.
        </p>
      </div>
    </div>
  );
}

// ============================================
// SCREEN 2 — CONDITION INTAKE
// ============================================
function ScreenConditions({ onNext, onBack }) {
  const [selected, setSelected] = useState([]);
  const [budget, setBudget] = useState(200);
  const [warning, setWarning] = useState(false);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
    setWarning(false);
  };

  const handleNext = () => {
    if (selected.length === 0) { setWarning(true); return; }
    onNext(selected, budget);
  };

  const budgets = [
    {val:100,label:"₱100",sublabel:"Tipid"},
    {val:200,label:"₱200",sublabel:"Katamtaman"},
    {val:300,label:"₱300",sublabel:"Komportable"},
  ];

  return (
    <div style={{
      minHeight:"100vh", background:"#F7FDF9",
      display:"flex", flexDirection:"column",
      fontFamily:"'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg, #0D3B26, #1A6644, #2D9E6B)",
        padding:"20px 20px 36px", position:"relative", overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
        <div style={{position:"absolute",bottom:-20,left:20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
        <button onClick={onBack} style={{
          background:"rgba(255,255,255,0.15)", border:"none", borderRadius:10,
          padding:"6px 12px", color:"#fff", fontSize:13, fontWeight:600,
          cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:20,
        }}>← Bumalik</button>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>
          Hakbang 1 ng 2
        </div>
        <h2 style={{fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.2,marginBottom:8}}>
          Ano ang iyong kalagayan?
        </h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",margin:0}}>
          Maaaring pumili ng higit sa isa
        </p>

        {/* Selection counter */}
        {selected.length > 0 && (
          <div style={{
            marginTop:12, display:"inline-flex", alignItems:"center", gap:6,
            background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)",
            borderRadius:20, padding:"4px 12px", animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <span style={{fontSize:12,fontWeight:800,color:"#fff"}}>{selected.length} napili ✓</span>
          </div>
        )}
      </div>

      {/* Multi-condition warning banner */}
      {selected.length > 1 && (
        <div style={{
          margin:"16px 20px 0",
          background:"#FEF8EC", border:"1.5px solid #F6C86A", borderRadius:12,
          padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start",
          animation:"fadeIn 0.3s ease",
        }}>
          <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
          <p style={{margin:0,fontSize:12,color:"#7D6608",lineHeight:1.5}}>
            Ang ilang pagkain ay maaaring magkasalungat sa iyong mga kalagayan. Ipapakita namin kung alin ang ligtas para sa lahat.
          </p>
        </div>
      )}

      <div style={{flex:1, overflowY:"auto", padding:"20px 20px 0"}}>
        {/* Condition cards */}
        <div style={{marginBottom:28}}>
          {CONDITIONS.map((c, i) => {
            const isSelected = selected.includes(c.id);
            return (
              <button key={c.id} onClick={() => toggle(c.id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:14,
                padding:"16px 18px", marginBottom:10, borderRadius:16, border:"none",
                background: isSelected ? `linear-gradient(135deg, ${c.bg}, #fff)` : "#fff",
                outline: isSelected ? `2px solid ${c.color}` : "2px solid #E8F0EC",
                cursor:"pointer", textAlign:"left",
                transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                transform: isSelected ? "scale(1.01)" : "scale(1)",
                boxShadow: isSelected ? `0 4px 20px ${c.color}22` : "0 2px 8px rgba(0,0,0,0.04)",
                animation:`fadeUp 0.4s ${i*0.07}s both`,
              }}>
                <div style={{
                  width:52, height:52, borderRadius:14, flexShrink:0,
                  background: isSelected ? c.bg : "#F8FAF9",
                  border:`2px solid ${isSelected ? c.color : "#E8F0EC"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:24, transition:"all 0.2s",
                }}>{c.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16, fontWeight:700, color: isSelected ? c.color : "#2C3E50", fontFamily:"'Playfair Display',Georgia,serif"}}>
                    {c.label}
                  </div>
                  <div style={{fontSize:12, color:"#7F8C8D", marginTop:2}}>{c.sublabel}</div>
                </div>
                <div style={{
                  width:26, height:26, borderRadius:"50%", flexShrink:0,
                  background: isSelected ? c.color : "#F0F0F0",
                  border:`2px solid ${isSelected ? c.color : "#E0E0E0"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, color:"#fff",
                  transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                  animation: isSelected ? "checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none",
                }}>
                  {isSelected && "✓"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Budget selector */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:700,color:"#566573",letterSpacing:0.5,textTransform:"uppercase",marginBottom:12}}>
            💰 Budget sa pagkain bawat araw:
          </div>
          <div style={{display:"flex", gap:8}}>
            {budgets.map(b => (
              <button key={b.val} onClick={()=>setBudget(b.val)} style={{
                flex:1, padding:"12px 8px", borderRadius:12, border:"none",
                background: budget===b.val ? "linear-gradient(135deg,#1A6644,#2D9E6B)" : "#fff",
                outline: budget===b.val ? "none" : "2px solid #E8F0EC",
                color: budget===b.val ? "#fff" : "#566573",
                cursor:"pointer", textAlign:"center",
                transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif",
                boxShadow: budget===b.val ? "0 4px 16px rgba(45,158,107,0.3)" : "none",
              }}>
                <div style={{fontSize:15,fontWeight:800}}>{b.label}</div>
                <div style={{fontSize:10,opacity:0.8,marginTop:2}}>{b.sublabel}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{padding:"16px 20px 32px", background:"rgba(247,253,249,0.95)", backdropFilter:"blur(10px)", borderTop:"1px solid #E8F0EC"}}>
        {warning && (
          <div style={{
            background:"#FDECEA", border:"1.5px solid #F1948A", borderRadius:10,
            padding:"10px 14px", marginBottom:10, fontSize:12, color:"#A93226",
            display:"flex", gap:6, alignItems:"center", animation:"fadeIn 0.2s ease",
          }}>
            <span>⚠️</span> Piliin muna ang iyong kalagayan bago magpatuloy.
          </div>
        )}
        <button onClick={handleNext} style={{
          width:"100%", padding:"16px", borderRadius:14, border:"none",
          background: selected.length > 0 ? "linear-gradient(135deg,#1A6644,#2D9E6B)" : "#D5D8DC",
          color:"#fff", fontSize:16, fontWeight:800, cursor: selected.length > 0 ? "pointer" : "not-allowed",
          boxShadow: selected.length > 0 ? "0 6px 24px rgba(45,158,107,0.35)" : "none",
          transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif",
        }}>
          Ipakita ang Pagkain Ko →
        </button>
      </div>
    </div>
  );
}

// ============================================
// SCREEN 3 — FOOD GUIDE
// ============================================
function ScreenFoodGuide({ selectedConditions, budget, onPwedeBaTo, onBack }) {
  const [activeTab, setActiveTab] = useState("kainin");
  const [selectedFood, setSelectedFood] = useState(null);
  const [search, setSearch] = useState("");

  const tabs = [
    {id:"kainin",   label:"Kainin",   icon:"✅", activeColor:"#2D9E6B"},
    {id:"limitahan",label:"Limitahan",icon:"⚠️", activeColor:"#E67E22"},
    {id:"iwasan",   label:"Iwasan",   icon:"❌", activeColor:"#C0392B"},
  ];

  const ligstasFoods = getFoodsByVerdict("kainin", selectedConditions);
  const tabFoods = getFoodsByVerdict(activeTab, selectedConditions);
  const filteredFoods = search.trim()
    ? tabFoods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : tabFoods;

  const condMeta = selectedConditions.map(c => CONDITIONS.find(x=>x.id===c)).filter(Boolean);

  return (
    <>
      <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F7FDF9",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#1A4731,#2D9E6B)",padding:"20px 20px 24px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
            ← Bumalik
          </button>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>
            Ang iyong gabay sa pagkain
          </div>
          <h2 style={{fontSize:24,fontWeight:900,color:"#fff",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.2,marginBottom:12}}>
            Ano ang mainam para sa iyo?
          </h2>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {condMeta.map(c=>(
              <span key={c.id} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:"#fff",display:"flex",alignItems:"center",gap:4}}>
                {c.emoji} {c.label}
              </span>
            ))}
            <span style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>
              💰 ₱{budget}/araw
            </span>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",paddingBottom:100}}>
          {/* Ligtas sa lahat */}
          {selectedConditions.length > 1 && ligstasFoods.length > 0 && (
            <div style={{padding:"16px 20px 0",animation:"fadeUp 0.4s ease"}}>
              <div style={{background:"linear-gradient(135deg,#F0FBF6,#E8F8F0)",border:"1.5px solid #A8DFBF",borderRadius:16,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:18}}>⭐</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:"#1A4731"}}>LIGTAS SA LAHAT NG KALAGAYAN MO</div>
                    <div style={{fontSize:11,color:"#2D9E6B",fontWeight:500}}>Pwedeng kainin nang walang alalahanin</div>
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ligstasFoods.slice(0,8).map(f=>(
                    <button key={f.food_id} onClick={()=>setSelectedFood(f)} style={{
                      background:"#fff",border:"1.5px solid #A8DFBF",borderRadius:10,
                      padding:"6px 12px",fontSize:12,fontWeight:600,color:"#1A4731",
                      cursor:"pointer",display:"flex",alignItems:"center",gap:4,
                      transition:"transform 0.15s",fontFamily:"'DM Sans',sans-serif",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                      {f.emoji} {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{padding:"16px 20px 0"}}>
            {/* Tabs */}
            <div style={{display:"flex",background:"#fff",borderRadius:14,padding:4,border:"1.5px solid #E8F0EC",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              {tabs.map(tab=>{
                const count = getFoodsByVerdict(tab.id, selectedConditions).length;
                const isActive = activeTab===tab.id;
                const activeBg = tab.id==="kainin"?"#2D9E6B":tab.id==="limitahan"?"#E67E22":"#C0392B";
                return (
                  <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setSearch("");}} style={{
                    flex:1,padding:"10px 4px",borderRadius:10,border:"none",
                    background:isActive?activeBg:"transparent",
                    color:isActive?"#fff":"#7F8C8D",
                    fontSize:12,fontWeight:700,cursor:"pointer",
                    transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                    fontFamily:"'DM Sans',sans-serif",
                  }}>
                    <span style={{fontSize:14}}>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span style={{fontSize:10,background:isActive?"rgba(255,255,255,0.25)":"#F0F0F0",borderRadius:10,padding:"1px 6px",color:isActive?"#fff":"#95A5A6"}}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{position:"relative",marginBottom:12}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#95A5A6"}}>🔍</span>
              <input type="text" placeholder="Hanapin ang pagkain..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{width:"100%",padding:"11px 16px 11px 36px",borderRadius:12,border:"1.5px solid #E8F0EC",background:"#fff",fontSize:13,color:"#2C3E50",outline:"none"}}/>
            </div>

            {/* Food list */}
            {filteredFoods.length === 0 ? (
              <div style={{textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:14,border:"1.5px dashed #D5D8DC"}}>
                <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                <div style={{fontSize:14,color:"#7F8C8D",fontWeight:500}}>Walang nahanap</div>
              </div>
            ) : filteredFoods.map(food=>{
              const combined = getCombinedVerdict(food, selectedConditions);
              const cfg = VERDICT_CFG[combined];
              const relConds = selectedConditions.filter(c=>food.conditions[c]);
              return (
                <button key={food.food_id} onClick={()=>setSelectedFood(food)} style={{
                  width:"100%",background:"#fff",border:`1.5px solid ${cfg.border}`,borderRadius:14,
                  padding:"14px 16px",marginBottom:8,cursor:"pointer",textAlign:"left",
                  transition:"transform 0.15s,box-shadow 0.15s",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                  fontFamily:"'DM Sans',sans-serif",
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)";}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                    <span style={{fontSize:30,flexShrink:0}}>{food.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                        <span style={{fontSize:15,fontWeight:700,color:"#1A2E1A",fontFamily:"'Playfair Display',Georgia,serif"}}>{food.name}</span>
                        <span style={{fontSize:11,fontWeight:800,color:cfg.color,background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:20,padding:"3px 10px",flexShrink:0}}>{cfg.icon} {cfg.label}</span>
                      </div>
                      <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>
                        {relConds.map(c=>{
                          const condCfg = VERDICT_CFG[food.conditions[c].verdict];
                          const condMeta = CONDITIONS.find(x=>x.id===c);
                          return (
                            <span key={c} style={{fontSize:11,fontWeight:600,color:condCfg.color,background:condCfg.bg,border:`1px solid ${condCfg.border}`,borderRadius:20,padding:"2px 8px"}}>
                              {condMeta?.emoji} {condMeta?.label} {condCfg.icon}
                            </span>
                          );
                        })}
                      </div>
                      <div style={{marginTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#95A5A6"}}>{food.price_estimate}</span>
                        <span style={{fontSize:11,color:cfg.color,fontWeight:600}}>Tingnan ang detalye →</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky bottom */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(247,253,249,0.95)",backdropFilter:"blur(10px)",borderTop:"1px solid #E8F0EC",padding:"12px 20px 20px",display:"flex",flexDirection:"column",gap:8}}>
          <button onClick={onPwedeBaTo} style={{
            width:"100%",padding:"15px",borderRadius:14,border:"none",
            background:"linear-gradient(135deg,#1A4731,#2D9E6B)",color:"#fff",
            fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:"0 4px 20px rgba(45,158,107,0.35)",transition:"transform 0.15s",fontFamily:"'DM Sans',sans-serif",
          }}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            🤔 Pwede Ba To? — Magtanong ng Pagkain
          </button>
        </div>
      </div>

      {/* Food detail bottom sheet */}
      {selectedFood && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={()=>setSelectedFood(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",background:"#FAFDF9",borderRadius:"24px 24px 0 0",maxHeight:"85vh",overflowY:"auto",padding:"0 0 32px",animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 -8px 40px rgba(0,0,0,0.15)"}}>
            <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
              <div style={{width:40,height:4,borderRadius:2,background:"#D5D8DC"}}/>
            </div>
            <div style={{padding:"16px 24px 0"}}>
              {(()=>{
                const food = selectedFood;
                const combined = getCombinedVerdict(food, selectedConditions);
                const cfg = VERDICT_CFG[combined];
                const relConds = selectedConditions.filter(c=>food.conditions[c]);
                return (
                  <>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:42}}>{food.emoji}</span>
                        <div>
                          <div style={{fontSize:20,fontWeight:800,color:"#1A2E1A",fontFamily:"'Playfair Display',Georgia,serif"}}>{food.name}</div>
                          <div style={{fontSize:12,color:"#7F8C8D",marginTop:2}}>{food.category}</div>
                        </div>
                      </div>
                      <button onClick={()=>setSelectedFood(null)} style={{width:32,height:32,borderRadius:"50%",background:"#EAEDED",border:"none",fontSize:16,cursor:"pointer",color:"#566573",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                    </div>

                    <div style={{background:cfg.bg,border:`1.5px solid ${cfg.border}`,borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22}}>{cfg.icon}</span>
                      <div>
                        <div style={{fontSize:15,fontWeight:800,color:cfg.color}}>{cfg.label}</div>
                        <div style={{fontSize:12,color:cfg.color,opacity:0.8}}>{cfg.tagline}</div>
                      </div>
                    </div>

                    <div style={{marginBottom:16}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#566573",letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Para sa Bawat Kalagayan</div>
                      {relConds.map(c=>{
                        const condData = food.conditions[c];
                        const condCfg = VERDICT_CFG[condData.verdict];
                        const condMeta = CONDITIONS.find(x=>x.id===c);
                        return (
                          <div key={c} style={{background:"#fff",border:`1.5px solid ${condCfg.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span>{condMeta?.emoji}</span>
                                <span style={{fontSize:13,fontWeight:700,color:"#2C3E50"}}>{condMeta?.label}</span>
                              </div>
                              <span style={{fontSize:11,fontWeight:800,color:condCfg.color,background:condCfg.bg,border:`1px solid ${condCfg.border}`,borderRadius:20,padding:"2px 10px"}}>{condCfg.icon} {condCfg.label}</span>
                            </div>
                            <p style={{margin:0,fontSize:13,color:"#4A5568",lineHeight:1.6}}>{condData.reason}</p>
                          </div>
                        );
                      })}
                    </div>

                    {food.safe_alternative && (
                      <div style={{background:"#F0FBF6",border:"1.5px solid #A8DFBF",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#2D9E6B",marginBottom:4}}>💡 KAPALIT NA PAGKAIN</div>
                        <p style={{margin:0,fontSize:13,color:"#2C7A4B",lineHeight:1.6}}>{food.safe_alternative}</p>
                      </div>
                    )}
                    {food.cooking_tip && (
                      <div style={{background:"#FFFBF0",border:"1.5px solid #F0D080",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#D4820A",marginBottom:4}}>👨‍🍳 PARAAN NG PAGLUTO</div>
                        <p style={{margin:0,fontSize:13,color:"#7D6608",lineHeight:1.6}}>{food.cooking_tip}</p>
                      </div>
                    )}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                      <span style={{fontSize:13}}>🏪</span>
                      <span style={{fontSize:13,color:"#566573"}}>Presyo: <strong style={{color:"#2C3E50"}}>{food.price_estimate}</strong></span>
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#566573",letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>📚 Pinagmulan</div>
                      {food.sources.map((s,i)=>{
                        const bc = BADGE_COLORS[s.badge]||{bg:"#F4F6F7",text:"#566573"};
                        return (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:bc.bg,border:`1px solid ${bc.text}22`,borderRadius:10,textDecoration:"none",marginBottom:6,transition:"transform 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
                            <span style={{fontSize:10,fontWeight:800,color:bc.text,background:`${bc.text}20`,padding:"2px 7px",borderRadius:4,letterSpacing:0.5,flexShrink:0}}>{s.badge}</span>
                            <span style={{fontSize:12,color:bc.text,fontWeight:500}}>{s.label}</span>
                            <span style={{marginLeft:"auto",fontSize:12,color:bc.text,opacity:0.6}}>→</span>
                          </a>
                        );
                      })}
                    </div>
                    <p style={{margin:"12px 0 0",fontSize:11,color:"#95A5A6",lineHeight:1.6,textAlign:"center"}}>Ang gabay na ito ay pangkaalaman lamang. Kumonsulta sa iyong doktor.</p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// SCREEN 4 — PWEDE BA TO?
// ============================================
function ScreenPwedeBaTo({ selectedConditions, onBack, onGoToFoodGuide }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [dots, setDots] = useState(".");
  const inputRef = useRef(null);
  const resultRef = useRef(null);
  const [expandedConds, setExpandedConds] = useState(true);

  useEffect(()=>{
    if(!loading) return;
    const iv = setInterval(()=>setDots(d=>d.length>=3?".":d+"."),400);
    return ()=>clearInterval(iv);
  },[loading]);

  useEffect(()=>{ if(result && resultRef.current) resultRef.current.scrollIntoView({behavior:"smooth",block:"start"}); },[result]);

  const getSuggestions = () => {
    const seen = new Set(); const out = [];
    selectedConditions.forEach(c=>(QUICK_SUGGESTIONS[c]||[]).forEach(s=>{if(!seen.has(s)){seen.add(s);out.push(s);}}));
    return out.slice(0,8);
  };

  const submit = async (q) => {
    const fq = (q||query).trim(); if(!fq) return;
    setQuery(fq); setLoading(true); setResult(null); setError(null);
    try {
      const dbFood = findFoodInDB(fq);
      let res;
      if(dbFood){
        const combined = getCombinedVerdict(dbFood, selectedConditions);
        res = {
          food_name:dbFood.name, overall_verdict:combined,
          overall_reason:dbFood.conditions[selectedConditions[0]]?.reason||"Tingnan ang detalye sa ibaba.",
          per_condition:selectedConditions.filter(c=>dbFood.conditions[c]).map(c=>({condition:c,verdict:dbFood.conditions[c].verdict,reason:dbFood.conditions[c].reason,portion_tip:null})),
          safe_alternative:dbFood.safe_alternative, confidence:"mataas", disclaimer_needed:false, from_database:true,
        };
      } else {
        res = await callClaude(fq, selectedConditions);
        res.from_database = false;
      }
      setResult(res);
      setHistory(prev=>[{query:fq,result:res},...prev.slice(0,4)]);
    } catch(e) {
      setError("Hindi ko masagot ang tanong na iyon ngayon. Subukan muli o kumonsulta sa iyong doktor.");
    } finally { setLoading(false); }
  };

  const clear = () => { setQuery(""); setResult(null); setError(null); inputRef.current?.focus(); };

  const condMeta = selectedConditions.map(c=>CONDITIONS.find(x=>x.id===c)).filter(Boolean);

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F7FDF9",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0D3B26,#1A6644,#2D9E6B)",padding:"20px 20px 32px",position:"relative",overflow:"hidden"}}>
        {[{top:"-30px",right:"-30px",s:120},{bottom:0,left:"-20px",s:90},{top:"20px",right:"60px",s:50}].map((o,i)=>(
          <div key={i} style={{position:"absolute",width:o.s,height:o.s,borderRadius:"50%",background:`rgba(255,255,255,0.05)`,top:o.top,left:o.left,right:o.right,bottom:o.bottom}}/>
        ))}
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
          ← Bumalik
        </button>
        <div style={{fontSize:34,marginBottom:4}}>🤔</div>
        <h2 style={{margin:"0 0 6px",fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.1}}>Pwede Ba To?</h2>
        <p style={{margin:"0 0 14px",fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.5}}>I-type ang kahit anong pagkain at sasabihin ko kung ligtas para sa iyo.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {condMeta.map(c=>(
            <span key={c.id} style={{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,color:"#fff",display:"flex",alignItems:"center",gap:4}}>
              {c.emoji} {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Floating input */}
      <div style={{padding:"0 20px",marginTop:-20,position:"relative",zIndex:10}}>
        <div style={{background:"#fff",borderRadius:18,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:"2px solid #E8F0EC",overflow:"hidden",transition:"border-color 0.2s,box-shadow 0.2s"}}
          onFocusCapture={e=>{e.currentTarget.style.borderColor="#2D9E6B";e.currentTarget.style.boxShadow="0 8px 32px rgba(45,158,107,0.18)";}}
          onBlurCapture={e=>{e.currentTarget.style.borderColor="#E8F0EC";e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.12)";}}>
          <div style={{display:"flex",alignItems:"center",padding:"4px 6px 4px 16px",gap:8}}>
            <span style={{fontSize:18,flexShrink:0}}>🍽️</span>
            <input ref={inputRef} type="text" placeholder="Halimbawa: lechon, kanin, kape, tuna..." value={query}
              onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
              style={{flex:1,border:"none",background:"transparent",fontSize:15,color:"#2C3E50",padding:"14px 0",fontFamily:"'DM Sans',sans-serif"}}/>
            {query && <button onClick={clear} style={{background:"#EEF0F0",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#7F8C8D"}}>✕</button>}
            <button onClick={()=>submit()} disabled={!query.trim()||loading} style={{
              background:query.trim()&&!loading?"linear-gradient(135deg,#1A6644,#2D9E6B)":"#D5D8DC",
              border:"none",borderRadius:12,padding:"10px 18px",color:"#fff",fontSize:13,fontWeight:700,
              cursor:query.trim()&&!loading?"pointer":"not-allowed",transition:"all 0.2s",flexShrink:0,fontFamily:"'DM Sans',sans-serif",
            }}>
              {loading?"...":"Tanungin →"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 40px"}}>

        {/* Empty state */}
        {!result && !loading && (
          <div style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#95A5A6",letterSpacing:0.5,textTransform:"uppercase",marginBottom:10}}>Mga madalas na tanungin:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
              {getSuggestions().map(s=>(
                <button key={s} onClick={()=>submit(s)} style={{
                  background:"#fff",border:"1.5px solid #D5ECE0",borderRadius:20,padding:"7px 14px",
                  fontSize:13,fontWeight:600,color:"#2C7A4B",cursor:"pointer",transition:"all 0.15s",
                  fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={e=>{e.currentTarget.style.background="#F0FBF6";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.transform="translateY(0)";}}>
                  {s}
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <>
                <div style={{fontSize:12,fontWeight:700,color:"#95A5A6",letterSpacing:0.5,textTransform:"uppercase",marginBottom:10}}>Mga nakaraang tanong:</div>
                {history.map((item,i)=>{
                  const cfg = VERDICT_CFG[item.result?.overall_verdict]||VERDICT_CFG.kainin;
                  return (
                    <button key={i} onClick={()=>{setQuery(item.query);submit(item.query);}} style={{
                      display:"flex",alignItems:"center",gap:10,width:"100%",background:"#fff",
                      border:`1.5px solid ${cfg.border}`,borderRadius:12,padding:"10px 14px",marginBottom:6,
                      cursor:"pointer",textAlign:"left",transition:"transform 0.15s",fontFamily:"'DM Sans',sans-serif",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
                      <span style={{fontSize:18,flexShrink:0}}>{cfg.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#2C3E50",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.query}</div>
                        <div style={{fontSize:11,color:cfg.color,fontWeight:600}}>{cfg.label}</div>
                      </div>
                      <span style={{fontSize:12,color:"#95A5A6"}}>↩</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",animation:"fadeIn 0.3s ease"}}>
            <div style={{width:56,height:56,borderRadius:"50%",border:"3px solid #E8F0EC",borderTop:"3px solid #2D9E6B",animation:"spin 0.8s linear infinite",marginBottom:20}}/>
            <div style={{fontSize:16,fontWeight:700,color:"#1A4731",fontFamily:"'Playfair Display',Georgia,serif",marginBottom:8}}>Hinahanap ang sagot{dots}</div>
            <div style={{fontSize:13,color:"#7F8C8D",textAlign:"center"}}>Sinusuri ang "{query}"</div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{background:"#FDECEA",border:"1.5px solid #F1948A",borderRadius:16,padding:"20px",animation:"fadeIn 0.3s ease",marginBottom:16}}>
            <div style={{fontSize:24,marginBottom:8}}>😔</div>
            <div style={{fontSize:14,fontWeight:700,color:"#A93226",marginBottom:6}}>Hindi ko nasagot ang tanong</div>
            <div style={{fontSize:13,color:"#922B21",lineHeight:1.6,marginBottom:12}}>{error}</div>
            <button onClick={()=>submit()} style={{background:"#A93226",border:"none",borderRadius:10,padding:"10px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Subukan Muli</button>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div ref={resultRef} style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <span style={{fontSize:10,fontWeight:800,color:result.from_database?"#1A5276":"#6C3483",background:result.from_database?"#EBF5FB":"#F5EEF8",border:`1px solid ${result.from_database?"#1A527622":"#6C348322"}`,borderRadius:6,padding:"3px 8px",letterSpacing:0.5}}>
                {result.from_database?"📚 FNRI DATABASE":"🤖 AI ANALYSIS"}
              </span>
              <span style={{fontSize:11,color:"#95A5A6"}}>{result.from_database?"Mula sa aming verified na database":"Sinuri ng AI"}</span>
            </div>

            {(()=>{
              const cfg = VERDICT_CFG[result.overall_verdict]||VERDICT_CFG.kainin;
              const relConds = result.per_condition?.filter(c=>selectedConditions.includes(c.condition))||[];
              return (
                <div style={{background:"#fff",borderRadius:20,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.10)",border:`2px solid ${cfg.border}`,marginBottom:14}}>
                  <div style={{background:`linear-gradient(135deg,${cfg.bg},#fff)`,padding:"18px 20px 14px",borderBottom:`1.5px solid ${cfg.border}`}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                      <div>
                        <div style={{fontSize:12,color:"#95A5A6",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>{result.food_name}</div>
                        <div style={{fontSize:26,fontWeight:900,color:cfg.color,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1}}>{cfg.label}</div>
                        <div style={{fontSize:13,color:cfg.color,opacity:0.8,marginTop:4,lineHeight:1.4}}>{result.overall_reason}</div>
                      </div>
                      <div style={{width:50,height:50,borderRadius:"50%",background:cfg.bg,border:`2px solid ${cfg.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{cfg.icon}</div>
                    </div>
                    <div style={{marginTop:10,display:"flex",flexWrap:"wrap"}}>
                      {relConds.map(c=>{
                        const condCfg = VERDICT_CFG[c.verdict]||VERDICT_CFG.kainin;
                        const condMeta = CONDITIONS.find(x=>x.id===c.condition);
                        return (
                          <span key={c.condition} style={{fontSize:11,fontWeight:700,color:condCfg.color,background:condCfg.bg,border:`1.5px solid ${condCfg.border}`,borderRadius:20,padding:"3px 10px",marginRight:4,marginBottom:4}}>
                            {condMeta?.emoji} {condMeta?.label} {condCfg.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {relConds.length > 0 && (
                    <div style={{padding:"0 20px"}}>
                      <button onClick={()=>setExpandedConds(!expandedConds)} style={{width:"100%",background:"none",border:"none",padding:"12px 0",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,fontWeight:700,color:"#7F8C8D",letterSpacing:0.5,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>
                        Para sa Bawat Kalagayan
                        <span style={{transition:"transform 0.2s",transform:expandedConds?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
                      </button>
                      {expandedConds && (
                        <div style={{paddingBottom:16}}>
                          {relConds.map(c=>{
                            const condCfg = VERDICT_CFG[c.verdict]||VERDICT_CFG.kainin;
                            const condMeta = CONDITIONS.find(x=>x.id===c.condition);
                            return (
                              <div key={c.condition} style={{background:condCfg.bg,border:`1.5px solid ${condCfg.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                                    <span>{condMeta?.emoji}</span>
                                    <span style={{fontSize:13,fontWeight:700,color:"#2C3E50"}}>{condMeta?.label}</span>
                                  </div>
                                  <span style={{fontSize:11,fontWeight:800,color:condCfg.color,background:"#fff",border:`1px solid ${condCfg.border}`,borderRadius:20,padding:"2px 10px"}}>{condCfg.icon} {condCfg.label}</span>
                                </div>
                                <p style={{margin:0,fontSize:13,color:"#4A5568",lineHeight:1.6}}>{c.reason}</p>
                                {c.portion_tip && <div style={{marginTop:8,padding:"6px 10px",background:"#fff",borderRadius:8,fontSize:12,color:condCfg.color,fontWeight:600,border:`1px dashed ${condCfg.border}`}}>📏 {c.portion_tip}</div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {result.safe_alternative && (
                    <div style={{margin:"0 20px 16px",background:"#F0FBF6",border:"1.5px solid #A8DFBF",borderRadius:12,padding:"12px 14px"}}>
                      <div style={{fontSize:11,fontWeight:800,color:"#1A7A4A",marginBottom:4,letterSpacing:0.5}}>💡 SUBUKAN MO ITO SA HALIP</div>
                      <p style={{margin:0,fontSize:13,color:"#1A4731",lineHeight:1.6}}>{result.safe_alternative}</p>
                    </div>
                  )}

                  {result.disclaimer_needed && (
                    <div style={{margin:"0 20px 16px",background:"#FEF9E7",border:"1.5px solid #F9E79F",borderRadius:12,padding:"10px 14px",fontSize:12,color:"#7D6608",lineHeight:1.5}}>
                      ⚠️ Kumonsulta pa rin sa iyong doktor o nutritionist para sa mas tiyak na gabay.
                    </div>
                  )}

                  <div style={{borderTop:"1px solid #F0F0F0",padding:"10px 20px",display:"flex",alignItems:"center",gap:6}}>
                    {["FNRI","DOH"].map(b=>{const bc=BADGE_COLORS[b];return <span key={b} style={{fontSize:10,fontWeight:800,color:bc.text,background:bc.bg,border:`1px solid ${bc.text}22`,borderRadius:4,padding:"2px 7px",letterSpacing:0.5}}>{b}</span>;})}
                    <span style={{fontSize:11,color:"#95A5A6",marginLeft:4}}>Batay sa datos ng FNRI at DOH Pilipinas</span>
                  </div>
                </div>
              );
            })()}

            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={clear} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#0D3B26,#2D9E6B)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(45,158,107,0.3)",fontFamily:"'DM Sans',sans-serif",transition:"transform 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                🔄 Magtanong ng Iba Pang Pagkain
              </button>
              <button onClick={onGoToFoodGuide} style={{width:"100%",padding:"12px",borderRadius:14,border:"1.5px solid #A8DFBF",background:"#fff",color:"#2D9E6B",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"'DM Sans',sans-serif",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F0FBF6"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                📋 Tingnan ang Buong Listahan ng Pagkain
              </button>
            </div>

            <p style={{margin:"16px 0 0",fontSize:11,color:"#95A5A6",lineHeight:1.6,textAlign:"center"}}>
              Ang gabay na ito ay pangkaalaman lamang at hindi kapalit ng medikal na payo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// BHW MODE
// ============================================
function ScreenBHW({ onBack }) {
  const [conditions, setConditions] = useState([]);
  const [generated, setGenerated] = useState(false);

  const toggle = (id) => setConditions(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  const ligtas = getFoodsByVerdict("kainin", conditions);
  const limitahan = getFoodsByVerdict("limitahan", conditions);
  const iwasan = getFoodsByVerdict("iwasan", conditions);

  if(generated && conditions.length > 0) return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#fff",minHeight:"100vh",padding:"24px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:"#1A4731",fontFamily:"'Playfair Display',Georgia,serif",margin:0}}>Gabay sa Pagkain</h2>
          <div style={{fontSize:11,color:"#7F8C8D",marginTop:4}}>Batay sa: FNRI at DOH Pilipinas</div>
        </div>
        <button onClick={()=>setGenerated(false)} style={{background:"#F0F0F0",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>← Bumalik</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
        {conditions.map(c=>{const m=CONDITIONS.find(x=>x.id===c);return <span key={c} style={{background:m.bg,border:`1px solid ${m.border}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,color:m.color}}>{m.emoji} {m.label}</span>;})}
      </div>
      {[{list:ligtas,label:"✅ KAININ",color:"#1A7A4A",bg:"#E8F8F0",border:"#6FCF97"},{list:limitahan,label:"⚠️ LIMITAHAN",color:"#B8620A",bg:"#FEF8EC",border:"#F6C86A"},{list:iwasan,label:"❌ IWASAN",color:"#A93226",bg:"#FDECEA",border:"#F1948A"}].map(({list,label,color,bg,border})=>(
        list.length > 0 && (
          <div key={label} style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color,background:bg,border:`1.5px solid ${border}`,borderRadius:8,padding:"6px 12px",marginBottom:8,display:"inline-block"}}>{label}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {list.map(f=><span key={f.food_id} style={{background:"#F8F9FA",border:"1px solid #E0E0E0",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:600,color:"#2C3E50"}}>{f.emoji} {f.name}</span>)}
            </div>
          </div>
        )
      ))}
      <p style={{fontSize:10,color:"#95A5A6",marginTop:20,lineHeight:1.6,borderTop:"1px solid #E0E0E0",paddingTop:12}}>Para sa kaalaman lamang. Kumonsulta sa iyong doktor o nutritionist.</p>
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#F7FDF9",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"linear-gradient(135deg,#1A4731,#2D9E6B)",padding:"20px 20px 28px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:16}}>← Bumalik</button>
        <div style={{fontSize:22,marginBottom:4}}>👩‍⚕️</div>
        <h2 style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"'Playfair Display',Georgia,serif",margin:"0 0 6px"}}>BHW Mode</h2>
        <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.75)"}}>Para sa Barangay Health Workers — gumawa ng printable na gabay</p>
      </div>
      <div style={{flex:1,padding:"20px",overflowY:"auto"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#566573",letterSpacing:0.5,textTransform:"uppercase",marginBottom:12}}>Piliin ang kalagayan ng pasyente:</div>
        {CONDITIONS.map(c=>{
          const isSel = conditions.includes(c.id);
          return (
            <button key={c.id} onClick={()=>toggle(c.id)} style={{
              width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",marginBottom:8,
              borderRadius:14,border:"none",background:isSel?`linear-gradient(135deg,${c.bg},#fff)`:"#fff",
              outline:isSel?`2px solid ${c.color}`:"2px solid #E8F0EC",
              cursor:"pointer",textAlign:"left",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif",
            }}>
              <span style={{fontSize:24,flexShrink:0}}>{c.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:isSel?c.color:"#2C3E50"}}>{c.label}</div>
                <div style={{fontSize:11,color:"#7F8C8D"}}>{c.sublabel}</div>
              </div>
              <div style={{width:24,height:24,borderRadius:"50%",background:isSel?c.color:"#F0F0F0",border:`2px solid ${isSel?c.color:"#E0E0E0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",transition:"all 0.2s"}}>
                {isSel&&"✓"}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{padding:"16px 20px 32px",background:"rgba(247,253,249,0.95)",backdropFilter:"blur(10px)",borderTop:"1px solid #E8F0EC"}}>
        <button onClick={()=>{if(conditions.length>0)setGenerated(true);}} style={{
          width:"100%",padding:"15px",borderRadius:14,border:"none",
          background:conditions.length>0?"linear-gradient(135deg,#1A4731,#2D9E6B)":"#D5D8DC",
          color:"#fff",fontSize:15,fontWeight:700,cursor:conditions.length>0?"pointer":"not-allowed",
          fontFamily:"'DM Sans',sans-serif",
        }}>
          🖨️ Gumawa ng Gabay sa Pagkain
        </button>
      </div>
    </div>
  );
}

// ============================================
// APP — ROOT ROUTER
// ============================================
const SCREENS = { WELCOME:"welcome", CONDITIONS:"conditions", FOOD_GUIDE:"food_guide", PWEDE_BA_TO:"pwede_ba_to", BHW:"bhw" };

export default function KainKlinikal() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [budget, setBudget] = useState(200);

  const navigate = (s) => setScreen(s);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{maxWidth:480,margin:"0 auto",position:"relative",minHeight:"100vh",boxShadow:"0 0 60px rgba(0,0,0,0.3)"}}>

        {screen === SCREENS.WELCOME && (
          <ScreenWelcome
            onStart={() => navigate(SCREENS.CONDITIONS)}
            onBHW={() => navigate(SCREENS.BHW)}
          />
        )}

        {screen === SCREENS.CONDITIONS && (
          <ScreenConditions
            onBack={() => navigate(SCREENS.WELCOME)}
            onNext={(conds, bud) => {
              setSelectedConditions(conds);
              setBudget(bud);
              navigate(SCREENS.FOOD_GUIDE);
            }}
          />
        )}

        {screen === SCREENS.FOOD_GUIDE && (
          <ScreenFoodGuide
            selectedConditions={selectedConditions}
            budget={budget}
            onBack={() => navigate(SCREENS.CONDITIONS)}
            onPwedeBaTo={() => navigate(SCREENS.PWEDE_BA_TO)}
          />
        )}

        {screen === SCREENS.PWEDE_BA_TO && (
          <ScreenPwedeBaTo
            selectedConditions={selectedConditions}
            onBack={() => navigate(SCREENS.FOOD_GUIDE)}
            onGoToFoodGuide={() => navigate(SCREENS.FOOD_GUIDE)}
          />
        )}

        {screen === SCREENS.BHW && (
          <ScreenBHW onBack={() => navigate(SCREENS.WELCOME)} />
        )}
      </div>
    </>
  );
}
