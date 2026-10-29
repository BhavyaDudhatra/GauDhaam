/**
 * Generates the branded placeholder artwork used by the site.
 * Every file is written to public/assets/images with the exact names
 * used by the app, so real photos can simply drop in later.
 *
 * Run with: npm run images
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "assets", "images");

const C = {
  brand: "#496B45",
  dark: "#2F4930",
  brown: "#795548",
  cream: "#FFF8EF",
  light: "#EAF1E5",
  line: "#E9DFD0",
  body: "#655B54",
  ghee: "#E8B94E",
  gheeDeep: "#D9A43A",
  honey: "#D99B33",
  amber: "#B98338",
};

const leaf = (x, y, s, rotate, fill, opacity = 1) => `
  <g transform="translate(${x} ${y}) rotate(${rotate}) scale(${s})" opacity="${opacity}">
    <path d="M0 0C18 -46 62 -58 92 -50C86 -16 56 8 0 0Z" fill="${fill}"/>
    <path d="M4 -2C30 -18 58 -34 86 -46" stroke="${C.cream}" stroke-width="3" fill="none" opacity="0.55" stroke-linecap="round"/>
  </g>`;

const sprig = (x, y, s, rotate, fill, opacity = 1) => `
  <g transform="translate(${x} ${y}) rotate(${rotate}) scale(${s})" opacity="${opacity}">
    <path d="M0 120C10 70 14 30 4 0" stroke="${fill}" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${leaf(4, 96, 0.5, -18, fill, 1)}
    ${leaf(6, 66, 0.55, 18, fill, 1)}
    ${leaf(4, 40, 0.6, -24, fill, 1)}
  </g>`;

function frame({ bg = C.cream, arch = C.light, inner = "" }) {
  return `
  <defs>
    <radialGradient id="sky" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="58%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#F6ECDE"/>
    </radialGradient>
    <linearGradient id="archGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${arch}"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.65"/>
    </linearGradient>
    <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="38%" stop-color="#FFFFFF" stop-opacity="0.05"/>
      <stop offset="72%" stop-color="#FFFFFF" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.4"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#F3D07C"/>
      <stop offset="55%" stop-color="${C.ghee}"/>
      <stop offset="100%" stop-color="${C.gheeDeep}"/>
    </linearGradient>
    <linearGradient id="honeyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#EDB95C"/>
      <stop offset="100%" stop-color="${C.honey}"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D8A65B"/>
      <stop offset="50%" stop-color="${C.amber}"/>
      <stop offset="100%" stop-color="#9C6526"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#sky)"/>
  <circle cx="600" cy="520" r="470" fill="url(#glow)" opacity="0.9"/>
  <path d="M300 980 L300 620 A300 300 0 0 1 900 620 L900 980 Z" fill="url(#archGrad)"/>
  <path d="M300 980 L300 620 A300 300 0 0 1 900 620 L900 980 Z" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.7"/>
  <ellipse cx="600" cy="1000" rx="520" ry="54" fill="${C.dark}" opacity="0.05"/>
  <circle cx="905" cy="360" r="30" fill="${C.brand}" opacity="0.12"/>
  <circle cx="286" cy="500" r="16" fill="${C.brown}" opacity="0.14"/>
  <circle cx="330" cy="430" r="7" fill="${C.brand}" opacity="0.18"/>
  ${sprig(268, 700, 1.1, -8, C.brand, 0.28)}
  ${sprig(900, 760, 1.15, 190, C.brown, 0.16)}
  ${inner}
  `;
}

const jarShadow = `<ellipse cx="600" cy="918" rx="238" ry="30" fill="${C.dark}" opacity="0.13"/>`;

function label(x, y, w, h, accent = C.brand) {
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.cream}" opacity="0.96"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="none" stroke="${C.line}" stroke-width="2"/>
    <circle cx="${x + w / 2}" cy="${y + 34}" r="15" fill="${accent}" opacity="0.14"/>
    <path d="M${x + w / 2 - 8} ${y + 38}c6 -12 18 -14 24 -12c-2 9 -10 14 -24 12z" fill="${accent}"/>
    <rect x="${x + 26}" y="${y + 62}" width="${w - 52}" height="7" rx="3.5" fill="${accent}" opacity="0.55"/>
    <rect x="${x + 44}" y="${y + 80}" width="${w - 88}" height="7" rx="3.5" fill="${C.body}" opacity="0.28"/>
    <rect x="${x + 58}" y="${y + 98}" width="${w - 116}" height="6" rx="3" fill="${C.body}" opacity="0.18"/>
  </g>`;
}

/* ------------------------------- products -------------------------------- */

function gheeJar() {
  return `
  ${jarShadow}
  <rect x="452" y="372" width="296" height="86" rx="18" fill="#F5E7CB"/>
  <rect x="440" y="318" width="320" height="80" rx="26" fill="${C.brand}"/>
  <rect x="440" y="318" width="320" height="30" rx="15" fill="#5C8157"/>
  <ellipse cx="600" cy="392" rx="150" ry="16" fill="${C.brand}" opacity="0.35"/>
  <path d="M438 430h324v446c0 28-22 50-50 50H488c-28 0-50-22-50-50V430z" fill="#F7EEDF" opacity="0.9"/>
  <path d="M452 452h296v404c0 22-18 40-40 40H492c-22 0-40-18-40-40V452z" fill="url(#gold)"/>
  <path d="M452 452h296v404c0 22-18 40-40 40H492c-22 0-40-18-40-40V452z" fill="url(#jarGlass)"/>
  <path d="M438 430h324v446c0 28-22 50-50 50H488c-28 0-50-22-50-50V430z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.6"/>
  <rect x="478" y="468" width="22" height="390" rx="11" fill="#FFFFFF" opacity="0.3"/>
  <rect x="438" y="430" width="324" height="26" fill="#FFFFFF" opacity="0.35"/>
  ${label(470, 590, 260, 150, C.brand)}
  <g transform="translate(700 760) rotate(12)">
    <path d="M0 0h96a14 14 0 0 1 0 28H0z" fill="#E7CDA1"/>
    <ellipse cx="96" cy="14" rx="16" ry="24" fill="#E7CDA1"/>
    <ellipse cx="96" cy="14" rx="11" ry="17" fill="#F7EEDF" opacity="0.8"/>
  </g>`;
}

function powderJar() {
  return `
  ${jarShadow}
  <rect x="466" y="392" width="268" height="40" rx="12" fill="#D9C9B2"/>
  <rect x="452" y="326" width="296" height="82" rx="24" fill="${C.brown}"/>
  <rect x="452" y="326" width="296" height="26" rx="13" fill="#8C6757"/>
  <ellipse cx="600" cy="408" rx="134" ry="14" fill="${C.brown}" opacity="0.3"/>
  <path d="M448 404h304v428c0 30-24 54-54 54H502c-30 0-54-24-54-54V404z" fill="#E8D2A8" opacity="0.5"/>
  <path d="M462 420h276v400c0 20-16 36-36 36H498c-20 0-36-16-36-36V420z" fill="#C9A472"/>
  <path d="M462 420h276v400c0 20-16 36-36 36H498c-20 0-36-16-36-36V420z" fill="url(#jarGlass)"/>
  <path d="M462 500c46 16 92 -14 138 2s92 12 138 -6v330c0 20-16 36-36 36H498c-20 0-36-16-36-36V500z" fill="#B98C58" opacity="0.55"/>
  <path d="M448 404h304v428c0 30-24 54-54 54H502c-30 0-54-24-54-54V404z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.55"/>
  <rect x="484" y="440" width="22" height="380" rx="11" fill="#FFFFFF" opacity="0.35"/>
  ${label(478, 592, 244, 146, C.brand)}
  <g transform="translate(708 812)">
    <rect x="0" y="0" width="150" height="18" rx="9" fill="#C79A5C" transform="rotate(-16)"/>
    <ellipse cx="8" cy="34" rx="28" ry="24" fill="#D3AA6C"/>
    <ellipse cx="8" cy="32" rx="20" ry="17" fill="#E4C493"/>
    <ellipse cx="8" cy="30" rx="15" ry="12" fill="#8FA98B"/>
  </g>`;
}

function oilBottle() {
  return `
  <ellipse cx="600" cy="924" rx="210" ry="26" fill="${C.dark}" opacity="0.13"/>
  <rect x="566" y="260" width="68" height="70" rx="10" fill="${C.brand}"/>
  <rect x="550" y="318" width="100" height="46" rx="14" fill="${C.brand}"/>
  <rect x="556" y="352" width="88" height="20" rx="8" fill="#5C8157"/>
  <path d="M556 372c-46 0-78 34-78 82v398c0 34 26 60 60 60h124c34 0 60-26 60-60V454c0-48-32-82-78-82z" fill="url(#amberGrad)"/>
  <path d="M556 372c-46 0-78 34-78 82v398c0 34 26 60 60 60h124c34 0 60-26 60-60V454c0-48-32-82-78-82z" fill="url(#jarGlass)"/>
  <path d="M556 372c-46 0-78 34-78 82v398c0 34 26 60 60 60h124c34 0 60-26 60-60V454c0-48-32-82-78-82z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.45"/>
  <rect x="512" y="490" width="18" height="360" rx="9" fill="#FFFFFF" opacity="0.28"/>
  <rect x="500" y="580" width="200" height="230" rx="14" fill="${C.cream}" opacity="0.97"/>
  <rect x="500" y="580" width="200" height="230" rx="14" fill="none" stroke="${C.line}" stroke-width="2"/>
  <circle cx="600" cy="622" r="20" fill="${C.brand}" opacity="0.14"/>
  <path d="M590 628c8 -16 24 -18 32 -16c-3 12 -14 19 -32 16z" fill="${C.brand}"/>
  <rect x="530" y="656" width="140" height="8" rx="4" fill="${C.brand}" opacity="0.55"/>
  <rect x="548" y="676" width="104" height="7" rx="3.5" fill="${C.body}" opacity="0.3"/>
  <rect x="560" y="694" width="80" height="6" rx="3" fill="${C.body}" opacity="0.2"/>
  <rect x="530" y="720" width="140" height="52" rx="8" fill="${C.light}"/>
  <rect x="548" y="736" width="104" height="6" rx="3" fill="${C.brand}" opacity="0.35"/>
  <rect x="562" y="750" width="76" height="6" rx="3" fill="${C.brand}" opacity="0.25"/>
  ${sprig(392, 700, 0.9, -20, C.brand, 0.35)}
  ${sprig(824, 760, 0.85, 200, C.brown, 0.2)}`;
}

function honeyJar() {
  return `
  ${jarShadow}
  <rect x="452" y="330" width="296" height="60" rx="18" fill="${C.brand}"/>
  <rect x="464" y="316" width="272" height="34" rx="12" fill="#5C8157"/>
  <path d="M438 402h324v402c0 62-50 112-112 112H550c-62 0-112-50-112-112V402z" fill="url(#honeyGrad)"/>
  <path d="M438 402h324v402c0 62-50 112-112 112H550c-62 0-112-50-112-112V402z" fill="url(#jarGlass)"/>
  <rect x="438" y="402" width="324" height="34" fill="#FFFFFF" opacity="0.35"/>
  <path d="M438 402h324v402c0 62-50 112-112 112H550c-62 0-112-50-112-112V402z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>
  <rect x="478" y="450" width="26" height="400" rx="13" fill="#FFFFFF" opacity="0.25"/>
  ${label(472, 610, 256, 156, C.brown)}
  <g transform="translate(748 688) rotate(24)">
    <rect x="0" y="0" width="18" height="230" rx="9" fill="#C99A63"/>
    <rect x="-16" y="200" width="50" height="26" rx="10" fill="#C99A63"/>
    <path d="M-22 226h62M-22 246h62M-22 266h62" stroke="#C99A63" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="6" cy="300" rx="12" ry="16" fill="${C.honey}"/>
  </g>
  <g opacity="0.9">
    <path d="M790 420l26 15v30l-26 15-26-15v-30z" fill="#F1DDB6"/>
    <path d="M790 420l26 15-26 15-26-15z" fill="#F8EACB"/>
  </g>
  ${sprig(330, 740, 0.9, -14, C.brand, 0.3)}`;
}

function soapBar() {
  return `
  <ellipse cx="600" cy="900" rx="250" ry="32" fill="${C.dark}" opacity="0.12"/>
  <g transform="translate(0 60) rotate(-6 600 640)">
    <rect x="382" y="592" width="436" height="210" rx="44" fill="#D9CDBB"/>
    <rect x="382" y="566" width="436" height="210" rx="44" fill="#EFE4D2"/>
    <rect x="382" y="566" width="436" height="210" rx="44" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.6"/>
    <path d="M382 610h436" stroke="#DCCFBA" stroke-width="4" opacity="0.6"/>
  </g>
  <g transform="translate(0 -20) rotate(5 600 640)">
    <rect x="418" y="540" width="364" height="186" rx="40" fill="#C9D8C2"/>
    <rect x="418" y="514" width="364" height="186" rx="40" fill="#DDE9D6"/>
    <rect x="418" y="514" width="364" height="186" rx="40" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.7"/>
    <path d="M418 556h364" stroke="#C6D8BC" stroke-width="4" opacity="0.7"/>
    <circle cx="600" cy="620" r="46" fill="${C.brand}" opacity="0.13"/>
    <path d="M578 628c10 -22 32 -26 44 -22c-4 16 -20 26 -44 22z" fill="${C.brand}" opacity="0.8"/>
    <path d="M578 628c12 -6 26 -12 40 -16" stroke="${C.cream}" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round"/>
  </g>
  ${sprig(330, 690, 1.1, -22, C.brand, 0.4)}
  ${sprig(842, 720, 1, 200, C.brown, 0.25)}
  <circle cx="352" cy="520" r="9" fill="${C.brown}" opacity="0.25"/>
  <circle cx="880" cy="600" r="14" fill="${C.brand}" opacity="0.12"/>`;
}

/* ------------------------------- scenes ---------------------------------- */

function landscape({ sky2 = "#F4E7D3", hill1 = "#DCE8D3", hill2 = "#B9CFAF", hill3 = "#8FA98B" }) {
  return `
  <defs>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFDF8"/>
      <stop offset="60%" stop-color="${sky2}"/>
      <stop offset="100%" stop-color="#F1E2CB"/>
    </linearGradient>
    <linearGradient id="hillG1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${hill1}"/>
      <stop offset="100%" stop-color="#C9DBBF"/>
    </linearGradient>
    <linearGradient id="hillG2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${hill2}"/>
      <stop offset="100%" stop-color="${hill3}"/>
    </linearGradient>
  </defs>`;
}

function tree(x, y, s, fill = C.brand, opacity = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
    <rect x="-5" y="-10" width="10" height="52" rx="5" fill="${C.brown}"/>
    <circle cx="0" cy="-46" r="42" fill="${fill}"/>
    <circle cx="-32" cy="-20" r="30" fill="${fill}" opacity="0.92"/>
    <circle cx="34" cy="-22" r="32" fill="${fill}" opacity="0.86"/>
  </g>`;
}

function farmhouse(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="0" y="0" width="180" height="120" rx="6" fill="#F3E7D4"/>
    <path d="M-18 6L90 -78L198 6Z" fill="${C.brown}"/>
    <rect x="70" y="46" width="44" height="74" rx="4" fill="${C.brand}"/>
    <rect x="20" y="30" width="30" height="28" rx="4" fill="#E7D6BC"/>
    <rect x="132" y="30" width="30" height="28" rx="4" fill="#E7D6BC"/>
    <rect x="184" y="-46" width="14" height="40" rx="4" fill="${C.brown}"/>
  </g>`;
}

function bannerStillLife() {
  return `
  <defs>
    <radialGradient id="bannerGlow" cx="42%" cy="34%" r="66%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="55%" stop-color="${C.cream}"/>
      <stop offset="100%" stop-color="#F2E6D4"/>
    </radialGradient>
    <linearGradient id="jarGlass2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
      <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.42"/>
    </linearGradient>
    <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F4D486"/>
      <stop offset="60%" stop-color="${C.ghee}"/>
      <stop offset="100%" stop-color="#CE9531"/>
    </linearGradient>
    <linearGradient id="honeyG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#EFC173"/>
      <stop offset="100%" stop-color="#C98D2C"/>
    </linearGradient>
  </defs>
  <rect width="1800" height="1200" fill="url(#bannerGlow)"/>
  <circle cx="1180" cy="380" r="330" fill="${C.light}" opacity="0.75"/>
  <path d="M760 1120V690a420 420 0 0 1 840 0v430z" fill="#FFFFFF" opacity="0.42"/>
  <path d="M760 1120V690a420 420 0 0 1 840 0v430z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.8"/>
  <ellipse cx="1150" cy="1020" rx="470" ry="52" fill="${C.dark}" opacity="0.07"/>

  <!-- wooden table -->
  <rect x="120" y="960" width="1560" height="34" rx="17" fill="#D8B98E" opacity="0.65"/>
  <rect x="120" y="994" width="1560" height="120" fill="#EFE0C8" opacity="0.5"/>

  <!-- ghee jar -->
  <g transform="translate(860 470)">
    <ellipse cx="160" cy="512" rx="180" ry="26" fill="${C.dark}" opacity="0.12"/>
    <rect x="52" y="52" width="216" height="56" rx="16" fill="#F6E9CE"/>
    <rect x="42" y="14" width="236" height="54" rx="20" fill="${C.brand}"/>
    <rect x="42" y="14" width="236" height="20" rx="10" fill="#5F8559"/>
    <path d="M34 92h252v368c0 24-18 44-42 44H76c-24 0-42-20-42-44V92z" fill="url(#goldG)"/>
    <path d="M34 92h252v368c0 24-18 44-42 44H76c-24 0-42-20-42-44V92z" fill="url(#jarGlass2)"/>
    <path d="M34 92h252v368c0 24-18 44-42 44H76c-24 0-42-20-42-44V92z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>
    <rect x="66" y="112" width="18" height="310" rx="9" fill="#FFFFFF" opacity="0.3"/>
    <rect x="76" y="212" width="166" height="132" rx="12" fill="${C.cream}" opacity="0.97"/>
    <circle cx="159" cy="252" r="16" fill="${C.brand}" opacity="0.14"/>
    <path d="M150 256c7 -13 20 -15 26 -13c-2 10 -11 15 -26 13z" fill="${C.brand}"/>
    <rect x="100" y="284" width="118" height="7" rx="3.5" fill="${C.brand}" opacity="0.5"/>
    <rect x="114" y="302" width="90" height="6" rx="3" fill="${C.body}" opacity="0.25"/>
    <rect x="124" y="318" width="70" height="5" rx="2.5" fill="${C.body}" opacity="0.18"/>
  </g>

  <!-- honey jar -->
  <g transform="translate(1250 640)">
    <ellipse cx="120" cy="336" rx="140" ry="22" fill="${C.dark}" opacity="0.12"/>
    <rect x="26" y="0" width="188" height="46" rx="14" fill="${C.brand}"/>
    <path d="M12 52h216v242c0 54-42 96-94 96h-28c-52 0-94-42-94-96V52z" fill="url(#honeyG)"/>
    <path d="M12 52h216v242c0 54-42 96-94 96h-28c-52 0-94-42-94-96V52z" fill="url(#jarGlass2)"/>
    <path d="M12 52h216v242c0 54-42 96-94 96h-28c-52 0-94-42-94-96V52z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.45"/>
    <rect x="40" y="70" width="16" height="250" rx="8" fill="#FFFFFF" opacity="0.25"/>
    <rect x="52" y="150" width="146" height="122" rx="10" fill="${C.cream}" opacity="0.96"/>
    <circle cx="125" cy="186" r="14" fill="${C.brown}" opacity="0.16"/>
    <path d="M117 190c6 -12 18 -14 24 -12c-2 9 -10 14 -24 12z" fill="${C.brown}"/>
    <rect x="76" y="216" width="98" height="7" rx="3.5" fill="${C.brown}" opacity="0.5"/>
    <rect x="90" y="234" width="70" height="6" rx="3" fill="${C.body}" opacity="0.25"/>
  </g>

  <!-- amber bottle -->
  <g transform="translate(278 590)">
    <ellipse cx="92" cy="466" rx="104" ry="20" fill="${C.dark}" opacity="0.12"/>
    <rect x="74" y="18" width="36" height="44" rx="8" fill="${C.brand}"/>
    <rect x="62" y="56" width="60" height="30" rx="10" fill="${C.brand}"/>
    <path d="M66 86c-30 0-52 22-52 54v266c0 22 18 40 40 40h92c22 0 40-18 40-40V140c0-32-22-54-52-54z" fill="url(#amberGrad)"/>
    <path d="M66 86c-30 0-52 22-52 54v266c0 22 18 40 40 40h92c22 0 40-18 40-40V140c0-32-22-54-52-54z" fill="url(#jarGlass2)"/>
    <rect x="28" y="150" width="14" height="240" rx="7" fill="#FFFFFF" opacity="0.25"/>
    <rect x="24" y="212" width="136" height="158" rx="10" fill="${C.cream}" opacity="0.97"/>
    <circle cx="92" cy="244" r="15" fill="${C.brand}" opacity="0.14"/>
    <path d="M84 248c6 -12 19 -14 25 -12c-2 10 -11 15 -25 12z" fill="${C.brand}"/>
    <rect x="46" y="272" width="92" height="7" rx="3.5" fill="${C.brand}" opacity="0.5"/>
    <rect x="58" y="290" width="68" height="6" rx="3" fill="${C.body}" opacity="0.25"/>
    <rect x="46" y="316" width="92" height="34" rx="6" fill="${C.light}"/>
  </g>

  <!-- loose leaves -->
  ${sprig(700, 830, 1.4, -22, C.brand, 0.42)}
  ${sprig(1530, 806, 1.1, 192, C.brown, 0.24)}
  <circle cx="742" cy="382" r="12" fill="${C.brown}" opacity="0.18"/>
  <circle cx="1610" cy="470" r="20" fill="${C.brand}" opacity="0.12"/>
  <circle cx="1130" cy="300" r="8" fill="${C.brand}" opacity="0.2"/>`;
}

function farmScene({ w = 1400, h = 1000, sun = true, crops = true } = {}) {
  const sx = w * 0.72;
  const sy = h * 0.28;
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    ${landscape({})}
    <rect width="${w}" height="${h}" fill="url(#skyG)"/>
    ${sun ? `<circle cx="${sx}" cy="${sy}" r="${h * 0.09}" fill="#F2CE8C" opacity="0.75"/>
    <circle cx="${sx}" cy="${sy}" r="${h * 0.14}" fill="#F2CE8C" opacity="0.2"/>` : ""}
    <path d="M0 ${h * 0.62}C${w * 0.16} ${h * 0.5},${w * 0.36} ${h * 0.68},${w * 0.52} ${h * 0.6}S${w * 0.82} ${h * 0.48},${w} ${h * 0.58}V${h}H0Z" fill="url(#hillG1)"/>
    <path d="M0 ${h * 0.72}C${w * 0.2} ${h * 0.62},${w * 0.38} ${h * 0.82},${w * 0.6} ${h * 0.72}S${w * 0.86} ${h * 0.6},${w} ${h * 0.7}V${h}H0Z" fill="url(#hillG2)" opacity="0.85"/>
    <path d="M0 ${h * 0.84}C${w * 0.22} ${h * 0.76},${w * 0.5} ${h * 0.9},${w * 0.74} ${h * 0.82}S${w * 0.9} ${h * 0.78},${w} ${h * 0.84}V${h}H0Z" fill="${C.brand}" opacity="0.5"/>
    ${tree(w * 0.1, h * 0.68, 1.15, C.brand, 0.85)}
    ${tree(w * 0.2, h * 0.62, 0.75, C.brand, 0.7)}
    ${farmhouse(w * 0.36, h * 0.58, 1.1)}
    ${tree(w * 0.88, h * 0.66, 1.3, C.brand, 0.9)}
    ${
      crops
        ? `<g opacity="0.5" stroke="${C.cream}" stroke-width="3" stroke-linecap="round">
            ${Array.from({ length: 26 })
              .map((_, i) => {
                const x = 40 + i * (w / 26);
                const y = h * 0.9;
                return `<path d="M${x} ${y}l6 -${24 + (i % 4) * 8}"/>`;
              })
              .join("")}
          </g>`
        : ""
    }
    <path d="M0 ${h * 0.95}h${w}" stroke="${C.brown}" stroke-width="3" opacity="0.18"/>
  </svg>`;
}

function gheeScene() {
  return `
  <svg width="1400" height="1050" viewBox="0 0 1400 1050" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFDF9"/>
        <stop offset="55%" stop-color="${C.cream}"/>
        <stop offset="100%" stop-color="#F3E5D0"/>
      </linearGradient>
      <linearGradient id="gold2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F5D689"/>
        <stop offset="100%" stop-color="#DBA53E"/>
      </linearGradient>
      <linearGradient id="glass3" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.65"/>
        <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.35"/>
      </linearGradient>
    </defs>
    <rect width="1400" height="1050" fill="url(#warm)"/>
    <circle cx="760" cy="430" r="380" fill="${C.light}" opacity="0.6"/>
    <path d="M330 1000V660a380 380 0 0 1 760 0v340z" fill="#FFFFFF" opacity="0.4"/>
    <ellipse cx="700" cy="900" rx="440" ry="46" fill="${C.dark}" opacity="0.07"/>
    <rect x="140" y="880" width="1120" height="28" rx="14" fill="#D9BA90" opacity="0.7"/>

    <g transform="translate(430 330)">
      <ellipse cx="280" cy="540" rx="290" ry="34" fill="${C.dark}" opacity="0.12"/>
      <rect x="170" y="60" width="220" height="60" rx="18" fill="#F6E9CE"/>
      <rect x="158" y="10" width="244" height="62" rx="22" fill="${C.brand}"/>
      <rect x="158" y="10" width="244" height="24" rx="12" fill="#5F8559"/>
      <path d="M148 100h264v368c0 30-24 54-54 54H202c-30 0-54-24-54-54V100z" fill="url(#gold2)"/>
      <path d="M148 100h264v368c0 30-24 54-54 54H202c-30 0-54-24-54-54V100z" fill="url(#glass3)"/>
      <path d="M148 100h264v368c0 30-24 54-54 54H202c-30 0-54-24-54-54V100z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.55"/>
      <rect x="180" y="130" width="20" height="310" rx="10" fill="#FFFFFF" opacity="0.3"/>
      <rect x="196" y="230" width="168" height="134" rx="14" fill="${C.cream}"/>
      <circle cx="280" cy="270" r="17" fill="${C.brand}" opacity="0.14"/>
      <path d="M270 274c7 -14 21 -16 28 -14c-3 11 -12 16 -28 14z" fill="${C.brand}"/>
      <rect x="222" y="302" width="116" height="7" rx="3.5" fill="${C.brand}" opacity="0.5"/>
      <rect x="238" y="320" width="84" height="6" rx="3" fill="${C.body}" opacity="0.25"/>
    </g>

    <g transform="translate(860 640) rotate(-18)">
      <rect x="0" y="0" width="30" height="260" rx="15" fill="#C89B63"/>
      <ellipse cx="15" cy="20" rx="34" ry="26" fill="#D8AE78"/>
      <ellipse cx="15" cy="18" rx="24" ry="17" fill="#EACB99"/>
      <ellipse cx="15" cy="14" rx="18" ry="12" fill="#F5D38A"/>
      <path d="M-4 40c8 -6 30 -6 38 0" stroke="#FFFFFF" stroke-width="4" opacity="0.4" fill="none"/>
    </g>

    ${sprig(200, 700, 1.5, -18, C.brand, 0.35)}
    ${sprig(1180, 720, 1.3, 195, C.brown, 0.22)}
    <circle cx="1130" cy="330" r="16" fill="${C.brown}" opacity="0.16"/>
    <circle cx="280" cy="300" r="10" fill="${C.brand}" opacity="0.2"/>
  </svg>`;
}

function herbalScene() {
  return `
  <svg width="1400" height="1050" viewBox="0 0 1400 1050" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="herbBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FBFDF8"/>
        <stop offset="60%" stop-color="${C.light}"/>
        <stop offset="100%" stop-color="#DCE8D4"/>
      </linearGradient>
      <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F1EADD"/>
        <stop offset="100%" stop-color="#D8CBB6"/>
      </linearGradient>
    </defs>
    <rect width="1400" height="1050" fill="url(#herbBg)"/>
    <circle cx="700" cy="420" r="400" fill="#FFFFFF" opacity="0.4"/>
    <ellipse cx="700" cy="900" rx="470" ry="48" fill="${C.dark}" opacity="0.07"/>
    <path d="M300 1010V700a400 400 0 0 1 800 0v310z" fill="#FFFFFF" opacity="0.38"/>

    <g transform="translate(520 560)">
      <ellipse cx="180" cy="330" rx="230" ry="30" fill="${C.dark}" opacity="0.1"/>
      <path d="M40 120h280l-32 180c-4 24-24 42-48 42H120c-24 0-44-18-48-42z" fill="url(#stone)"/>
      <ellipse cx="180" cy="120" rx="140" ry="30" fill="#F6F0E4"/>
      <ellipse cx="180" cy="120" rx="112" ry="22" fill="#E4D8C2"/>
      <ellipse cx="180" cy="120" rx="82" ry="14" fill="#8FA98B" opacity="0.75"/>
      <g transform="rotate(-14 180 120)">
        <rect x="120" y="10" width="26" height="220" rx="13" fill="#C8A170"/>
        <ellipse cx="133" cy="28" rx="30" ry="20" fill="#D6B183"/>
      </g>
      <path d="M40 120h280" stroke="#FFFFFF" stroke-width="4" opacity="0.45"/>
      <circle cx="330" cy="250" r="12" fill="${C.brown}" opacity="0.2"/>
    </g>

    <g transform="translate(900 480)">
      <ellipse cx="100" cy="370" rx="120" ry="20" fill="${C.dark}" opacity="0.1"/>
      <path d="M30 30c-20 40-26 90-20 150l16 120c2 20 18 36 38 36h72c20 0 36-16 38-36l16-120c6-60 0-110-20-150z" fill="#EFE6D5"/>
      <path d="M30 30c-20 40-26 90-20 150l16 120c2 20 18 36 38 36h72c20 0 36-16 38-36l16-120c6-60 0-110-20-150z" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.6"/>
      <rect x="10" y="0" width="180" height="42" rx="16" fill="${C.brand}"/>
      <rect x="10" y="0" width="180" height="16" rx="8" fill="#5F8559"/>
      <rect x="34" y="160" width="132" height="130" rx="12" fill="${C.cream}"/>
      <rect x="56" y="190" width="88" height="8" rx="4" fill="${C.brand}" opacity="0.5"/>
      <rect x="68" y="210" width="64" height="6" rx="3" fill="${C.body}" opacity="0.25"/>
      <circle cx="100" cy="250" r="20" fill="${C.brand}" opacity="0.12"/>
      <path d="M90 256c8 -16 24 -18 32 -16c-3 12 -14 19 -32 16z" fill="${C.brand}"/>
    </g>

    ${sprig(300, 760, 1.7, -26, C.brand, 0.4)}
    ${sprig(1130, 780, 1.5, 195, C.brand, 0.3)}
    ${sprig(1180, 400, 1.1, 210, C.brown, 0.22)}
    <circle cx="360" cy="330" r="12" fill="${C.brown}" opacity="0.2"/>
    <circle cx="1080" cy="300" r="8" fill="${C.brand}" opacity="0.25"/>
  </svg>`;
}

function herbalBanner() {
  return `
  <svg width="1800" height="720" viewBox="0 0 1800 720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hb" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${C.brand}"/>
        <stop offset="55%" stop-color="#3E5D3B"/>
        <stop offset="100%" stop-color="${C.dark}"/>
      </linearGradient>
      <radialGradient id="hGlow" cx="78%" cy="40%" r="45%">
        <stop offset="0%" stop-color="#EAF1E5" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#EAF1E5" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1800" height="720" fill="url(#hb)"/>
    <rect width="1800" height="720" fill="url(#hGlow)"/>
    <circle cx="1440" cy="320" r="240" fill="#FFFFFF" opacity="0.05"/>
    <circle cx="1440" cy="320" r="170" fill="#FFFFFF" opacity="0.06"/>
    ${sprig(1250, 430, 2.4, -18, C.light, 0.2)}
    ${sprig(1650, 470, 2.2, 195, C.light, 0.14)}
    ${sprig(1180, 150, 1.2, 20, C.cream, 0.12)}
    <path d="M0 650C260 590 520 690 820 640S1400 560 1800 620V720H0Z" fill="#2A422B" opacity="0.5"/>
    <circle cx="1500" cy="180" r="10" fill="${C.cream}" opacity="0.35"/>
    <circle cx="1320" cy="250" r="6" fill="${C.cream}" opacity="0.4"/>
    <circle cx="1610" cy="360" r="14" fill="${C.cream}" opacity="0.2"/>
  </svg>`;
}

/* -------------------------------- logo ----------------------------------- */

function logoMark(size = 512) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#557A50"/>
        <stop offset="100%" stop-color="#2F4930"/>
      </linearGradient>
    </defs>
    <circle cx="128" cy="128" r="124" fill="url(#lg)"/>
    <circle cx="128" cy="128" r="110" fill="none" stroke="#FFF8EF" stroke-width="2" opacity="0.35"/>
    <path d="M128 196c-42 0-74-26-80-60c34-2 62 6 80 24c18-18 46-26 80-24c-6 34-38 60-80 60z" fill="#795548" opacity="0.85"/>
    <path d="M128 60c-8 34-6 62 0 92c6-30 8-58 0-92z" fill="#EAF1E5"/>
    <path d="M128 152c-24-6-40-24-40-46c24 2 38 20 40 46z" fill="#EAF1E5"/>
    <path d="M128 152c24-6 40-24 40-46c-24 2-38 20-40 46z" fill="#DCE8D3"/>
    <circle cx="128" cy="54" r="7" fill="#E8C17A"/>
    <path d="M60 168c22-6 46-4 68 6c22-10 46-12 68-6" stroke="#FFF8EF" stroke-width="2" fill="none" opacity="0.25"/>
  </svg>`;
}

/* --------------------------------- run ----------------------------------- */

const jobs = [
  {
    name: "banner.jpg",
    w: 1800,
    h: 1200,
    svg: `<svg width="1800" height="1200" viewBox="0 0 1800 1200" xmlns="http://www.w3.org/2000/svg">${bannerStillLife()}</svg>`,
  },
  { name: "gheehome.jpg", w: 1400, h: 1050, svg: gheeScene() },
  { name: "planthome.jpg", w: 1400, h: 1050, svg: herbalScene() },
  { name: "herbalbanner.jpg", w: 1800, h: 720, svg: herbalBanner() },
  { name: "aboutus.jpg", w: 1400, h: 1000, svg: farmScene({ w: 1400, h: 1000 }) },
  { name: "conus.jpg", w: 1400, h: 900, svg: farmScene({ w: 1400, h: 900, crops: false }) },
  {
    name: "Ghee.jpg",
    w: 1200,
    h: 1200,
    svg: `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${frame({ arch: "#EFE5CF", inner: gheeJar() })}</svg>`,
  },
  {
    name: "Herbalpowder.jpg",
    w: 1200,
    h: 1200,
    svg: `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${frame({ arch: "#EAF1E5", inner: powderJar() })}</svg>`,
  },
  {
    name: "herbaloil.jpg",
    w: 1200,
    h: 1200,
    svg: `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${frame({ arch: "#EEF2E5", inner: oilBottle() })}</svg>`,
  },
  {
    name: "Honey.jpg",
    w: 1200,
    h: 1200,
    svg: `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${frame({ arch: "#F7EBD4", inner: honeyJar() })}</svg>`,
  },
  {
    name: "soap.jpg",
    w: 1200,
    h: 1200,
    svg: `<svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">${frame({ arch: "#EDF3E7", inner: soapBar() })}</svg>`,
  },
  {
    name: "gaudhamlogo.png",
    w: 512,
    h: 512,
    svg: logoMark(512),
    png: true,
  },
];

await mkdir(OUT, { recursive: true });
await mkdir(path.join(process.cwd(), "app"), { recursive: true });

for (const job of jobs) {
  const img = sharp(Buffer.from(job.svg), { density: 144 }).resize(job.w, job.h, {
    fit: "cover",
  });
  const out = path.join(OUT, job.name);
  if (job.png) {
    await img.png({ compressionLevel: 9 }).toFile(out);
  } else {
    await img.jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(out);
  }
  console.log("wrote", job.name);
}

await sharp(Buffer.from(logoMark(512)), { density: 144 })
  .resize(512, 512)
  .png()
  .toFile(path.join(process.cwd(), "app", "icon.png"));

await sharp(Buffer.from(logoMark(512)), { density: 144 })
  .resize(180, 180)
  .png()
  .toFile(path.join(process.cwd(), "app", "apple-icon.png"));

console.log("done");
