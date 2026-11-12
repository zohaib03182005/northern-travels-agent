// Voice Call Agent brain - prices/FAQs, booking, lead capture, handoff.
const KB = {
  business: "Northern Travels",
  tagline: "Tours to Hunza, Skardu, Swat and Naran",
  hours: "Open daily 9am to 9pm",
  location: "Lahore, Pakistan. Tours depart from Lahore and Islamabad",
  services: [
    { name: "Hunza 5-Day Tour", key: "hunza", price: "Rs. 28,500 per person", details: "Transport, hotel, breakfast and guide included. Departs every Friday." },
    { name: "Skardu 7-Day Tour", key: "skardu", price: "Rs. 42,000 per person", details: "Transport, hotel, breakfast, guide, and jeep for Deosai included." },
    { name: "Swat 3-Day Tour", key: "swat", price: "Rs. 16,500 per person", details: "Transport, hotel and breakfast included. Departs every Thursday." },
    { name: "Private Custom Tour", key: "private", price: "Price on request", details: "Your dates, your group, car or jeep, flexible plan." }
  ],
  faqs: [
    { keys: ["refund", "cancel"], a: "Cancel 7 or more days before departure for a full advance refund. Inside 7 days, the advance moves to your next trip." },
    { keys: ["discount", "group", "offer"], a: "Groups of 6 or more get 8 percent off. Students with a valid ID card get 5 percent off on Swat tours." },
    { keys: ["payment", "pay", "advance", "jazzcash", "easypaisa"], a: "We take a small advance via JazzCash or EasyPaisa to confirm your seat. The rest is paid on departure day." },
    { keys: ["hotel", "stay", "room"], a: "All package prices include clean family hotels on double sharing. A single room is available for an extra charge." },
    { keys: ["booking", "book", "reserve"], a: "Booking is easy. Tell me your name, phone number, which tour, and how many people. Our team will call you to confirm." }
  ],
  ownerPhone: "03286770527",
  fallback: "I can help with tour prices, dates, booking and policies. For anything else, I will connect you to our team on 0328 6770527. Or leave your number and we will call you back."
};
function findService(t) { return KB.services.find(s => t.includes(s.key)) || null; }
function findFaq(t) { const f = KB.faqs.find(f => f.keys.some(k => t.includes(k))); return f ? f.a : null; }
function agentReply(input, state) {
  const t = (input || "").trim();
  const low = t.toLowerCase();
  if (state.pendingLead) {
    const phone = t.replace(/\D/g, "").match(/(\d{10,13})/);
    if (phone) {
      const name = t.replace(/[\d\s-]+/g, "").trim() || "Customer";
      const lead = { name, phone: phone[1], service: state.pendingLead.service, time: new Date().toISOString() };
      state.pendingLead = null;
      return { text: `Shukriya ${name}! Your booking lead for ${lead.service} is saved. Our team will call you on ${lead.phone} very soon to confirm. Anything else, prices or dates?`, lead };
    }
    return { text: "Please say your phone number slowly, for example 0321 1234567, so our team can call you to confirm." };
  }
  if (["hi", "hello", "salam", "aoa", "hey"].some(g => low === g || low.startsWith(g + " "))) {
    return { text: `Assalamualaikum! Welcome to ${KB.business}. ${KB.tagline}. Ask me about tour prices, or say book, to reserve a seat.` };
  }
  if (low.includes("book") || low.includes("reserve")) {
    const svc = findService(low);
    state.pendingLead = { service: svc ? svc.name : "General Tour" };
    return { text: `Great choice! Let us book ${state.pendingLead.service}. Please say your name and phone number.` };
  }
  if (["price", "rate", "cost", "package", "tour", "trip"].some(w => low.includes(w))) {
    const svc = findService(low);
    if (svc) return { text: `${svc.name}: ${svc.price}. ${svc.details} Say book ${svc.key}, to reserve your seat.` };
    return { text: KB.services.map(s => `${s.name}, ${s.price}`).join(". ") + ". Which tour do you like?" };
  }
  if (low.includes("hour") || low.includes("open") || low.includes("timing")) return { text: `${KB.hours}. Our number is 0328 6770527.` };
  if (low.includes("where") || low.includes("location") || low.includes("address")) return { text: KB.location + "." };
  if (low.includes("human") || low.includes("owner") || low.includes("real person")) {
    return { text: `Sure. You can call our team directly on 0328 6770527, ${KB.hours.toLowerCase()}. Or leave your number here and we will call you back.` };
  }
  const faq = findFaq(low);
  if (faq) return { text: faq };
  return { text: KB.fallback };
}
const INCOMING_GREETING = `Assalamualaikum! ${KB.business} mein khush amdeed. ${KB.tagline}. Mein aap ki kya madad kar sakti hoon? Prices, booking, ya koi aur sawal?`;
const OUTGOING_PITCH = (lead) =>
  `Assalamualaikum ${lead.name}, mein ${KB.business} se bol rahi hoon. Aap ne ${lead.service} mein interest dikhaya tha. Seats limited hain, kya mein aap ki booking confirm kar doon? Price hai ` +
  ((findService(lead.service.toLowerCase()) || {}).price || "available on request") + ".";
