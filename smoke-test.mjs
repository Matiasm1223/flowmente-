import { readFileSync } from 'fs';
import { join } from 'path';

function runSmokeTest() {
  console.log("Running smoke test...");
  
  try {
    const htmlPath = join(process.cwd(), 'dist', 'index.html');
    const html = readFileSync(htmlPath, 'utf8');

    // Comprobar la existencia del contenedor y el SVG
    if (!html.includes('id="contenedor-lineas-neon"')) {
      throw new Error("❌ FALLO: No se encontró el contenedor-lineas-neon en el HTML.");
    }
    
    // Contar las líneas (deben ser exactamente 5)
    const matches = html.match(/class="[^"]*linea-neon linea-\d+[^"]*"/g);
    const count = matches ? matches.length : 0;
    
    if (count !== 5) {
      throw new Error(`❌ FALLO: Se esperaban 5 paths con clase 'linea-neon', pero se encontraron ${count}.`);
    }

    // Comprobar que no tocamos la TarjetaEscena2 original (su contenedor debe seguir existiendo)
    if (!html.includes('id="tarjeta-post-explosion"')) {
      throw new Error("❌ FALLO: La tarjeta original desapareció. Regla absoluta violada.");
    }

    console.log("✅ ÉXITO: El smoke test pasó. Las 5 líneas existen y la tarjeta no fue afectada.");
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

runSmokeTest();
