/**
 * The Palm Garden — carte.
 * Prices are in Tunisian dinars (DT). 8 => "8,000 DT".
 * Edit this file to update the menu; the UI rebuilds itself from it.
 */

export interface Price {
  /** Size / format label, e.g. "Dose", "20cl", "1L". Omit for a single price. */
  label?: string;
  value: number;
}

export interface MenuItem {
  name: string;
  /** Small secondary line under the name. */
  note?: string;
  prices: Price[];
}

export interface MenuCategory {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
}

export interface MenuSection {
  id: 'drinks' | 'food';
  title: string;
  categories: MenuCategory[];
}

const p = (value: number): Price[] => [{ value }];

export const CURRENCY = 'DT';

export const CORKAGE_FEE = 200;

/**
 * Happy hour. Set `enabled: false` to switch it off everywhere (menu banner,
 * discounted prices and the /happy-hour page). `hours` is optional, e.g. '18h – 20h'.
 */
export const HAPPY_HOUR = {
  enabled: true,
  categoryId: 'bieres',
  discount: 1,
  hours: '' as string,
};

/** Happy-hour price for an item in `categoryId`, or null when no offer applies. */
export function happyPrice(categoryId: string, value: number): number | null {
  if (!HAPPY_HOUR.enabled || categoryId !== HAPPY_HOUR.categoryId) return null;
  return Math.max(0, value - HAPPY_HOUR.discount);
}

export const MENU: MenuSection[] = [
  {
    id: 'drinks',
    title: 'Boissons',
    categories: [
      {
        id: 'bieres',
        title: 'Bières',
        subtitle: 'Bien fraîches',
        items: [
          { name: 'Celtia', prices: p(8) },
          { name: 'Amstel', prices: p(8) },
          { name: "Beck's", prices: p(9) },
          { name: 'Heineken', prices: p(9) },
        ],
      },
      {
        id: 'softs',
        title: 'Softs',
        subtitle: 'Sans alcool',
        items: [
          { name: 'Soda', prices: p(6) },
          { name: 'Safia', note: 'Eau minérale', prices: p(6) },
          { name: 'Red Bull', prices: p(15) },
        ],
      },
      {
        id: 'vins',
        title: 'Vins',
        subtitle: 'À la bouteille',
        items: [
          { name: 'Magon Rosé', prices: p(50) },
          { name: 'Magon Blanc', prices: p(55) },
          { name: 'Magon Rouge', prices: p(60) },
          { name: 'Vieux Magon', prices: p(80) },
          { name: 'Jour et Nuit Rosé', prices: p(70) },
          { name: 'Jour et Nuit Blanc', prices: p(70) },
          { name: 'Désiré', prices: p(70) },
          { name: 'Soltane Rosé', prices: p(75) },
          { name: 'Soltane Blanc', prices: p(75) },
        ],
      },
      {
        id: 'shots',
        title: 'Shots & Apéritifs',
        subtitle: 'À la dose',
        items: [
          { name: 'Ricard', prices: p(10) },
          { name: 'Tequila', note: 'Shot', prices: p(10) },
          { name: 'Thibarine', prices: p(10) },
          { name: 'Jet 27', prices: p(15) },
        ],
      },
      {
        id: 'vodka',
        title: 'Vodka',
        subtitle: 'Dose ou bouteille',
        items: [
          {
            name: 'Absolut',
            prices: [
              { label: 'Dose', value: 16 },
              { label: '20cl', value: 75 },
              { label: '½L', value: 180 },
              { label: '1L', value: 360 },
            ],
          },
          {
            name: 'Smirnoff',
            prices: [
              { label: '20cl', value: 70 },
              { label: '½L', value: 170 },
              { label: '1L', value: 320 },
            ],
          },
          { name: 'Belvedere', prices: p(550) },
          { name: 'Grey Goose', prices: p(550) },
          { name: 'Roberto Cavalli', prices: p(570) },
          { name: 'Cîroc', prices: p(650) },
          { name: 'Beluga', prices: p(700) },
        ],
      },
      {
        id: 'whisky',
        title: 'Whisky',
        subtitle: 'Dose ou bouteille',
        items: [
          {
            name: 'Red Label',
            note: 'Johnnie Walker',
            prices: [
              { label: 'Dose', value: 18 },
              { label: '20cl', value: 100 },
              { label: '½L', value: 225 },
              { label: '1L', value: 380 },
            ],
          },
          {
            name: 'Black Label',
            note: 'Johnnie Walker',
            prices: [
              { label: 'Dose', value: 24 },
              { label: '20cl', value: 140 },
              { label: '½L', value: 320 },
              { label: '1L', value: 550 },
            ],
          },
          {
            name: 'Jack Daniel’s',
            prices: [
              { label: 'Dose', value: 22 },
              { label: '1L', value: 530 },
            ],
          },
          { name: 'Ballantine’s', prices: p(360) },
          { name: 'Chivas Regal', prices: p(500) },
          { name: 'Double Black', note: 'Johnnie Walker · 1L', prices: p(650) },
        ],
      },
      {
        id: 'gin',
        title: 'Gin & Liqueurs',
        subtitle: 'Dose ou bouteille',
        items: [
          {
            name: 'Gin',
            prices: [
              { label: 'Dose', value: 16 },
              { label: '1L', value: 340 },
            ],
          },
          {
            name: 'Jägermeister',
            prices: [
              { label: 'Dose', value: 15 },
              { label: '1L', value: 360 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'food',
    title: 'Cuisine',
    categories: [
      {
        id: 'tapas',
        title: 'Tapas',
        subtitle: 'À partager',
        items: [
          { name: 'Mezza Terre', prices: p(60) },
          { name: 'Mezza Mer', prices: p(90) },
          { name: 'Crevettes sautées à l’ail', prices: p(28) },
          { name: 'Seiches sautées à l’ail', prices: p(32) },
          { name: 'Calamars dorés', prices: p(30) },
          { name: 'Assiette de fromage', prices: p(22) },
          { name: 'Assiette de fruits', prices: p(20) },
          { name: 'Assiette de frites', prices: p(10) },
          { name: 'Chips', prices: p(5) },
        ],
      },
      {
        id: 'viandes',
        title: 'Viandes',
        subtitle: 'Émincés',
        items: [
          { name: 'Émincé de poulet', prices: p(28) },
          { name: 'Émincé de veau', prices: p(36) },
        ],
      },
      {
        id: 'pates',
        title: 'Pâtes',
        subtitle: 'Spaghetti ou fell',
        items: [
          { name: 'Bolognaise', note: 'Spaghetti ou fell', prices: p(30) },
          { name: 'Fruits de mer', note: 'Spaghetti ou fell', prices: p(38) },
        ],
      },
      {
        id: 'pizza',
        title: 'Pizzas',
        subtitle: 'Au choix',
        items: [
          { name: 'Pizza Neptune', prices: p(25) },
          { name: 'Pizza 4 Saisons', prices: p(25) },
          { name: 'Pizza 4 Fromages', prices: p(28) },
          { name: 'Pizza Steak haché', prices: p(28) },
          { name: 'Pizza Fruits de mer', prices: p(30) },
        ],
      },
    ],
  },
];

/** 8 -> "8,000" (Tunisian notation, 3 decimals). */
export function formatPrice(value: number): string {
  return value.toFixed(3).replace('.', ',');
}
