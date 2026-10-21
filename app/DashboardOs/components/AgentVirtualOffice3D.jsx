'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// Coordinates for each Agent's station in the 3D virtual office
const AGENT_STATIONS = {
  solaria: {
    name: 'SOLARIA',
    role: 'PV Layout & Azimuth',
    color: 0xf59e0b,
    hex: '#f59e0b',
    icon: '☀️',
    deskPos: [-3.2, 0, -1.2],
    camTarget: [-3.2, 1.2, -1.2],
    camPos: [-1.2, 3.2, 2.2],
    quote: 'Standby - Siap kalkulasi kapasitas kWp & layout string PV',
  },
  helios: {
    name: 'HELIOS',
    role: 'SPH Proposal Copilot',
    color: 0x38bdf8,
    hex: '#38bdf8',
    icon: '📑',
    deskPos: [-1.1, 0, -1.2],
    camTarget: [-1.1, 1.2, -1.2],
    camPos: [0.9, 3.2, 2.2],
    quote: 'Standby - Siap generate draf penawaran komersial SPH & estimasi ROI',
  },
  volt: {
    name: 'VOLT',
    role: 'IoT Fleet Watchdog',
    color: 0x10b981,
    hex: '#10b981',
    icon: '⚡',
    deskPos: [1.1, 0, -1.2],
    camTarget: [1.1, 1.2, -1.2],
    camPos: [2.8, 3.2, 2.2],
    quote: 'Telemetry Ready - Memantau status inverter, modul, dan baterai site aktif',
  },
  omni: {
    name: 'OMNI',
    role: 'Lead Concierge',
    color: 0xa855f7,
    hex: '#a855f7',
    icon: '💬',
    deskPos: [3.2, 0, -1.2],
    camTarget: [3.2, 1.2, -1.2],
    camPos: [4.5, 3.2, 2.2],
    quote: 'Standby - Siap kualifikasi calon klien dari Live Chat SURTI & WhatsApp',
  },
};

const DEFAULT_CAM_POS = [0, 5.8, 6.2];
const DEFAULT_CAM_LOOK = [0, 0.8, -0.6];

export default function AgentVirtualOffice3D({
  selectedAgentKey = 'solaria',
  onSelectAgent,
  agents = {},
  isCycleActive = false,
  onTriggerCycle,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    animFrameId: null,
    targetCamPos: new THREE.Vector3(...DEFAULT_CAM_POS),
    targetLookAt: new THREE.Vector3(...DEFAULT_CAM_LOOK),
    currentLookAt: new THREE.Vector3(...DEFAULT_CAM_LOOK),
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    orbitAngles: { theta: 0, phi: 0.65, radius: 8.5 },
    orbitCenter: new THREE.Vector3(...DEFAULT_CAM_LOOK),
    agentMeshes: {},
    screenMesh: null,
    clock: new THREE.Clock(),
    cyclePulseStartTime: 0,
  });

  const [viewMode, setViewMode] = useState('focus'); // 'focus' | 'orbit'
  const [activeSpeech, setActiveSpeech] = useState(AGENT_STATIONS[selectedAgentKey]?.quote || '');

  // Update camera target when selectedAgentKey changes
  useEffect(() => {
    const config = AGENT_STATIONS[selectedAgentKey];
    if (!config) return;

    setActiveSpeech(agents[selectedAgentKey]?.activity || config.quote);

    if (viewMode === 'focus') {
      stateRef.current.targetCamPos.set(...config.camPos);
      stateRef.current.targetLookAt.set(...config.camTarget);
    }
  }, [selectedAgentKey, viewMode, agents]);

  // When cycle is triggered, record pulse start time
  useEffect(() => {
    if (isCycleActive) {
      stateRef.current.cyclePulseStartTime = stateRef.current.clock.getElapsedTime();
    }
  }, [isCycleActive]);

  // Reset to full overview
  const handleResetOverview = useCallback(() => {
    setViewMode('orbit');
    stateRef.current.targetCamPos.set(...DEFAULT_CAM_POS);
    stateRef.current.targetLookAt.set(...DEFAULT_CAM_LOOK);
  }, []);

  const handleFocusAgent = useCallback((key) => {
    setViewMode('focus');
    if (onSelectAgent) onSelectAgent(key);
  }, [onSelectAgent]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    // SCENE: Bright, crisp daylight modern architectural tech studio
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xecf2f8);
    scene.fog = new THREE.Fog(0xecf2f8, 16, 40);
    stateRef.current.scene = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(...DEFAULT_CAM_POS);
    camera.lookAt(...DEFAULT_CAM_LOOK);
    stateRef.current.camera = camera;

    // RENDERER with WebGL fallback & antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // -------------------------------------------------------------
    // LIGHTING: BRIGHT DAYLIGHT & CRISP STUDIO LIGHTS
    // -------------------------------------------------------------
    // Bright sky hemisphere light (white sky, soft blue bounce from floor)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 2.2);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    // Warm bright ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Primary Sunlit Directional Light (sharp solar rays from ceiling skylight)
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 3.2);
    dirLight.position.set(8, 14, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 35;
    dirLight.shadow.bias = -0.0003;
    const d = 9;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Secondary Soft Fill Light to eliminate dark corners
    const fillLight = new THREE.DirectionalLight(0xbae6fd, 1.8);
    fillLight.position.set(-8, 12, -6);
    scene.add(fillLight);

    // Overhead Office Daylight Ceiling Panels
    const ceilingLight1 = new THREE.PointLight(0xffffff, 2.0, 16);
    ceilingLight1.position.set(-2, 4.2, 0);
    scene.add(ceilingLight1);

    const ceilingLight2 = new THREE.PointLight(0xffffff, 2.0, 16);
    ceilingLight2.position.set(2, 4.2, 0);
    scene.add(ceilingLight2);

    // -------------------------------------------------------------
    // ARCHITECTURE: BRIGHT FLOOR & WALLS (MODERN TECH STUDIO)
    // -------------------------------------------------------------
    // Bright polished showroom floor
    const floorGeo = new THREE.PlaneGeometry(18, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.18,
      metalness: 0.08,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle modern architectural grid lines (soft cyan/blue & slate)
    const gridHelper = new THREE.GridHelper(18, 36, 0x38bdf8, 0xcfd8dc);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Bright Back Wall (Off-white architectural finish)
    const wallGeo = new THREE.BoxGeometry(18, 5.0, 0.2);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 2.5, -5.5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Bright Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.0, 14), wallMat);
    leftWall.position.set(-8.8, 2.5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Glass Partition Meeting Room (Behind Desks, clear tinted glass)
    const glassGeo = new THREE.BoxGeometry(12, 3.2, 0.08);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.88,
      ior: 1.45,
    });
    const glassWall = new THREE.Mesh(glassGeo, glassMat);
    glassWall.position.set(0, 1.6, -3.2);
    scene.add(glassWall);

    // Glass frames (sleek matte black aluminium)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(11, 0.08, 0.12), frameMat);
    topFrame.position.set(0, 3.2, -3.2);
    scene.add(topFrame);

    // Large Executive Presentation Screen on Back Wall
    const screenFrameGeo = new THREE.BoxGeometry(6.4, 2.4, 0.12);
    const screenFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const screenFrame = new THREE.Mesh(screenFrameGeo, screenFrameMat);
    screenFrame.position.set(0, 2.7, -5.35);
    scene.add(screenFrame);

    // Glowing Screen Content Canvas
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 384;
    const ctx = screenCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 1024, 384);

      // Gradient accent
      const grad = ctx.createLinearGradient(0, 0, 1024, 0);
      grad.addColorStop(0, '#0369a1');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#059669');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 12);

      // Title & Metrics
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('SUNBLIX ENERGY OS // EXECUTIVE COMMAND CENTER', 40, 70);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('TARGET: 15–30 SOLAR PROJECTS / BULAN', 40, 120);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px monospace';
      ctx.fillText('• SOLARIA: Azimuth & PV Matrix  • HELIOS: SPH Copilot  • VOLT: IoT Fleet  • OMNI: Lead Concierge', 40, 175);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('● SYSTEM STATUS: AUTONOMOUS AI FLEET ACTIVE & LIVE DISPATCH', 40, 230);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 260, 944, 90);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '22px sans-serif';
      ctx.fillText('Pipeline: 24 SPH Drafted | 48 Inverters Monitored | Zero Critical Faults', 60, 315);
    }
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.2), screenMat);
    screenMesh.position.set(0, 2.7, -5.28);
    scene.add(screenMesh);
    stateRef.current.screenMesh = screenMesh;

    // -------------------------------------------------------------
    // INDONESIAN TOUCH: MERAH PUTIH FLAG & LOUNGE CORNER
    // -------------------------------------------------------------
    // Indonesian Merah Putih Flagpole (Left Front Corner)
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 16), poleMat);
    flagPole.position.set(-6.5, 1.6, 2.5);
    flagPole.castShadow = true;
    scene.add(flagPole);

    const flagBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.15, 16), poleMat);
    flagBase.position.set(-6.5, 0.075, 2.5);
    scene.add(flagBase);

    // Merah Putih Fabric Canvas Texture
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 256;
    flagCanvas.height = 160;
    const fctx = flagCanvas.getContext('2d');
    if (fctx) {
      fctx.fillStyle = '#dc2626'; // Merah
      fctx.fillRect(0, 0, 256, 80);
      fctx.fillStyle = '#ffffff'; // Putih
      fctx.fillRect(0, 80, 256, 80);
    }
    const flagTex = new THREE.CanvasTexture(flagCanvas);
    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.8),
      new THREE.MeshStandardMaterial({ map: flagTex, roughness: 0.7, side: THREE.DoubleSide })
    );
    flagMesh.position.set(-5.88, 2.65, 2.5);
    scene.add(flagMesh);

    // Lounge Area (Right Side)
    // Sofa Seat (Modern charcoal upholstery with high contrast on white floor)
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.9), sofaMat);
    sofaSeat.position.set(5.8, 0.25, 1.2);
    sofaSeat.castShadow = true;
    scene.add(sofaSeat);

    // Sofa Backrest
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.25), sofaMat);
    sofaBack.position.set(5.8, 0.65, 0.8);
    sofaBack.castShadow = true;
    scene.add(sofaBack);

    // Coffee table (Clean white architectural top)
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1 });
    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.7), tableMat);
    coffeeTable.position.set(5.8, 0.18, 2.2);
    coffeeTable.castShadow = true;
    scene.add(coffeeTable);

    // Galon Water Dispenser (Indonesian Office Classic)
    const galonStand = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.8, 0.38),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    galonStand.position.set(7.1, 0.4, -2.5);
    galonStand.castShadow = true;
    scene.add(galonStand);

    const galonBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.48, 16),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, roughness: 0.05, transmission: 0.8 })
    );
    galonBottle.position.set(7.1, 1.05, -2.5);
    scene.add(galonBottle);

    // Tropical Indoor Plant (Potted Monstera)
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.2, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    pot.position.set(-6.8, 0.22, -2.2);
    pot.castShadow = true;
    scene.add(pot);

    const plantMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), plantMat);
      leaf.scale.set(1, 0.2, 1.5);
      leaf.rotation.x = 0.3 + (i * 0.15);
      leaf.rotation.y = (i * Math.PI) / 2.5;
      leaf.position.set(-6.8 + (Math.sin(i) * 0.15), 0.55 + (i * 0.08), -2.2 + (Math.cos(i) * 0.15));
      scene.add(leaf);
    }

    // -------------------------------------------------------------
    // BUILD 4 AGENT WORKSTATIONS & 3D AVATARS (BRIGHT ARCHITECTURAL)
    // -------------------------------------------------------------
    // Bright white executive desk tops with sleek dark borders
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.05 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const agentMeshes = {};

    Object.keys(AGENT_STATIONS).forEach((key) => {
      const config = AGENT_STATIONS[key];
      const [x, , z] = config.deskPos;

      // Desk
      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.9), deskMat);
      deskTop.position.set(x, 0.75, z);
      deskTop.castShadow = true;
      deskTop.receiveShadow = true;
      scene.add(deskTop);

      // Desk Legs (Sleek Chrome / Brushed Aluminium)
      const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
      [[-0.72, -0.38], [0.72, -0.38], [-0.72, 0.38], [0.72, 0.38]].forEach(([dx, dz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8), legMat);
        leg.position.set(x + dx, 0.375, z + dz);
        leg.castShadow = true;
        scene.add(leg);
      });

      // Dual Monitors on Desk
      const monFrameMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 });
      const monScreenMat = new THREE.MeshBasicMaterial({ color: config.color });

      // Main curved monitor
      const mon1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.42, 0.03), monFrameMat);
      mon1.position.set(x, 1.08, z - 0.25);
      scene.add(mon1);

      const screen1 = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.38), monScreenMat);
      screen1.position.set(x, 1.08, z - 0.23);
      scene.add(screen1);

      // Secondary angled monitor
      const mon2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.03), monFrameMat);
      mon2.position.set(x + 0.52, 1.05, z - 0.2);
      mon2.rotation.y = -0.35;
      scene.add(mon2);

      // Ergonomic Office Chair
      const chairBase = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.5), chairMat);
      chairBase.position.set(x, 0.46, z + 0.55);
      chairBase.castShadow = true;
      scene.add(chairBase);

      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.65, 0.08), chairMat);
      chairBack.position.set(x, 0.82, z + 0.76);
      chairBack.castShadow = true;
      scene.add(chairBack);

      // Desk Point Light (Accent glow matching agent color)
      const deskLight = new THREE.PointLight(config.color, 1.8, 3.2);
      deskLight.position.set(x, 1.4, z);
      scene.add(deskLight);

      // ---------------------------------------------------------
      // STYLIZED 3D AGENT CHARACTER (Sitting in chair)
      // ---------------------------------------------------------
      const agentGroup = new THREE.Group();
      agentGroup.position.set(x, 0.5, z + 0.48);

      // Torso / Suit
      const bodyMat = new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.4,
        metalness: 0.2,
      });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.26), bodyMat);
      torso.position.y = 0.45;
      torso.castShadow = true;
      agentGroup.add(torso);

      // Head / Tech Helmet Visor
      const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), headMat);
      head.position.y = 0.82;
      head.castShadow = true;
      agentGroup.add(head);

      // Glowing Neon Visor Face
      const visor = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 0.08),
        new THREE.MeshBasicMaterial({ color: config.color })
      );
      visor.position.set(0, 0.82, -0.125);
      visor.rotation.y = Math.PI;
      agentGroup.add(visor);

      // Arms typing towards desk
      const armMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.08), armMat);
      leftArm.position.set(-0.22, 0.42, -0.12);
      leftArm.rotation.x = -0.6;
      agentGroup.add(leftArm);

      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.08), armMat);
      rightArm.position.set(0.22, 0.42, -0.12);
      rightArm.rotation.x = -0.6;
      agentGroup.add(rightArm);

      // Pulsing Holographic Ring Beacon Above Agent
      const haloGeo = new THREE.RingGeometry(0.28, 0.34, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: config.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(0, 1.25, 0);
      halo.rotation.x = Math.PI / 2;
      agentGroup.add(halo);

      scene.add(agentGroup);

      agentMeshes[key] = {
        group: agentGroup,
        halo,
        head,
        leftArm,
        rightArm,
        deskLight,
        baseColor: config.color,
      };
    });

    stateRef.current.agentMeshes = agentMeshes;

    // -------------------------------------------------------------
    // MOUSE DRAG / ORBIT INTERACTION
    // -------------------------------------------------------------
    const handleMouseDown = (e) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!stateRef.current.isDragging) return;

      const dx = e.clientX - stateRef.current.prevMouse.x;
      const dy = e.clientY - stateRef.current.prevMouse.y;
      stateRef.current.prevMouse = { x: e.clientX, y: e.clientY };

      // Free orbit around center
      const s = stateRef.current;
      s.orbitAngles.theta -= dx * 0.006;
      s.orbitAngles.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, s.orbitAngles.phi + dy * 0.005));

      const x = s.orbitAngles.radius * Math.sin(s.orbitAngles.phi) * Math.sin(s.orbitAngles.theta);
      const y = s.orbitAngles.radius * Math.cos(s.orbitAngles.phi);
      const z = s.orbitAngles.radius * Math.sin(s.orbitAngles.phi) * Math.cos(s.orbitAngles.theta);

      s.targetCamPos.set(s.orbitCenter.x + x, s.orbitCenter.y + y, s.orbitCenter.z + z);
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const s = stateRef.current;
      s.orbitAngles.radius = Math.max(3.5, Math.min(14, s.orbitAngles.radius + (e.deltaY > 0 ? 0.6 : -0.6)));

      const x = s.orbitAngles.radius * Math.sin(s.orbitAngles.phi) * Math.sin(s.orbitAngles.theta);
      const y = s.orbitAngles.radius * Math.cos(s.orbitAngles.phi);
      const z = s.orbitAngles.radius * Math.sin(s.orbitAngles.phi) * Math.cos(s.orbitAngles.theta);
      s.targetCamPos.set(s.orbitCenter.x + x, s.orbitCenter.y + y, s.orbitCenter.z + z);
    };

    // Touch events for tablet/mobile
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        stateRef.current.isDragging = true;
        stateRef.current.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (stateRef.current.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - stateRef.current.prevMouse.x;
        const dy = e.touches[0].clientY - stateRef.current.prevMouse.y;
        stateRef.current.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        const s = stateRef.current;
        s.orbitAngles.theta -= dx * 0.008;
        s.orbitAngles.phi = Math.max(0.25, Math.min(1.4, s.orbitAngles.phi + dy * 0.006));

        const x = s.orbitAngles.radius * Math.sin(s.orbitAngles.phi) * Math.sin(s.orbitAngles.theta);
        const y = s.orbitAngles.radius * Math.cos(s.orbitAngles.phi);
        const z = s.orbitAngles.radius * Math.sin(s.orbitAngles.phi) * Math.cos(s.orbitAngles.theta);
        s.targetCamPos.set(s.orbitCenter.x + x, s.orbitCenter.y + y, s.orbitCenter.z + z);
      }
    };

    const handleTouchEnd = () => {
      stateRef.current.isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // -------------------------------------------------------------
    // RESIZE LISTENER
    // -------------------------------------------------------------
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // RENDER ANIMATION LOOP
    // -------------------------------------------------------------
    const animate = () => {
      stateRef.current.animFrameId = requestAnimationFrame(animate);

      const elapsedTime = stateRef.current.clock.getElapsedTime();
      const s = stateRef.current;

      // Smooth camera interpolation (lerp)
      s.camera.position.lerp(s.targetCamPos, 0.05);
      s.currentLookAt.lerp(s.targetLookAt, 0.05);
      s.camera.lookAt(s.currentLookAt);

      // Subtle breathing & typing movement for agents
      Object.keys(s.agentMeshes).forEach((key, idx) => {
        const meshObj = s.agentMeshes[key];
        const isSelected = key === selectedAgentKey;

        // Typing jitter on arms
        const typingOffset = Math.sin(elapsedTime * 8 + idx * 2) * 0.02;
        meshObj.leftArm.position.y = 0.42 + typingOffset;
        meshObj.rightArm.position.y = 0.42 - typingOffset;

        // Rotating halo
        meshObj.halo.rotation.z = elapsedTime * (isSelected ? 1.8 : 0.8);

        // Highlight selected agent with light intensity pulse
        if (isSelected) {
          const pulse = Math.sin(elapsedTime * 4) * 0.4 + 1.6;
          meshObj.deskLight.intensity = pulse;
          meshObj.halo.scale.setScalar(1 + (Math.sin(elapsedTime * 3) * 0.12));
        } else {
          meshObj.deskLight.intensity = 1.0;
          meshObj.halo.scale.setScalar(1.0);
        }
      });

      // Special autonomous cycle particle pulse
      if (s.cyclePulseStartTime > 0) {
        const elapsedSincePulse = elapsedTime - s.cyclePulseStartTime;
        if (elapsedSincePulse < 3.0) {
          const sel = s.agentMeshes[selectedAgentKey];
          if (sel) {
            sel.group.position.y = 0.5 + Math.sin(elapsedSincePulse * Math.PI) * 0.08;
            sel.halo.scale.setScalar(1.2 + (elapsedSincePulse * 0.3));
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // CLEANUP ON UNMOUNT (ZERO MEMORY LEAK)
    // -------------------------------------------------------------
    return () => {
      if (stateRef.current.animFrameId) {
        cancelAnimationFrame(stateRef.current.animFrameId);
      }
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (renderer) {
        renderer.dispose();
      }
      if (container && dom && dom.parentNode === container) {
        container.removeChild(dom);
      }
    };
  }, []);

  const activeConfig = AGENT_STATIONS[selectedAgentKey] || AGENT_STATIONS.solaria;

  return (
    <div className="sbx-3d-office-container">
      {/* 3D CANVAS MOUNT POINT */}
      <div ref={mountRef} className="sbx-3d-canvas-mount" />

      {/* TOP FLOATING HUD OVERLAY */}
      <div className="sbx-3d-hud-top">
        {/* Active Agent Status Chip */}
        <div className="sbx-3d-agent-badge">
          <span style={{ fontSize: '18px' }}>{activeConfig.icon}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: activeConfig.hex }}>
              3D OFFICE // {activeConfig.name}
            </span>
            <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 500 }}>
              {activeConfig.role}
            </span>
          </div>
          <span style={{ marginLeft: '6px', fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            ● ONLINE
          </span>
        </div>

        {/* Quick Camera Navigation Buttons */}
        <div className="sbx-3d-nav-pills">
          {Object.keys(AGENT_STATIONS).map((key) => {
            const ag = AGENT_STATIONS[key];
            const isSelected = selectedAgentKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleFocusAgent(key)}
                className={`sbx-3d-pill-btn ${isSelected ? 'selected' : ''}`}
                title={`Kamera fokus ke meja ${ag.name}`}
              >
                <span>{ag.icon}</span> <span>{ag.name}</span>
              </button>
            );
          })}

          <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />

          <button
            type="button"
            onClick={handleResetOverview}
            className={`sbx-3d-pill-btn ${viewMode === 'orbit' ? 'overview' : ''}`}
            title="Lihat seluruh ruangan kantor 3D"
          >
            🏢 Overview
          </button>
        </div>
      </div>

      {/* SPEECH BUBBLE & LIVE ACTIVITY BANNER (BOTTOM) */}
      <div className="sbx-3d-hud-bottom">
        {/* Live speech bubble from selected agent */}
        <div className="sbx-3d-speech-box">
          <span style={{ fontSize: '18px' }}>{activeConfig.icon}</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: activeConfig.hex }}>{activeConfig.name}:</strong> &ldquo;{activeSpeech}&rdquo;
          </div>
        </div>

        {/* Trigger Autonomous Cycle Quick Button */}
        {onTriggerCycle && (
          <button
            type="button"
            onClick={() => onTriggerCycle(selectedAgentKey)}
            className="sbx-3d-trigger-btn"
          >
            ⚡ Trigger Autonomous
          </button>
        )}
      </div>

      {/* Touch/Mouse Instructions watermark */}
      <div className="sbx-3d-instructions">
        Drag to Orbit • Scroll to Zoom • Tap Agent to Focus
      </div>
    </div>
  );
}
