/**
 * DUMMY DATA for the Instrument Booking System.
 *
 * Every export below mirrors a database table defined in `@/services/types`
 * (see the "Table:" comments there). When the backend is ready, create the same
 * tables, expose the same JSON shape, and replace the functions in
 * `@/services/instrument.service.ts` with `apiRequest` calls. This file can
 * then be deleted.
 *
 * Booking dates are generated relative to "today" so the calendar always looks
 * populated during the demo. A real backend stores fixed ISO timestamps.
 */
import {
  Instrument,
  InstrumentBooking,
  InstrumentCategory,
  InstrumentReview,
  InstrumentSpecification,
  InstrumentUnavailablePeriod,
} from '@/services/types';

/** ISO timestamp for `dayOffset` days from today at hour:minute (local time). */
const at = (dayOffset: number, hour: number, minute = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const NOW = new Date().toISOString();

// ---------------------------------------------------------------- categories
export const dummyInstrumentCategories: InstrumentCategory[] = [
  { id: 'cat-spectroscopy', name: 'Spectroscopy' },
  { id: 'cat-microscopy', name: 'Microscopy' },
  { id: 'cat-separation', name: 'Separation & Chromatography' },
  { id: 'cat-sample-prep', name: 'Sample Preparation' },
  { id: 'cat-molecular', name: 'Molecular Biology' },
];

// --------------------------------------------------------------- instruments
type InstrumentRow = Omit<Instrument, 'specifications' | 'averageRating' | 'reviewCount'>;

const ADMIN = {
  responsibleAdminId: 'admin-001',
  responsibleAdminName: 'Dr. Yunus Ahmed',
  responsibleAdminEmail: 'admin@bcerlab.com',
};

const RULES = {
  openingHour: 9,
  closingHour: 18,
  slotIntervalMinutes: 30,
  minDurationMinutes: 30,
  maxDurationMinutes: 240,
  advanceBookingDays: 60,
};

export const dummyInstrumentRows: InstrumentRow[] = [
  {
    id: 'ins-uv-vis',
    slug: 'uv-vis-spectrophotometer',
    name: 'UV-Vis Spectrophotometer',
    shortDescription: 'Double-beam spectrophotometer for absorbance and concentration measurements from 190 to 1100 nm.',
    description:
      'A high-precision double-beam UV-Visible spectrophotometer used for quantitative analysis of dyes, pollutants and nanomaterial suspensions. It is the workhorse of our photocatalysis and adsorption studies.\n\nThe instrument supports kinetic scans, wavelength scans and multi-point calibration, and can export results directly to a USB drive or the connected workstation.',
    categoryId: 'cat-spectroscopy',
    category: 'Spectroscopy',
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1663354876870-6282cb0a8843?w=900&q=80',
    manufacturer: 'Shimadzu',
    model: 'UV-1800',
    serialNumber: 'A11454802345',
    location: 'Room 204, Department of Chemistry, CUET',
    ...ADMIN,
    features: ['Double-beam optical system', 'Kinetics and wavelength scan modes', 'Quartz and glass cuvette compatible', 'USB data export'],
    usageRequirements: ['Use clean quartz cuvettes for UV measurements', 'Filter turbid samples before measurement', 'Record your usage in the logbook'],
    ...RULES,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'ins-ftir',
    slug: 'ftir-spectrometer',
    name: 'FTIR Spectrometer',
    shortDescription: 'Fourier-transform infrared spectrometer with ATR module for rapid functional group identification.',
    description:
      'The FTIR spectrometer identifies functional groups and bonding in solids, liquids and thin films. The diamond ATR accessory removes the need for KBr pellets for most samples.\n\nIt is routinely used to characterise synthesised nanomaterials, polymers and adsorbent surfaces before and after treatment.',
    categoryId: 'cat-spectroscopy',
    category: 'Spectroscopy',
    status: 'in_use',
    imageUrl: 'https://images.unsplash.com/photo-1669344319217-19810a5e3d3b?w=900&q=80',
    manufacturer: 'PerkinElmer',
    model: 'Spectrum Two',
    serialNumber: 'L1600300-77',
    location: 'Room 204, Department of Chemistry, CUET',
    ...ADMIN,
    features: ['Diamond ATR accessory', 'Resolution up to 0.5 cm-1', 'Built-in spectral library search'],
    usageRequirements: ['Samples must be dry', 'Clean the ATR crystal with isopropanol after use', 'Training required before first use'],
    ...RULES,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'ins-microscope',
    slug: 'research-optical-microscope',
    name: 'Research Optical Microscope',
    shortDescription: 'Trinocular research microscope with camera for bright-field imaging up to 1000x magnification.',
    description:
      'A trinocular research-grade optical microscope fitted with a digital camera for documenting morphology of biological samples, biofilms and microplastics.\n\nFive plan achromat objectives and Kohler illumination deliver crisp, evenly lit images suitable for publication.',
    categoryId: 'cat-microscopy',
    category: 'Microscopy',
    status: 'booked',
    imageUrl: 'https://images.unsplash.com/photo-1614308460927-5024ba2e1dcb?w=900&q=80',
    manufacturer: 'Meiji Techno',
    model: 'MT5300L',
    serialNumber: 'MT-530-2291',
    location: 'Room 206, Department of Chemistry, CUET',
    ...ADMIN,
    features: ['4x to 100x plan achromat objectives', '5 MP USB camera', 'LED Kohler illumination', 'Image capture software'],
    usageRequirements: ['Use immersion oil only with the 100x objective', 'Return stage to lowest position after use'],
    ...RULES,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'ins-centrifuge',
    slug: 'high-speed-refrigerated-centrifuge',
    name: 'High-Speed Refrigerated Centrifuge',
    shortDescription: 'Refrigerated centrifuge up to 15,000 rpm for nanoparticle recovery and cell harvesting.',
    description:
      'A refrigerated high-speed centrifuge for separating nanoparticles, precipitates and cell pellets under temperature control. Multiple rotors support tubes from 1.5 mL to 50 mL.\n\nPre-cooling and soft-start programs protect delicate samples.',
    categoryId: 'cat-sample-prep',
    category: 'Sample Preparation',
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1748278739348-d9886621530f?w=900&q=80',
    manufacturer: 'Eppendorf',
    model: '5430 R',
    serialNumber: '5428-0412',
    location: 'Room 205, Department of Chemistry, CUET',
    ...ADMIN,
    features: ['Max speed 15,000 rpm', 'Temperature range -10 to 40 C', 'Programmable acceleration profiles'],
    usageRequirements: ['Balance tubes precisely before starting', 'Never exceed rotor-rated speed'],
    ...RULES,
    closingHour: 17,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'ins-hplc',
    slug: 'hplc-system',
    name: 'HPLC System',
    shortDescription: 'High-performance liquid chromatography with diode-array detector for trace organic analysis.',
    description:
      'A modular HPLC system with quaternary pump, autosampler, column oven and diode-array detector. Used for quantifying pharmaceuticals, pesticides and degradation by-products in water samples.\n\nMethods are developed and stored on the dedicated workstation.',
    categoryId: 'cat-separation',
    category: 'Separation & Chromatography',
    status: 'maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1602052577122-f73b9710adba?w=900&q=80',
    manufacturer: 'Agilent',
    model: '1260 Infinity II',
    serialNumber: 'DEAB812340',
    location: 'Room 210, Department of Chemistry, CUET',
    ...ADMIN,
    features: ['Quaternary pump', '120-vial autosampler', 'Thermostatted column compartment', 'Diode-array detector (190-950 nm)'],
    usageRequirements: ['HPLC-grade solvents only', 'Filter all samples through 0.22 um filters', 'Training and approval mandatory'],
    ...RULES,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'ins-pcr',
    slug: 'real-time-pcr-system',
    name: 'Real-Time PCR System',
    shortDescription: 'Quantitative PCR thermocycler for gene detection and antimicrobial resistance profiling.',
    description:
      'A 96-well real-time PCR system for quantitative gene expression and detection of antimicrobial resistance genes in environmental samples.\n\nIncludes melt-curve analysis and a validated assay template library.',
    categoryId: 'cat-molecular',
    category: 'Molecular Biology',
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1694230155228-cdde50083573?w=900&q=80',
    manufacturer: 'Bio-Rad',
    model: 'CFX96 Touch',
    serialNumber: 'CFX-880-1923',
    location: 'Room 212, Department of Chemistry, CUET',
    ...ADMIN,
    features: ['96-well format', 'Six-channel optical detection', 'Melt-curve analysis'],
    usageRequirements: ['Use nuclease-free consumables', 'Bring your own plates and sealing film'],
    ...RULES,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ------------------------------------------------------------ specifications
const spec = (instrumentId: string, rows: [string, string][]): InstrumentSpecification[] =>
  rows.map(([label, value], i) => ({ id: `${instrumentId}-spec-${i + 1}`, instrumentId, label, value, sortOrder: i }));

export const dummyInstrumentSpecifications: InstrumentSpecification[] = [
  ...spec('ins-uv-vis', [
    ['Wavelength range', '190 - 1100 nm'],
    ['Spectral bandwidth', '1 nm'],
    ['Photometric range', '-4 to 4 Abs'],
    ['Light source', 'Deuterium and halogen lamps'],
    ['Scan speed', 'Up to 3200 nm/min'],
  ]),
  ...spec('ins-ftir', [
    ['Spectral range', '8,300 - 350 cm-1'],
    ['Resolution', '0.5 cm-1'],
    ['Detector', 'LiTaO3'],
    ['Sampling', 'Diamond ATR'],
  ]),
  ...spec('ins-microscope', [
    ['Magnification', '40x - 1000x'],
    ['Objectives', '4x, 10x, 20x, 40x, 100x'],
    ['Illumination', '3 W LED, Kohler'],
    ['Camera', '5 MP USB 3.0'],
  ]),
  ...spec('ins-centrifuge', [
    ['Max speed', '15,000 rpm'],
    ['Max RCF', '20,817 x g'],
    ['Temperature range', '-10 to 40 C'],
    ['Max capacity', '4 x 50 mL'],
  ]),
  ...spec('ins-hplc', [
    ['Flow range', '0.001 - 5 mL/min'],
    ['Pressure limit', '600 bar'],
    ['Detector', 'Diode array, 190 - 950 nm'],
    ['Autosampler capacity', '120 vials'],
  ]),
  ...spec('ins-pcr', [
    ['Block format', '96-well'],
    ['Temperature range', '4 - 100 C'],
    ['Detection channels', '6'],
    ['Ramp rate', '5 C/s'],
  ]),
];

// ------------------------------------------------------------------ bookings
const base = {
  requesterPhone: '+8801700000000',
  createdAt: NOW,
};

export const dummyInstrumentBookings: InstrumentBooking[] = [
  // Approved (appear on calendars)
  { ...base, id: 'bk-001', instrumentId: 'ins-uv-vis', requesterName: 'Rahim Uddin', requesterEmail: 'rahim@cuet.ac.bd', affiliation: 'MSc Student, Chemistry', supervisorName: 'Dr. Yunus Ahmed', purposeTitle: 'Methylene blue degradation kinetics', purposeDescription: 'Absorbance scans at 664 nm for photocatalysis time series.', startAt: at(1, 10), endAt: at(1, 12), status: 'approved', reviewedBy: 'admin-001', reviewedAt: NOW },
  { ...base, id: 'bk-002', instrumentId: 'ins-uv-vis', requesterName: 'Nusrat Jahan', requesterEmail: 'nusrat@cuet.ac.bd', affiliation: 'PhD Fellow, Chemistry', purposeTitle: 'Dye adsorption isotherms', purposeDescription: 'Equilibrium concentration measurements for adsorption isotherm study.', startAt: at(2, 14), endAt: at(2, 16), status: 'approved', reviewedBy: 'admin-001', reviewedAt: NOW },
  { ...base, id: 'bk-003', instrumentId: 'ins-uv-vis', requesterName: 'Tanvir Hossain', requesterEmail: 'tanvir@cuet.ac.bd', affiliation: 'BSc Student, Chemistry', purposeTitle: 'Thesis calibration curves', purposeDescription: 'Preparing calibration curves for undergraduate thesis.', startAt: at(4, 9, 30), endAt: at(4, 11), status: 'approved', reviewedBy: 'admin-001', reviewedAt: NOW },
  { ...base, id: 'bk-004', instrumentId: 'ins-uv-vis', requesterName: 'Sadia Rahman', requesterEmail: 'sadia@cuet.ac.bd', affiliation: 'Research Assistant', purposeTitle: 'Nanoparticle band-gap estimation', purposeDescription: 'Tauc plot analysis of synthesised ZnO samples.', startAt: at(-2, 13), endAt: at(-2, 15), status: 'approved', reviewedBy: 'admin-001', reviewedAt: NOW },
  { ...base, id: 'bk-005', instrumentId: 'ins-ftir', requesterName: 'Mahmudul Hasan', requesterEmail: 'mahmud@cuet.ac.bd', affiliation: 'MPhil Fellow, Chemistry', purposeTitle: 'Adsorbent surface characterisation', purposeDescription: 'ATR-FTIR of biochar before and after adsorption.', startAt: at(0, 9), endAt: at(0, 12), status: 'approved', reviewedBy: 'admin-001', reviewedAt: NOW },
  { ...base, id: 'bk-006', instrumentId: 'ins-microscope', requesterName: 'Farhana Akter', requesterEmail: 'farhana@cuet.ac.bd', affiliation: 'MSc Student, Chemistry', purposeTitle: 'Biofilm morphology imaging', purposeDescription: 'Bright-field imaging of biofilm growth on membranes.', startAt: at(0, 13), endAt: at(0, 17), status: 'approved', reviewedBy: 'admin-001', reviewedAt: NOW },
  { ...base, id: 'bk-007', instrumentId: 'ins-microscope', requesterName: 'Imran Khan', requesterEmail: 'imran@cuet.ac.bd', affiliation: 'PhD Fellow, Chemistry', purposeTitle: 'Microplastic counting', purposeDescription: 'Counting and sizing microplastic particles from river water.', startAt: at(3, 10), endAt: at(3, 13), status: 'approved', reviewedBy: 'admin-001', reviewedAt: NOW },
  { ...base, id: 'bk-008', instrumentId: 'ins-pcr', requesterName: 'Maliha Chowdhury', requesterEmail: 'maliha@cuet.ac.bd', affiliation: 'Post Doctoral Researcher', purposeTitle: 'ARG detection in wastewater', purposeDescription: 'qPCR of tetracycline resistance genes.', startAt: at(2, 9), endAt: at(2, 13), status: 'approved', reviewedBy: 'admin-001', reviewedAt: NOW },
  // Pending (visible only to admins until reviewed)
  { ...base, id: 'bk-009', instrumentId: 'ins-uv-vis', requesterName: 'Arif Mahmud', requesterEmail: 'arif@cuet.ac.bd', affiliation: 'MSc Student, Chemistry', supervisorName: 'Dr. Yunus Ahmed', purposeTitle: 'Photocatalytic dye removal', purposeDescription: 'Time-resolved UV-Vis scans for an MSc thesis experiment.', sampleDetails: '10 aqueous samples in quartz cuvettes', startAt: at(3, 14), endAt: at(3, 16), status: 'pending' },
  { ...base, id: 'bk-010', instrumentId: 'ins-centrifuge', requesterName: 'Nabila Islam', requesterEmail: 'nabila@cuet.ac.bd', affiliation: 'BSc Student, Chemistry', purposeTitle: 'Nanoparticle washing', purposeDescription: 'Centrifugal washing of silver nanoparticles (3 cycles).', sampleDetails: '8 x 15 mL tubes', startAt: at(1, 11), endAt: at(1, 12), status: 'pending' },
  { ...base, id: 'bk-011', instrumentId: 'ins-pcr', requesterName: 'Jubayer Ahmed', requesterEmail: 'jubayer@cuet.ac.bd', affiliation: 'External collaborator, CU', purposeTitle: 'Gene expression pilot study', purposeDescription: 'Pilot qPCR run for gene expression under heavy-metal stress.', startAt: at(5, 10), endAt: at(5, 14), status: 'pending' },
  // Rejected
  { ...base, id: 'bk-012', instrumentId: 'ins-ftir', requesterName: 'Sohel Rana', requesterEmail: 'sohel@cuet.ac.bd', affiliation: 'BSc Student, Chemistry', purposeTitle: 'Wet sample analysis', purposeDescription: 'FTIR of aqueous slurry.', startAt: at(-1, 10), endAt: at(-1, 11), status: 'rejected', adminNote: 'Wet slurry samples can damage the ATR crystal. Please dry the sample and resubmit.', reviewedBy: 'admin-001', reviewedAt: NOW },
];

// ------------------------------------------------------ unavailable periods
export const dummyInstrumentUnavailablePeriods: InstrumentUnavailablePeriod[] = [
  { id: 'un-001', instrumentId: 'ins-hplc', startAt: at(-3, 9), endAt: at(10, 18), reason: 'Pump seal replacement and detector calibration', type: 'maintenance' },
  { id: 'un-002', instrumentId: 'ins-uv-vis', startAt: at(5, 9), endAt: at(5, 12), reason: 'Lamp alignment check', type: 'calibration' },
  { id: 'un-003', instrumentId: 'ins-centrifuge', startAt: at(3, 9), endAt: at(3, 18), reason: 'Department closed (seminar day)', type: 'closed' },
];

// ------------------------------------------------------------------- reviews
export const dummyInstrumentReviews: InstrumentReview[] = [
  { id: 'rv-001', instrumentId: 'ins-uv-vis', reviewerName: 'Sadia Rahman', reviewerAffiliation: 'Research Assistant', rating: 5, comment: 'Very stable baseline and quick scans. Booking process was smooth and the instrument was always ready.', createdAt: '2026-09-12T10:00:00.000Z' },
  { id: 'rv-002', instrumentId: 'ins-uv-vis', reviewerName: 'Rahim Uddin', reviewerAffiliation: 'MSc Student', rating: 4, comment: 'Excellent for kinetics. Wish there were more quartz cuvettes available during peak weeks.', createdAt: '2026-08-28T10:00:00.000Z' },
  { id: 'rv-003', instrumentId: 'ins-uv-vis', reviewerName: 'Tanvir Hossain', reviewerAffiliation: 'BSc Student', rating: 5, comment: 'Easy to use, and the lab team trained me in ten minutes.', createdAt: '2026-07-19T10:00:00.000Z' },
  { id: 'rv-004', instrumentId: 'ins-ftir', reviewerName: 'Mahmudul Hasan', reviewerAffiliation: 'MPhil Fellow', rating: 5, comment: 'ATR makes sample prep trivial. Spectra were clean and reproducible.', createdAt: '2026-09-02T10:00:00.000Z' },
  { id: 'rv-005', instrumentId: 'ins-ftir', reviewerName: 'Nusrat Jahan', reviewerAffiliation: 'PhD Fellow', rating: 4, comment: 'Great instrument. Please remember to clean the crystal after each run.', createdAt: '2026-08-10T10:00:00.000Z' },
  { id: 'rv-006', instrumentId: 'ins-microscope', reviewerName: 'Farhana Akter', reviewerAffiliation: 'MSc Student', rating: 4, comment: 'Sharp images and a handy camera. Software could be faster.', createdAt: '2026-09-05T10:00:00.000Z' },
  { id: 'rv-007', instrumentId: 'ins-centrifuge', reviewerName: 'Imran Khan', reviewerAffiliation: 'PhD Fellow', rating: 5, comment: 'Quiet, reliable, and holds temperature well.', createdAt: '2026-08-21T10:00:00.000Z' },
  { id: 'rv-008', instrumentId: 'ins-hplc', reviewerName: 'Maliha Chowdhury', reviewerAffiliation: 'Post Doctoral Researcher', rating: 5, comment: 'Reproducible retention times and a very responsive support team.', createdAt: '2026-06-30T10:00:00.000Z' },
  { id: 'rv-009', instrumentId: 'ins-hplc', reviewerName: 'Arif Mahmud', reviewerAffiliation: 'MSc Student', rating: 4, comment: 'Method setup takes some learning, but results are excellent.', createdAt: '2026-06-11T10:00:00.000Z' },
  { id: 'rv-010', instrumentId: 'ins-pcr', reviewerName: 'Maliha Chowdhury', reviewerAffiliation: 'Post Doctoral Researcher', rating: 5, comment: 'Excellent melt-curve resolution for our ARG panel.', createdAt: '2026-09-15T10:00:00.000Z' },
];
