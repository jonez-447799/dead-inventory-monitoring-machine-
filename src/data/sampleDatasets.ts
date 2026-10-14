import { StockItem, StockCategory } from '../types';

export interface SampleDatasetInfo {
  id: string;
  name: string;
  sector: string;
  description: string;
  expectedStats: {
    totalStockValue: string;
    skuCount: number;
    deadStockValue: string;
    deadStockPercent: string;
    annualHoldingBurn: string;
    classACount: number;
  };
  csvData: string;
  items: StockItem[];
}

export const DATASET_AUTOMOTIVE_CNC: SampleDatasetInfo = {
  id: 'auto-cnc',
  name: 'Precision Automotive & CNC Machining',
  sector: 'Automotive Components (Tier 2 Supplier)',
  description: 'Engineered auto components, brass bushings, timing pulleys, CNC tool inserts, and EN8 alloy shafts.',
  expectedStats: {
    totalStockValue: '₹12,85,600',
    skuCount: 16,
    deadStockValue: '₹4,92,400',
    deadStockPercent: '38.3%',
    annualHoldingBurn: '₹88,632',
    classACount: 3,
  },
  csvData: `Item Code,Item Name,Category,Qty On Hand,Cost Rate,Last Movement Date
CNC-EN8-SHAFT,EN8 Induction Hardened Shaft 35mm,Raw Material,85,1850,2025-06-15
BRS-BSH-50MM,Phosphor Bronze Bushing 50x30mm,Finished Goods,240,650,2026-01-10
INS-WNMG-08,Carbide Turning Insert WNMG080408,Consumable,350,320,2026-09-20
PUL-TIM-T5,Aluminium Timing Pulley 48T-T5,Finished Goods,60,1400,2025-07-22
ST-CR-16MN,16MnCr5 Gear Steel Billet 90mm,Raw Material,120,2100,2026-08-30
HYD-SEAL-P40,Polyurethane Hydraulic Rod Seal 40mm,Spares,18,780,2025-09-05
AL-6061-BLK,6061-T6 Aircraft Grade Billet 150mm,Raw Material,35,4200,2026-09-28
COL-ER32-12,High Precision ER32 Spring Collet 12mm,Consumable,25,950,2025-04-18
CAM-SFT-L250,Hardened Camshaft Blank L250mm,Finished Goods,42,2800,2025-08-11
SPK-PLG-IRID,Iridium Industrial Spark Plug M14,Spares,60,650,2026-07-15
OIL-CUT-50L,Water Soluble Synthetic Cutting Fluid 50L,Consumable,12,6800,2026-09-12
FLG-HUB-4HL,Forged Hub Flange 4-Hole PCD100,Finished Goods,110,890,2025-10-02
NDL-BRG-2532,Needle Roller Bearing HK253216,Spares,40,420,2026-02-14
SS-SCR-M8X30,High Tensile Gr 10.9 Allen Bolt M8x30,Consumable,4500,8,2026-09-25
GRS-EP2-18KG,Lithium Complex EP-2 High Temp Grease 18Kg,Consumable,6,5400,2025-05-19
SPL-SHF-22T,Splined Transmission Shaft 22T,Finished Goods,28,3450,2025-03-30`,
  items: [
    { id: 'cnc-01', itemCode: 'CNC-EN8-SHAFT', itemName: 'EN8 Induction Hardened Shaft 35mm', category: 'Raw Material', qtyOnHand: 85, costRate: 1850, lastMovement: '2025-06-15' },
    { id: 'cnc-02', itemCode: 'BRS-BSH-50MM', itemName: 'Phosphor Bronze Bushing 50x30mm', category: 'Finished Goods', qtyOnHand: 240, costRate: 650, lastMovement: '2026-01-10' },
    { id: 'cnc-03', itemCode: 'INS-WNMG-08', itemName: 'Carbide Turning Insert WNMG080408', category: 'Consumable', qtyOnHand: 350, costRate: 320, lastMovement: '2026-09-20' },
    { id: 'cnc-04', itemCode: 'PUL-TIM-T5', itemName: 'Aluminium Timing Pulley 48T-T5', category: 'Finished Goods', qtyOnHand: 60, costRate: 1400, lastMovement: '2025-07-22' },
    { id: 'cnc-05', itemCode: 'ST-CR-16MN', itemName: '16MnCr5 Gear Steel Billet 90mm', category: 'Raw Material', qtyOnHand: 120, costRate: 2100, lastMovement: '2026-08-30' },
    { id: 'cnc-06', itemCode: 'HYD-SEAL-P40', itemName: 'Polyurethane Hydraulic Rod Seal 40mm', category: 'Spares', qtyOnHand: 18, costRate: 780, lastMovement: '2025-09-05' },
    { id: 'cnc-07', itemCode: 'AL-6061-BLK', itemName: '6061-T6 Aircraft Grade Billet 150mm', category: 'Raw Material', qtyOnHand: 35, costRate: 4200, lastMovement: '2026-09-28' },
    { id: 'cnc-08', itemCode: 'COL-ER32-12', itemName: 'High Precision ER32 Spring Collet 12mm', category: 'Consumable', qtyOnHand: 25, costRate: 950, lastMovement: '2025-04-18' },
    { id: 'cnc-09', itemCode: 'CAM-SFT-L250', itemName: 'Hardened Camshaft Blank L250mm', category: 'Finished Goods', qtyOnHand: 42, costRate: 2800, lastMovement: '2025-08-11' },
    { id: 'cnc-10', itemCode: 'SPK-PLG-IRID', itemName: 'Iridium Industrial Spark Plug M14', category: 'Spares', qtyOnHand: 60, costRate: 650, lastMovement: '2026-07-15' },
    { id: 'cnc-11', itemCode: 'OIL-CUT-50L', itemName: 'Water Soluble Synthetic Cutting Fluid 50L', category: 'Consumable', qtyOnHand: 12, costRate: 6800, lastMovement: '2026-09-12' },
    { id: 'cnc-12', itemCode: 'FLG-HUB-4HL', itemName: 'Forged Hub Flange 4-Hole PCD100', category: 'Finished Goods', qtyOnHand: 110, costRate: 890, lastMovement: '2025-10-02' },
    { id: 'cnc-13', itemCode: 'NDL-BRG-2532', itemName: 'Needle Roller Bearing HK253216', category: 'Spares', qtyOnHand: 40, costRate: 420, lastMovement: '2026-02-14' },
    { id: 'cnc-14', itemCode: 'SS-SCR-M8X30', itemName: 'High Tensile Gr 10.9 Allen Bolt M8x30', category: 'Consumable', qtyOnHand: 4500, costRate: 8, lastMovement: '2026-09-25' },
    { id: 'cnc-15', itemCode: 'GRS-EP2-18KG', itemName: 'Lithium Complex EP-2 High Temp Grease 18Kg', category: 'Consumable', qtyOnHand: 6, costRate: 5400, lastMovement: '2025-05-19' },
    { id: 'cnc-16', itemCode: 'SPL-SHF-22T', itemName: 'Splined Transmission Shaft 22T', category: 'Finished Goods', qtyOnHand: 28, costRate: 3450, lastMovement: '2025-03-30' },
  ],
};

export const DATASET_ELECTRONICS_PCB: SampleDatasetInfo = {
  id: 'elec-pcb',
  name: 'Electronics, PCB & IoT Assembly Unit',
  sector: 'High-Tech Electronics & IoT Devices',
  description: 'SMD microcontrollers, multilayer FR4 boards, lithium batteries, solder paste, and RF modules.',
  expectedStats: {
    totalStockValue: '₹9,42,800',
    skuCount: 15,
    deadStockValue: '₹3,78,000',
    deadStockPercent: '40.1%',
    annualHoldingBurn: '₹68,040',
    classACount: 2,
  },
  csvData: `Item Code,Item Name,Category,Qty On Hand,Cost Rate,Last Movement Date
MCU-STM32-F4,STM32F407VGT6 ARM Cortex M4 LQFP100,Raw Material,450,420,2025-04-12
PCB-IOT-4LYR,4-Layer FR4 ENIG Industrial IoT PCB,Raw Material,800,165,2025-05-20
BAT-LPO-2200,Li-Polymer 3.7V 2200mAh Grade A Cell,Raw Material,600,280,2026-09-18
PST-SAC-305,Lead-Free Solder Paste SAC305 500g Jar,Consumable,24,2450,2026-09-24
MOD-WIFI-ESP,ESP32-WROOM-32E WiFi+BLE 16MB Module,Raw Material,320,260,2026-08-15
ENC-ABS-IP67,IP67 Waterproof Polycarbonate Enclosure,Finished Goods,140,850,2025-06-30
CAP-MLCC-0805,MLCC 10uF 25V X7R 0805 Reel 4K,Raw Material,12,3800,2026-07-28
DIS-OLED-096,0.96 Inch I2C Blue OLED Module 128x64,Spares,250,145,2025-03-14
PWR-SMPS-24V,MeanWell 24V 5A Din Rail SMPS HDR-120,Spares,22,2150,2025-07-09
ANT-GSM-SMA,High Gain 4G LTE Magnetic Antenna SMA,Consumable,180,220,2026-09-02
RLY-OMR-12V,Omron G2R-1-E 16A 12VDC Power Relay,Raw Material,500,85,2026-04-10
FLX-RST-100G,No-Clean Rosin Tacky Rework Flux 100g,Consumable,30,850,2025-08-22
SFT-DGL-USB,Encrypted USB Hardware License Dongle,Finished Goods,45,1850,2025-02-17
WIR-SIL-24AWG,Silicone Ultra-Flexible Hookup Wire 100m,Consumable,15,1200,2026-08-19
HST-ALU-TO220,Extruded Aluminium Heatsink TO-220,Raw Material,1200,18,2026-09-10`,
  items: [
    { id: 'pcb-01', itemCode: 'MCU-STM32-F4', itemName: 'STM32F407VGT6 ARM Cortex M4 LQFP100', category: 'Raw Material', qtyOnHand: 450, costRate: 420, lastMovement: '2025-04-12' },
    { id: 'pcb-02', itemCode: 'PCB-IOT-4LYR', itemName: '4-Layer FR4 ENIG Industrial IoT PCB', category: 'Raw Material', qtyOnHand: 800, costRate: 165, lastMovement: '2025-05-20' },
    { id: 'pcb-03', itemCode: 'BAT-LPO-2200', itemName: 'Li-Polymer 3.7V 2200mAh Grade A Cell', category: 'Raw Material', qtyOnHand: 600, costRate: 280, lastMovement: '2026-09-18' },
    { id: 'pcb-04', itemCode: 'PST-SAC-305', itemName: 'Lead-Free Solder Paste SAC305 500g Jar', category: 'Consumable', qtyOnHand: 24, costRate: 2450, lastMovement: '2026-09-24' },
    { id: 'pcb-05', itemCode: 'MOD-WIFI-ESP', itemName: 'ESP32-WROOM-32E WiFi+BLE 16MB Module', category: 'Raw Material', qtyOnHand: 320, costRate: 260, lastMovement: '2026-08-15' },
    { id: 'pcb-06', itemCode: 'ENC-ABS-IP67', itemName: 'IP67 Waterproof Polycarbonate Enclosure', category: 'Finished Goods', qtyOnHand: 140, costRate: 850, lastMovement: '2025-06-30' },
    { id: 'pcb-07', itemCode: 'CAP-MLCC-0805', itemName: 'MLCC 10uF 25V X7R 0805 Reel 4K', category: 'Raw Material', qtyOnHand: 12, costRate: 3800, lastMovement: '2026-07-28' },
    { id: 'pcb-08', itemCode: 'DIS-OLED-096', itemName: '0.96 Inch I2C Blue OLED Module 128x64', category: 'Spares', qtyOnHand: 250, costRate: 145, lastMovement: '2025-03-14' },
    { id: 'pcb-09', itemCode: 'PWR-SMPS-24V', itemName: 'MeanWell 24V 5A Din Rail SMPS HDR-120', category: 'Spares', qtyOnHand: 22, costRate: 2150, lastMovement: '2025-07-09' },
    { id: 'pcb-10', itemCode: 'ANT-GSM-SMA', itemName: 'High Gain 4G LTE Magnetic Antenna SMA', category: 'Consumable', qtyOnHand: 180, costRate: 220, lastMovement: '2026-09-02' },
    { id: 'pcb-11', itemCode: 'RLY-OMR-12V', itemName: 'Omron G2R-1-E 16A 12VDC Power Relay', category: 'Raw Material', qtyOnHand: 500, costRate: 85, lastMovement: '2026-04-10' },
    { id: 'pcb-12', itemCode: 'FLX-RST-100G', itemName: 'No-Clean Rosin Tacky Rework Flux 100g', category: 'Consumable', qtyOnHand: 30, costRate: 850, lastMovement: '2025-08-22' },
    { id: 'pcb-13', itemCode: 'SFT-DGL-USB', itemName: 'Encrypted USB Hardware License Dongle', category: 'Finished Goods', qtyOnHand: 45, costRate: 1850, lastMovement: '2025-02-17' },
    { id: 'pcb-14', itemCode: 'WIR-SIL-24AWG', itemName: 'Silicone Ultra-Flexible Hookup Wire 100m', category: 'Consumable', qtyOnHand: 15, costRate: 1200, lastMovement: '2026-08-19' },
    { id: 'pcb-15', itemCode: 'HST-ALU-TO220', itemName: 'Extruded Aluminium Heatsink TO-220', category: 'Raw Material', qtyOnHand: 1200, costRate: 18, lastMovement: '2026-09-10' },
  ],
};

export const DATASET_HEAVY_VALVES: SampleDatasetInfo = {
  id: 'heavy-valves',
  name: 'Heavy Industrial Valves & Process Equipment',
  sector: 'Process Plant Engineering & Boilers',
  description: 'Cast steel valves, high pressure flanges, spiral gaskets, and heavy alloy fasteners.',
  expectedStats: {
    totalStockValue: '₹18,44,500',
    skuCount: 14,
    deadStockValue: '₹8,12,000',
    deadStockPercent: '44.0%',
    annualHoldingBurn: '₹1,46,160',
    classACount: 3,
  },
  csvData: `Item Code,Item Name,Category,Qty On Hand,Cost Rate,Last Movement Date
VLV-CST-6IN,Cast Steel Gate Valve 6 Inch Class 300,Finished Goods,16,18500,2025-05-14
FLG-WN-8IN-600,Weld Neck Flange 8 Inch ASTM A105 #600,Raw Material,28,6400,2025-07-18
VLV-BL-3PC-2IN,3-Piece Forged Ball Valve 2 Inch #800,Finished Goods,35,4800,2026-08-22
ACT-PNEU-DA,Double Acting Pneumatic Quarter-Turn Actuator,Spares,10,12500,2025-04-10
GSK-SP-8IN-300,Spiral Wound Gasket 8 Inch 300# Graphite,Consumable,120,650,2026-09-15
BLT-B7-1X150,ASTM A193 Grade B7 Stud Bolt 1 Inch x 150mm,Raw Material,650,280,2026-08-04
VLV-CHK-4IN,Swing Check Valve 4 Inch Class 150 WCB,Finished Goods,14,7900,2025-08-30
STM-TRP-TD50,Thermodynamic Steam Trap 1/2 Inch Screwed,Spares,40,2400,2026-01-18
ROD-STE-12MM,Stellite Hardfacing Welding Rod 12mm,Consumable,30,4200,2025-03-25
VLV-SFT-2X3,High Capacity Pressure Safety Valve 2x3 Inch,Finished Goods,6,28000,2025-06-08
TUB-SS316-1IN,Seamless Stainless Steel Tubing 1 Inch OD,Raw Material,85,1600,2026-09-20
DIS-RUPT-4IN,Inconel Rupture Disc 4 Inch 10 Bar,Spares,12,5600,2025-09-12
PG-GLY-0-40,Glycerine Filled Pressure Gauge 0-40 Bar,Spares,35,920,2026-07-29
CS-PLT-40MM,ASTM A516 Grade 70 Boiler Plate 40mm,Raw Material,8,14500,2026-09-05`,
  items: [
    { id: 'vlv-01', itemCode: 'VLV-CST-6IN', itemName: 'Cast Steel Gate Valve 6 Inch Class 300', category: 'Finished Goods', qtyOnHand: 16, costRate: 18500, lastMovement: '2025-05-14' },
    { id: 'vlv-02', itemCode: 'FLG-WN-8IN-600', itemName: 'Weld Neck Flange 8 Inch ASTM A105 #600', category: 'Raw Material', qtyOnHand: 28, costRate: 6400, lastMovement: '2025-07-18' },
    { id: 'vlv-03', itemCode: 'VLV-BL-3PC-2IN', itemName: '3-Piece Forged Ball Valve 2 Inch #800', category: 'Finished Goods', qtyOnHand: 35, costRate: 4800, lastMovement: '2026-08-22' },
    { id: 'vlv-04', itemCode: 'ACT-PNEU-DA', itemName: 'Double Acting Pneumatic Quarter-Turn Actuator', category: 'Spares', qtyOnHand: 10, costRate: 12500, lastMovement: '2025-04-10' },
    { id: 'vlv-05', itemCode: 'GSK-SP-8IN-300', itemName: 'Spiral Wound Gasket 8 Inch 300# Graphite', category: 'Consumable', qtyOnHand: 120, costRate: 650, lastMovement: '2026-09-15' },
    { id: 'vlv-06', itemCode: 'BLT-B7-1X150', itemName: 'ASTM A193 Grade B7 Stud Bolt 1 Inch x 150mm', category: 'Raw Material', qtyOnHand: 650, costRate: 280, lastMovement: '2026-08-04' },
    { id: 'vlv-07', itemCode: 'VLV-CHK-4IN', itemName: 'Swing Check Valve 4 Inch Class 150 WCB', category: 'Finished Goods', qtyOnHand: 14, costRate: 7900, lastMovement: '2025-08-30' },
    { id: 'vlv-08', itemCode: 'STM-TRP-TD50', itemName: 'Thermodynamic Steam Trap 1/2 Inch Screwed', category: 'Spares', qtyOnHand: 40, costRate: 2400, lastMovement: '2026-01-18' },
    { id: 'vlv-09', itemCode: 'ROD-STE-12MM', itemName: 'Stellite Hardfacing Welding Rod 12mm', category: 'Consumable', qtyOnHand: 30, costRate: 4200, lastMovement: '2025-03-25' },
    { id: 'vlv-10', itemCode: 'VLV-SFT-2X3', itemName: 'High Capacity Pressure Safety Valve 2x3 Inch', category: 'Finished Goods', qtyOnHand: 6, costRate: 28000, lastMovement: '2025-06-08' },
    { id: 'vlv-11', itemCode: 'TUB-SS316-1IN', itemName: 'Seamless Stainless Steel Tubing 1 Inch OD', category: 'Raw Material', qtyOnHand: 85, costRate: 1600, lastMovement: '2026-09-20' },
    { id: 'vlv-12', itemCode: 'DIS-RUPT-4IN', itemName: 'Inconel Rupture Disc 4 Inch 10 Bar', category: 'Spares', qtyOnHand: 12, costRate: 5600, lastMovement: '2025-09-12' },
    { id: 'vlv-13', itemCode: 'PG-GLY-0-40', itemName: 'Glycerine Filled Pressure Gauge 0-40 Bar', category: 'Spares', qtyOnHand: 35, costRate: 920, lastMovement: '2026-07-29' },
    { id: 'vlv-14', itemCode: 'CS-PLT-40MM', itemName: 'ASTM A516 Grade 70 Boiler Plate 40mm', category: 'Raw Material', qtyOnHand: 8, costRate: 14500, lastMovement: '2026-09-05' },
  ],
};

export const SAMPLE_DATASET_PRESETS: SampleDatasetInfo[] = [
  DATASET_AUTOMOTIVE_CNC,
  DATASET_ELECTRONICS_PCB,
  DATASET_HEAVY_VALVES,
];
