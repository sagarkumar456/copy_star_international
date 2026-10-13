import * as T from './vendor/three.module.js';

// Smooth cubic interpolation helper
const smooth = (a, b, x) => {
  const p = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return p * p * (3 - 2 * p);
};

// Material generator
const mat = (color, roughness = 0.45, metalness = 0) =>
  new T.MeshStandardMaterial({ color, roughness, metalness });

export const SERVICE_ACTIONS = {
  toner: {
    id: 'toner',
    name: 'Toner Cartridge Refill & Replacement',
    tag: 'CONSUMABLES SERVICE',
    icon: '🖨️',
    steps: [
      {
        start: 0.00, end: 0.22,
        title: 'Step 1: Opening Front Service Panel',
        spec: 'DUST-SEALED ACCESS · HINGE RELEASE',
        desc: 'Technician opens the front service panel to access the 4 CMYK imaging and toner bays.'
      },
      {
        start: 0.22, end: 0.44,
        title: 'Step 2: Unlocking & Removing Empty Toner Unit',
        spec: 'CARTRIDGE RELEASE · DUAL RAIL GUIDE',
        desc: 'Unlocking safety latch and smoothly sliding out the depleted Cyan toner along precision rails.'
      },
      {
        start: 0.44, end: 0.72,
        title: 'Step 3: Loading Genuine High-Yield Toner',
        spec: '100% GENUINE OEM · 45,000 PAGE CAPACITY',
        desc: 'Aligning factory-sealed genuine toner cartridge with chassis rails and locking into place with positive click.'
      },
      {
        start: 0.72, end: 0.88,
        title: 'Step 4: Securing Front Service Door',
        spec: 'POSITIVE LATCH · DUST ENCLOSURE CHECK',
        desc: 'Closing and sealing the front panel to prevent toner leakage and maintain internal air filtration.'
      },
      {
        start: 0.88, end: 1.00,
        title: 'Step 5: System Calibrated · Ready to Print!',
        spec: 'CALIBRATION COMPLETE · 100% TONER LEVEL',
        desc: 'Touch screen calibrated. Status verified: Cyan Toner 100% · All systems operational.'
      }
    ]
  },
  roller: {
    id: 'roller',
    name: 'Precision Roller & Drive Gear Service',
    tag: 'MECHANICAL REPAIR',
    icon: '⚙️',
    steps: [
      {
        start: 0.00, end: 0.25,
        title: 'Step 1: Accessing Drive & Fuser Assembly',
        spec: 'SIDE MAINTENANCE PANEL · ROTOR BAY',
        desc: 'Opening side maintenance access panel to inspect high-torque transfer rollers and drive gears.'
      },
      {
        start: 0.25, end: 0.55,
        title: 'Step 2: Inspecting Gear Mesh & Roller Wear',
        spec: 'TOOTH ENGAGEMENT · ZERO BACKLASH TEST',
        desc: 'Examining drive gear teeth alignment and releasing worn paper feed roller with precision probe.'
      },
      {
        start: 0.55, end: 0.80,
        title: 'Step 3: Installing High-Durability OEM Roller',
        spec: 'HEAT-RESISTANT SILICONE · 100K PAGE RATED',
        desc: 'Fitting brand-new high-grip rubber feed roller and lubricating precision gear bearings.'
      },
      {
        start: 0.80, end: 1.00,
        title: 'Step 4: Mechanical Rotation Test Passed',
        spec: 'TEST SPEED: 60 RPM · ZERO PAPER-JAM RATED',
        desc: 'Running high-speed gear rotation test. Smooth mechanical meshing verified with zero jam tolerance.'
      }
    ]
  },
  cassette: {
    id: 'cassette',
    name: 'Paper Cassette & Feed Unit Maintenance',
    tag: 'FEED SYSTEM SERVICE',
    icon: '📥',
    steps: [
      {
        start: 0.00, end: 0.30,
        title: 'Step 1: Extending Paper Cassette Tray 1',
        spec: '500-SHEET HEAVY DUTY DRAWER · SLIDE RAILS',
        desc: 'Sliding out 500-sheet paper cassette along heavy-duty ball-bearing rails to service pickup mechanism.'
      },
      {
        start: 0.30, end: 0.65,
        title: 'Step 2: Cleaning Separator Pad & Paper Guides',
        spec: 'ANTI-STATIC CLEANING · WIDTH GUIDE ALIGNED',
        desc: 'Servicing rubber pickup pads, cleaning optical sheet sensors, and adjusting precision width guides.'
      },
      {
        start: 0.65, end: 1.00,
        title: 'Step 3: Drawer Locked & Feed System Ready',
        spec: 'MAGNETIC LATCH · SENSOR ENGAGED',
        desc: 'Re-engaging drawer guide track with positive magnetic latching. Paper feed ready for high-speed printing.'
      }
    ]
  }
};

/**
 * Builds the 3D Technician character and Service Caddy.
 */
export function buildTechnician() {
  const root = new T.Group();
  root.name = 'Technician_Root';

  // Materials
  const skin = mat('#df9f7a', 0.58, 0.0);
  const uniformNavy = mat('#1b324b', 0.46, 0.02);
  const uniformRed = mat('#df252e', 0.38, 0.05); // COPYSTAR red accent
  const uniformDark = mat('#141d27', 0.5, 0.0);
  const beltMat = mat('#1f1917', 0.6, 0.1);
  const goldBrass = mat('#c79838', 0.32, 0.7);
  const steel = mat('#939f9a', 0.28, 0.65);
  const whiteMat = mat('#f6f8f6', 0.28, 0.0);
  const blackRubber = mat('#171a1c', 0.82, 0.0);
  const glassLens = mat('#6b9abb', 0.15, 0.45);
  glassLens.transparent = true;
  glassLens.opacity = 0.7;

  const cyanMat = mat('#0ea5e9', 0.32, 0.1);
  const magentaMat = mat('#ec4899', 0.32, 0.1);
  const yellowMat = mat('#eab308', 0.32, 0.1);
  const tonerBlack = mat('#18181b', 0.4, 0.05);

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

  function cyl(rTop, rBot, len, m, x = 0, y = 0, z = 0, parent = root, axis = 'y') {
    const geo = new T.CylinderGeometry(rTop, rBot, len, 16);
    const msh = mesh(geo, m, x, y, z, parent);
    if (axis === 'x') msh.rotation.z = Math.PI / 2;
    if (axis === 'z') msh.rotation.x = Math.PI / 2;
    return msh;
  }

  // --- SKELETON HIERARCHY ---
  // Pelvis / Hips (pivot around y = 1.45)
  const hips = new T.Group();
  hips.name = 'hips';
  hips.position.set(0, 1.45, 0);
  root.add(hips);

  // Pelvis mesh
  box(0.56, 0.24, 0.36, uniformDark, 0, 0, 0, hips);
  // Belt
  box(0.58, 0.07, 0.38, beltMat, 0, 0.09, 0, hips);
  box(0.11, 0.08, 0.395, goldBrass, 0, 0.09, 0, hips);
  // Tool pouch on right hip
  box(0.14, 0.22, 0.14, beltMat, 0.32, -0.02, 0.05, hips);
  // Screwdriver handle sticking out of pouch
  cyl(0.02, 0.02, 0.16, uniformRed, 0.33, 0.11, 0.05, hips);
  cyl(0.008, 0.008, 0.12, steel, 0.33, 0.2, 0.05, hips);

  // --- LEGS ---
  // Left Leg
  const leftHip = new T.Group();
  leftHip.position.set(-0.18, 0, 0);
  hips.add(leftHip);

  // Left Thigh
  cyl(0.115, 0.1, 0.62, uniformDark, 0, -0.31, 0, leftHip);

  // Left Knee
  const leftKnee = new T.Group();
  leftKnee.position.set(0, -0.62, 0);
  leftHip.add(leftKnee);

  // Left Shin / Calf
  cyl(0.098, 0.088, 0.62, uniformDark, 0, -0.31, 0, leftKnee);

  // Left Ankle & Boot
  const leftAnkle = new T.Group();
  leftAnkle.position.set(0, -0.62, 0);
  leftKnee.add(leftAnkle);
  // Boot sole & body
  box(0.2, 0.14, 0.36, blackRubber, 0, -0.07, 0.06, leftAnkle);
  box(0.18, 0.04, 0.38, uniformRed, 0, -0.13, 0.07, leftAnkle); // Red work boot sole trim

  // Right Leg
  const rightHip = new T.Group();
  rightHip.position.set(0.18, 0, 0);
  hips.add(rightHip);

  // Right Thigh
  cyl(0.115, 0.1, 0.62, uniformDark, 0, -0.31, 0, rightHip);

  // Right Knee
  const rightKnee = new T.Group();
  rightKnee.position.set(0, -0.62, 0);
  rightHip.add(rightKnee);

  // Right Shin / Calf
  cyl(0.098, 0.088, 0.62, uniformDark, 0, -0.31, 0, rightKnee);

  // Right Ankle & Boot
  const rightAnkle = new T.Group();
  rightAnkle.position.set(0, -0.62, 0);
  rightKnee.add(rightAnkle);
  box(0.2, 0.14, 0.36, blackRubber, 0, -0.07, 0.06, rightAnkle);
  box(0.18, 0.04, 0.38, uniformRed, 0, -0.13, 0.07, rightAnkle);

  // --- TORSO / SPINE ---
  const torso = new T.Group();
  torso.name = 'torso';
  torso.position.set(0, 0.12, 0);
  hips.add(torso);

  // Torso jacket body
  box(0.62, 0.78, 0.38, uniformNavy, 0, 0.39, 0, torso);
  // Red collar and chest styling (COPYSTAR brand identity)
  box(0.3, 0.16, 0.39, uniformRed, 0, 0.72, 0, torso);
  // Front zipper / seam
  box(0.02, 0.76, 0.392, uniformDark, 0, 0.39, 0, torso);
  // ID Badge on chest
  box(0.13, 0.09, 0.015, whiteMat, -0.17, 0.58, 0.198, torso);
  box(0.09, 0.025, 0.018, uniformRed, -0.17, 0.605, 0.198, torso);
  box(0.08, 0.015, 0.018, uniformDark, -0.17, 0.565, 0.198, torso);

  // Pen in breast pocket
  box(0.11, 0.015, 0.015, uniformDark, 0.17, 0.58, 0.198, torso);
  cyl(0.008, 0.008, 0.09, uniformRed, 0.18, 0.63, 0.198, torso);

  // --- NECK & HEAD ---
  const neck = new T.Group();
  neck.position.set(0, 0.78, 0);
  torso.add(neck);
  cyl(0.075, 0.085, 0.15, skin, 0, 0.075, 0, neck);

  const head = new T.Group();
  head.position.set(0, 0.14, 0);
  neck.add(head);

  // Head sphere / shape
  const headMesh = mesh(new T.SphereGeometry(0.18, 16, 16), skin, 0, 0.14, 0, head);
  headMesh.scale.set(0.92, 1.05, 0.98);

  // Hair
  const hair = mesh(new T.SphereGeometry(0.19, 16, 16), uniformDark, 0, 0.17, -0.02, head);
  hair.scale.set(0.96, 0.95, 1.02);

  // Service Cap (navy with red brim)
  const capDome = mesh(new T.SphereGeometry(0.20, 16, 16), uniformNavy, 0, 0.22, -0.01, head);
  capDome.scale.set(0.96, 0.55, 1.02);
  // Cap brim / visor pointing forward (+Z)
  box(0.24, 0.025, 0.16, uniformRed, 0, 0.19, 0.18, head);
  // Cap badge (COPYSTAR tiny emblem)
  box(0.05, 0.04, 0.02, goldBrass, 0, 0.25, 0.18, head);

  // Safety glasses / inspection visor
  box(0.27, 0.06, 0.08, glassLens, 0, 0.15, 0.15, head);
  box(0.02, 0.02, 0.09, steel, 0, 0.15, 0.15, head);

  // --- ARMS ---
  // Left Arm (Responsible for holding / opening front cover)
  const leftShoulder = new T.Group();
  leftShoulder.position.set(-0.37, 0.70, 0);
  torso.add(leftShoulder);
  mesh(new T.SphereGeometry(0.095, 12, 12), uniformNavy, 0, 0, 0, leftShoulder);

  // Left Upper Arm
  const leftUpperArm = cyl(0.082, 0.074, 0.46, uniformNavy, 0, -0.23, 0, leftShoulder);

  // Left Elbow
  const leftElbow = new T.Group();
  leftElbow.position.set(0, -0.46, 0);
  leftShoulder.add(leftElbow);
  mesh(new T.SphereGeometry(0.075, 12, 12), uniformNavy, 0, 0, 0, leftElbow);

  // Left Forearm
  cyl(0.072, 0.064, 0.44, uniformNavy, 0, -0.22, 0, leftElbow);

  // Left Wrist & Hand
  const leftWrist = new T.Group();
  leftWrist.position.set(0, -0.44, 0);
  leftElbow.add(leftWrist);
  // Palm
  box(0.07, 0.11, 0.05, skin, 0, -0.055, 0, leftWrist);
  // Fingers
  box(0.06, 0.06, 0.035, skin, 0, -0.12, 0.01, leftWrist);

  // Right Arm (Responsible for holding toner cartridge and tool)
  const rightShoulder = new T.Group();
  rightShoulder.position.set(0.37, 0.70, 0);
  torso.add(rightShoulder);
  mesh(new T.SphereGeometry(0.095, 12, 12), uniformNavy, 0, 0, 0, rightShoulder);

  // Right Upper Arm
  cyl(0.082, 0.074, 0.46, uniformNavy, 0, -0.23, 0, rightShoulder);

  // Right Elbow
  const rightElbow = new T.Group();
  rightElbow.position.set(0, -0.46, 0);
  rightShoulder.add(rightElbow);
  mesh(new T.SphereGeometry(0.075, 12, 12), uniformNavy, 0, 0, 0, rightElbow);

  // Right Forearm
  cyl(0.072, 0.064, 0.44, uniformNavy, 0, -0.22, 0, rightElbow);

  // Right Wrist & Hand
  const rightWrist = new T.Group();
  rightWrist.position.set(0, -0.44, 0);
  rightElbow.add(rightWrist);
  box(0.07, 0.11, 0.05, skin, 0, -0.055, 0, rightWrist);
  box(0.06, 0.06, 0.035, skin, 0, -0.12, 0.01, rightWrist);

  // Handheld props slot (attached to right wrist)
  const heldPropGroup = new T.Group();
  heldPropGroup.position.set(0, -0.09, 0.05);
  rightWrist.add(heldPropGroup);

  // --- HELD PROPS (Toner cartridge held by technician) ---
  const heldToner = new T.Group();
  heldToner.name = 'heldToner';
  heldPropGroup.add(heldToner);

  // Long cylindrical toner body
  cyl(0.082, 0.082, 1.35, tonerBlack, 0, 0, 0, heldToner, 'x');
  // Cyan toner cap / handle
  cyl(0.095, 0.095, 0.16, cyanMat, 0.68, 0, 0, heldToner, 'x');
  box(0.14, 0.11, 0.08, cyanMat, 0.78, 0, 0.04, heldToner);
  // Steel drive coupling on other end
  cyl(0.075, 0.075, 0.12, steel, -0.72, 0, 0, heldToner, 'x');
  // Genuine toner label
  box(0.42, 0.06, 0.01, whiteMat, 0.1, 0.075, 0, heldToner);
  box(0.2, 0.025, 0.012, uniformRed, 0.1, 0.075, 0, heldToner);

  // Precision tool (screwdriver / calibration probe)
  const heldTool = new T.Group();
  heldTool.name = 'heldTool';
  heldTool.visible = false;
  heldPropGroup.add(heldTool);
  cyl(0.024, 0.024, 0.22, uniformRed, 0, 0, 0, heldTool, 'z');
  cyl(0.009, 0.009, 0.26, steel, 0, 0, 0.22, heldTool, 'z');

  // --- SERVICE CADDY / MOBILE TROLLEY ---
  const caddy = new T.Group();
  caddy.name = 'Service_Caddy';
  caddy.position.set(1.42, 0.14, 1.72);
  root.add(caddy);

  // Wheels (4 rubber casters)
  for (const cx of [-0.3, 0.3]) {
    for (const cz of [-0.26, 0.26]) {
      cyl(0.045, 0.045, 0.035, blackRubber, cx, 0.04, cz, caddy, 'x');
      cyl(0.012, 0.012, 0.08, steel, cx, 0.08, cz, caddy);
    }
  }

  // Steel frame legs
  for (const cx of [-0.31, 0.31]) {
    for (const cz of [-0.27, 0.27]) {
      cyl(0.014, 0.014, 1.48, steel, cx, 0.82, cz, caddy);
    }
  }

  // Bottom shelf
  box(0.72, 0.035, 0.62, steel, 0, 0.15, 0, caddy);
  // Spare parts box on lower shelf
  box(0.48, 0.28, 0.38, uniformNavy, -0.05, 0.31, 0, caddy);
  box(0.49, 0.05, 0.39, uniformRed, -0.05, 0.44, 0, caddy);
  // Label on box
  box(0.22, 0.09, 0.01, whiteMat, -0.05, 0.32, 0.196, caddy);

  // Top tray
  box(0.74, 0.04, 0.64, steel, 0, 1.25, 0, caddy);
  // Tray rim
  box(0.76, 0.06, 0.02, steel, 0, 1.29, -0.32, caddy);
  box(0.76, 0.06, 0.02, steel, 0, 1.29, 0.32, caddy);
  box(0.02, 0.06, 0.64, steel, -0.38, 1.29, 0, caddy);
  box(0.02, 0.06, 0.64, steel, 0.38, 1.29, 0, caddy);

  // Extra CMYK toner units on top tray
  const trayColors = [magentaMat, yellowMat, tonerBlack];
  for (let i = 0; i < 3; i++) {
    const tz = -0.16 + i * 0.15;
    cyl(0.048, 0.048, 0.58, tonerBlack, -0.04, 1.32, tz, caddy, 'x');
    cyl(0.055, 0.055, 0.09, trayColors[i], 0.26, 1.32, tz, caddy, 'x');
  }

  // Spare rubber fuser roller on tray
  cyl(0.035, 0.035, 0.52, blackRubber, 0.02, 1.31, 0.24, caddy, 'x');
  cyl(0.012, 0.012, 0.6, steel, 0.02, 1.31, 0.24, caddy, 'x');

  // Technician Diagnostic Tablet / Clipboard
  const tablet = new T.Group();
  tablet.position.set(-0.2, 1.30, 0);
  tablet.rotation.set(-0.25, 0.3, 0);
  caddy.add(tablet);
  box(0.28, 0.015, 0.38, uniformDark, 0, 0, 0, tablet);
  // Glowing status screen
  const screenMat = new T.MeshBasicMaterial({ color: 0x0ea5e9 });
  box(0.24, 0.018, 0.34, screenMat, 0, 0.005, 0, tablet);

  // --- SNAP / LOCK EFFECT (PULSE RING) ---
  const snapRing = new T.Group();
  snapRing.name = 'snapRing';
  snapRing.position.set(0, 2.1, 1.05);
  snapRing.visible = false;
  root.add(snapRing);

  const ringGeo = new T.RingGeometry(0.05, 0.18, 32);
  const ringMat = new T.MeshBasicMaterial({
    color: 0x22c55e,
    side: T.DoubleSide,
    transparent: true,
    opacity: 0.85
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
      heldTool
    },
    caddy,
    snapRing,
    ringMesh
  };
}

/**
 * Procedurally poses and animates the technician, tools, and copier parts based on action & progress.
 */
export function animateTechnicianService(technician, copier, actionId, p, time = 0) {
  if (!technician || !copier) return;

  const { limbs, caddy, snapRing, ringMesh } = technician;

  // Base technician world position & facing direction (standing in front of copier)
  technician.root.position.set(0.65, 0.14, 1.85);
  technician.root.rotation.y = Math.PI * 0.92;

  // Subtle natural idle breathing & weight shifting
  const breathe = Math.sin(time * 2.2) * 0.02;
  const sway = Math.cos(time * 1.5) * 0.015;

  // Reset basic limb resting poses
  limbs.hips.position.y = 1.45 + breathe * 0.5;
  limbs.hips.rotation.set(0, sway * 0.5, 0);

  limbs.torso.rotation.set(0.04, 0, sway);
  limbs.neck.rotation.set(-0.02, 0, 0);
  limbs.head.rotation.set(0.08, -0.05, 0);

  limbs.leftHip.rotation.set(0, 0, -0.04);
  limbs.leftKnee.rotation.set(0.05, 0, 0);
  limbs.rightHip.rotation.set(0, 0, 0.04);
  limbs.rightKnee.rotation.set(0.05, 0, 0);

  limbs.leftShoulder.rotation.set(0.1, 0, -0.15);
  limbs.leftElbow.rotation.set(-0.25, 0, 0);
  limbs.leftWrist.rotation.set(0, 0, 0);

  limbs.rightShoulder.rotation.set(0.1, 0, 0.15);
  limbs.rightElbow.rotation.set(-0.25, 0, 0);
  limbs.rightWrist.rotation.set(0, 0, 0);

  limbs.heldToner.visible = false;
  limbs.heldTool.visible = false;
  snapRing.visible = false;

  // Find copier front door, toners, drive gears, cassettes
  const frontDoorPart = copier.parts.find(pt => pt.g.name === 'Front service cover');
  const cyanTonerPart = copier.parts.find(pt => pt.g.name === 'Toner cyan');
  const drivePart = copier.parts.find(pt => pt.g.name === 'Drive gears');
  const rollerPart = copier.parts.find(pt => pt.g.name === 'Transfer and fuser rollers');
  const cassette1Part = copier.parts.find(pt => pt.g.name === 'Paper cassette 1');

  // ==========================================
  // ACTION: TONER REFILL & REPLACEMENT
  // ==========================================
  if (actionId === 'toner') {
    limbs.heldToner.visible = true;

    // --- PHASE 1: Open front door (p: 0.00 -> 0.22) ---
    const doorOpenP = smooth(0.04, 0.20, p);
    const doorCloseP = smooth(0.72, 0.88, p);
    const doorState = doorOpenP * (1 - doorCloseP);

    if (frontDoorPart) {
      // Hinge the front cover open around left edge
      frontDoorPart.g.position.copy(frontDoorPart.base);
      frontDoorPart.g.position.x = frontDoorPart.base.x - 0.75 * doorState;
      frontDoorPart.g.position.z = frontDoorPart.base.z + 0.55 * doorState;
      frontDoorPart.g.rotation.y = -Math.PI * 0.48 * doorState;
    }

    // Left arm reaches for door handle during open/close
    if (p < 0.24) {
      const reach = smooth(0.02, 0.16, p);
      limbs.leftShoulder.rotation.set(0.8 * reach, 0.3 * reach, -0.4 * reach);
      limbs.leftElbow.rotation.set(-0.9 * reach, 0, 0);
      limbs.torso.rotation.x = 0.08 * reach;
    } else if (p > 0.70 && p < 0.90) {
      const push = smooth(0.72, 0.84, p) * (1 - smooth(0.85, 0.92, p));
      limbs.leftShoulder.rotation.set(0.75 * push, 0.2 * push, -0.3 * push);
      limbs.leftElbow.rotation.set(-0.85 * push, 0, 0);
    }

    // --- PHASE 2: Removing old Cyan Toner (p: 0.22 -> 0.44) ---
    const pullOutP = smooth(0.24, 0.42, p);
    const returnNewP = smooth(0.52, 0.72, p);

    if (cyanTonerPart) {
      cyanTonerPart.g.position.copy(cyanTonerPart.base);
      if (p >= 0.22 && p < 0.44) {
        // Old toner slides out towards +Z
        cyanTonerPart.g.position.z = cyanTonerPart.base.z + 1.45 * pullOutP;
      } else if (p >= 0.44 && p < 0.72) {
        // Old toner removed, new toner entering
        cyanTonerPart.g.position.z = cyanTonerPart.base.z + 1.45 * (1 - returnNewP);
      } else if (p >= 0.72) {
        // Locked fully home
        cyanTonerPart.g.position.z = cyanTonerPart.base.z;
      }
    }

    // Right arm choreography
    if (p >= 0.20 && p < 0.45) {
      // Reaching into slot to unclip & extract old toner
      const rReach = smooth(0.20, 0.32, p);
      const rExtract = smooth(0.32, 0.44, p);
      limbs.torso.rotation.y = -0.15 * rReach;
      limbs.torso.rotation.x = 0.12 * rReach;
      limbs.rightShoulder.rotation.set(0.95 * rReach, -0.4 * rReach, 0.35 * rReach);
      limbs.rightElbow.rotation.set(-0.6 * rReach - 0.4 * rExtract, 0, 0);
      limbs.heldToner.visible = rExtract > 0.2;
    } else if (p >= 0.45 && p < 0.74) {
      // Holding fresh toner from caddy, shaking, aligning & sliding into slot
      const rPrep = smooth(0.45, 0.54, p);
      const rInsert = smooth(0.54, 0.72, p);
      // Gentle professional shake gesture
      const shake = Math.sin((p - 0.45) * 50) * 0.08 * (1 - rInsert);

      limbs.torso.rotation.y = 0.1 * (1 - rInsert) - 0.15 * rInsert;
      limbs.rightShoulder.rotation.set(0.7 + 0.3 * rInsert + shake, -0.3 * rInsert, 0.2 + shake);
      limbs.rightElbow.rotation.set(-0.9 + 0.35 * rInsert, 0, 0);
      limbs.rightWrist.rotation.set(0, shake * 2, 0);
      limbs.heldToner.visible = rInsert < 0.85; // Disappears into machine slot
    } else if (p >= 0.74 && p < 0.90) {
      // Releasing handle, stepping slightly back
      limbs.rightShoulder.rotation.set(0.2, 0, 0.15);
      limbs.rightElbow.rotation.set(-0.35, 0, 0);
      limbs.heldToner.visible = false;
    } else if (p >= 0.90) {
      // Service complete: Thumbs up / friendly check gesture!
      const cheer = smooth(0.90, 0.96, p);
      limbs.rightShoulder.rotation.set(0.85 * cheer, -0.2 * cheer, 0.5 * cheer);
      limbs.rightElbow.rotation.set(-1.4 * cheer, 0, 0);
      limbs.rightWrist.rotation.set(0, 0.4 * cheer, 0);
      limbs.head.rotation.set(-0.05, 0.25 * cheer, 0.05); // Looks towards user
      limbs.heldToner.visible = false;
    }

    // --- SNAP / LOCK PULSE RING AT p ~ 0.72 ---
    if (p >= 0.70 && p < 0.82) {
      const snapProgress = (p - 0.70) / 0.12;
      snapRing.visible = true;
      snapRing.position.set(0.2, 2.15, 1.05);
      const scale = 1 + snapProgress * 2.8;
      snapRing.scale.set(scale, scale, scale);
      ringMesh.material.opacity = (1 - snapProgress) * 0.9;
    }

    // ==========================================
    // ACTION: ROLLER & GEAR SERVICE
    // ==========================================
  } else if (actionId === 'roller') {
    limbs.heldTool.visible = true;

    // Side panel / roller inspection
    const gearInspectP = smooth(0.25, 0.55, p);
    const rollerReplaceP = smooth(0.55, 0.85, p);

    // Technician steps closer to right side of machine
    technician.root.position.set(0.95, 0.14, 1.55);
    technician.root.rotation.y = Math.PI * 0.82;

    // Drive gears spin to demonstrate testing
    if (drivePart) {
      const spinSpeed = (p >= 0.25 && p <= 0.6) || p >= 0.82 ? 14 : 0;
      drivePart.g.children.forEach((child, idx) => {
        child.rotation.x += spinSpeed * 0.02 * (idx % 2 === 0 ? 1 : -1);
      });
    }

    // Tool usage gesture
    if (p >= 0.20 && p < 0.60) {
      const probe = Math.sin(time * 8) * 0.05;
      limbs.torso.rotation.set(0.14, 0.25, 0);
      limbs.rightShoulder.rotation.set(0.95 + probe, -0.2, 0.3);
      limbs.rightElbow.rotation.set(-0.85, 0, 0);
      limbs.leftShoulder.rotation.set(0.65, 0.4, -0.2);
      limbs.leftElbow.rotation.set(-0.75, 0, 0);
    } else if (p >= 0.60 && p < 0.85) {
      // Swapping roller
      limbs.torso.rotation.set(0.18, 0.15, 0);
      limbs.rightShoulder.rotation.set(0.8, -0.1, 0.2);
      limbs.rightElbow.rotation.set(-0.6, 0, 0);
    } else if (p >= 0.85) {
      // Satisfied check pose
      const readyP = smooth(0.85, 0.95, p);
      limbs.rightShoulder.rotation.set(0.8 * readyP, -0.15 * readyP, 0.45 * readyP);
      limbs.rightElbow.rotation.set(-1.2 * readyP, 0, 0);
      limbs.head.rotation.set(0, 0.3 * readyP, 0);
    }

    // ==========================================
    // ACTION: PAPER CASSETTE SERVICE
    // ==========================================
  } else if (actionId === 'cassette') {
    limbs.heldTool.visible = false;

    // Technician crouches down slightly to service lower paper drawer
    const slideOutP = smooth(0.08, 0.32, p);
    const slideInP = smooth(0.65, 0.88, p);
    const trayOffset = slideOutP * (1 - slideInP);

    if (cassette1Part) {
      cassette1Part.g.position.copy(cassette1Part.base);
      cassette1Part.g.position.z = cassette1Part.base.z + 1.65 * trayOffset;
    }

    // Technician lowers stance
    const crouch = smooth(0.1, 0.3, p) * (1 - smooth(0.85, 0.95, p));
    limbs.hips.position.y = 1.45 - 0.22 * crouch;
    limbs.torso.rotation.x = 0.25 * crouch;
    limbs.leftKnee.rotation.x = 0.35 * crouch;
    limbs.rightKnee.rotation.x = 0.35 * crouch;

    // Hands guiding tray out and inspecting pickup pad
    if (p < 0.35) {
      const pull = smooth(0.08, 0.28, p);
      limbs.leftShoulder.rotation.set(0.8 * pull, 0.2 * pull, -0.3 * pull);
      limbs.leftElbow.rotation.set(-0.7 * pull, 0, 0);
      limbs.rightShoulder.rotation.set(0.8 * pull, -0.2 * pull, 0.3 * pull);
      limbs.rightElbow.rotation.set(-0.7 * pull, 0, 0);
    } else if (p >= 0.35 && p < 0.65) {
      // Inspection / cleaning motion
      const inspectWiggle = Math.sin(time * 6) * 0.04;
      limbs.rightShoulder.rotation.set(0.9 + inspectWiggle, -0.1, 0.2);
      limbs.rightElbow.rotation.set(-0.85, 0, 0);
      limbs.head.rotation.set(0.3, -0.1, 0);
    } else if (p >= 0.65 && p < 0.90) {
      // Pushing tray back in
      const push = smooth(0.65, 0.82, p);
      limbs.leftShoulder.rotation.set(0.75 * push, 0.15 * push, -0.25 * push);
      limbs.leftElbow.rotation.set(-0.65 * push, 0, 0);
      limbs.rightShoulder.rotation.set(0.75 * push, -0.15 * push, 0.25 * push);
      limbs.rightElbow.rotation.set(-0.65 * push, 0, 0);
    } else if (p >= 0.90) {
      // Standing up ready
      const stand = smooth(0.90, 0.98, p);
      limbs.rightShoulder.rotation.set(0.7 * stand, -0.1 * stand, 0.4 * stand);
      limbs.rightElbow.rotation.set(-1.1 * stand, 0, 0);
    }
  }
}
