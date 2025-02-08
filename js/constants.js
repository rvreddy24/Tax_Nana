// Default tax constants
const DEFAULT_TAX_CONSTANTS = {
    NEW_REGIME: {
        SLABS: [
            { limit: 0, rate: 0 }
        ],
        BASIC_EXEMPTION: 300000,
        STANDARD_DEDUCTION: 50000
    },
    DEDUCTION_LIMITS: {
        SECTION_80C: 0,
        SECTION_80D: 0,
        SECTION_80CCD: 0,
        SECTION_80CCD_EMPLOYER: 0,
        SECTION_80D_SENIOR: 0,
        SECTION_80TTA: 0
    },
    HRA: {
        METRO_RATE: 0,
        NON_METRO_RATE: 0,
        BASIC_RATE: 0
    },
    SURCHARGE: {
        INCOME_LIMITS: {
            LEVEL_1: 0,
            LEVEL_2: 0,
            LEVEL_3: 0,
            LEVEL_4: 0
        },
        RATES: {
            LEVEL_1: 0,
            LEVEL_2: 0,
            LEVEL_3: 0,
            LEVEL_4: 0
        }
    },
    CESS_RATE: 0
};

// Load saved settings or use defaults
const TAX_CONSTANTS = (() => {
    const savedSettings = localStorage.getItem('taxSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            // Validate the settings structure
            if (settings.NEW_REGIME) {
                return settings;
            }
        } catch (e) {
            console.error('Invalid tax settings found:', e);
        }
    }
    return DEFAULT_TAX_CONSTANTS;
})();

// Function to reset to defaults
function resetTaxConstants() {
    localStorage.removeItem('taxSettings');
    Object.assign(TAX_CONSTANTS, DEFAULT_TAX_CONSTANTS);
}

// Function to update tax constants
function updateTaxConstants(newSettings) {
    Object.assign(TAX_CONSTANTS, newSettings);
    localStorage.setItem('taxSettings', JSON.stringify(TAX_CONSTANTS));
} 