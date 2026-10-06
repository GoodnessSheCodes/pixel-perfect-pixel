export const CATEGORIES = ["Product Quality", "Customer Service", "Delivery", "Pricing", "User Experience"] as const;

// prettier-ignore
const REVIEWS: Record<(typeof CATEGORIES)[number], string[]> = {
  "Product Quality": [
    "I absolutely love this jacket. The stitching is excellent and it still looks new after a full winter.",
    "The blender is powerful and crushes ice in seconds. Really impressed with the build.",
    "Headphones broke after two weeks. The hinge snapped while I was simply folding them.",
    "Material feels flimsy and cheaply made, nothing like the photos on the website.",
    "Solid kettle. Boils fast and the handle stays cool. Does the job.",
    "The fabric is soft but the colour faded badly after the first wash. Disappointed.",
    "Arrived with a cracked screen protector already installed, and the phone case itself was scratched.",
    "Sturdy, well designed backpack. The zips are smooth and the pockets are genuinely useful.",
    "It is a standard USB cable, 1.5 metres long, black. It charges my phone.",
    "The mattress is incredibly comfortable. Best sleep I have had in years!",
    "Shoes started to fall apart at the sole within a month. Not worth the hype.",
    "Watch strap is made of silicone and comes in three sizes. Fits my wrist.",
    "Great sound quality for such a small speaker, and the battery lasts all weekend.",
    "The knife set is sharp, balanced and beautiful. A real upgrade for my kitchen.",
    "Lid of the container started leaking on day one. Food ended up all over my bag.",
    "The desk lamp has a bright, crisp light and the arm stays exactly where I put it.",
    "Product is as described. Box contained the device, a charger and a manual.",
    "Very poor quality control. Two of the four glasses were chipped out of the box.",
    "The camera produces vibrant, sharp photos even in low light. Flawless so far.",
    "It works, but the plastic smelled strongly for days and the buttons feel mediocre.",
    "Exceptional craftsmanship on this wooden chair. Sturdy and elegant.",
    "Stopped working after three weeks. Really disappointing for a brand I used to trust.",
    "The towels are thick and absorbent. Very pleased with them.",
    "Charger gets dangerously hot. I am worried about using it overnight.",
  ],
  "Customer Service": [
    "The support agent was patient, friendly and resolved my issue in under ten minutes.",
    "I contacted support three times and nobody replied. Completely ignored.",
    "Thank you to Thandi from the help desk, she went above and beyond to fix my account.",
    "Rude staff on the phone. They hung up on me twice. Unacceptable.",
    "I emailed support on Monday and received a reply on Wednesday with a tracking link.",
    "Knowledgeable and courteous team. They explained everything clearly.",
    "Waited over an hour on hold only to be told to call back tomorrow. Frustrating.",
    "The chat assistant answered my question about warranty terms.",
    "Refund was processed quickly and the agent apologised for the delay. Appreciated.",
    "Unhelpful responses copied from a script. They clearly did not read my complaint.",
    "Excellent service at the store. The manager personally helped me choose the right model.",
    "Support asked for my order number and said a technician would contact me.",
    "They refused to replace a faulty item that was still under warranty. Avoid this company.",
    "Really helpful team, very responsive on WhatsApp and always polite.",
    "I was transferred between four departments and nobody could help. A nightmare.",
    "The agent was kind but could not actually solve the problem. Still waiting.",
    "Brilliant support! They sent a replacement before I even returned the broken one.",
    "Call centre opening hours are 8am to 5pm on weekdays.",
    "Incompetent and unprofessional. My complaint was closed without any resolution.",
    "Fast, friendly help through live chat. Problem sorted in minutes.",
    "The return form asks for a reason code and a photo of the item.",
    "Very attentive staff who followed up a week later to check I was happy.",
    "Promised a callback that never happened. Very disappointing experience.",
    "I appreciate how professional and transparent the team was about the recall.",
  ],
  Delivery: [
    "Package arrived two days early and was packed carefully. Fantastic service!",
    "Delivery was delayed by eleven days with no updates at all. Terrible.",
    "The courier left the parcel outside in the rain. The box was soaked and damaged.",
    "Arrived on time and in perfect condition. No complaints.",
    "Order shipped from the Johannesburg warehouse and arrived on Thursday.",
    "Tracking said delivered but the parcel was missing. Still trying to get it sorted.",
    "Super quick delivery, ordered at night and it arrived the next morning!",
    "The driver was polite and called ahead to confirm I was home.",
    "Wrong item delivered and the return process was a hassle.",
    "Delivery came in a single box with a printed invoice inside.",
    "Groceries arrived fresh and cold, delivered right to my door. Very convenient.",
    "Late again. This is the third order in a row that missed the delivery window.",
    "Everything arrived safely and well packaged, even the fragile items.",
    "Courier was rude and threw the box over the gate. The contents were dented.",
    "The parcel was delivered to the reception desk of my building.",
    "Ahead of schedule and the packaging was eco-friendly. Wonderful.",
    "Delivery fee was charged twice and the parcel came a week late.",
    "Prompt delivery and the driver was extremely friendly.",
    "Half of my order was lost in transit. Very upset.",
    "Estimated delivery time was three to five working days.",
    "Fast shipping and the item was intact. Happy customer.",
    "Slow delivery, but the item itself was fine.",
    "Box arrived crushed and the glass inside was broken. Awful packaging.",
    "Delivered quickly to a pickup point near my office. Really convenient option.",
  ],
  Pricing: [
    "Excellent value for money. Cheaper than the competitors and better quality.",
    "Way overpriced for what you get. A complete rip off.",
    "The price increased by twenty percent overnight. Not happy at all.",
    "Affordable subscription and the student discount is generous.",
    "The monthly plan costs R149 and the annual plan costs R1490.",
    "Hidden fees at checkout made the final total much more expensive than advertised.",
    "Great bargain during the sale. I bought two!",
    "Fair price for a premium product. Worth every cent.",
    "I was overcharged and it took weeks to get my money back.",
    "Prices are listed in rands and include VAT.",
    "Reasonable pricing and no surprise charges. Transparent and fair.",
    "Too expensive for the quality. I regret this purchase.",
    "The loyalty points system gives a small discount on future orders.",
    "Waste of money. It broke the same day and the shipping cost more than the item.",
    "The bundle deal saves you a lot compared to buying separately. Good value.",
    "Pricey, but honestly the quality justifies it.",
    "Misleading advertising. The discount only applied to one colour.",
    "Free shipping on orders over R500 is a nice touch.",
    "Payment can be made by card, EFT or cash on delivery.",
    "Cheap and cheerful. Does the job for the price.",
    "Subscription renewed without warning and I was charged for a full year. Furious.",
    "The price matches what I paid at the physical store.",
    "Very affordable compared to other brands and works just as well.",
    "Not worth the premium price. Mediocre at best.",
  ],
  "User Experience": [
    "The app is intuitive and the checkout process is effortless.",
    "The website keeps crashing when I try to pay. Extremely frustrating.",
    "Clean design, easy navigation and the search actually finds what I need.",
    "Confusing menus and too many pop-ups. I gave up halfway.",
    "The app has a light mode and a dark mode in the settings.",
    "Love the new update. The dashboard is so much faster and smoother!",
    "Login fails every time with an unclear error message. Unusable.",
    "Setting up the smart plug took two minutes. Seamless experience.",
    "The interface is cluttered and outdated compared to similar apps.",
    "You can save items to a wishlist and share it with friends.",
    "Really enjoy using the app. Notifications are useful, not annoying.",
    "The checkout page freezes on mobile and my cart was emptied. Very annoying.",
    "Helpful onboarding tutorial that explains every feature clearly.",
    "The app is slow and laggy on older phones.",
    "Account settings can be changed from the profile page.",
    "Brilliant redesign. Everything is exactly where I expect it to be.",
    "Too many steps to reset a password. A painful process.",
    "The product filter works well and the photos load quickly.",
    "The app requires Android 10 or later to install.",
    "Buggy update. Half the features stopped working after installing it.",
    "Simple, elegant and fun to use. My favourite shopping app.",
    "Navigation is okay but the font is tiny and hard to read.",
    "Voice search is a handy feature and surprisingly accurate.",
    "The redesign made it difficult to find my order history. Clunky and confusing.",
  ],
};

export interface RawRecord {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  category: string;
}

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function buildSampleDataset(): RawRecord[] {
  const rand = lcg(20260101);
  const start = Date.UTC(2026, 0, 3);
  const span = 177; // days, Jan -> late June 2026
  const out: RawRecord[] = [];
  CATEGORIES.forEach((cat) => {
    REVIEWS[cat].forEach((text) => {
      const day = Math.floor(rand() * span);
      const d = new Date(start + day * 86400000);
      out.push({ id: "", date: d.toISOString().slice(0, 10), text, category: cat });
    });
  });
  out.sort((a, b) => a.date.localeCompare(b.date));
  return out.map((r, i) => ({ ...r, id: `R-${String(i + 1).padStart(3, "0")}` }));
}
