// Demo catalogue mirroring supabase/seed.sql — used only when Supabase env vars are missing,
// so the storefront can be previewed before the database is connected.
import type { Category, Product } from "./types";

const U = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const demoCategories: Category[] = [
  { id: "c1", name: "Furniture", slug: "furniture", description: "Sculpted seating, tables and storage made to last.", image_url: U("1586023492125-27b2c045efd7"), sort_order: 1 },
  { id: "c2", name: "Lighting", slug: "lighting", description: "Pendants, lamps and sconces that set the mood.", image_url: U("1615529182904-14819c35db37"), sort_order: 2 },
  { id: "c3", name: "Decor", slug: "decor", description: "Vessels, candles and objects for the considered shelf.", image_url: U("1532372320572-cda25653a26d"), sort_order: 3 },
  { id: "c4", name: "Textiles", slug: "textiles", description: "Cushions, throws and rugs in natural fibres.", image_url: U("1522771739844-6a9f6d5f14af"), sort_order: 4 },
  { id: "c5", name: "Wall Art", slug: "wall-art", description: "Frames, prints and gallery sets for every wall.", image_url: U("1513519245088-0e12902e5a38"), sort_order: 5 },
];

type Row = [string, string, string, string, number, number | null, number, string[], string, string, boolean];
const rows: Row[] = [
  ["Verdant Velvet Sofa", "A deep three-seater in emerald cotton velvet.", "Generous proportions, a tight back and softly tapered oak legs. Built on a kiln-dried hardwood frame with high-resilience foam wrapped in feather down.", "c1", 84900, 96000, 6, ["1555041469-a586c61ea9bc", "1493663284031-b7e3aefcae8e"], "Cotton velvet, solid oak, hardwood frame", "W 214 × D 92 × H 78 cm", true],
  ["Saffron Lounge Chair", "A sculpted armchair in mustard bouclé.", "Low, wide and quietly glamorous. Upholstered in a textured bouclé with a sweeping curved back.", "c1", 32500, null, 10, ["1616627547584-bf28cee262db", "1586023492125-27b2c045efd7"], "Bouclé, beech wood", "W 78 × D 80 × H 74 cm", true],
  ["Ivory Tufted Armchair", "Button-tufted wingback in ivory linen blend.", "A modern take on the wingback — crisp ivory upholstery, hand-tufted buttons and slender turned legs.", "c1", 27900, 31500, 8, ["1567538096630-e0c55bd6374c"], "Linen blend, mango wood", "W 72 × D 76 × H 98 cm", false],
  ["Terracotta Modular Sofa", "Low-slung modular sofa in burnt-orange weave.", "Arrange it as a three-seater or split it into a pair of lounge seats.", "c1", 112000, null, 3, ["1567016432779-094069958ea5"], "Woven polyester-linen, pine frame", "W 240 × D 98 × H 70 cm", true],
  ["Ash Counter Stool", "A pared-back stool in whitewashed ash.", "Joinery-led and refreshingly simple: four splayed legs, a footrest rail and a softly dished seat.", "c1", 8900, null, 24, ["1503602642458-232111445657"], "Solid ash", "Ø 34 × H 65 cm", false],
  ["Shell Dining Chair", "Moulded shell seat on a wire-and-oak base.", "A mid-century silhouette for the dining table or the desk.", "c1", 7400, 8200, 30, ["1581539250439-c96689b516dd", "1592078615290-033ee584e267"], "Polypropylene, steel, beech", "W 46 × D 54 × H 81 cm", false],
  ["Linen Bench with Cushions", "Leather-strap bench dressed in linen cushions.", "An entryway or bed-end bench with a woven leather seat.", "c1", 21500, null, 7, ["1579656381226-5fc0f0100c3b"], "Teak, vegetable-tanned leather, linen", "W 120 × D 40 × H 45 cm", false],
  ["Lagoon Pendant", "A spun-metal dome pendant in matte white.", "Clean lines and a warm downlight, spun from a single sheet of aluminium.", "c2", 6900, null, 20, ["1513506003901-1e6a229e2d15"], "Spun aluminium, fabric cord", "Ø 30 × H 22 cm", true],
  ["Copper Dome Pendant Trio", "Three polished-copper domes on a shared canopy.", "A statement over the dining table — three hand-polished copper domes hung at staggered heights.", "c2", 18500, 21000, 9, ["1540932239986-30128078f3c5", "1615529182904-14819c35db37"], "Copper, steel", "Each Ø 25 cm", true],
  ["Atelier Task Lamp", "An articulated desk lamp in graphite.", "Adjustable at every joint, weighted at the base and finished in graphite.", "c2", 5400, null, 18, ["1507473885765-e6ed057f782c"], "Powder-coated steel", "H 52 cm", false],
  ["Alba Stoneware Vase", "A wide-shouldered vase in chalk-white glaze.", "Hand-thrown in Khurja and finished in a satin chalk glaze.", "c3", 3200, null, 40, ["1612196808214-b8e1d6145a8c"], "Stoneware", "Ø 18 × H 26 cm", true],
  ["Mist Vessel Set", "Two tall vessels in a soft graphite glaze.", "A pair of slender bottle vases in complementary heights.", "c3", 4600, 5200, 25, ["1565193566173-7a0ee3dbe261"], "Ceramic", "H 32 & 24 cm", false],
  ["Sand & Stone Planter Duo", "Two ceramic planters with a raw clay base.", "Half-dipped glaze over raw terracotta, with drainage holes.", "c3", 2800, null, 32, ["1610701596007-11502861dcfa"], "Terracotta, glaze", "Ø 16 & 12 cm", false],
  ["Ember Hand-poured Candle", "Soy wax candle with notes of oud and amber.", "Hand-poured in small batches into a smoked-glass vessel.", "c3", 1450, null, 80, ["1602874801007-bd458bb1b8b6"], "Soy wax, cotton wick", "300 g", true],
  ["Floating Oak Shelf", "A slim wall shelf with concealed brackets.", "One solid oak plank, no visible fixings.", "c3", 3900, null, 22, ["1594026112284-02bb6f3352fe"], "Solid oak", "W 80 × D 20 cm", false],
  ["Marigold Linen Cushion", "Stonewashed linen cushion with feather insert.", "Pure European linen, stonewashed for softness.", "c4", 1900, null, 60, ["1584100936595-c0654b55a2e2"], "Linen, duck feather", "50 × 50 cm", false],
  ["Handwoven Jute Rug", "Flat-woven jute rug with a bound edge.", "Woven by hand in Bhadohi from natural jute.", "c4", 12500, 14900, 12, ["1600166898405-da9535204843"], "Natural jute", "170 × 240 cm", true],
  ["Console Frame Set", "Three oak frames to lean or hang.", "A curated set of three solid-oak frames with museum-grade mounts.", "c5", 5600, null, 15, ["1618220048045-10a6dbdf83e0"], "Oak, glass", "A3, A4, A5", false],
  ["Curated Gallery Wall", "A nine-piece gallery wall, ready to hang.", "Prints, frames and a paper hanging template.", "c5", 14800, 16500, 6, ["1513519245088-0e12902e5a38"], "Archival prints, ash frames", "180 × 120 cm", true],
];

export const demoProducts: Product[] = rows.map((r, i) => {
  const cat = demoCategories.find((c) => c.id === r[3])!;
  return {
    id: `p${i + 1}`,
    name: r[0],
    slug: r[0].toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    short_description: r[1],
    description: r[2],
    category_id: r[3],
    price: r[4],
    compare_at_price: r[5],
    stock: r[6],
    sku: null,
    images: r[7].map(U),
    materials: r[8],
    dimensions: r[9],
    care: null,
    is_active: true,
    is_featured: r[10],
    created_at: new Date(2026, 9, 30 - i).toISOString(),
    category: { name: cat.name, slug: cat.slug },
  };
});
