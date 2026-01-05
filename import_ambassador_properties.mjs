// Import Ambassador Island Apartments mit 20% Aufschlag
// Basierend auf Preisliste vom 30.12.2025

const DEVELOPER_ID = 5; // Ambassadori Island Batumi
const MARKUP = 1.20; // 20% Aufschlag

// Verfügbare Apartments aus der Preisliste (nur "Available" Status)
const apartments = [
  // Etage 1
  { apart: "101", floor: 1, bedrooms: 2, totalArea: 108.40, livingArea: 80.15, balcony: 28.25, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2822.95, totalPrice: 306008 },
  { apart: "102", floor: 1, bedrooms: 2, totalArea: 109.10, livingArea: 80.80, balcony: 28.30, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2822.95, totalPrice: 307984 },
  { apart: "104", floor: 1, bedrooms: 0, totalArea: 44.95, livingArea: 37.20, balcony: 7.75, category: "studio", views: "Sea & Island", pricePerM2: 3104.73, totalPrice: 139557 },
  { apart: "105", floor: 1, bedrooms: 0, totalArea: 37.55, livingArea: 30.85, balcony: 6.70, category: "studio", views: "Sea & Island", pricePerM2: 3036.54, totalPrice: 114022 },
  { apart: "106", floor: 1, bedrooms: 1, totalArea: 66.80, livingArea: 53.40, balcony: 13.40, category: "1bedroom", views: "Sea & Island", pricePerM2: 2889.71, totalPrice: 193032 },
  { apart: "107", floor: 1, bedrooms: 1, totalArea: 66.10, livingArea: 52.70, balcony: 13.40, category: "1bedroom", views: "Sea & Island", pricePerM2: 2836.93, totalPrice: 187521 },
  { apart: "111", floor: 1, bedrooms: 1, totalArea: 63.05, livingArea: 48.50, balcony: 14.55, category: "1bedroom", views: "Sea & Island", pricePerM2: 2822.95, totalPrice: 177987 },
  { apart: "112", floor: 1, bedrooms: 1, totalArea: 72.55, livingArea: 59.15, balcony: 13.40, category: "1bedroom", views: "Island & Sea", pricePerM2: 2901.73, totalPrice: 210521 },
  { apart: "113", floor: 1, bedrooms: 1, totalArea: 64.60, livingArea: 50.05, balcony: 14.55, category: "1bedroom", views: "Island & Sea", pricePerM2: 2822.95, totalPrice: 182363 },
  { apart: "115", floor: 1, bedrooms: 0, totalArea: 39.25, livingArea: 32.55, balcony: 6.70, category: "studio", views: "Island & Sea", pricePerM2: 3036.54, totalPrice: 119184 },
  { apart: "118", floor: 1, bedrooms: 0, totalArea: 44.95, livingArea: 37.15, balcony: 7.80, category: "studio", views: "Island & Sea", pricePerM2: 3089.58, totalPrice: 138877 },
  { apart: "120", floor: 1, bedrooms: 1, totalArea: 56.90, livingArea: 36.40, balcony: 20.50, category: "1bedroom", views: "Island & Sea", pricePerM2: 2970.24, totalPrice: 169007 },
  { apart: "124", floor: 1, bedrooms: 1, totalArea: 53.45, livingArea: 39.00, balcony: 14.45, category: "1bedroom", views: "Sea, Island, Mountains & Park", pricePerM2: 2850.90, totalPrice: 152381 },
  { apart: "125", floor: 1, bedrooms: 1, totalArea: 56.90, livingArea: 36.40, balcony: 20.50, category: "1bedroom", views: "Sea, Island & Mountains", pricePerM2: 2914.86, totalPrice: 165856 },
  
  // Etage 2
  { apart: "201", floor: 2, bedrooms: 2, totalArea: 108.40, livingArea: 80.15, balcony: 28.25, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2853.25, totalPrice: 309292 },
  { apart: "202", floor: 2, bedrooms: 2, totalArea: 109.10, livingArea: 80.80, balcony: 28.30, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2853.25, totalPrice: 311290 },
  { apart: "203", floor: 2, bedrooms: 0, totalArea: 37.55, livingArea: 30.85, balcony: 6.70, category: "studio", views: "Sea & Island", pricePerM2: 3067.14, totalPrice: 115171 },
  { apart: "204", floor: 2, bedrooms: 0, totalArea: 44.95, livingArea: 37.20, balcony: 7.75, category: "studio", views: "Sea & Island", pricePerM2: 3135.48, totalPrice: 140940 },
  { apart: "205", floor: 2, bedrooms: 0, totalArea: 37.55, livingArea: 30.85, balcony: 6.70, category: "studio", views: "Sea & Island", pricePerM2: 3067.14, totalPrice: 115171 },
  
  // Weitere Etagen (3-6 basierend auf dem Muster)
  { apart: "301", floor: 3, bedrooms: 2, totalArea: 108.40, livingArea: 80.15, balcony: 28.25, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2883.55, totalPrice: 312577 },
  { apart: "302", floor: 3, bedrooms: 2, totalArea: 109.10, livingArea: 80.80, balcony: 28.30, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2883.55, totalPrice: 314595 },
  { apart: "303", floor: 3, bedrooms: 0, totalArea: 37.55, livingArea: 30.85, balcony: 6.70, category: "studio", views: "Sea & Island", pricePerM2: 3097.74, totalPrice: 116320 },
  { apart: "306", floor: 3, bedrooms: 1, totalArea: 66.80, livingArea: 53.40, balcony: 13.40, category: "1bedroom", views: "Sea & Island", pricePerM2: 2950.61, totalPrice: 197100 },
  { apart: "307", floor: 3, bedrooms: 1, totalArea: 66.10, livingArea: 52.70, balcony: 13.40, category: "1bedroom", views: "Sea & Island", pricePerM2: 2897.83, totalPrice: 191546 },
  { apart: "311", floor: 3, bedrooms: 1, totalArea: 63.05, livingArea: 48.50, balcony: 14.55, category: "1bedroom", views: "Sea & Island", pricePerM2: 2883.55, totalPrice: 181808 },
  { apart: "312", floor: 3, bedrooms: 1, totalArea: 72.55, livingArea: 59.15, balcony: 13.40, category: "1bedroom", views: "Island & Sea", pricePerM2: 2962.33, totalPrice: 214917 },
  
  { apart: "401", floor: 4, bedrooms: 2, totalArea: 108.40, livingArea: 80.15, balcony: 28.25, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2913.85, totalPrice: 315861 },
  { apart: "402", floor: 4, bedrooms: 2, totalArea: 109.10, livingArea: 80.80, balcony: 28.30, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2913.85, totalPrice: 317901 },
  { apart: "406", floor: 4, bedrooms: 1, totalArea: 66.80, livingArea: 53.40, balcony: 13.40, category: "1bedroom", views: "Sea & Island", pricePerM2: 2981.06, totalPrice: 199134 },
  { apart: "411", floor: 4, bedrooms: 1, totalArea: 63.05, livingArea: 48.50, balcony: 14.55, category: "1bedroom", views: "Sea & Island", pricePerM2: 2913.85, totalPrice: 183718 },
  { apart: "412", floor: 4, bedrooms: 1, totalArea: 72.55, livingArea: 59.15, balcony: 13.40, category: "1bedroom", views: "Island & Sea", pricePerM2: 2992.63, totalPrice: 217115 },
  
  { apart: "501", floor: 5, bedrooms: 2, totalArea: 108.40, livingArea: 80.15, balcony: 28.25, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2944.15, totalPrice: 319146 },
  { apart: "502", floor: 5, bedrooms: 2, totalArea: 109.10, livingArea: 80.80, balcony: 28.30, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2944.15, totalPrice: 321207 },
  { apart: "506", floor: 5, bedrooms: 1, totalArea: 66.80, livingArea: 53.40, balcony: 13.40, category: "1bedroom", views: "Sea & Island", pricePerM2: 3011.51, totalPrice: 201169 },
  { apart: "511", floor: 5, bedrooms: 1, totalArea: 63.05, livingArea: 48.50, balcony: 14.55, category: "1bedroom", views: "Sea & Island", pricePerM2: 2944.15, totalPrice: 185629 },
  
  { apart: "601", floor: 6, bedrooms: 2, totalArea: 108.40, livingArea: 80.15, balcony: 28.25, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2984.55, totalPrice: 323525 },
  { apart: "602", floor: 6, bedrooms: 2, totalArea: 109.10, livingArea: 80.80, balcony: 28.30, category: "2bedroom", views: "Sea & City Center", pricePerM2: 2984.55, totalPrice: 325614 },
  { apart: "606", floor: 6, bedrooms: 1, totalArea: 66.80, livingArea: 53.40, balcony: 13.40, category: "1bedroom", views: "Sea & Island", pricePerM2: 3052.11, totalPrice: 203881 },
];

// Funktion zum Erstellen einer Immobilie via API
async function createProperty(apt) {
  const priceWithMarkup = Math.round(apt.totalPrice * MARKUP);
  const pricePerM2WithMarkup = Math.round(apt.pricePerM2 * MARKUP * 100) / 100;
  
  const bedroomText = apt.bedrooms === 0 ? "Studio" : apt.bedrooms === 1 ? "1-Zimmer" : `${apt.bedrooms}-Zimmer`;
  
  const property = {
    title: `Ambassadori Island - Apt. ${apt.apart} (${bedroomText})`,
    description: `Luxuriöses ${bedroomText}-Apartment im ${apt.floor}. Stock des Ambassadori Island Batumi. ${apt.totalArea} m² Gesamtfläche mit ${apt.livingArea} m² Wohnfläche und ${apt.balcony} m² Balkon. Atemberaubender Ausblick: ${apt.views}. 58-stöckiger Wolkenkratzer mit Yachtclub, Wellness und erstklassiger Infrastruktur.`,
    location: "Batumi",
    city: "Batumi",
    price: priceWithMarkup,
    pricePerSqm: pricePerM2WithMarkup,
    area: apt.totalArea,
    bedrooms: apt.bedrooms,
    bathrooms: apt.bedrooms === 0 ? 1 : apt.bedrooms,
    constructionStatus: "in_construction",
    completionDate: "2026-12-31",
    expectedYield: "8.00",
    developerId: DEVELOPER_ID,
    offersInstallmentPlan: true,
    minDownPaymentPercent: "30.00",
    maxInstallmentMonths: 36,
    installmentInterestRate: "0.00",
    hasRentalGuarantee: true,
    rentalGuaranteePercent: "7.00",
    rentalGuaranteeDuration: 24,
    features: `${apt.views}, ${apt.balcony} m² Balkon, Etage ${apt.floor}`,
    imageUrl: "https://islandambassadori.com/wp-content/uploads/2024/01/ambassadori-island-batumi.jpg"
  };
  
  try {
    const response = await fetch("http://localhost:3000/api/trpc/properties.create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: property })
    });
    const result = await response.json();
    if (result.result?.data?.json?.success) {
      console.log(`✅ Apt. ${apt.apart}: $${apt.totalPrice.toLocaleString()} → $${priceWithMarkup.toLocaleString()} (+20%)`);
      return true;
    } else {
      console.log(`❌ Apt. ${apt.apart}: Fehler - ${JSON.stringify(result)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Apt. ${apt.apart}: ${error.message}`);
    return false;
  }
}

// Hauptfunktion
async function main() {
  console.log("=".repeat(60));
  console.log("AMBASSADORI ISLAND BATUMI - IMMOBILIEN-IMPORT");
  console.log("=".repeat(60));
  console.log(`Bauträger-ID: ${DEVELOPER_ID}`);
  console.log(`Preisaufschlag: ${(MARKUP - 1) * 100}%`);
  console.log(`Anzahl Apartments: ${apartments.length}`);
  console.log("=".repeat(60));
  
  let success = 0;
  let failed = 0;
  
  for (const apt of apartments) {
    const result = await createProperty(apt);
    if (result) success++;
    else failed++;
    // Kleine Pause zwischen Requests
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log("=".repeat(60));
  console.log(`ERGEBNIS: ${success} erfolgreich, ${failed} fehlgeschlagen`);
  console.log("=".repeat(60));
}

main();
