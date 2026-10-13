import * as T from "./vendor/three.module.js";

// Smooth cubic interpolation helper
export const smooth = (a, b, x) => {
  const p = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return p * p * (3 - 2 * p);
};

// Shortest-arc angle interpolation helper
export function lerpAngle(a, b, t) {
  let diff = (b - a) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

// Material generator
const mat = (color, roughness = 0.45, metalness = 0) =>
  new T.MeshStandardMaterial({ color, roughness, metalness });

/**
 * COMPREHENSIVE SERVICE ACTIONS & STEP-BY-STEP PART DETAILS (100% ENGLISH)
 * Supports realistic human repair simulations:
 * - "all" (Complete Part-by-Part Copier Teardown & Reassembly)
 * - "toner" (4 CMYK Color Cartridge Service)
 * - "roller" (High-Temp Fuser Roller & Drive Gears)
 * - "cassette" (Dual 500-Sheet Paper Drawers & Pickup System)
 * - "scanner" (ADF Document Feeder & Optical Platen Bed)
 */
export const SERVICE_ACTIONS = {
  all: {
    id: "all",
    name: "Full Copier Teardown & Reassembly",
    tag: "COMPLETE MACHINE OVERHAUL · 8-PART TEARDOWN & REASSEMBLY",
    icon: "🔧",
    steps: [
      {
        start: 0.00, end: 0.12,
        partName: "Automatic document feeder",
        partTitle: "Automatic Document Feeder (ADF)",
        spec: "OEM #ADF-9400 · 80 PPM DUAL-SCAN · BOROSILICATE GUIDE",
        title: "Part 1: Unlatching & Servicing ADF Feeder Unit",
        desc: "Human technician unscrews safety hinge dampers with magnetic driver, lifts the 100-sheet document feeder with both hands, wipes pick-up rollers, and seats firmly into pivot pins.",
        oemCode: "CP-ADF-9400-HD",
        material: "High-Impact Polycarbonate + Borosilicate Glass Guide",
        tolerance: "±0.05 mm Optical Hinge Alignment",
        duty: "300,000 Document Feeds",
        latchType: "Dual Pivot Quick-Release Latch"
      },
      {
        start: 0.12, end: 0.24,
        partName: "Scanner assembly",
        partTitle: "Optical Scanner Platen & CCD Carriage",
        spec: "OEM #SCN-600-OPT · 600×600 DPI CCD · ANTI-GLARE FLOAT GLASS",
        title: "Part 2: Optical Platen Glass & Scanner Bed",
        desc: "Unfastening optical platen clamps, lifting scanning bed to expose CCD mirrors, buffing first-surface optics with microfiber cloth, then docking securely onto vibration dampers.",
        oemCode: "CP-SCN-6000-GL",
        material: "Tempered Anti-Glare Float Glass + Aluminum Carrier",
        tolerance: "±0.02 mm Platen Flatness",
        duty: "500,000 Scan Cycles",
        latchType: "Vibration-Damped Lug Clamps"
      },
      {
        start: 0.24, end: 0.35,
        partName: "Touch control panel",
        partTitle: "Smart Touch Screen Operator UI",
        spec: "OEM #DSP-101-UI · 10.1\" WSVGA COLOR LCD · FLEX HARNESS",
        title: "Part 3: Smart Touch Display & Digital UI",
        desc: "Unclipping articulated tilt mount, unplugging digital flex harness for diagnostic pin test, then snapping control console back onto dual locking lugs.",
        oemCode: "CP-DSP-1010-UI",
        material: "Capacitive Multi-Touch Glass + ABS-FR Bezel",
        tolerance: "Zero-Flex Swivel Mount",
        duty: "1,000,000 Tap Operations",
        latchType: "Snap-In Articulated Swivel Joint"
      },
      {
        start: 0.35, end: 0.46,
        partName: "Front service cover",
        partTitle: "Front Magnetic Service Access Door",
        spec: "OEM #DR-520-FRT · DUST-SEALED · DUAL MAGNETIC SAFETY SWITCH",
        title: "Part 4: Front Magnetic Service Access Door",
        desc: "Releasing front safety interlock lever, swinging door open 120 degrees on heavy-duty hinges, and checking dust-seal gaskets to access imaging bays.",
        oemCode: "CP-DR-5200-FR",
        material: "Impact Polycarbonate + Neoprene Gaskets",
        tolerance: "Magnetic Contact Interlock Check",
        duty: "100,000 Open/Close Cycles",
        latchType: "Dual Pivot Hinge & Magnetic Safety Latch"
      },
      {
        start: 0.46, end: 0.58,
        partName: "Toner cyan",
        partTitle: "4-Color CMYK Toner Cartridge Set",
        spec: "OEM #TN-8800-CMYK · 45,000 PAGE CAPACITY · RFID CHIP",
        title: "Part 5: 4-Color CMYK Toner Cartridge Extraction & Seating",
        desc: "Unlocking rail cam levers, sliding out Cyan, Magenta, Yellow, and Black toner bottles, shaking horizontally for fluid toner distribution, and pressing firmly home until latched.",
        oemCode: "CP-TN-8800-CMYK",
        material: "Genuine Micro-Polymer Toner + RFID Authentication Chip",
        tolerance: "Dual Precision Slide Rails",
        duty: "45,000 Pages @ 5% A4",
        latchType: "Dual Rail Guide & Cam-Lock Lever"
      },
      {
        start: 0.58, end: 0.70,
        partName: "Transfer and fuser rollers",
        partTitle: "Heated Transfer & Fuser Roller Unit",
        spec: "OEM #FUS-2200-HT · 200°C HEAT-RESISTANT SILICONE · 100K RATED",
        title: "Part 6: High-Temp Transfer & Fuser Rollers",
        desc: "Disengaging high-temp thermal cam locks with tool, extracting heated silicone pressure roller, inspecting thermistors, and sliding back into thermal cavity with positive lock.",
        oemCode: "CP-FUS-2200-HT",
        material: "Non-Stick Fluoropolymer Sleeve + Heat-Resistant Silicone Core",
        tolerance: "±0.03 mm Radial Runout",
        duty: "100,000 Continuous Pages",
        latchType: "Dual Thermal Cam Locks & High-Temp Spring Retainers"
      },
      {
        start: 0.70, end: 0.81,
        partName: "Drive gears",
        partTitle: "Precision Drive Gear Transmission Train",
        spec: "OEM #GR-4402-DRV · 14T/12T/10T HELICAL & SPUR GEAR CLUSTER",
        title: "Part 7: Precision Drive Gear Transmission Train",
        desc: "Loosening gear retention bracket, disengaging helical gear train, verifying zero tooth wear with precision probe, applying silicone grease, and re-meshing drive train.",
        oemCode: "CP-GR-4402-DRV",
        material: "Heavy-Duty POM Delrin + Sintered Steel Hubs",
        tolerance: "Zero-Backlash Tooth Engagement",
        duty: "500,000 Print Revolutions",
        latchType: "Flanged Spline Shaft & Retention Clip"
      },
      {
        start: 0.81, end: 0.92,
        partName: "Paper cassette 1",
        partTitle: "Dual 500-Sheet Paper Cassette Trays",
        spec: "OEM #CAS-500-D1 · DUAL 500-SHEET CASSETTES · TELESCOPIC RAILS",
        title: "Part 8: Dual 500-Sheet Paper Cassette Trays",
        desc: "Squatting down to extend lower drawers along telescopic ball-bearing slides, wiping anti-static separator pads, checking pickup rings, and pushing drawers in with magnetic click.",
        oemCode: "CP-CAS-5000-D1",
        material: "Reinforced Steel Sub-Chassis + High-Grip Rubber Pickup Rings",
        tolerance: "Paper Width Guide: 0.1 mm Micro-Adjustment",
        duty: "250,000 Drawer Slide Cycles",
        latchType: "Telescopic Ball-Bearing Slides & Magnetic Catch"
      },
      {
        start: 0.92, end: 1.00,
        partName: "Structural frame",
        partTitle: "Full Overhaul Complete & Verified",
        spec: "COPYSTAR CERTIFIED · ALL 19 OEM COMPONENTS LOCKED & TESTED",
        title: "Part 9: Full Overhaul Complete · Verified 100%",
        desc: "Technician seals front door, puts tools in caddy, verifies green system diagnostic check on touch screen: Copier 100% operational and ready for production printing.",
        oemCode: "COPYSTAR-CERTIFIED-AMC",
        material: "Fully Integrated Multifunction Copier Chassis",
        tolerance: "Factory Precision Calibration",
        duty: "Continuous Commercial Operation",
        latchType: "All Interlocks & Sensors Verified Active"
      }
    ]
  },
  toner: {
    id: "toner",
    name: "4-Color CMYK Toner Cartridge Service",
    tag: "IMAGING CONSUMABLES · 4 CMYK TONER SERVICE",
    icon: "🎨",
    steps: [
      {
        start: 0.00, end: 0.18,
        partName: "Front service cover",
        partTitle: "Front Magnetic Door Safety Interlock",
        title: "Step 1: Front Door Release & Imaging Bay Exposure",
        spec: "DUST-SEALED HINGES · SAFETY INTERLOCK OPENED",
        desc: "Releasing front interlock safety latch, swinging magnetic door open 120 degrees to expose 4 CMYK toner cartridge bays.",
        oemCode: "CP-DR-5200-FR",
        material: "Flame-Retardant ABS + Magnetic Contact Switch",
        tolerance: "Dual Pivot Hinges",
        duty: "100,000 Cycles",
        latchType: "Magnetic Safety Latch"
      },
      {
        start: 0.18, end: 0.38,
        partName: "Toner cyan",
        partTitle: "Cyan Micro-Polymer Toner Cartridge",
        title: "Step 2: Cyan Toner (C) Unlatch, Agitate & Seat",
        spec: "OEM #TN-8800-C · 45,000 PAGES · RFID CHIP",
        desc: "Pressing cyan locking lever, sliding cartridge out along rails, shaking horizontally for fluid toner distribution, and pressing home until clicked.",
        oemCode: "CP-TN-8800-C",
        material: "Micro-Polymer Cyan Toner",
        tolerance: "Dual Slide Rail Guide",
        duty: "45,000 Pages @ 5%",
        latchType: "Cam-Lock Lever"
      },
      {
        start: 0.38, end: 0.58,
        partName: "Toner magenta",
        partTitle: "Magenta Micro-Polymer Toner Cartridge",
        title: "Step 3: Magenta Toner (M) Extraction & Insertion",
        spec: "OEM #TN-8800-M · 45,000 PAGES · RFID CHIP",
        desc: "Disengaging magenta rail latch, pulling cartridge forward, inspecting developer seal, shaking bottle, and reseating into rail guides.",
        oemCode: "CP-TN-8800-M",
        material: "Micro-Polymer Magenta Toner",
        tolerance: "Dual Slide Rail Guide",
        duty: "45,000 Pages @ 5%",
        latchType: "Cam-Lock Lever"
      },
      {
        start: 0.58, end: 0.78,
        partName: "Toner yellow",
        partTitle: "Yellow Micro-Polymer Toner Cartridge",
        title: "Step 4: Yellow Toner (Y) Service & Sensor Check",
        spec: "OEM #TN-8800-Y · 45,000 PAGES · RFID CHIP",
        desc: "Sliding yellow toner bottle, cleaning optical level sensor with lint-free swab, agitating cartridge, and docking with positive lock.",
        oemCode: "CP-TN-8800-Y",
        material: "Micro-Polymer Yellow Toner",
        tolerance: "Dual Slide Rail Guide",
        duty: "45,000 Pages @ 5%",
        latchType: "Cam-Lock Lever"
      },
      {
        start: 0.78, end: 0.92,
        partName: "Toner black",
        partTitle: "High-Capacity Black Toner Cartridge",
        title: "Step 5: Black High-Yield (K) Cartridge Service",
        spec: "OEM #TN-8800-K · 70,000 PAGES HIGH-YIELD",
        desc: "Pulling heavy-duty black toner unit, verifying agitator drive coupling, shaking bottle, and sliding into primary imaging bay.",
        oemCode: "CP-TN-8800-K",
        material: "High-Density Carbon Black Polymer",
        tolerance: "Reinforced Heavy Slide Track",
        duty: "70,000 Pages @ 5%",
        latchType: "Heavy-Duty Cam Lock"
      },
      {
        start: 0.92, end: 1.00,
        partName: "Front service cover",
        partTitle: "Front Door Lock & Diagnostic Verification",
        title: "Step 6: Front Door Sealed & Toner Levels 100%",
        spec: "ALL 4 CMYK TONERS AUTHENTICATED & 100% READY",
        desc: "Swinging magnetic door shut firmly with palm. RFID diagnostic screen confirms all 4 cartridges genuine and calibrated.",
        oemCode: "CP-DR-5200-FR",
        material: "Magnetic Interlock Confirmed Active",
        tolerance: "Zero-Vibration Sealing",
        duty: "Service Complete",
        latchType: "Magnetic Safety Latch"
      }
    ]
  },
  roller: {
    id: "roller",
    name: "Transfer & Fuser Rollers + Drive Gears",
    tag: "THERMAL FUSER & TRANSMISSION · HIGH-TEMP MAINTENANCE",
    icon: "⚙️",
    steps: [
      {
        start: 0.00, end: 0.28,
        partName: "Right service panel",
        partTitle: "Right Thermal Maintenance Service Cover",
        title: "Step 1: Right Service Panel Disassembly",
        spec: "LATCH-RELEASED COVER · THERMAL VENTILATION LOUVERS",
        desc: "Technician unscrews captive safety fasteners on right side cover with tool, pivots panel outward, exposing fuser cavity and drive train.",
        oemCode: "CP-PNL-2030-RT",
        material: "Heat-Resistant ABS-FR with Ventilation Grid",
        tolerance: "Captive Spring Screws",
        duty: "50,000 Removals",
        latchType: "Dual Captive Fasteners"
      },
      {
        start: 0.28, end: 0.62,
        partName: "Transfer and fuser rollers",
        partTitle: "Heated Silicone Fuser Roller Unit",
        title: "Step 2: Disengaging High-Temp Fuser Roller Unit",
        spec: "200°C HEAT-RESISTANT · TEFLON SLEEVE · 100K PAGES",
        desc: "Disengaging high-temp cam locks, sliding out heated fuser roller module, inspecting surface for toner buildup, cleaning with heat pad, and seating.",
        oemCode: "CP-FUS-2200-HT",
        material: "Fluoropolymer Sleeve + Silicone Core",
        tolerance: "±0.03 mm Radial Runout",
        duty: "100,000 Pages",
        latchType: "Thermal Cam Lock"
      },
      {
        start: 0.62, end: 0.88,
        partName: "Drive gears",
        partTitle: "Helical Gear Cluster Transmission",
        title: "Step 3: Precision Drive Gear Cluster Inspection",
        spec: "14T/12T/10T HELICAL & SPUR · DELRIN POM · ZERO BACKLASH",
        desc: "Loosening drive retainer bracket, disengaging helical gears, checking gear teeth with probe, applying silicone grease, and re-meshing teeth.",
        oemCode: "CP-GR-4402-DRV",
        material: "Heavy-Duty POM Delrin + Sintered Steel Hub",
        tolerance: "Zero Backlash Mesh",
        duty: "500,000 Revolutions",
        latchType: "Spline Shaft Clip"
      },
      {
        start: 0.88, end: 1.00,
        partName: "Drive gears",
        partTitle: "Drive System Armed & Right Cover Sealed",
        title: "Step 4: Right Panel Sealed & 60 RPM Drive Test Passed",
        spec: "TRANSMISSION LOCKED · ZERO PLAY · TEST PASSED",
        desc: "Docking right panel, tightening captive screws, running 60 RPM drive motor diagnostic test to verify smooth whisper-quiet operation.",
        oemCode: "CP-SYS-DRV-OK",
        material: "Complete Thermal & Drive Assembly",
        tolerance: "Full Motor Diagnostic Passed",
        duty: "100% Ready for Heavy Duty",
        latchType: "Thermal & Mechanical Interlocks Active"
      }
    ]
  },
  cassette: {
    id: "cassette",
    name: "Dual Paper Cassette Drawers",
    tag: "FEED SYSTEM & PICKUP ROLLERS · 1,000-SHEET CAPACITY",
    icon: "📦",
    steps: [
      {
        start: 0.00, end: 0.35,
        partName: "Paper cassette 1",
        partTitle: "Upper Paper Cassette Tray 1 (500-Sheet)",
        title: "Step 1: Extending Tray 1 & Servicing Pickup Roller",
        spec: "500-SHEET CAPACITY · BALL-BEARING SLIDE RAILS",
        desc: "Technician crouches down, pulls out 500-sheet paper cassette along ball-bearing slides, wipes rubber pickup roller, and checks optical sensors.",
        oemCode: "CP-CAS-5001-TR1",
        material: "Reinforced Sub-Chassis + High-Grip Rubber Rings",
        tolerance: "A4 / A3 Adjustable Width Guides",
        duty: "250,000 Drawer Slide Cycles",
        latchType: "Telescopic Ball-Bearing Slides"
      },
      {
        start: 0.35, end: 0.70,
        partName: "Paper cassette 2",
        partTitle: "Lower Paper Cassette Tray 2 (500-Sheet)",
        title: "Step 2: Extending Tray 2 & Cleaning Separator Pad",
        spec: "ANTI-STATIC CLEANING · SEPARATOR PAD ALIGNED",
        desc: "Extending Tray 2, wiping anti-static separator pad with cleaning cloth, blowing clear optical sheet sensors, and adjusting width guides.",
        oemCode: "CP-CAS-5002-TR2",
        material: "Reinforced Steel + Anti-Static Polyurethane Pad",
        tolerance: "0.1 mm Micro-Adjustment",
        duty: "250,000 Drawer Slide Cycles",
        latchType: "Telescopic Ball-Bearing Slides"
      },
      {
        start: 0.70, end: 1.00,
        partName: "Paper cassette 1",
        partTitle: "Dual Drawers Locked & Feed System Ready",
        title: "Step 3: Dual Drawers Locked & Feed System Ready",
        spec: "MAGNETIC LATCH · 1,000 SHEETS TOTAL READY",
        desc: "Pushing both drawers firmly in with palms until magnetic latches engage. Paper feed armed and ready for 60 PPM high-speed printing.",
        oemCode: "CP-FEED-1000SH",
        material: "Feed System Fully Armed",
        tolerance: "Magnetic Latch Engaged",
        duty: "Ready for 60 PPM Printing",
        latchType: "Magnetic Drawer Catch"
      }
    ]
  },
  scanner: {
    id: "scanner",
    name: "Scanner Bed & Document Feeder",
    tag: "OPTICS & DIGITAL UI · ADF & SCANNER",
    icon: "📄",
    steps: [
      {
        start: 0.00, end: 0.38,
        partName: "Automatic document feeder",
        partTitle: "Automatic Document Feeder (ADF)",
        title: "Step 1: Document Feeder Hinge Release & Lift",
        spec: "80 PPM DUAL-SCAN · REVERSE FEED ROLLERS",
        desc: "Technician unscrews hinge pins, lifts upper document feed unit with two hands, and cleans reverse feed rollers with microfiber cloth.",
        oemCode: "CP-ADF-9400-HD",
        material: "Polycarbonate Chassis + Optical Glass Guide",
        tolerance: "±0.05 mm Alignment",
        duty: "300,000 Feeds",
        latchType: "Quick-Release Hinge Pins"
      },
      {
        start: 0.38, end: 0.72,
        partName: "Scanner assembly",
        partTitle: "Optical Platen Glass & CCD Mirror Bed",
        title: "Step 2: Optical Platen Glass & Mirror Cleaning",
        spec: "600×600 DPI CCD CARRIAGE · ANTI-STATIC GLASS",
        desc: "Buffing optical glass bed with yellow microfiber cloth using circular buffing strokes, cleaning CCD mirrors, and seating glass onto dampers.",
        oemCode: "CP-SCN-6000-GL",
        material: "Borosilicate Glass + Aluminum Platen Frame",
        tolerance: "±0.02 mm Flatness",
        duty: "500,000 Scans",
        latchType: "Front Locking Lug"
      },
      {
        start: 0.72, end: 1.00,
        partName: "Touch control panel",
        partTitle: "Smart Touch Screen & Diagnostic Test",
        title: "Step 3: Touch Screen Alignment & Optical Test Passed",
        spec: "10.1\" DISPLAY · 600 DPI OPTICAL CALIBRATION PASSED",
        desc: "Docking touch display harness into swivel bracket, tapping screen with index finger to confirm 600 DPI optical alignment test passed.",
        oemCode: "CP-DSP-1010-UI",
        material: "Capacitive Glass + WSVGA Display",
        tolerance: "Zero-Flex Mount",
        duty: "1,000,000 Operations",
        latchType: "Snap-In Swivel Joint"
      }
    ]
  }
};

/**
 * Builds the 3D Technician character with lifelike human anatomy, expressive face,
 * detailed service uniform, articulated joints, handheld tools, and mobile service caddy.
 * Scaled to 2.45 to match the 4.3-unit photocopier model proportions (1.78m human height).
 */
export function buildTechnician() {
  const root = new T.Group();
  root.name = "Technician_Root";
  root.scale.set(2.45, 2.45, 2.45);
  root.position.set(1.65, 0.14, 1.15);

  // Materials
  const skin = mat("#f1c29e", 0.60, 0.0);
  const uniformNavy = mat("#1a365d", 0.46, 0.02);
  const uniformRed = mat("#dc2626", 0.38, 0.05);
  const uniformDark = mat("#0f172a", 0.52, 0.0);
  const beltMat = mat("#291e18", 0.62, 0.1);
  const goldBrass = mat("#d97706", 0.32, 0.7);
  const steel = mat("#94a3b8", 0.28, 0.65);
  const whiteMat = mat("#f8fafc", 0.28, 0.0);
  const blackRubber = mat("#090d16", 0.82, 0.0);
  const glassLens = mat("#38bdf8", 0.15, 0.45);
  glassLens.transparent = true;
  glassLens.opacity = 0.75;

  const cyanMat = mat("#0ea5e9", 0.32, 0.1);
  const magentaMat = mat("#ec4899", 0.32, 0.1);
  const yellowMat = mat("#eab308", 0.32, 0.1);
  const tonerBlack = mat("#18181b", 0.4, 0.05);

  function mesh(geom, m, x = 0, y = 0, z = 0, parent = root) {
    const a = new T.Mesh(geom, m);
    a.position.set(x, y, z);
    a.castShadow = true;
    a.receiveShadow = true;
    if (parent) parent.add(a);
    return a;
  }

  function box(w, h, d, m, x = 0, y = 0, z = 0, parent = root) {
    const geo = new T.BoxGeometry(w, h, d);
    return mesh(geo, m, x, y, z, parent);
  }

  function cyl(rTop, rBot, len, m, x = 0, y = 0, z = 0, parent = root, axis = "y") {
    const geo = new T.CylinderGeometry(rTop, rBot, len, 16);
    const msh = mesh(geo, m, x, y, z, parent);
    if (axis === "x") msh.rotation.z = Math.PI / 2;
    if (axis === "z") msh.rotation.x = Math.PI / 2;
    return msh;
  }

  // --- SKELETON HIERARCHY ---
  // Pelvis / Hips (standing height at y = 1.00m in local space)
  const hips = new T.Group();
  hips.name = "hips";
  hips.position.set(0, 1.00, 0);
  root.add(hips);

  // Pelvis mesh & heavy-duty technician belt
  box(0.44, 0.18, 0.28, uniformNavy, 0, 0, 0, hips);
  box(0.46, 0.06, 0.30, beltMat, 0, 0.07, 0, hips);
  box(0.10, 0.07, 0.315, goldBrass, 0, 0.07, 0, hips);

  // Right Hip Tool Holster with screwdrivers & probe
  box(0.12, 0.18, 0.12, beltMat, 0.25, -0.02, 0.03, hips);
  cyl(0.016, 0.016, 0.14, uniformRed, 0.26, 0.10, 0.03, hips);
  cyl(0.012, 0.012, 0.12, cyanMat, 0.26, 0.08, 0.06, hips);
  cyl(0.006, 0.006, 0.10, steel, 0.26, 0.18, 0.03, hips);

  // Left Hip Multimeter Diagnostic Pouch
  box(0.11, 0.16, 0.11, beltMat, -0.25, -0.02, 0.03, hips);
  box(0.07, 0.10, 0.03, uniformRed, -0.25, 0.04, 0.03, hips);

  // --- LEGS & FEET (GROUNDED FLAT ON FLOOR AT y = 0.0 IN LOCAL SPACE) ---
  // Left Leg
  const leftHip = new T.Group();
  leftHip.position.set(-0.15, 0, 0);
  hips.add(leftHip);
  cyl(0.092, 0.080, 0.48, uniformNavy, 0, -0.24, 0, leftHip);
  box(0.11, 0.14, 0.025, uniformDark, 0, -0.24, 0.085, leftHip); // Knee patch

  const leftKnee = new T.Group();
  leftKnee.position.set(0, -0.48, 0);
  leftHip.add(leftKnee);
  cyl(0.078, 0.068, 0.44, uniformNavy, 0, -0.22, 0, leftKnee);

  const leftAnkle = new T.Group();
  leftAnkle.position.set(0, -0.44, 0);
  leftKnee.add(leftAnkle);
  // Steel-toe work boots resting flat on floor (bottom touches y = 0.0 relative to root)
  box(0.15, 0.09, 0.28, blackRubber, 0, -0.04, 0.04, leftAnkle);
  box(0.14, 0.06, 0.11, uniformDark, 0, -0.055, 0.13, leftAnkle);
  box(0.13, 0.03, 0.06, uniformRed, 0, -0.035, -0.08, leftAnkle);
  box(0.16, 0.025, 0.30, uniformDark, 0, -0.08, 0.04, leftAnkle); // Sole

  // Right Leg
  const rightHip = new T.Group();
  rightHip.position.set(0.15, 0, 0);
  hips.add(rightHip);
  cyl(0.092, 0.080, 0.48, uniformNavy, 0, -0.24, 0, rightHip);
  box(0.11, 0.14, 0.025, uniformDark, 0, -0.24, 0.085, rightHip); // Knee patch

  const rightKnee = new T.Group();
  rightKnee.position.set(0, -0.48, 0);
  rightHip.add(rightKnee);
  cyl(0.078, 0.068, 0.44, uniformNavy, 0, -0.22, 0, rightKnee);

  const rightAnkle = new T.Group();
  rightAnkle.position.set(0, -0.44, 0);
  rightKnee.add(rightAnkle);
  box(0.15, 0.09, 0.28, blackRubber, 0, -0.04, 0.04, rightAnkle);
  box(0.14, 0.06, 0.11, uniformDark, 0, -0.055, 0.13, rightAnkle);
  box(0.13, 0.03, 0.06, uniformRed, 0, -0.035, -0.08, rightAnkle);
  box(0.16, 0.025, 0.30, uniformDark, 0, -0.08, 0.04, rightAnkle); // Sole

  // --- TORSO / SPINE ---
  const torso = new T.Group();
  torso.name = "torso";
  torso.position.set(0, 0.10, 0);
  hips.add(torso);

  // Field Service Jacket
  box(0.48, 0.52, 0.30, uniformNavy, 0, 0.26, 0, torso);
  // Red folded collar & tie
  box(0.24, 0.11, 0.31, uniformRed, 0, 0.48, 0, torso);
  box(0.06, 0.16, 0.312, uniformRed, 0, 0.40, 0, torso);
  // Reflective safety stripe across chest & back
  box(0.485, 0.028, 0.305, mat("#facc15", 0.2, 0.1), 0, 0.32, 0, torso);
  // COPYSTAR certified chest badge with photo
  box(0.10, 0.07, 0.012, whiteMat, -0.13, 0.40, 0.155, torso);
  box(0.08, 0.016, 0.015, uniformRed, -0.13, 0.42, 0.156, torso);
  // Right breast pocket with dual ballpoint pens
  box(0.08, 0.07, 0.010, uniformDark, 0.13, 0.40, 0.155, torso);
  cyl(0.005, 0.005, 0.08, uniformDark, 0.12, 0.44, 0.158, torso);
  cyl(0.005, 0.005, 0.08, uniformRed, 0.14, 0.44, 0.158, torso);

  // --- NECK & ANATOMICAL HEAD ---
  const neck = new T.Group();
  neck.position.set(0, 0.52, 0);
  torso.add(neck);
  cyl(0.065, 0.075, 0.10, skin, 0, 0.05, 0, neck);

  const head = new T.Group();
  head.position.set(0, 0.10, 0);
  neck.add(head);

  // Cranium & facial contour
  const headMesh = mesh(new T.SphereGeometry(0.14, 16, 16), skin, 0, 0.10, 0, head);
  headMesh.scale.set(0.92, 1.05, 0.98);
  box(0.11, 0.06, 0.11, skin, 0, 0.03, 0.05, head); // Chin & jaw

  // Eyes with white sclera and focused dark pupils
  box(0.032, 0.018, 0.012, whiteMat, -0.05, 0.11, 0.122, head);
  box(0.015, 0.015, 0.015, uniformDark, -0.05, 0.11, 0.125, head);
  box(0.032, 0.018, 0.012, whiteMat, 0.05, 0.11, 0.122, head);
  box(0.015, 0.015, 0.015, uniformDark, 0.05, 0.11, 0.125, head);

  // Eyebrows
  box(0.038, 0.010, 0.012, uniformDark, -0.05, 0.13, 0.125, head);
  box(0.038, 0.010, 0.012, uniformDark, 0.05, 0.13, 0.125, head);

  // Sculpted nose & ears
  box(0.022, 0.038, 0.032, skin, 0, 0.09, 0.138, head);
  cyl(0.020, 0.020, 0.012, skin, -0.135, 0.10, 0, head, "x");
  cyl(0.020, 0.020, 0.012, skin, 0.135, 0.10, 0, head, "x");

  // Diagnostic safety spectacles
  box(0.20, 0.032, 0.04, glassLens, 0, 0.11, 0.135, head);
  cyl(0.003, 0.003, 0.04, steel, 0, 0.11, 0.14, head, "x");

  // Technician Communication Headset
  cyl(0.030, 0.030, 0.025, uniformDark, -0.145, 0.10, 0, head, "x");
  cyl(0.004, 0.004, 0.11, steel, -0.11, 0.07, 0.07, head);
  mesh(new T.SphereGeometry(0.010, 8, 8), uniformRed, -0.06, 0.05, 0.13, head);

  // Service Cap with forward-facing visor and gold emblem
  const hair = mesh(new T.SphereGeometry(0.148, 16, 16), uniformDark, 0, 0.12, -0.015, head);
  hair.scale.set(0.96, 0.95, 1.02);
  const capDome = mesh(new T.SphereGeometry(0.152, 16, 16), uniformNavy, 0, 0.16, -0.01, head);
  capDome.scale.set(0.96, 0.55, 1.02);
  box(0.18, 0.016, 0.13, uniformRed, 0, 0.145, 0.145, head); // Visor
  cyl(0.016, 0.016, 0.008, goldBrass, 0, 0.185, 0.145, head, "z"); // Emblem

  // --- ARMS (LEFT & RIGHT WITH ANATOMICAL PIVOTS) ---
  // Left Arm
  const leftShoulder = new T.Group();
  leftShoulder.position.set(-0.26, 0.48, 0);
  torso.add(leftShoulder);
  mesh(new T.SphereGeometry(0.075, 12, 12), uniformNavy, 0, 0, 0, leftShoulder);
  cyl(0.065, 0.058, 0.34, uniformNavy, 0, -0.17, 0, leftShoulder);

  const leftElbow = new T.Group();
  leftElbow.position.set(0, -0.34, 0);
  leftShoulder.add(leftElbow);
  mesh(new T.SphereGeometry(0.060, 12, 12), uniformNavy, 0, 0, 0, leftElbow);
  cyl(0.056, 0.050, 0.30, uniformNavy, 0, -0.15, 0, leftElbow);

  const leftWrist = new T.Group();
  leftWrist.position.set(0, -0.30, 0);
  leftElbow.add(leftWrist);
  box(0.055, 0.075, 0.038, skin, 0, -0.038, 0, leftWrist);
  box(0.020, 0.038, 0.025, skin, 0.032, -0.025, 0.015, leftWrist);
  box(0.050, 0.040, 0.025, skin, 0, -0.08, 0.008, leftWrist);

  // Right Arm
  const rightShoulder = new T.Group();
  rightShoulder.position.set(0.26, 0.48, 0);
  torso.add(rightShoulder);
  mesh(new T.SphereGeometry(0.075, 12, 12), uniformNavy, 0, 0, 0, rightShoulder);
  cyl(0.065, 0.058, 0.34, uniformNavy, 0, -0.17, 0, rightShoulder);

  const rightElbow = new T.Group();
  rightElbow.position.set(0, -0.34, 0);
  rightShoulder.add(rightElbow);
  mesh(new T.SphereGeometry(0.060, 12, 12), uniformNavy, 0, 0, 0, rightElbow);
  cyl(0.056, 0.050, 0.30, uniformNavy, 0, -0.15, 0, rightElbow);

  const rightWrist = new T.Group();
  rightWrist.position.set(0, -0.30, 0);
  rightElbow.add(rightWrist);
  box(0.055, 0.075, 0.038, skin, 0, -0.038, 0, rightWrist);
  box(0.020, 0.038, 0.025, skin, -0.032, -0.025, 0.015, rightWrist);
  box(0.050, 0.040, 0.025, skin, 0, -0.08, 0.008, rightWrist);

  // Handheld props slot attached to right wrist
  const heldPropGroup = new T.Group();
  heldPropGroup.position.set(0, -0.07, 0.03);
  rightWrist.add(heldPropGroup);

  // HELD PROP 1: CMYK Toner Cartridge
  const heldToner = new T.Group();
  heldToner.name = "heldToner";
  heldToner.visible = false;
  heldPropGroup.add(heldToner);
  cyl(0.072, 0.072, 1.15, tonerBlack, 0, 0, 0, heldToner, "x");
  cyl(0.082, 0.082, 0.14, cyanMat, 0.58, 0, 0, heldToner, "x");
  box(0.12, 0.09, 0.07, cyanMat, 0.68, 0, 0.03, heldToner);
  cyl(0.065, 0.065, 0.10, steel, -0.62, 0, 0, heldToner, "x");

  // HELD PROP 2: Precision magnetic screwdriver / probe
  const heldTool = new T.Group();
  heldTool.name = "heldTool";
  heldTool.visible = false;
  heldPropGroup.add(heldTool);
  cyl(0.022, 0.018, 0.16, uniformRed, 0, 0, 0, heldTool, "z");
  cyl(0.024, 0.024, 0.03, uniformDark, 0, 0, 0.03, heldTool, "z");
  cyl(0.007, 0.007, 0.22, steel, 0, 0, 0.19, heldTool, "z");
  cyl(0.005, 0.002, 0.03, uniformDark, 0, 0, 0.31, heldTool, "z"); // Magnetic tip

  // HELD PROP 3: High-visibility yellow microfiber cleaning cloth
  const heldCloth = new T.Group();
  heldCloth.name = "heldCloth";
  heldCloth.visible = false;
  heldPropGroup.add(heldCloth);
  box(0.15, 0.05, 0.16, yellowMat, 0, 0, 0.06, heldCloth);
  box(0.12, 0.03, 0.13, mat("#fef08a", 0.9, 0), 0, 0.015, 0.06, heldCloth);

  // --- SERVICE CADDY / MOBILE TROLLEY (INDEPENDENT OBJECT PARKED BESIDE MACHINE) ---
  const caddy = new T.Group();
  caddy.name = "Service_Caddy";
  caddy.scale.set(2.45, 2.45, 2.45);
  caddy.position.set(2.7, 0.14, 1.6);
  caddy.rotation.y = -2.1;

  for (const cx of [-0.22, 0.22]) {
    for (const cz of [-0.18, 0.18]) {
      cyl(0.035, 0.035, 0.028, blackRubber, cx, 0.035, cz, caddy, "x");
      cyl(0.010, 0.010, 0.06, steel, cx, 0.065, cz, caddy);
    }
  }

  for (const cx of [-0.23, 0.23]) {
    for (const cz of [-0.19, 0.19]) {
      cyl(0.011, 0.011, 1.15, steel, cx, 0.65, cz, caddy);
    }
  }

  box(0.54, 0.028, 0.44, steel, 0, 0.12, 0, caddy);
  box(0.36, 0.20, 0.28, uniformNavy, -0.04, 0.24, 0, caddy);
  box(0.37, 0.04, 0.29, uniformRed, -0.04, 0.34, 0, caddy);
  box(0.56, 0.032, 0.46, steel, 0, 0.98, 0, caddy);

  const tablet = new T.Group();
  tablet.position.set(-0.14, 1.02, 0);
  tablet.rotation.set(-0.25, 0.3, 0);
  caddy.add(tablet);
  box(0.20, 0.012, 0.28, uniformDark, 0, 0, 0, tablet);
  box(0.17, 0.015, 0.25, new T.MeshBasicMaterial({ color: 0x0ea5e9 }), 0, 0.004, 0, tablet);

  // --- SNAP / LOCK PULSE RING EFFECT ---
  const snapRing = new T.Group();
  snapRing.name = "snapRing";
  snapRing.position.set(0, 2.1, 1.05);
  snapRing.visible = false;

  const ringGeo = new T.RingGeometry(0.12, 0.45, 32);
  const ringMat = new T.MeshBasicMaterial({
    color: 0x22c55e,
    side: T.DoubleSide,
    transparent: true,
    opacity: 0.95
  });
  const ringMesh = new T.Mesh(ringGeo, ringMat);
  snapRing.add(ringMesh);

  return {
    root,
    limbs: {
      hips,
      torso,
      neck,
      head,
      leftHip,
      leftKnee,
      leftAnkle,
      rightHip,
      rightKnee,
      rightAnkle,
      leftShoulder,
      leftElbow,
      leftWrist,
      rightShoulder,
      rightElbow,
      rightWrist,
      heldPropGroup,
      heldToner,
      heldTool,
      heldCloth
    },
    caddy,
    snapRing,
    ringMesh,
    activePart: null,
    activePart3DPos: new T.Vector3(0, 2.2, 0.8),
    justLocked: false
  };
}

/**
 * Mathematically exact 2-Bone Arm Inverse Kinematics solver.
 * Uses Law of Cosines for natural elbow flexion and Three.js Quaternions
 * to orient the arm directly at targetWorld with zero gimbal lock or inversion.
 */
export function solveArmIK(shoulder, elbow, wrist, targetWorld, scale = 2.45, isRight = true) {
  const L1 = 0.34;
  const L2 = 0.30;

  shoulder.updateMatrixWorld(true);
  const shoulderWorld = new T.Vector3();
  shoulder.getWorldPosition(shoulderWorld);

  const toTgtWorld = targetWorld.clone().sub(shoulderWorld);
  const distWorld = toTgtWorld.length();
  const dLocal = Math.max(0.12, Math.min(distWorld / scale, L1 + L2 - 0.012));

  // Law of Cosines for elbow angle
  const cosElbow = (L1 * L1 + L2 * L2 - dLocal * dLocal) / (2 * L1 * L2);
  const elbowAngle = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosElbow)));

  elbow.rotation.set(-elbowAngle, 0, 0);

  // Arm vector in shoulder local space (from shoulder origin to wrist)
  const upperLocal = new T.Vector3(0, -L1, 0);
  const lowerLocal = new T.Vector3(0, -L2, 0).applyAxisAngle(new T.Vector3(1, 0, 0), -elbowAngle);
  const armVecLocal = upperLocal.clone().add(lowerLocal).normalize();

  // Target direction in shoulder parent (torso) coordinate frame
  const torso = shoulder.parent;
  torso.updateMatrixWorld(true);
  const toTgtTorso = toTgtWorld.clone().transformDirection(new T.Matrix4().copy(torso.matrixWorld).invert()).normalize();

  // Shoulder quaternion aligns armVecLocal with toTgtTorso
  const q = new T.Quaternion().setFromUnitVectors(armVecLocal, toTgtTorso);
  shoulder.quaternion.copy(q);
  wrist.rotation.set(0, 0, 0);
}

// Dedicated physical workstations positioned cleanly around the photocopier
export const WORKSTATIONS = {
  all: [
    { x: 1.55, z: 1.10, rotY: -2.25 }, // 0: ADF Feeder Unit (Top front-right)
    { x: 1.50, z: 0.95, rotY: -2.20 }, // 1: Scanner Platen Glass (Front-right)
    { x: 1.65, z: 1.35, rotY: -2.35 }, // 2: Smart Touch UI Screen
    { x: 1.45, z: 1.55, rotY: -2.40 }, // 3: Front Service Access Door
    { x: 1.40, z: 1.45, rotY: -2.45 }, // 4: 4-Color CMYK Toners (Front-right)
    { x: 2.30, z: 0.20, rotY: -1.63 }, // 5: High-Temp Fuser Rollers (Right side bay)
    { x: 2.20, z: -0.50, rotY: -1.45 }, // 6: Drive Gear Cluster (Right rear corner)
    { x: 1.55, z: 1.45, rotY: -2.05, squat: true }, // 7: Paper Cassette Trays (Front-right side, grounded squat)
    { x: 1.65, z: 1.60, rotY: 0.35 }  // 8: 100% Certified (Steps back, thumbs up towards camera)
  ],
  toner: [
    { x: 1.45, z: 1.55, rotY: -2.40 }, // 0: Open Front Door
    { x: 1.40, z: 1.45, rotY: -2.45 }, // 1: Cyan Toner
    { x: 1.40, z: 1.45, rotY: -2.45 }, // 2: Magenta Toner
    { x: 1.40, z: 1.45, rotY: -2.45 }, // 3: Yellow Toner
    { x: 1.40, z: 1.45, rotY: -2.45 }, // 4: Black Toner
    { x: 1.45, z: 1.55, rotY: -2.40 }  // 5: Close Front Door
  ],
  roller: [
    { x: 2.30, z: 0.40, rotY: -1.63 }, // 0: Right Service Panel (Right side)
    { x: 2.30, z: 0.20, rotY: -1.63 }, // 1: Fuser Unit (Right side)
    { x: 2.20, z: -0.50, rotY: -1.45 }, // 2: Drive Gears (Right rear corner)
    { x: 2.20, z: -0.50, rotY: -1.45 }  // 3: 60 RPM Drive Test
  ],
  cassette: [
    { x: 1.55, z: 1.45, rotY: -2.05, squat: true }, // 0: Tray 1 Pickup Roller (Grounded squat)
    { x: 1.55, z: 1.45, rotY: -2.05, squat: true }, // 1: Tray 2 Separator Pad (Grounded squat)
    { x: 1.65, z: 1.60, rotY: 0.35 }                // 2: Drawers Locked & Verified
  ],
  scanner: [
    { x: 1.55, z: 1.10, rotY: -2.25 }, // 0: ADF Hinge & Lift (Front-right)
    { x: 1.50, z: 0.95, rotY: -2.20 }, // 1: Optical Platen Glass (Buffing)
    { x: 1.65, z: 1.35, rotY: -2.35 }  // 2: Touch UI Diagnostic Calibration
  ]
};

/**
 * Procedurally animates the technician as a skilled human mechanic at work:
 * - Active walking locomotion between workstations around the machine
 * - Mathematically exact 2-bone Inverse Kinematics
 * - Grounded athletic squat for lower cassettes (feet 100% on floor, spine tilts forward)
 * - Active head gaze tracking towards work point
 * - Microfiber wiping, precision unscrewing, toner agitation shaking, and palm pressing.
 */
export function animateTechnicianService(technician, copier, actionId, p, time = 0) {
  if (!technician || !copier) return;

  const { limbs, snapRing, ringMesh } = technician;
  const action = SERVICE_ACTIONS[actionId] || SERVICE_ACTIONS.all;
  const steps = action.steps;
  const stations = WORKSTATIONS[actionId] || WORKSTATIONS.all;

  // Determine current active step
  let currentStep = steps[0];
  let stepIdx = 0;
  for (let i = 0; i < steps.length; i++) {
    if (p >= steps[i].start && p <= steps[i].end) {
      currentStep = steps[i];
      stepIdx = i;
      break;
    }
  }

  // Local step progress from 0.0 to 1.0
  const stepDuration = Math.max(0.001, currentStep.end - currentStep.start);
  const localP = Math.max(0, Math.min(1, (p - currentStep.start) / stepDuration));

  // Reset held props visibility
  limbs.heldToner.visible = false;
  limbs.heldTool.visible = false;
  if (limbs.heldCloth) limbs.heldCloth.visible = false;
  snapRing.visible = false;

  // Map parts by name
  const partMap = {};
  copier.parts.forEach(pt => { partMap[pt.g.name] = pt; });

  const frontDoorPart = partMap["Front service cover"];
  const feederPart = partMap["Automatic document feeder"];
  const scannerPart = partMap["Scanner assembly"];
  const touchPart = partMap["Touch control panel"];
  const cyanToner = partMap["Toner cyan"];
  const magToner = partMap["Toner magenta"];
  const yelToner = partMap["Toner yellow"];
  const blkToner = partMap["Toner black"];
  const fuserPart = partMap["Transfer and fuser rollers"];
  const drivePart = partMap["Drive gears"];
  const cas1Part = partMap["Paper cassette 1"];
  const cas2Part = partMap["Paper cassette 2"];
  const rightPanelPart = partMap["Right service panel"];

  // Restore base poses
  copier.parts.forEach(pt => {
    pt.g.position.copy(pt.base);
    if (pt.baseRotation) pt.g.rotation.copy(pt.baseRotation);
    else pt.g.rotation.set(0, 0, 0);
  });

  // Service phase categorization (100% English)
  let phaseText = "WALKING TO WORKSTATION";
  if (localP >= 0.28 && localP < 0.48) {
    phaseText = "UNLATCHING & DISASSEMBLING";
  } else if (localP >= 0.48 && localP < 0.72) {
    phaseText = "INSPECTION & SERVICING";
  } else if (localP >= 0.72 && localP < 0.90) {
    phaseText = "REASSEMBLY & SEATING";
  } else if (localP >= 0.90) {
    phaseText = "POSITIVE LOCK & VERIFIED ✓";
  }

  // Smooth extraction displacement curve (starts after technician arrives at workstation)
  const extractAmount = smooth(0.32, 0.55, localP) * (1 - smooth(0.70, 0.92, localP));

  let active3D = new T.Vector3(0, 2.2, 0.8);
  let lockPos = new T.Vector3(0, 2.2, 1.05);

  const isSnapLocking = localP >= 0.90 && localP <= 0.97;
  technician.justLocked = isSnapLocking;

  // Mechanical human oscillations
  const unscrewTurn = Math.sin(time * 26) * 0.65;
  const wipeStroke = Math.sin(time * 12) * 0.25;
  const tonerShake = Math.sin(time * 24) * 0.15;
  const breathe = Math.sin(time * 2.2) * 0.015;
  const sway = Math.cos(time * 1.5) * 0.012;

  // =========================================================================
  // WALKING LOCOMOTION & WORKSTATION TRANSITIONS AROUND COPIER
  // =========================================================================

  const currentStation = stations[Math.min(stations.length - 1, stepIdx)];
  const prevStation = stations[Math.max(0, stepIdx - 1)];

  // Walking transition occurs in first 28% of a step when moving between stations
  const hasTravel = (prevStation.x !== currentStation.x || prevStation.z !== currentStation.z);
  const isTransitioning = localP < 0.28 && stepIdx > 0 && hasTravel;
  const walkP = isTransitioning ? smooth(0.0, 0.28, localP) : 1.0;

  let techX = currentStation.x;
  let techZ = currentStation.z;
  let techRotY = currentStation.rotY;

  if (isTransitioning) {
    // Current position along walk path
    techX = prevStation.x + (currentStation.x - prevStation.x) * walkP;
    techZ = prevStation.z + (currentStation.z - prevStation.z) * walkP;

    const dx = currentStation.x - prevStation.x;
    const dz = currentStation.z - prevStation.z;
    const travelAngle = Math.atan2(dx, dz);

    // Turn in direction of motion, blend to target workstation facing angle near end
    if (walkP < 0.75) {
      techRotY = travelAngle;
    } else {
      const blendP = smooth(0.75, 1.0, walkP);
      techRotY = lerpAngle(travelAngle, currentStation.rotY, blendP);
    }
  }

  // Update root coordinates directly on the floor plane (y = 0.14)
  technician.root.position.set(techX, 0.14, techZ);
  technician.root.rotation.y = techRotY;

  let rightTargetWorld = new T.Vector3();
  let leftTargetWorld = new T.Vector3();
  let squatAmount = 0.0;
  let useIK = true;

  // =========================================================================
  // TARGETED REPAIR SIMULATION FOR CURRENT STEP
  // =========================================================================

  if (actionId === "all") {
    switch (stepIdx) {
      case 0: { // ADF Feeder Unit
        if (feederPart) {
          feederPart.g.position.y = feederPart.base.y + 0.95 * extractAmount;
          feederPart.g.position.z = feederPart.base.z + 0.65 * extractAmount;
          feederPart.g.rotation.x = -0.32 * extractAmount;
          active3D.copy(feederPart.g.position);
          lockPos.set(0, 4.10, 0.20);
        }

        rightTargetWorld.set(0.30, feederPart ? feederPart.g.position.y + 0.15 : 4.15, feederPart ? feederPart.g.position.z + 0.25 : 0.25);
        leftTargetWorld.set(-0.30, feederPart ? feederPart.g.position.y + 0.15 : 4.15, feederPart ? feederPart.g.position.z + 0.25 : 0.25);

        if (localP >= 0.28 && localP < 0.45) {
          limbs.heldTool.visible = true;
          limbs.rightWrist.rotation.z = unscrewTurn;
        } else if (localP >= 0.50 && localP < 0.75) {
          if (limbs.heldCloth) limbs.heldCloth.visible = true;
          rightTargetWorld.x += wipeStroke * 0.4;
        }
        break;
      }
      case 1: { // Scanner Assembly & Platen Glass
        if (scannerPart) {
          scannerPart.g.position.y = scannerPart.base.y + 0.70 * extractAmount;
          scannerPart.g.position.z = scannerPart.base.z + 0.55 * extractAmount;
          scannerPart.g.rotation.x = -0.15 * extractAmount;
          active3D.copy(scannerPart.g.position);
          lockPos.set(0, 3.65, 0.20);
        }

        rightTargetWorld.set(0.20, scannerPart ? scannerPart.g.position.y + 0.10 : 3.75, scannerPart ? scannerPart.g.position.z : 0.0);
        leftTargetWorld.set(0.75, 3.70, 0.45); // Left hand rests on platen edge for support

        if (localP >= 0.28 && localP < 0.45) {
          limbs.heldTool.visible = true;
          limbs.rightWrist.rotation.z = unscrewTurn;
        } else if (localP >= 0.48 && localP < 0.75) {
          if (limbs.heldCloth) limbs.heldCloth.visible = true;
          // Circular buffing stroke
          rightTargetWorld.x += Math.cos(time * 10) * 0.22;
          rightTargetWorld.z += Math.sin(time * 10) * 0.16;
        }
        break;
      }
      case 2: { // Touch Screen Control Panel
        if (touchPart) {
          touchPart.g.position.x = touchPart.base.x + 0.55 * extractAmount;
          touchPart.g.position.y = touchPart.base.y + 0.25 * extractAmount;
          touchPart.g.position.z = touchPart.base.z + 0.75 * extractAmount;
          touchPart.g.rotation.y = 0.45 * extractAmount;
          active3D.copy(touchPart.g.position);
          lockPos.set(1.15, 3.50, 1.13);
        }

        rightTargetWorld.set(1.35 + 0.25 * extractAmount, 3.55 + 0.10 * extractAmount, 1.25 + 0.35 * extractAmount);
        leftTargetWorld.set(1.05, 3.35, 1.10);

        if (localP >= 0.28 && localP < 0.45) {
          limbs.heldTool.visible = true;
          limbs.rightWrist.rotation.z = unscrewTurn;
        } else if (localP >= 0.50 && localP < 0.75) {
          // Index finger taps diagnostic interface
          limbs.rightWrist.rotation.x = -0.3;
        }
        break;
      }
      case 3: { // Front Service Door
        const doorSwing = smooth(0.28, 0.65, localP);
        if (frontDoorPart) {
          frontDoorPart.g.position.x = frontDoorPart.base.x - 0.75 * doorSwing;
          frontDoorPart.g.position.z = frontDoorPart.base.z + 0.55 * doorSwing;
          frontDoorPart.g.rotation.y = -Math.PI * 0.48 * doorSwing;
          active3D.copy(frontDoorPart.g.position);
          lockPos.set(0, 2.40, 1.05);
        }

        leftTargetWorld.set(frontDoorPart ? frontDoorPart.g.position.x + 0.1 : 0.1, 2.35, frontDoorPart ? frontDoorPart.g.position.z : 1.1);
        rightTargetWorld.set(0.45, 2.30, 1.15);
        break;
      }
      case 4: { // 4 CMYK Toner Units
        if (frontDoorPart) {
          frontDoorPart.g.position.x = frontDoorPart.base.x - 0.75;
          frontDoorPart.g.position.z = frontDoorPart.base.z + 0.55;
          frontDoorPart.g.rotation.y = -Math.PI * 0.48;
        }

        [cyanToner, magToner, yelToner, blkToner].forEach((toner, i) => {
          if (toner) {
            const stagger = Math.sin(localP * Math.PI) * (1.65 - i * 0.15);
            toner.g.position.z = toner.base.z + stagger;
            toner.g.position.y = toner.base.y + 0.08 * Math.sin(localP * Math.PI);
          }
        });
        if (cyanToner) active3D.copy(cyanToner.g.position);
        lockPos.set(0, 2.30, 1.00);

        rightTargetWorld.set(0.55, 2.30, 1.45);
        leftTargetWorld.set(0.15, 2.30, 1.45);

        if (localP >= 0.35 && localP < 0.75) {
          limbs.heldToner.visible = true;
          rightTargetWorld.x += tonerShake;
          leftTargetWorld.x += tonerShake;
        }
        break;
      }
      case 5: { // Transfer & Fuser Rollers (Right side bay)
        if (fuserPart) {
          fuserPart.g.position.x = fuserPart.base.x + 1.35 * extractAmount;
          fuserPart.g.position.y = fuserPart.base.y + 0.25 * extractAmount;
          fuserPart.g.position.z = fuserPart.base.z + 0.65 * extractAmount;
          fuserPart.g.rotation.z = 0.18 * extractAmount;
          active3D.copy(fuserPart.g.position);
          lockPos.set(1.10, 2.66, 0.20);
        }

        rightTargetWorld.set(1.45, 2.66, 0.25);
        leftTargetWorld.set(1.35, 2.50, -0.05);

        if (localP >= 0.28 && localP < 0.45) {
          limbs.heldTool.visible = true;
          limbs.rightWrist.rotation.z = unscrewTurn;
        } else if (localP >= 0.50 && localP < 0.75) {
          if (limbs.heldCloth) limbs.heldCloth.visible = true;
          rightTargetWorld.z += wipeStroke * 0.35;
        }
        break;
      }
      case 6: { // Precision Drive Gear Cluster (Right rear corner)
        if (drivePart) {
          drivePart.g.position.x = drivePart.base.x + 1.15 * extractAmount;
          drivePart.g.position.y = drivePart.base.y + 0.15 * extractAmount;
          drivePart.g.position.z = drivePart.base.z + 0.45 * extractAmount;
          drivePart.g.children.forEach((c, idx) => {
            c.rotation.x += 0.10 * (idx % 2 === 0 ? 1 : -1);
          });
          active3D.copy(drivePart.g.position);
          lockPos.set(1.02, 2.22, -0.40);
        }

        limbs.heldTool.visible = true;
        rightTargetWorld.set(1.15, 2.22, -0.35);
        leftTargetWorld.set(1.25, 2.10, -0.15);
        break;
      }
      case 7: { // Paper Cassettes 1 & 2 (Grounded realistic athletic squat)
        if (localP >= 0.28) {
          squatAmount = smooth(0.28, 0.40, localP);
        }

        if (cas1Part) cas1Part.g.position.z = cas1Part.base.z + 1.85 * extractAmount;
        if (cas2Part) cas2Part.g.position.z = cas2Part.base.z + 1.55 * extractAmount;
        if (cas1Part) active3D.copy(cas1Part.g.position);
        lockPos.set(0, 1.20, 1.10);

        rightTargetWorld.set(0.35, 1.05, 1.45);
        leftTargetWorld.set(-0.15, 1.05, 1.45);

        if (localP >= 0.50 && localP < 0.75) {
          if (limbs.heldCloth) limbs.heldCloth.visible = true;
          rightTargetWorld.x += wipeStroke * 0.35;
        }
        break;
      }
      case 8: { // Full Assembly Complete & Verified
        active3D.set(0, 2.20, 0.80);
        lockPos.set(0, 2.40, 1.10);
        useIK = false;

        // Friendly thumbs-up check gesture
        const cheer = smooth(0.1, 0.7, localP);
        limbs.rightShoulder.quaternion.setFromEuler(new T.Euler(-0.85 * cheer, -0.2 * cheer, 0.35 * cheer));
        limbs.rightElbow.rotation.set(-1.35 * cheer, 0, 0);
        limbs.leftShoulder.quaternion.setFromEuler(new T.Euler(0.1, 0, -0.15));
        limbs.leftElbow.rotation.set(-0.35, 0, 0);
        limbs.head.rotation.set(-0.05, -0.25 * cheer, 0.05);
        break;
      }
    }
  } else if (actionId === "toner") {
    if (stepIdx === 0) {
      const doorOpen = smooth(0.28, 0.65, localP);
      if (frontDoorPart) {
        frontDoorPart.g.position.x = frontDoorPart.base.x - 0.75 * doorOpen;
        frontDoorPart.g.position.z = frontDoorPart.base.z + 0.55 * doorOpen;
        frontDoorPart.g.rotation.y = -Math.PI * 0.48 * doorOpen;
        active3D.copy(frontDoorPart.g.position);
        lockPos.set(0, 2.40, 1.05);
      }
      leftTargetWorld.set(frontDoorPart ? frontDoorPart.g.position.x + 0.1 : 0.1, 2.35, frontDoorPart ? frontDoorPart.g.position.z : 1.1);
      rightTargetWorld.set(0.45, 2.30, 1.15);
    } else if (stepIdx >= 1 && stepIdx <= 4) {
      if (frontDoorPart) {
        frontDoorPart.g.position.x = frontDoorPart.base.x - 0.75;
        frontDoorPart.g.position.z = frontDoorPart.base.z + 0.55;
        frontDoorPart.g.rotation.y = -Math.PI * 0.48;
      }

      const tonerArr = [cyanToner, magToner, yelToner, blkToner];
      const activeToner = tonerArr[stepIdx - 1];
      if (activeToner) {
        activeToner.g.position.z = activeToner.base.z + 1.75 * extractAmount;
        activeToner.g.position.y = activeToner.base.y + 0.12 * Math.sin(localP * Math.PI);
        active3D.copy(activeToner.g.position);
        lockPos.set(0, activeToner.base.y, 1.05);
      }

      rightTargetWorld.set(0.55, 2.30, 1.45);
      leftTargetWorld.set(0.15, 2.30, 1.45);

      if (localP >= 0.35 && localP < 0.75) {
        limbs.heldToner.visible = true;
        rightTargetWorld.x += tonerShake;
        leftTargetWorld.x += tonerShake;
      }
    } else {
      const doorClose = 1 - smooth(0.28, 0.65, localP);
      if (frontDoorPart) {
        frontDoorPart.g.position.x = frontDoorPart.base.x - 0.75 * doorClose;
        frontDoorPart.g.position.z = frontDoorPart.base.z + 0.55 * doorClose;
        frontDoorPart.g.rotation.y = -Math.PI * 0.48 * doorClose;
        active3D.copy(frontDoorPart.g.position);
        lockPos.set(0, 2.40, 1.05);
      }
      leftTargetWorld.set(frontDoorPart ? frontDoorPart.g.position.x + 0.1 : 0.1, 2.35, frontDoorPart ? frontDoorPart.g.position.z : 1.1);
      rightTargetWorld.set(0.45, 2.30, 1.15);
    }
  } else if (actionId === "roller") {
    if (stepIdx === 0) { // Right service panel
      limbs.heldTool.visible = true;
      limbs.rightWrist.rotation.z = unscrewTurn;
      if (rightPanelPart) {
        rightPanelPart.g.position.x = rightPanelPart.base.x + 1.65 * extractAmount;
        active3D.copy(rightPanelPart.g.position);
        lockPos.set(1.21, 2.03, 0);
      }
      rightTargetWorld.set(rightPanelPart ? rightPanelPart.g.position.x : 1.2, 2.03, 0);
      leftTargetWorld.set(1.10, 2.0, 0.3);
    } else if (stepIdx === 1) { // Fuser unit
      if (fuserPart) {
        fuserPart.g.position.x = fuserPart.base.x + 1.45 * extractAmount;
        fuserPart.g.position.y = fuserPart.base.y + 0.25 * extractAmount;
        fuserPart.g.position.z = fuserPart.base.z + 0.65 * extractAmount;
        active3D.copy(fuserPart.g.position);
        lockPos.set(1.10, 2.66, 0.20);
      }
      rightTargetWorld.set(1.45, 2.66, 0.25);
      leftTargetWorld.set(1.35, 2.50, -0.05);
      if (localP < 0.45) limbs.heldTool.visible = true;
      else if (localP >= 0.50 && localP < 0.75) {
        if (limbs.heldCloth) limbs.heldCloth.visible = true;
        rightTargetWorld.z += wipeStroke * 0.35;
      }
    } else { // Drive gears
      limbs.heldTool.visible = true;
      if (drivePart) {
        drivePart.g.position.x = drivePart.base.x + 1.25 * extractAmount;
        drivePart.g.children.forEach((c, idx) => {
          c.rotation.x += 0.12 * (idx % 2 === 0 ? 1 : -1);
        });
        active3D.copy(drivePart.g.position);
        lockPos.set(1.02, 2.22, -0.40);
      }
      rightTargetWorld.set(1.15, 2.22, -0.35);
      leftTargetWorld.set(1.25, 2.10, -0.15);
    }
  } else if (actionId === "cassette") {
    if (stepIdx < 2 && localP >= 0.28) {
      squatAmount = smooth(0.28, 0.40, localP);
    }

    if (stepIdx === 0) {
      if (cas1Part) {
        cas1Part.g.position.z = cas1Part.base.z + 1.85 * extractAmount;
        active3D.copy(cas1Part.g.position);
        lockPos.set(0, 0.93, 1.10);
      }
      rightTargetWorld.set(0.35, 1.00, 1.45);
      leftTargetWorld.set(-0.15, 1.00, 1.45);
    } else if (stepIdx === 1) {
      if (cas2Part) {
        cas2Part.g.position.z = cas2Part.base.z + 1.85 * extractAmount;
        active3D.copy(cas2Part.g.position);
        lockPos.set(0, 1.49, 1.10);
      }
      rightTargetWorld.set(0.35, 1.49, 1.45);
      leftTargetWorld.set(-0.15, 1.49, 1.45);
    } else {
      useIK = false;
      const cheer = smooth(0.2, 0.8, localP);
      limbs.rightShoulder.quaternion.setFromEuler(new T.Euler(-0.7 * cheer, -0.15 * cheer, 0.35 * cheer));
      limbs.rightElbow.rotation.set(-1.1 * cheer, 0, 0);
      active3D.set(0, 1.20, 1.00);
      lockPos.set(0, 1.20, 1.10);
    }
  } else if (actionId === "scanner") {
    if (stepIdx === 0) {
      if (feederPart) {
        feederPart.g.position.y = feederPart.base.y + 0.95 * extractAmount;
        feederPart.g.position.z = feederPart.base.z + 0.65 * extractAmount;
        feederPart.g.rotation.x = -0.32 * extractAmount;
        active3D.copy(feederPart.g.position);
        lockPos.set(0, 4.10, 0.20);
      }
      rightTargetWorld.set(0.30, feederPart ? feederPart.g.position.y + 0.15 : 4.15, feederPart ? feederPart.g.position.z + 0.25 : 0.25);
      leftTargetWorld.set(-0.30, feederPart ? feederPart.g.position.y + 0.15 : 4.15, feederPart ? feederPart.g.position.z + 0.25 : 0.25);
    } else if (stepIdx === 1) {
      if (limbs.heldCloth) limbs.heldCloth.visible = localP > 0.35 && localP < 0.75;
      if (scannerPart) {
        scannerPart.g.position.y = scannerPart.base.y + 0.70 * extractAmount;
        scannerPart.g.position.z = scannerPart.base.z + 0.55 * extractAmount;
        active3D.copy(scannerPart.g.position);
        lockPos.set(0, 3.65, 0.20);
      }
      rightTargetWorld.set(0.20 + Math.cos(time * 10) * 0.22, 3.75, Math.sin(time * 10) * 0.16);
      leftTargetWorld.set(0.75, 3.70, 0.45);
    } else {
      if (touchPart) {
        touchPart.g.position.x = touchPart.base.x + 0.55 * extractAmount;
        touchPart.g.position.z = touchPart.base.z + 0.75 * extractAmount;
        active3D.copy(touchPart.g.position);
        lockPos.set(1.15, 3.50, 1.13);
      }
      rightTargetWorld.set(1.35 + 0.25 * extractAmount, 3.55 + 0.10 * extractAmount, 1.25 + 0.35 * extractAmount);
      leftTargetWorld.set(1.05, 3.35, 1.10);
    }
  }

  // =========================================================================
  // LEGS & LOWER BODY: WALKING STRIDE vs GROUNDED SQUAT vs WORKING STANCE
  // =========================================================================

  if (isTransitioning) {
    // ACTIVE WALKING LOCOMOTION
    const walkCadence = time * 8.5;
    const stride = Math.sin(walkCadence) * 0.45;

    limbs.hips.position.y = 1.00 + Math.abs(Math.sin(walkCadence * 2)) * 0.03;
    limbs.leftHip.rotation.set(-stride, 0, -0.04);
    limbs.rightHip.rotation.set(stride, 0, 0.04);

    limbs.leftKnee.rotation.set(Math.max(0, stride) * 0.75, 0, 0);
    limbs.rightKnee.rotation.set(Math.max(0, -stride) * 0.75, 0, 0);

    limbs.leftAnkle.rotation.set(stride * 0.25, 0, 0);
    limbs.rightAnkle.rotation.set(-stride * 0.25, 0, 0);

    limbs.torso.rotation.set(0.04, Math.sin(walkCadence) * 0.08, 0);

    // Natural arm swings during walking
    limbs.leftShoulder.quaternion.setFromAxisAngle(new T.Vector3(1, 0, 0), stride * 0.7);
    limbs.leftElbow.rotation.set(-0.35, 0, 0);
    limbs.rightShoulder.quaternion.setFromAxisAngle(new T.Vector3(1, 0, 0), -stride * 0.7);
    limbs.rightElbow.rotation.set(-0.35, 0, 0);
    limbs.head.rotation.set(0, 0, 0);
  } else if (squatAmount > 0) {
    // GROUNDED ATHLETIC SQUAT (boots 100% flat on floor at y = 0.14, knees forward, torso leans forward)
    limbs.hips.position.y = 1.00 - 0.45 * squatAmount;
    const thighAngle = -1.15 * squatAmount;
    const kneeAngle = 2.30 * squatAmount;
    const ankleAngle = -1.15 * squatAmount;

    limbs.leftHip.rotation.set(thighAngle, 0, -0.04);
    limbs.rightHip.rotation.set(thighAngle, 0, 0.04);

    limbs.leftKnee.rotation.set(kneeAngle, 0, 0);
    limbs.rightKnee.rotation.set(kneeAngle, 0, 0);

    limbs.leftAnkle.rotation.set(ankleAngle, 0, 0);
    limbs.rightAnkle.rotation.set(ankleAngle, 0, 0);

    limbs.torso.rotation.set(0.40 * squatAmount, 0, sway); // Spine leans forward over drawer
  } else {
    // ALERT WORKING STANCE
    limbs.hips.position.y = 1.00 + breathe * 0.5;
    limbs.leftHip.rotation.set(0.04, 0, -0.04);
    limbs.leftKnee.rotation.set(-0.06, 0, 0);
    limbs.leftAnkle.rotation.set(0.02, 0, 0);

    limbs.rightHip.rotation.set(-0.04, 0, 0.04);
    limbs.rightKnee.rotation.set(-0.06, 0, 0);
    limbs.rightAnkle.rotation.set(0.02, 0, 0);

    limbs.torso.rotation.set(0.08, 0, sway); // Alert forward-engaged posture
  }

  // =========================================================================
  // ARMS INVERSE KINEMATICS & HEAD GAZE TRACKING (WHEN WORKING)
  // =========================================================================

  if (!isTransitioning && useIK) {
    solveArmIK(limbs.rightShoulder, limbs.rightElbow, limbs.rightWrist, rightTargetWorld, 2.45, true);
    solveArmIK(limbs.leftShoulder, limbs.leftElbow, limbs.leftWrist, leftTargetWorld, 2.45, false);

    // Active head gaze tracking towards work point
    const localWork = active3D.clone();
    technician.root.worldToLocal(localWork);
    const headLocal = new T.Vector3(0, limbs.hips.position.y + limbs.torso.position.y + 0.62, 0);
    const gazeVec = localWork.sub(headLocal);
    const gazeHoriz = Math.sqrt(gazeVec.x * gazeVec.x + gazeVec.z * gazeVec.z);
    const gYaw = Math.atan2(gazeVec.x, Math.max(0.01, gazeVec.z));
    const gPitch = Math.atan2(gazeVec.y, Math.max(0.01, gazeHoriz));
    limbs.head.rotation.x = -Math.max(-0.60, Math.min(0.60, gPitch));
    limbs.head.rotation.y = Math.max(-0.65, Math.min(0.65, gYaw));
  }

  // Visual lock pulse ring effect when part reaches locked state
  if (isSnapLocking) {
    const snapP = (localP - 0.90) / 0.07;
    snapRing.visible = true;
    snapRing.position.copy(lockPos);
    const scale = 0.8 + snapP * 2.2;
    snapRing.scale.set(scale, scale, scale);
    ringMesh.material.opacity = (1 - snapP) * 0.95;
  }

  // Record active part metadata for camera & HUD tracking (100% English)
  technician.activePart = {
    name: currentStep.partName || "Photocopier",
    title: currentStep.partTitle || currentStep.title,
    spec: currentStep.spec,
    desc: currentStep.desc,
    oemCode: currentStep.oemCode || "OEM-GENUINE-FIT",
    material: currentStep.material || "Engineered Photocopier Component",
    tolerance: currentStep.tolerance || "Factory Spec Fit",
    duty: currentStep.duty || "Standard Commercial Duty",
    latchType: currentStep.latchType || "Precision Mounting Latch",
    phase: phaseText,
    localP,
    stepIdx,
    totalSteps: steps.length
  };
  technician.activePart3DPos.copy(active3D);
}
