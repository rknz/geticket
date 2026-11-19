export interface StationOption {
  code: string;
  nameEn: string;
  nameBn: string;
}

export interface StaticTrainReference {
  trainNumber: string;
  nameEn: string;
  nameBn: string;
  corridor: string;
  offDay: string;
  isStaticReference: true;
}

/**
 * Common Bangladesh Railway station reference list for quick selection & autocomplete.
 * Users can also type any other station name freely.
 */
export const POPULAR_STATIONS: readonly StationOption[] = [
  { code: "DHK", nameEn: "Dhaka", nameBn: "ঢাকা (কমলাপুর)" },
  { code: "BBDR", nameEn: "Biman Bandar", nameBn: "বিমানবন্দর" },
  { code: "JYDP", nameEn: "Joydebpur", nameBn: "জয়দেবপুর" },
  { code: "MYN", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ" },
  { code: "JML", nameEn: "Jamalpur Town", nameBn: "জামালপুর টাউন" },
  { code: "DWG", nameEn: "Dewanganj Bazar", nameBn: "দেওয়ানগঞ্জ বাজার" },
  { code: "CTG", nameEn: "Chattogram", nameBn: "চট্টগ্রাম" },
  { code: "CXB", nameEn: "Cox's Bazar", nameBn: "কক্সবাজার" },
  { code: "SYL", nameEn: "Sylhet", nameBn: "সিলেট" },
  { code: "RJS", nameEn: "Rajshahi", nameBn: "রাজশাহী" },
  { code: "KLN", nameEn: "Khulna", nameBn: "খুলনা" },
  { code: "RNG", nameEn: "Rangpur", nameBn: "রংপুর" },
  { code: "DNP", nameEn: "Dinajpur", nameBn: "দিনাজপুর" },
  { code: "CML", nameEn: "Cumilla", nameBn: "কুমিল্লা" },
  { code: "FNI", nameEn: "Feni", nameBn: "ফেনী" },
  { code: "BHB", nameEn: "Bhairab Bazar", nameBn: "ভৈরব বাজার" },
  { code: "KSH", nameEn: "Kishoreganj", nameBn: "কিশোরগঞ্জ" },
  { code: "NTR", nameEn: "Netrakona", nameBn: "নেত্রকোনা" },
  { code: "TGL", nameEn: "Tangail", nameBn: "টাঙ্গাইল" },
  { code: "ISH", nameEn: "Ishwardi", nameBn: "ঈশ্বরদী" },
  { code: "BOG", nameEn: "Bogura", nameBn: "বগুড়া" },
  { code: "PNC", nameEn: "Panchagarh", nameBn: "পঞ্চগড়" },
] as const;

/**
 * Dated static reference list of well-known intercity trains for easy selection.
 * Not a live schedule feed; always verify current running days on official Railway pages.
 */
export const STATIC_TRAIN_REFERENCES: readonly StaticTrainReference[] = [
  {
    trainNumber: "707",
    nameEn: "Tista Express",
    nameBn: "তিস্তা এক্সপ্রেস",
    corridor: "Dhaka ↔ Mymensingh ↔ Jamalpur ↔ Dewanganj",
    offDay: "Monday",
    isStaticReference: true,
  },
  {
    trainNumber: "743",
    nameEn: "Brahmaputra Express",
    nameBn: "ব্রহ্মপুত্র এক্সপ্রেস",
    corridor: "Dhaka ↔ Mymensingh ↔ Jamalpur ↔ Dewanganj",
    offDay: "None",
    isStaticReference: true,
  },
  {
    trainNumber: "735",
    nameEn: "Agnibina Express",
    nameBn: "অগ্নিবীণা এক্সপ্রেস",
    corridor: "Dhaka ↔ Mymensingh ↔ Jamalpur ↔ Tarakandi",
    offDay: "None",
    isStaticReference: true,
  },
  {
    trainNumber: "745",
    nameEn: "Jamuna Express",
    nameBn: "যমুনা এক্সপ্রেস",
    corridor: "Dhaka ↔ Mymensingh ↔ Jamalpur ↔ Tarakandi",
    offDay: "None",
    isStaticReference: true,
  },
  {
    trainNumber: "777",
    nameEn: "Haor Express",
    nameBn: "হাওর এক্সপ্রেস",
    corridor: "Dhaka ↔ Mymensingh ↔ Netrakona ↔ Mohanganj",
    offDay: "Friday",
    isStaticReference: true,
  },
  {
    trainNumber: "701",
    nameEn: "Subarna Express",
    nameBn: "সুবর্ণ এক্সপ্রেস",
    corridor: "Dhaka ↔ Chattogram",
    offDay: "Monday",
    isStaticReference: true,
  },
  {
    trainNumber: "787",
    nameEn: "Sonar Bangla Express",
    nameBn: "সোনার বাংলা এক্সপ্রেস",
    corridor: "Dhaka ↔ Chattogram",
    offDay: "Tuesday",
    isStaticReference: true,
  },
  {
    trainNumber: "813",
    nameEn: "Cox's Bazar Express",
    nameBn: "কক্সবাজার এক্সপ্রেস",
    corridor: "Dhaka ↔ Chattogram ↔ Cox's Bazar",
    offDay: "Monday / Tuesday",
    isStaticReference: true,
  },
  {
    trainNumber: "709",
    nameEn: "Parabat Express",
    nameBn: "পারাবত এক্সপ্রেস",
    corridor: "Dhaka ↔ Sylhet",
    offDay: "Monday",
    isStaticReference: true,
  },
  {
    trainNumber: "753",
    nameEn: "Silkcity Express",
    nameBn: "সিল্কসিটি এক্সপ্রেস",
    corridor: "Dhaka ↔ Rajshahi",
    offDay: "Sunday",
    isStaticReference: true,
  },
  {
    trainNumber: "725",
    nameEn: "Sundarban Express",
    nameBn: "সুন্দরবন এক্সপ্রেস",
    corridor: "Dhaka ↔ Khulna",
    offDay: "Tuesday / Wednesday",
    isStaticReference: true,
  },
  {
    trainNumber: "771",
    nameEn: "Rangpur Express",
    nameBn: "রংপুর এক্সপ্রেস",
    corridor: "Dhaka ↔ Rangpur",
    offDay: "Monday",
    isStaticReference: true,
  },
] as const;

export const CLASS_OPTIONS = [
  { code: "S_CHAIR", labelEn: "Shovon Chair", labelBn: "শোভন চেয়ার" },
  { code: "SNIGDHA", labelEn: "Snigdha (AC Chair)", labelBn: "স্নিগ্ধা (এসি চেয়ার)" },
  { code: "F_CHAIR", labelEn: "First Class Chair", labelBn: "প্রথম শ্রেণি চেয়ার" },
  { code: "AC_S", labelEn: "AC Seat", labelBn: "এসি সিট" },
  { code: "AC_B", labelEn: "AC Berth", labelBn: "এসি বার্থ" },
  { code: "SHOVAN", labelEn: "Shovon", labelBn: "শোভন" },
] as const;
