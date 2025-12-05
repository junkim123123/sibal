/**
 * Type definitions for Sourcing Brief flow
 * 
 * These types define the structure for collecting product sourcing information
 * through a hybrid chat-form experience.
 */

/**
 * Quantity range options
 */
export type QuantityRange = 
  | "<100"
  | "100-999"
  | "1k-5k"
  | "5k+"
  | "not_sure";

/**
 * Section identifiers
 */
export type SectionId = 
  | "welcome"
  | "product_basics"
  | "packaging_logistics"
  | "compliance"
  | "budget_schedule_contact"
  | "review";

/**
 * Step identifiers for Section A: Product Basics
 */
export type ProductBasicsStepId =
  | "product_name"
  | "quantity"
  | "image_upload";

/**
 * Step identifiers for Section D: Budget, Schedule, Contact
 */
export type ContactStepId =
  | "email"
  | "name"
  | "company";

/**
 * Packaging type options
 */
export type PackagingType =
  | "retail_box"
  | "polybag"
  | "bulk"
  | "custom"
  | "not_sure";

/**
 * Incoterms options
 */
export type Incoterms =
  | "EXW"
  | "FOB"
  | "CIF"
  | "DDP"
  | "DDU"
  | "not_sure";

/**
 * Temperature handling options
 */
export type TemperatureHandling =
  | "room_temp"
  | "refrigerated"
  | "frozen"
  | "sensitive"
  | "not_sure";

/**
 * Certification options
 */
export type Certification =
  | "FDA"
  | "CE"
  | "RoHS"
  | "UL"
  | "FCC"
  | "other"
  | "not_sure";

/**
 * Complete sourcing brief state
 */
export interface SourcingBriefState {
  // Section A: Product Basics
  productName?: string;
  productLink?: string;
  quantity?: QuantityRange;
  quantityCustom?: string;
  uploadedFiles?: File[];
  uploadedFileUrls?: string[];
  
  // Section B: Packaging & Logistics
  packagingType?: PackagingType;
  specialPackaging?: string[]; // e.g., ["moisture_proof", "pest_proof"]
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: "cm" | "in";
    weight?: number;
    weightUnit?: "kg" | "lb";
  };
  incoterms?: Incoterms;
  originCity?: string;
  destinationCity?: string;
  factoryPickup?: boolean;
  
  // Section C: Compliance & Special Handling
  isHazardous?: boolean;
  hazardousDetails?: string[]; // e.g., ["battery", "liquid", "powder"]
  certifications?: Certification[];
  certificationOther?: string;
  temperatureHandling?: TemperatureHandling;
  specialHandlingNotes?: string;
  
  // Section D: Contact
  email?: string;
  name?: string;
  company?: string;
  
  // Metadata
  currentSection?: SectionId;
  currentStep?: string;
  completedSections?: SectionId[];
  resumeToken?: string; // For "save and resume" feature
}

/**
 * Helper function to get human-readable label for quantity range
 */
export function getQuantityLabel(range: QuantityRange): string {
  const labels: Record<QuantityRange, string> = {
    "<100": "<100 units",
    "100-999": "100–999 units",
    "1k-5k": "1k–5k units",
    "5k+": "5k+ units",
    "not_sure": "Not sure yet",
  };
  return labels[range];
}

/**
 * Helper function to get human-readable label for packaging type
 */
export function getPackagingLabel(type: PackagingType): string {
  const labels: Record<PackagingType, string> = {
    retail_box: "Retail box",
    polybag: "Polybag",
    bulk: "Bulk",
    custom: "Custom",
    not_sure: "Not sure yet",
  };
  return labels[type];
}

/**
 * Helper function to get human-readable label for incoterms
 */
export function getIncotermsLabel(incoterms: Incoterms): string {
  const labels: Record<Incoterms, string> = {
    EXW: "EXW (Ex Works)",
    FOB: "FOB (Free On Board)",
    CIF: "CIF (Cost, Insurance, Freight)",
    DDP: "DDP (Delivered Duty Paid)",
    DDU: "DDU (Delivered Duty Unpaid)",
    "not_sure": "Not sure yet",
  };
  return labels[incoterms];
}

/**
 * Helper function to get human-readable label for certification
 */
export function getCertificationLabel(cert: Certification): string {
  const labels: Record<Certification, string> = {
    FDA: "FDA",
    CE: "CE",
    RoHS: "RoHS",
    UL: "UL",
    FCC: "FCC",
    other: "Other",
    "not_sure": "Not sure yet",
  };
  return labels[cert];
}

/**
 * Helper function to get human-readable label for temperature handling
 */
export function getTemperatureLabel(temp: TemperatureHandling): string {
  const labels: Record<TemperatureHandling, string> = {
    room_temp: "Room temperature",
    refrigerated: "Refrigerated",
    frozen: "Frozen",
    sensitive: "Sensitive items",
    "not_sure": "Not sure yet",
  };
  return labels[temp];
}

