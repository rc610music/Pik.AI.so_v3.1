export enum ArtStyle {
  PHOTOREALISTIC = "Photorealistic",
  WATERCOLOR = "Watercolor",
  OIL_PAINTING = "Oil Painting",
  PIXEL_ART = "Pixel Art",
  ANIME_MANGA = "Anime/Manga",
  CARTOON = "Cartoon",
  STEAMPUNK = "Steampunk",
  CYBERPUNK = "Cyberpunk",
  FANTASY_ART = "Fantasy Art",
  ABSTRACT = "Abstract",
  SURREALISM = "Surrealism",
  POP_ART = "Pop Art",
  MINIMALIST = "Minimalist",
  THREE_D_RENDER = "3D Render",
  SKETCH_LINE_ART = "Sketch/Line Art",
  VINTAGE_COMIC = "Vintage Comic Book Art",
  IMPRESSIONISTIC = "Impressionistic",
  GOTHIC_ART = "Gothic Art",
  NEON_PUNK = "Neon Punk",
  CONCEPT_ART = "Concept Art",
  HAUTE_COUTURE = "Haute Couture & High Fashion",
  RENAISSANCE_CHIAROSCURO = "Renaissance Chiaroscuro",
  GILDED_GOLD_LEAF = "Gilded Gold Leaf & Baroque",
  WABI_SABI_MINIMAL = "Wabi-Sabi Organic Minimalist",
  AVANT_GARDE_EXPRESSIONISM = "Avant-Garde Expressionism",
  NEOCLASSICAL_MARBLE = "Neoclassical Polished Marble",
  ROYAL_EMPIRE_VINTAGE = "Royal Empire Vintage Tapestry",
  ART_DECO_ILLUSTRATION = "Art Deco Luxury Illustration",
  HYPER_REALISTIC_JEWELRY = "Hyper-Realistic Fine Jewelry Rendering",
  EDITORIAL_PHOTOGRAPHY = "Vogue Editorial Studio Photography",
  IMPERIAL_MATTE_PORCELAIN = "Imperial Matte Porcelain & Jade"
}

export interface ArtStyleOption {
  value: ArtStyle;
  label: string;
}

export enum SignatureStyle {
  ELEGANT_SCRIPT = "Elegant Script",
  BOLD_MODERN = "Bold & Modern",
  MINIMALIST_LINE = "Minimalist Line Art",
  BRUSH_STROKE = "Brush Stroke",
  VINTAGE_CALLIGRAPHY = "Vintage Calligraphy",
  GRAFFITI_TAG = "Graffiti Tag",
  TECH_DIGITAL = "Tech/Digital",
  FUTURISTIC_CIRCUIT = "Futuristic Circuit",
  ART_NOUVEAU = "Art Nouveau",
  HORROR_DRIP = "Horror Drip",
  WILDSTYLE_GRAFFITI = "Wildstyle Graffiti",
  MEDIEVAL_ILLUMINATION = "Medieval Illumination",
  NEON_NOIR = "Neon Noir",
  WATERCOLOR_SPLASH = "Watercolor Splash",
  DELICATE_BOTANICAL = "Delicate Botanical",
  ROYAL_CHANCERY = "Royal Chancery Script",
  PLATINUM_LUXURY = "Platinum Luxury Monoline",
  FRENCH_CURSIVE = "French Atelier Cursive",
  HIGH_FASHION_MINIMAL = "High-Fashion Minimalist Serif",
  MAJESTIC_CALLIGRAPHY = "Majestic Copperplate Calligraphy",
  SOPHISTICATED_SIGNATURE = "Sophisticated Executive Pen",
  GOTHIC_BLACKLETTER = "Gothic Blackletter & Gold Embossed",
  MINIMALIST_ARCHITECT = "Minimalist Architect Draft"
}

export interface SignatureStyleOption {
  value: SignatureStyle;
  label: string;
}

export enum TypographyStyle {
  CHROME_3D = "3D Chrome",
  FLORAL = "Floral",
  WOODEN_BLOCK = "Wooden Block",
  NEON_GLOW = "Neon Glow",
  GLITCH_EFFECT = "Glitch Effect",
  WATERCOLOR = "Watercolor Splash",
  GOLD_FOIL = "Golden Foil",
  STONE_CARVED = "Stone Carved",
  STEAMPUNK_GEARS = "Steampunk Gears",
  VINTAGE_LETTERPRESS = "Vintage Letterpress",
  HOLOGRAPHIC = "Holographic",
  RETRO_WAVE = "Retro Wave",
  COMIC_BOOK_BURST = "Comic Book Burst",
  HAND_DRAWN_CHALK = "Hand-drawn Chalk",
  INK_BLEED = "Ink Bleed",
  ART_DECO = "Art Deco",
  ROSE_GOLD_CHROME = "3D Rose Gold Chrome",
  STAINED_GLASS_CATHEDRAL = "Stained Glass Cathedral",
  DIAMOND_CRUSTED = "Diamond-Crusted Haute Jewelry",
  ONYX_MARBLE_INLAY = "Onyx & Polished Marble Inlay",
  GILDED_FILIGREE = "Gilded Filigree & Vintage Lace",
  AVANT_GARDE_GEOMETRIC = "Avant-Garde Luxury Geometric",
  EMERALD_ENAMEL = "Imperial Emerald & Gold Enamel",
  SILK_RIBBON_FLOW = "Fluid Silk Ribbon Cursive"
}

export interface TypographyStyleOption {
  value: TypographyStyle;
  label: string;
}

export enum MonogramStyle {
  CLASSIC_SHIELD = "Classic Shield",
  MODERN_MINIMALIST = "Modern Minimalist",
  VINTAGE_FLORAL = "Vintage Floral",
  ART_DECO_GEOMETRIC = "Art Deco Geometric",
  INTERLOCKING_SCRIPT = "Interlocking Script",
  TRIBAL_INSPIRED = "Tribal-Inspired",
  VICTORIAN_ORNATE = "Victorian Ornate",
  CELTIC_KNOT = "Celtic Knot",
  NAUTICAL_ROPE = "Nautical Rope",
  HAUTE_COUTURE_INTERLOCK = "Haute Couture Interlocking Seal",
  HERALDIC_CREST = "Royal Heraldic Crest & Lion",
  ROLEX_CHRONO_MINIMAL = "Sleek Horology Chronometer Line",
  GILDED_FILIGREE_SHIELD = "Gilded Filigree & Shield",
  CHELSEA_MANOR_VICTORIAN = "Chelsea Manor Ornate Victorian",
  LUXURY_YACHT_CLUB = "Luxury Yacht Club Monogram",
  EMPERORS_JADE_SEAL = "Emperor's Jade & Vermillion Seal"
}

export interface MonogramStyleOption {
  value: MonogramStyle;
  label: string;
}

export enum LogoStyle {
    ABSTRACT_MARK = "Abstract Mark",
    MASCOT = "Mascot",
    COMBINATION_MARK = "Combination Mark",
    EMBLEM = "Emblem",
    LETTERMARK = "Lettermark (Monogram)",
    WORDMARK = "Wordmark (Logotype)",
    GEOMETRIC = "Geometric",
    MINIMALIST = "Minimalist",
    VINTAGE_RETRO = "Vintage/Retro",
    HAND_DRAWN = "Hand-drawn",
    HAUTE_COUTURE_EMBLEM = "Haute Couture Luxe Emblem",
    MINIMALIST_PREMIUM_LINE = "Minimalist Premium Monoline",
    HERITAGE_LUXURY_INSIGNIA = "Heritage Luxury Insignia",
    NEO_NOIR_CYBER_LUXE = "Neo-Noir Cyber Luxe Wordmark",
    SWISS_CHRONO_GEOMETRIC = "Swiss Chrono Luxury Geometric",
    AVANT_GARDE_SCULPTURE = "Avant-Garde Architectural Sculpture"
}

export interface LogoStyleOption {
    value: LogoStyle;
    label: string;
}

export enum BrandStyle {
  TECH_MINIMAL = "Futuristic Tech Minimal",
  GOLD_LUXURY = "Golden Luxury & Premium",
  NEON_CYBER = "Neon Cyberpunk & Synthwave",
  ECO_ORGANIC = "Biophilic Eco-Organic",
  SWISS_BRUTALISM = "Swiss Brutalism & Modern",
  VINTAGE_HERITAGE = "Vintage Heritage & Classic",
  COSMIC_NEBULA = "Cosmic Nebula & Galactic",
  BAUHAUS_PLAYFUL = "Bauhaus Playful Geometric",
  MINIMALIST_NORDIC = "Minimalist Nordic & Clean",
  HAUTE_COUTURE_ATELIER = "Haute Couture Atelier & Editorial",
  IMPERIAL_PALACE = "Imperial Palace Royal Heritage",
  SOPHISTICATED_WINE_ESTATE = "Sophisticated Wine Estate Heritage",
  CHELSEA_TOWNHOUSE = "Chelsea Townhouse Classic Elegance",
  MONACO_YACHTING = "Monaco Riviera Yachting & Luxe",
  AVANT_GARDE_GALLERY = "Avant-Garde Art Gallery Modernism"
}

export interface BrandStyleOption {
  value: BrandStyle;
  label: string;
}

export interface BrandPackData {
  companyName: string;
  industry: string;
  style: BrandStyle;
  slogan: string;
  story: string;
  pillars: { title: string; description: string; }[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    primaryName: string;
    secondaryName: string;
    accentName: string;
    backgroundName: string;
    primaryDesc: string;
    secondaryDesc: string;
    accentDesc: string;
    backgroundDesc: string;
  };
  typography: {
    headingFont: string;
    headingFontUrl: string;
    bodyFont: string;
    bodyFontUrl: string;
    pairDescription: string;
  };
  assets: {
    logoPrompt: string;
    businessCardPrompt: string;
    bannerPrompt: string;
  };
}

export interface AiAnalysis {
  explanation: string;
  suggestions: string[];
}

export type DownloadFormat = 'image/jpeg' | 'image/png';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent1: string;
  accent2: string;
}