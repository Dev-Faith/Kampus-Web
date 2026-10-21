import { CampusCode } from "@/types/property";

export interface CampusDefinition {
  code: CampusCode;
  name: string;
  shortName: string;
  fullName: string;
  campusesOrGates: string;
  city: string;
  state: string;
  isActive: boolean;
  statusLabel: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const CAMPUSES: CampusDefinition[] = [
  {
    code: "FUTMINNA",
    name: "Federal University of Technology, Minna",
    shortName: "FUTMINNA",
    fullName: "Federal University of Technology, Minna (FUTMINNA)",
    campusesOrGates: "Gidan Kwano & Bosso Gates",
    city: "Minna",
    state: "Niger State",
    isActive: true,
    statusLabel: "Active Campus",
    coordinates: {
      lat: 9.5836,
      lng: 6.5463,
    },
  },
  {
    code: "UNILAG",
    name: "University of Lagos",
    shortName: "UNILAG",
    fullName: "University of Lagos (Akoka / Yaba)",
    campusesOrGates: "Akoka & Yaba Gates",
    city: "Lagos",
    state: "Lagos State",
    isActive: false,
    statusLabel: "Coming Soon",
    coordinates: {
      lat: 6.5178,
      lng: 3.3884,
    },
  },
  {
    code: "FUTA",
    name: "Federal University of Technology, Akure",
    shortName: "FUTA",
    fullName: "Federal University of Technology, Akure (FUTA)",
    campusesOrGates: "South & North Gates",
    city: "Akure",
    state: "Ondo State",
    isActive: false,
    statusLabel: "Coming Soon",
    coordinates: {
      lat: 7.303,
      lng: 5.138,
    },
  },
  {
    code: "UI",
    name: "University of Ibadan",
    shortName: "UI",
    fullName: "University of Ibadan (Agbowo / Bodija)",
    campusesOrGates: "Main Gate & Agbowo",
    city: "Ibadan",
    state: "Oyo State",
    isActive: false,
    statusLabel: "Coming Soon",
    coordinates: {
      lat: 7.444,
      lng: 3.901,
    },
  },
  {
    code: "UNIBEN",
    name: "University of Benin",
    shortName: "UNIBEN",
    fullName: "University of Benin (Ugbowo / BDPA)",
    campusesOrGates: "Main Gate & BDPA",
    city: "Benin City",
    state: "Edo State",
    isActive: false,
    statusLabel: "Coming Soon",
    coordinates: {
      lat: 6.401,
      lng: 5.617,
    },
  },
  {
    code: "OAU",
    name: "Obafemi Awolowo University",
    shortName: "OAU",
    fullName: "Obafemi Awolowo University (Ile-Ife)",
    campusesOrGates: "Campus Road & Mayfair",
    city: "Ile-Ife",
    state: "Osun State",
    isActive: false,
    statusLabel: "Coming Soon",
    coordinates: {
      lat: 7.518,
      lng: 4.528,
    },
  },
];

export const PRIMARY_CAMPUS = CAMPUSES[0]; // FUTMINNA
