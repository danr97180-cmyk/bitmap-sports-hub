import type { League, Team } from "./types";

export const TEAMS: Record<string, Team> = {
  ars: { id: "ars", short: "ARS", color: "25", name: { en: "Arsenal", ar: "أرسنال", he: "ארסנל" } },
  liv: { id: "liv", short: "LIV", color: "20", name: { en: "Liverpool", ar: "ليفربول", he: "ליברפול" } },
  mci: { id: "mci", short: "MCI", color: "230", name: { en: "Manchester City", ar: "مانشستر سيتي", he: "מנצ'סטר סיטי" } },
  che: { id: "che", short: "CHE", color: "260", name: { en: "Chelsea", ar: "تشيلسي", he: "צ'לסי" } },
  tot: { id: "tot", short: "TOT", color: "270", name: { en: "Tottenham", ar: "توتنهام", he: "טוטנהאם" } },
  new: { id: "new", short: "NEW", color: "0", name: { en: "Newcastle", ar: "نيوكاسل", he: "ניוקאסל" } },

  rma: { id: "rma", short: "RMA", color: "90", name: { en: "Real Madrid", ar: "ريال مدريد", he: "ריאל מדריד" } },
  bar: { id: "bar", short: "BAR", color: "300", name: { en: "Barcelona", ar: "برشلونة", he: "ברצלונה" } },
  atm: { id: "atm", short: "ATM", color: "15", name: { en: "Atlético Madrid", ar: "أتلتيكو مدريد", he: "אתלטיקו מדריד" } },
  sev: { id: "sev", short: "SEV", color: "35", name: { en: "Sevilla", ar: "إشبيلية", he: "סביליה" } },
  rso: { id: "rso", short: "RSO", color: "240", name: { en: "Real Sociedad", ar: "ريال سوسيداد", he: "ריאל סוסיאדד" } },
  vil: { id: "vil", short: "VIL", color: "95", name: { en: "Villarreal", ar: "فياريال", he: "ויאריאל" } },

  hil: { id: "hil", short: "HIL", color: "250", name: { en: "Al Hilal", ar: "الهلال", he: "אל-הילאל" } },
  nas: { id: "nas", short: "NAS", color: "85", name: { en: "Al Nassr", ar: "النصر", he: "אל-נסר" } },
  itt: { id: "itt", short: "ITT", color: "80", name: { en: "Al Ittihad", ar: "الاتحاد", he: "אל-איתיחאד" } },
  ahl: { id: "ahl", short: "AHL", color: "150", name: { en: "Al Ahli", ar: "الأهلي", he: "אל-אהלי" } },
  sha: { id: "sha", short: "SHA", color: "45", name: { en: "Al Shabab", ar: "الشباب", he: "אל-שבאב" } },
  ett: { id: "ett", short: "ETT", color: "140", name: { en: "Al Ettifaq", ar: "الاتفاق", he: "אל-אתיפאק" } },

  mta: { id: "mta", short: "MTA", color: "90", name: { en: "Maccabi Tel Aviv", ar: "مكابي تل أبيب", he: "מכבי תל אביב" } },
  mhf: { id: "mhf", short: "MHF", color: "145", name: { en: "Maccabi Haifa", ar: "مكابي حيفا", he: "מכבי חיפה" } },
  hbs: { id: "hbs", short: "HBS", color: "25", name: { en: "Hapoel Be'er Sheva", ar: "هبوعيل بئر السبع", he: "הפועל באר שבע" } },
  bej: { id: "bej", short: "BEJ", color: "75", name: { en: "Beitar Jerusalem", ar: "بيتار القدس", he: "בית\"ר ירושלים" } },
  hta: { id: "hta", short: "HTA", color: "28", name: { en: "Hapoel Tel Aviv", ar: "هبوعيل تل أبيب", he: "הפועל תל אביב" } },
  bsk: { id: "bsk", short: "BSK", color: "15", name: { en: "Bnei Sakhnin", ar: "أبناء سخنين", he: "בני סכנין" } },
};

export const LEAGUES: League[] = [
  {
    id: "epl",
    flag: "🏴",
    name: { en: "Premier League", ar: "الدوري الإنجليزي الممتاز", he: "הפרמייר ליג" },
    country: { en: "England", ar: "إنجلترا", he: "אנגליה" },
    teamIds: ["ars", "liv", "mci", "che", "tot", "new"],
  },
  {
    id: "laliga",
    flag: "🇪🇸",
    name: { en: "La Liga", ar: "الدوري الإسباني", he: "לה ליגה" },
    country: { en: "Spain", ar: "إسبانيا", he: "ספרד" },
    teamIds: ["rma", "bar", "atm", "sev", "rso", "vil"],
  },
  {
    id: "spl",
    flag: "🇸🇦",
    name: { en: "Saudi Pro League", ar: "دوري روشن السعودي", he: "הליגה הסעודית" },
    country: { en: "Saudi Arabia", ar: "السعودية", he: "ערב הסעודית" },
    teamIds: ["hil", "nas", "itt", "ahl", "sha", "ett"],
  },
  {
    id: "ligat",
    flag: "🇮🇱",
    name: { en: "Israeli Premier League", ar: "الدوري الإسرائيلي الممتاز", he: "ליגת העל" },
    country: { en: "Israel", ar: "إسرائيل", he: "ישראל" },
    teamIds: ["mta", "mhf", "hbs", "bej", "hta", "bsk"],
  },
];

export const getLeague = (id: string) => LEAGUES.find((l) => l.id === id);
export const getTeam = (id: string) => TEAMS[id];
