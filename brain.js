// Northern Travels Voice Agent brain v2 — AUTO LANGUAGE edition.
// Detects the talker's language and replies + speaks in the SAME language:
// en (English), roman (Roman Urdu/Hindi), ur (Urdu script), hi (Hindi),
// pa (Punjabi), sd (Sindhi), ps (Pashto). Saraiki/Balochi speakers are
// understood via Urdu/Punjabi closeness and answered in Urdu (honest limit:
// no free natural TTS voice exists for Saraiki/Balochi yet).
const OWNER = "03286770527";
const SERVICES = [
  { name: "Hunza 5-Day Tour", key: "hunza", aliases: ["hunza", "ہنزہ", "हुनज़ा", "hunza"], price: "Rs. 28,500 per person",
    details: { en: "Transport, hotel, breakfast and guide included. Departs every Friday.",
      ur: "ٹرانسپورٹ، ہوٹل، ناشتہ اور گائیڈ شامل۔ ہر جمعہ روانگی۔",
      hi: "ट्रांसपोर्ट, होटल, नाश्ता और गाइड शामिल। हर शुक्रवार रवानगी।" } },
  { name: "Skardu 7-Day Tour", key: "skardu", aliases: ["skardu", "سکردو", "स्कर्दू"], price: "Rs. 42,000 per person",
    details: { en: "Transport, hotel, breakfast, guide, and jeep for Deosai included.",
      ur: "ٹرانسپورٹ، ہوٹل، ناشتہ، گائیڈ اور دیوسائی کے لیے جیپ شامل۔",
      hi: "ट्रांसपोर्ट, होटल, नाश्ता, गाइड और देवसाई के लिए जीप शामिल।" } },
  { name: "Swat 3-Day Tour", key: "swat", aliases: ["swat", "سوات", "स्वात"], price: "Rs. 16,500 per person",
    details: { en: "Transport, hotel and breakfast included. Departs every Thursday.",
      ur: "ٹرانسپورٹ، ہوٹل اور ناشتہ شامل۔ ہر جمعرات روانگی۔",
      hi: "ट्रांसपोर्ट, होटल, नाश्ता शामिल। हर गुरुवार रवानगी।" } },
  { name: "Private Custom Tour", key: "private", aliases: ["private", "پرائیویٹ", "प्राइवेट", "custom"], price: "Price on request",
    details: { en: "Your dates, your group, car or jeep, flexible plan.",
      ur: "آپ کی تاریخیں، آپ کا گروپ، لچکدار پلان۔",
      hi: "आपकी तारीखें, आपका ग्रुप, लचीला प्लान।" } }
];
const det = (s, lang) => (s.details[lang] || s.details.en);

const T = {
en: { hello: `Assalamualaikum! Welcome to Northern Travels. Tours to Hunza, Skardu, Swat and Naran. Ask me tour prices, or say book, to reserve a seat.`,
  priceOne: s => `${s.name}: ${s.price}. ${det(s,'en')} Say book ${s.key}, to reserve.`,
  priceList: () => "Our tours: " + SERVICES.map(s => `${s.name}, ${s.price}`).join(". ") + ". Which tour do you like?",
  book: n => `Great choice! Let us book ${n}. Please say your name and phone number together.`,
  askPhone: "Please share your phone number, for example 0321-1234567, so our team can confirm.",
  saved: (n, s, p) => `Thank you ${n}! Your booking lead for ${s} is saved. Our team will call you on ${p} to confirm. Anything else?`,
  hours: `Open daily 9am to 9pm. Our number is ${OWNER}.`,
  loc: "Lahore, Pakistan. Tours depart from Lahore and Islamabad.",
  human: `Sure, call our team directly on ${OWNER}, 9am to 9pm. Or leave your number here and we will call you back.`,
  fallback: `I can help with tour prices, dates, booking and policies. For anything else, call our team on ${OWNER}, or leave your number and we will call you back.`,
  refund: "Cancel 7 or more days before departure for a full advance refund. Inside 7 days, the advance moves to your next trip.",
  discount: "Groups of 6 or more get 8 percent off. Students with a valid ID card get 5 percent off on Swat tours.",
  payment: "A small advance via JazzCash or EasyPaisa confirms your seat. The rest is paid on departure day.",
  hotel: "All prices include clean family hotels on double sharing. A single room is available for an extra charge." },
roman: { hello: `Assalamualaikum! Northern Travels mein khush amdeed. Hunza, Skardu, Swat aur Naran ke tours. Prices poochain, ya 'book' keh kar seat reserve karein.`,
  priceOne: s => `${s.name}: ${s.price}. ${det(s,'en')} Reserve karne ke liye 'book ${s.key}' kahein.`,
  priceList: () => "Hamare tours: " + SERVICES.map(s => `${s.name}, ${s.price}`).join(". ") + ". Konsa tour pasand hai?",
  book: n => `Great choice! ${n} book karte hain. Apna naam aur phone number ek saath bol dein.`,
  askPhone: "Please apna phone number bol dein, for example 0321-1234567, taake hamari team confirm kar sake.",
  saved: (n, s, p) => `Shukriya ${n}! ${s} ke liye aap ki booking lead save ho gayi hai. Hamari team ${p} par call karke confirm karegi. Kuch aur?`,
  hours: `Rozana subah 9 se raat 9 baje tak khule hain. Hamara number hai ${OWNER}.`,
  loc: "Lahore, Pakistan. Tours Lahore aur Islamabad se rawana hote hain.",
  human: `Sure, hamari team se direct ${OWNER} par baat karein, subah 9 se raat 9. Ya apna number yahan dein, hum khud call kar lenge.`,
  fallback: `Mein prices, dates, booking aur policies mein madad kar sakta hoon. Is ke ilawa sawal ho to hamari team ko ${OWNER} par call karein, ya apna number dein, hum khud call kar lenge.`,
  refund: "Rawanagi se 7 ya zyada din pehle cancel karein to pura advance wapis. 7 din ke andar ho to advance aap ke agle trip mein chala jayega.",
  discount: "6 ya zyada afrad ke group par 8% riyayat. Talib ilmon ko sahi ID card par Swat tours mein 5% riyayat.",
  payment: "Seat confirm karne ke liye JazzCash/EasyPaisa se chhota sa advance liya jata hai. Baqi raqam rawanagi ke din di jati hai.",
  hotel: "Tamam packages mein saaf family hotel (double sharing) shamil hain. Single room izafi charge par mil sakta hai." },
ur: { hello: `السلام علیکم! ناردرن ٹریولز میں خوش آمدید — ہنزہ، سکردو، سوات اور ناران کے ٹورز۔ ٹور کی قیمت پوچھیں یا 'بک' کہہ کر سیٹ ریزرو کریں۔`,
  priceOne: s => `${s.name}: ${s.price}۔ ${det(s,'ur')} ریزرو کرنے کے لیے 'بک' کہیں۔`,
  priceList: () => "ہمارے ٹورز: " + SERVICES.map(s => `${s.name}، ${s.price}`).join("۔ ") + "۔ کونسا ٹور پسند ہے؟",
  book: n => `بہت خوب! ${n} بک کرتے ہیں۔ اپنا نام اور فون نمبر ایک ساتھ بتائیں۔`,
  askPhone: "براہ کرم اپنا فون نمبر بتائیں، مثال 0321-1234567، تاکہ ہماری ٹیم تصدیق کر سکے۔",
  saved: (n, s, p) => `شکریہ ${n}! ${s} کے لیے آپ کی بکنگ لیڈ محفوظ ہو گئی ہے۔ ہماری ٹیم ${p} پر کال کر کے تصدیق کرے گی۔ کچھ اور چاہیے؟`,
  hours: `ہم روزانہ صبح 9 سے رات 9 بجے تک کھلے ہیں۔ ہمارا نمبر ${OWNER} ہے۔`,
  loc: "لاہور، پاکستان۔ ٹور لاہور اور اسلام آباد سے روانہ ہوتے ہیں۔",
  human: `ضرور، ہماری ٹیم سے براہ راست ${OWNER} پر بات کریں، صبح 9 سے رات 9۔ یا اپنا نمبر یہاں دیں، ہم خود کال کر لیں گے۔`,
  fallback: `میں قیمتوں، تاریخوں، بکنگ اور پالیسیوں میں مدد کر سکتا ہوں۔ اس کے علاوہ سوال ہو تو ہماری ٹیم کو ${OWNER} پر کال کریں، یا اپنا نمبر دیں، ہم خود کال کر لیں گے۔`,
  refund: "روانگی سے 7 یا زیادہ دن پہلے منسوخ کریں تو ایڈوانس پورا واپس۔ 7 دن کے اندر ہو تو ایڈوانس آپ کے اگلے ٹرپ میں منتقل ہو جائے گا۔",
  discount: "6 یا زیادہ افراد کے گروپ پر 8 فیصد رعایت۔ طلبہ کو درست شناختی کارڈ پر سوات ٹورز میں 5 فیصد رعایت۔",
  payment: "سیٹ کی تصدیق کے لیے جاز کیش/ایزی پیسہ سے چھوٹا سا ایڈوانس لیا جاتا ہے۔ باقی رقم روانگی کے دن دی جاتی ہے۔",
  hotel: "تمام پیکجز میں صاف ستھرے فیملی ہوٹل (ڈبل شیئرنگ) شامل ہیں۔ سنگل روم اضافی چارج پر مل سکتا ہے۔" },
hi: { hello: `नमस्ते! नॉर्दर्न ट्रैवल्स में आपका स्वागत है — हुनज़ा, स्कर्दू, स्वात और नारान के टूर। टूर की कीमत पूछें या 'बुक' कहकर सीट रिज़र्व करें।`,
  priceOne: s => `${s.name}: ${s.price}। ${det(s,'hi')} रिज़र्व करने के लिए 'बुक' कहें।`,
  priceList: () => "हमारे टूर: " + SERVICES.map(s => `${s.name}, ${s.price}`).join(". ") + ". कौनसा टूर पसंद है?",
  book: n => `बहुत बढ़िया! ${n} बुक करते हैं। अपना नाम और फोन नंबर एक साथ बताएं।`,
  askPhone: "कृपया अपना फोन नंबर बताएं, उदाहरण 0321-1234567, ताकि हमारी टीम पुष्टि कर सके।",
  saved: (n, s, p) => `धन्यवाद ${n}! ${s} के लिए आपकी बुकिंग लीड सेव हो गई है। हमारी टीम ${p} पर कॉल करके पुष्टि करेगी। कुछ और चाहिए?`,
  hours: `हम रोज़ सुबह 9 से रात 9 बजे तक खुले हैं। हमारा नंबर ${OWNER} है।`,
  loc: "लाहौर, पाकिस्तान। टूर लाहौर और इस्लामाबाद से रवाना होते हैं।",
  human: `ज़रूर, हमारी टीम से सीधे ${OWNER} पर बात करें, सुबह 9 से रात 9। या अपना नंबर यहाँ दें, हम खुद कॉल कर लेंगे।`,
  fallback: `मैं कीमतों, तारीखों, बुकिंग और नीतियों में मदद कर सकता हूँ। इसके अलावा सवाल हो तो हमारी टीम को ${OWNER} पर कॉल करें, या अपना नंबर दें, हम खुद कॉल कर लेंगे।`,
  refund: "रवानगी से 7 या अधिक दिन पहले रद्द करने पर पूरा एडवांस वापस। 7 दिन के अंदर हो तो एडवांस आपके अगले ट्रिप में चला जाएगा।",
  discount: "6 या अधिक लोगों के ग्रुप पर 8 प्रतिशत छूट। छात्रों को वैध आईडी कार्ड पर स्वात टूर में 5 प्रतिशत छूट।",
  payment: "सीट की पुष्टि के लिए जैज़कैश/ईज़ीपैसा से छोटा सा एडवांस लिया जाता है। बाकी रकम रवानगी के दिन दी जाती है।",
  hotel: "सभी पैकेज में साफ़ परिवार होटल (डबल शेयरिंग) शामिल हैं। सिंगल रूम अतिरिक्त शुल्क पर मिल सकता है।" },
pa: { hello: `Sat Sri Akal! Northern Travels vich tuhada swagat hai — Hunza, Skardu, Swat te Naran de tour. Tour di qeemat puchho, ya 'book' keh ke seat reserve karo.`,
  priceOne: s => `${s.name}: ${s.price}. ${det(s,'en')} Reserve karan layi 'book' kaho.`,
  priceList: () => "Sade tour: " + SERVICES.map(s => `${s.name}, ${s.price}`).join(". ") + ". Kehra tour pasand hai?",
  book: n => `Bohat changa! ${n} book karde aan. Apna naam te phone number ikko saath daso.`,
  askPhone: "Meharbani karke apna phone number daso, maslan 0321-1234567, taake sadi team tasdeeq kar sake.",
  saved: (n, s, p) => `Shukriya ${n}! ${s} layi tuhadi booking lead save ho gayi hai. Sadi team ${p} te call karke confirm karegi. Hor kuch chahida?`,
  hours: `Assi roz savere 9 to raat 9 waje tak khulle aan. Sada number ${OWNER} hai.`,
  loc: "Lahore, Pakistan. Tour Lahore te Islamabad to rawana hunde ne.",
  human: `Zaroor, sadi team naal seedha ${OWNER} te gal karo, savere 9 to raat 9. Ya apna number ethe deo, assi aap call kar lawaange.`,
  fallback: `Main qeematan, tareekhan, booking te policies vich madad kar sakda aan. Is to ilawa sawal hove ta sadi team nu ${OWNER} te call karo, ya apna number deo, assi aap call kar lawaange.`,
  refund: "Rawanagi to 7 ya zyada din pehle cancel karo ta pura advance wapis. 7 din de andar hove ta advance tuhade agle trip vich chala jayega.",
  discount: "6 ya zyada bandeya de group te 8% chhoot. Students nu sahi ID card te Swat tour vich 5% chhoot.",
  payment: "Seat confirm karan layi JazzCash/EasyPaisa to chhota jeya advance liya janda hai. Baqi raqam rawanagi wale din ditti jandi hai.",
  hotel: "Saare packages vich saaf family hotel (double sharing) shamil ne. Single room wadhi charge te mil sakda hai." },
sd: { hello: `Assalamualaikum! Northern Travels mein tawhanjo bhalikar — Hunza, Skardu, Swat aein Naran ja tour. Tour ji qeemat puchho, ya 'book' chae seat reserve kayo.`,
  priceOne: s => `${s.name}: ${s.price}. ${det(s,'en')} Reserve karan lai 'book' chao.`,
  priceList: () => "Asaanja tour: " + SERVICES.map(s => `${s.name}, ${s.price}`).join(". ") + ". Kehro tour pasand ahe?",
  book: n => `Zabardast! ${n} book kayon tha. Panhinjo naalo aein phone number gad budhayo.`,
  askPhone: "Meharbani kare panhinjo phone number budhayo, masalan 0321-1234567, taake asaanji team tasdeeq kare saghe.",
  saved: (n, s, p) => `Meharbani ${n}! ${s} lai tawhanji booking lead save thi wayi ahe. Asaanji team ${p} te call kare confirm kandi. Kujh byo ghurje?`,
  hours: `Asaan roz subuh 9 khan raat 9 waje taeen khula aahiyon. Asaanjo number ${OWNER} ahe.`,
  loc: "Lahore, Pakistan. Tour Lahore aein Islamabad khan rawana thinda ahen.",
  human: `Bilkul, asaanji team san seedho ${OWNER} te galhayo, subuh 9 khan raat 9. Ya panhinjo number hite deyo, asaan paan call kayon tha.`,
  fallback: `Aanein qeematan, tareekhan, booking aein policies mein madad kare saghan tho. Kaan byo sawal huje ta asaanji team khe ${OWNER} te call kayo, ya panhinjo number deyo, asaan paan call kayon tha.`,
  refund: "Rawanagi khan 7 ya wadheek deenhan ag cancel kayo ta pooro advance wapis. 7 deenhan andar huje ta advance tawhanje agle trip mein huli weendo.",
  discount: "6 ya wadheek manhan je group te 8% riayat. Students khe sahi ID card te Swat tour mein 5% riayat.",
  payment: "Seat confirm karan lai JazzCash/EasyPaisa khan nandho advance wathando ahe. Baqi raqam rawanagi ware deenh dindi ahe.",
  hotel: "Sabhi packages mein saaf family hotel (double sharing) shamil ahen. Single room wadhi charge te mili saghe tho." },
ps: { hello: `Pa khair raghlay! Northern Travels ta staso swagat de — Hunza, Skardu, Swat aw Naran safaruna. Da safar qeemat wapohtay, ya 'book' owayast se seat reserve kay.`,
  priceOne: s => `${s.name}: ${s.price}. ${det(s,'en')} Reserve kawalo dapara 'book' owayast.`,
  priceList: () => "Zamung safaruna: " + SERVICES.map(s => `${s.name}, ${s.price}`).join(". ") + ". Kum safar mo khwakh de?",
  book: n => `Der kha! ${n} book kawu. Khpal num aw phone number yo zaay owayast.`,
  askPhone: "Meharbani okray khpal phone number owayast, mesal 0321-1234567, che zamung team tasdeeq okri.",
  saved: (n, s, p) => `Manana ${n}! ${s} dapara staso booking lead save sho. Zamung team ba ${p} ta call okri aw confirm ba kri. Nor sa pakar di?`,
  hours: `Mung har wraz sahar 9 na makham 9 bajo pore khlas yu. Zamung number ${OWNER} de.`,
  loc: "Lahore, Pakistan. Safaruna Lahore aw Islamabad na rawanegi.",
  human: `Bilkul, zamung team sara seedha ${OWNER} bande khabare okay, sahar 9 na makham 9. Ya khpal number dalta rakay, mung ba pa khpala call oko.`,
  fallback: `Za qeematuno, tareekhuno, booking aw policies ke madad kawalay sham. Da de na elawa sawal wi nu zamung team ta ${OWNER} bande call okay, ya khpal number rakay, mung ba call oko.`,
  refund: "Rawanagi na 7 ya zyada wrazay makhke cancel kay nu pura advance wapas. 7 wrazay ke danana wi nu advance ba staso nore safar ta lar shi.",
  discount: "6 ya zyada kasanu group bande 8% riayat. Students ta sahi ID card bande Swat tour ke 5% riayat.",
  payment: "Seat confirm kawalo dapara JazzCash/EasyPaisa na lag advance akhistal kegi. Baqi raqam da rawanagi wrazay warkawal kegi.",
  hotel: "Tolo packages ke safa family hotel (double sharing) shamil di. Single room zyada charge bande milawedai shi." }
};

const LANG_NAMES = { en: "English", roman: "Roman Urdu", ur: "اردو", hi: "हिन्दी", pa: "ਪੰਜਾਬੀ", sd: "سنڌي", ps: "پښتو" };
const LANG_CODES = { en: "en-US", roman: "ur-PK", ur: "ur-PK", hi: "hi-IN", pa: "pa-IN", sd: "sd-IN", ps: "ps-AF" };
const TTS_TL = { en: "en", roman: "en", ur: "ur", hi: "hi", pa: "pa", sd: "sd", ps: "ps" };

function detectLanguage(text) {
  const t = text || "";
  if (/[ؐ-ۿ]/.test(t)) {
    if (/[ٻڄڏڳڱڃ]/.test(t)) return "sd";
    if (/[ټډړږښګڼې]/.test(t)) return "ps";
    return "ur";
  }
  if (/[ऀ-ॿ]/.test(t)) return "hi";
  if (/[਀-੿]/.test(t)) return "pa";
  const low = " " + t.toLowerCase() + " ";
  const score = (words) => words.reduce((n, w) => n + (low.includes(" " + w + " ") || low.includes(" " + w + ",") ? 1 : 0), 0);
  const pa = score(["tusi", "assi", "tuhada", "tuhadi", "sada", "sadi", "haiga", "chahida", "kidda", "daso", "kaho", "wajay", "waje", "bandeya", "gal", "karo", "puchho"]);
  const sd = score(["tawhan", "tawhanjo", "tawhanji", "panhinjo", "asaan", "asaanji", "asaanjo", "aahiyon", "budhayo", "ghurje", "thinda", "kayo", "chao", "ahe", "deenh"]);
  const ps = score(["staso", "zamung", "mung", "khpal", "owayast", "raghlay", "pakar", "kegi", "wraz", "wrazay", "makham", "pohtay", "safaruna", "bande"]);
  const roman = score(["hai", "hain", "ka", "ki", "ke", "mein", "mujhe", "chahiye", "kitna", "kitne", "kya", "aap", "mera", "meri", "wala", "wali", "bhi", "nahi", "karna", "karni", "poochna", "batao", "kab", "hai?"]);
  const best = Math.max(pa, sd, ps, roman);
  if (best === 0) return "en";
  if (pa === best) return "pa";
  if (sd === best) return "sd";
  if (ps === best) return "ps";
  return "roman";
}

function findService(low) { return SERVICES.find(s => (s.aliases || [s.key]).some(a => low.includes(a))) || null; }

function agentReply(input, state) {
  const raw = (input || "").trim();
  const low = raw.toLowerCase();
  const lang = state.pendingLead ? (state.lang || "roman") : detectLanguage(raw);
  state.lang = lang;
  const L = T[lang] || T.en;

  if (state.pendingLead) {
    const digits = raw.replace(/\D/g, "");
    const phone = digits.match(/(\d{10,13})/);
    if (phone) {
      const name = raw.replace(/[\d\s-]+/g, "").trim() || "Customer";
      const lead = { name, phone: phone[1], service: state.pendingLead.service, lang, time: new Date().toISOString() };
      state.pendingLead = null;
      return { text: L.saved(name, lead.service, lead.phone), lead, lang };
    }
    return { text: L.askPhone, lang };
  }

  if (["hi", "hello", "salam", "aoa", "hey", "assalamualaikum", "assalam o alaikum", "sat sri akal", "namaste", "adab"].some(g => low === g || low.startsWith(g + " ") || raw.startsWith("السلام") || raw.startsWith("नमस्ते"))) {
    return { text: L.hello, lang };
  }
  if (low.includes("book") || low.includes("reserve") || raw.includes("بک") || low.includes("बुक")) {
    const svc = findService(low);
    state.pendingLead = { service: svc ? svc.name : "General Tour" };
    return { text: L.book(state.pendingLead.service), lang };
  }
  if (["price", "rate", "cost", "package", "tour", "trip", "qeemat", "qemat", "قیمت", "कीमत", "safar"].some(w => low.includes(w) || raw.includes(w))) {
    const svc = findService(low);
    if (svc) return { text: L.priceOne(svc), lang };
    return { text: L.priceList(), lang };
  }
  if (["hour", "open", "timing", "time", "waqt", "waje", "وقت"].some(w => low.includes(w) || raw.includes(w))) return { text: L.hours, lang };
  if (["where", "location", "address", "office", "kahan", "کہاں"].some(w => low.includes(w) || raw.includes(w))) return { text: L.loc, lang };
  if (["human", "owner", "real person", "banda"].some(w => low.includes(w))) return { text: L.human, lang };
  if (["refund", "cancel", "رقم واپس", "रद्द"].some(w => low.includes(w) || raw.includes(w))) return { text: L.refund, lang };
  if (["discount", "group", "offer", "رعایت", "छूट"].some(w => low.includes(w) || raw.includes(w))) return { text: L.discount, lang };
  if (["payment", "pay", "advance", "jazzcash", "easypaisa", "ادائیگی", "भुगतान"].some(w => low.includes(w) || raw.includes(w))) return { text: L.payment, lang };
  if (["hotel", "stay", "room", "ہوٹل", "होटल"].some(w => low.includes(w) || raw.includes(w))) return { text: L.hotel, lang };
  return { text: L.fallback, lang };
}

const INCOMING_GREETING = T.roman.hello;
const OUTGOING_PITCH = (lead, lang) => {
  const svc = SERVICES.find(s => lead.service.toLowerCase().includes(s.key));
  const price = svc ? svc.price : "available on request";
  const by = {
    en: `Hello ${lead.name}, I am calling from Northern Travels. You showed interest in ${lead.service}. Seats are limited - shall I confirm your booking? The price is ${price}.`,
    ur: `السلام علیکم ${lead.name}، میں ناردرن ٹریولز سے بول رہا ہوں۔ آپ نے ${lead.service} میں دلچسپی ظاہر کی تھی۔ نشستیں محدود ہیں، کیا میں آپ کی بکنگ کنفرم کر دوں؟ قیمت ہے ${price}۔`
  };
  return by[lang] || `Assalamualaikum ${lead.name}, mein Northern Travels se bol raha hoon. Aap ne ${lead.service} mein interest dikhaya tha. Seats limited hain, kya mein aap ki booking confirm kar doon? Price hai ${price}.`;
};

if (typeof module !== "undefined") module.exports = { detectLanguage, agentReply, T, SERVICES, LANG_CODES, TTS_TL, LANG_NAMES, INCOMING_GREETING, OUTGOING_PITCH };
