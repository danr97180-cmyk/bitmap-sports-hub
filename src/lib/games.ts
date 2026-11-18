import penalty from "@/assets/game-penalty.jpg";
import blocks from "@/assets/game-blocks.jpg";
import space from "@/assets/game-space.jpg";
import trivia from "@/assets/game-trivia.jpg";
import arcade from "@/assets/banner-arcade.jpg";
import rewards from "@/assets/banner-rewards.jpg";
import type { LocalizedText } from "./i18n/dictionaries";

export type GameCategory = "sports" | "arcade" | "puzzle" | "trivia";

export interface Game {
  id: string;
  name: LocalizedText;
  category: GameCategory;
  image: string;
  isNew?: boolean;
  popular?: boolean;
}

/** Original BITMAP free-play titles. No stakes; rounds award virtual points only. */
export const GAMES: Game[] = [
  { id: "penalty-pixel", category: "sports", image: penalty, isNew: true, popular: true, name: { en: "Penalty Pixel", ar: "ركلة البكسل", he: "פנדל פיקסל" } },
  { id: "stack-glow", category: "puzzle", image: blocks, isNew: true, name: { en: "Stack Glow", ar: "مكعبات متوهجة", he: "מגדל זוהר" } },
  { id: "astro-bit", category: "arcade", image: space, popular: true, name: { en: "Astro Bit", ar: "أسترو بت", he: "אסטרו ביט" } },
  { id: "pitch-quiz", category: "trivia", image: trivia, isNew: true, popular: true, name: { en: "Pitch Quiz", ar: "تحدي الملعب", he: "חידון המגרש" } },
  { id: "neon-run", category: "arcade", image: arcade, name: { en: "Neon Run", ar: "سباق النيون", he: "ריצת ניאון" } },
  { id: "hex-match", category: "puzzle", image: rewards, popular: true, name: { en: "Hex Match", ar: "تطابق السداسيات", he: "התאמת משושים" } },
];
