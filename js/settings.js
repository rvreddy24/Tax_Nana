// Add this function to generate financial years
function generateFinancialYears() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11

    // If we're in Jan-Mar, we're in the previous financial year
    const currentFY = currentMonth < 3 ? currentYear - 1 : currentYear;
    
    // Generate array of 8 years (3 above, current, 4 below)
    const years = [];
    for (let i = 3; i >= -4; i--) {
        const year = currentFY - i;
        years.push({
            value: year,
            label: `${year}-${(year + 1).toString().slice(2)}`,
            isCurrent: i === 0
        });
    }
    return years;
}

class TaxSettings {
    constructor() {
        this.initializeFinancialYear();
        this.loadSettings();
        this.loadPersonalDetails();
        this.renderSlabs();
        this.setupEventListeners();
    }

    initializeFinancialYear() {
        const fySelect = document.getElementById('financialYear');
        const years = generateFinancialYears();
        
        // Get currently saved FY or use current FY
        const savedFY = localStorage.getItem('currentFinancialYear');
        const currentFY = savedFY || years.find(y => y.isCurrent).value;
        
        // Populate dropdown
        fySelect.innerHTML = years.map(year => `
            <option value="${year.value}" ${year.value == currentFY ? 'selected' : ''}>
                FY ${year.label}
            </option>
        `).join('');

        // Set initial value if not already set
        if (!savedFY) {
            localStorage.setItem('currentFinancialYear', currentFY);
        }

        // Add event listener for year change
        fySelect.addEventListener('change', () => {
            const selectedYear = fySelect.value;
            localStorage.setItem('currentFinancialYear', selectedYear);
            this.loadSettingsForYear(selectedYear);
            
            // Dispatch event to notify other pages
            window.dispatchEvent(new Event('financialYearChanged'));
        });
    }

    loadSettingsForYear(year) {
        const savedSettings = localStorage.getItem(`taxSettings_${year}`);
        if (savedSettings) {
            this.currentSettings = JSON.parse(savedSettings);
        } else {
            this.currentSettings = structuredClone(DEFAULT_TAX_CONSTANTS);
        }
        this.renderSlabs();
    }

    loadSettings() {
        const currentFY = localStorage.getItem('currentFinancialYear');
        // Try to load year-specific settings first
        const savedSettings = localStorage.getItem(`taxSettings_${currentFY}`);
        
        if (savedSettings) {
            this.currentSettings = JSON.parse(savedSettings);
        } else {
            // If no year-specific settings exist, check for default settings
            const defaultSettings = localStorage.getItem('taxSettings');
            if (defaultSettings) {
                this.currentSettings = JSON.parse(defaultSettings);
                // Save as year-specific settings
                localStorage.setItem(`taxSettings_${currentFY}`, JSON.stringify(this.currentSettings));
            } else {
                // If no settings exist at all, use constants
                this.currentSettings = structuredClone(DEFAULT_TAX_CONSTANTS);
                // Save both as default and year-specific
                localStorage.setItem('taxSettings', JSON.stringify(this.currentSettings));
                localStorage.setItem(`taxSettings_${currentFY}`, JSON.stringify(this.currentSettings));
            }
        }
    }

    updateConstants(settings) {
        Object.assign(TAX_CONSTANTS, settings);
    }

    renderSlabs() {
        this.renderRegimeSlabs('NEW');
    }

    renderRegimeSlabs(regime) {
        const container = document.getElementById(`${regime.toLowerCase()}RegimeSlabs`);
        const slabs = this.currentSettings[`${regime}_REGIME`].SLABS;
        
        container.innerHTML = slabs.map((slab, index) => `
            <div class="slab-item" data-index="${index}">
                <div class="input-group">
                    <label>Income Limit</label>
                    <div class="input-with-icon">
                        <i class="fas fa-rupee-sign"></i>
                        <input type="number" class="slab-limit" 
                               value="${slab.limit === Infinity ? '' : slab.limit}"
                               ${slab.limit === Infinity ? 'disabled' : ''}>
                    </div>
                </div>
                <div class="input-group">
                    <label>Tax Rate (%)</label>
                    <div class="input-with-icon">
                        <i class="fas fa-percent"></i>
                        <input type="number" class="slab-rate" 
                               value="${slab.rate * 100}" step="0.1">
                    </div>
                </div>
                ${index === slabs.length - 1 ? '' : `
                    <div class="delete-slab" onclick="taxSettings.deleteSlab('${regime}', ${index})">
                        <i class="fas fa-trash"></i>
                    </div>
                `}
            </div>
        `).join('');
    }

    addSlab(regime) {
        const slabs = this.currentSettings[`${regime}_REGIME`].SLABS;
        const lastSlab = slabs[slabs.length - 1];
        
        // Add new slab before the last one (which is always Infinity)
        slabs.splice(slabs.length - 1, 0, {
            limit: lastSlab.limit === Infinity ? 1500000 : lastSlab.limit + 500000,
            rate: lastSlab.rate
        });
        
        this.renderRegimeSlabs(regime);
    }

    deleteSlab(regime, index) {
        const slabs = this.currentSettings[`${regime}_REGIME`].SLABS;
        slabs.splice(index, 1);
        this.renderRegimeSlabs(regime);
    }

    loadPersonalDetails() {
        const details = localStorage.getItem('personalDetails');
        if (details) {
            const data = JSON.parse(details);
            document.getElementById('taxpayerName').value = data.name || '';
            document.getElementById('panNumber').value = data.pan || '';
            document.getElementById('aadharNumber').value = data.aadhar || '';
            document.getElementById('idNumber').value = data.id || '';
        }
    }

    savePersonalDetails() {
        const details = {
            name: document.getElementById('taxpayerName').value,
            pan: document.getElementById('panNumber').value,
            aadhar: document.getElementById('aadharNumber').value,
            id: document.getElementById('idNumber').value
        };
        localStorage.setItem('personalDetails', JSON.stringify(details));
    }

    validatePersonalDetails() {
        const name = document.getElementById('taxpayerName');
        const pan = document.getElementById('panNumber');
        const aadhar = document.getElementById('aadharNumber');
        const id = document.getElementById('idNumber');

        if (!name.value.trim()) {
            this.showError(name, 'Name is required');
            return false;
        }

        if (!pan.value.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)) {
            this.showError(pan, 'Enter valid PAN number');
            return false;
        }

        if (!aadhar.value.match(/^\d{12}$/)) {
            this.showError(aadhar, 'Enter valid 12-digit Aadhar number');
            return false;
        }

        if (!id.value.trim()) {
            this.showError(id, 'ID number is required');
            return false;
        }

        if (!id.value.match(/^[A-Z0-9]+$/)) {
            this.showError(id, 'ID must contain only letters and numbers');
            return false;
        }

        return true;
    }

    saveSettings() {
        if (!this.validatePersonalDetails()) {
            return;
        }

        // Only save personal details if they've changed
        const currentDetails = localStorage.getItem('personalDetails');
        const newDetails = {
            name: document.getElementById('taxpayerName').value,
            pan: document.getElementById('panNumber').value,
            aadhar: document.getElementById('aadharNumber').value,
            id: document.getElementById('idNumber').value
        };

        if (!currentDetails || JSON.stringify(newDetails) !== currentDetails) {
            this.savePersonalDetails();
        }

        // Save tax settings
        const year = document.getElementById('financialYear').value;
        
        // Update the slabs in current settings
        ['NEW'].forEach(regime => {
            const slabs = [];
            const slabElements = document.querySelectorAll(`#${regime.toLowerCase()}RegimeSlabs .slab-item`);
            
            slabElements.forEach(slab => {
                const limit = slab.querySelector('.slab-limit').value;
                const rate = slab.querySelector('.slab-rate').value;
                slabs.push({
                    limit: limit === '' ? Infinity : Number(limit),
                    rate: Number(rate) / 100
                });
            });
            
            this.currentSettings[`${regime}_REGIME`].SLABS = slabs;
        });

        // Save year-specific settings
        localStorage.setItem(`taxSettings_${year}`, JSON.stringify(this.currentSettings));
        
        // Also save as default settings
        localStorage.setItem('taxSettings', JSON.stringify(this.currentSettings));
        
        localStorage.setItem('taxSettingsLastUpdated', new Date().toISOString());
        this.showToast(`Settings saved successfully for FY ${year}-${(parseInt(year) + 1).toString().slice(2)}!`);
    }

    resetDefaults() {
        if (confirm('Are you sure you want to reset to default settings? This will reset tax slabs and personal details.')) {
            // Clear tax settings
            localStorage.removeItem('taxSettings');
            const years = generateFinancialYears();
            // Clear settings for all years
            years.forEach(year => {
                localStorage.removeItem(`taxSettings_${year.value}`);
            });

            // Clear personal details
            localStorage.removeItem('personalDetails');

            // Clear form fields
            document.getElementById('taxpayerName').value = '';
            document.getElementById('panNumber').value = '';
            document.getElementById('aadharNumber').value = '';
            document.getElementById('idNumber').value = '';

            // Show confirmation message
            this.showToast('All settings have been reset to defaults');

            // Reload page to reinitialize with defaults
            location.reload();
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showError(input, message) {
        input.classList.add('invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
        
        setTimeout(() => {
            input.classList.remove('invalid');
            errorDiv.remove();
        }, 3000);
    }

    setupEventListeners() {
        window.addSlabNew = () => this.addSlab('NEW');
        window.saveSettings = () => this.saveSettings();
        window.resetDefaults = () => this.resetDefaults();

        // PAN number formatting
        document.getElementById('panNumber').addEventListener('input', function(e) {
            let value = e.target.value.toUpperCase();
            value = value.replace(/[^A-Z0-9]/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            e.target.value = value;
        });

        // Aadhar number formatting
        document.getElementById('aadharNumber').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 12) value = value.slice(0, 12);
            e.target.value = value;
        });

        // ID number formatting
        document.getElementById('idNumber').addEventListener('input', function(e) {
            let value = e.target.value.toUpperCase();
            value = value.replace(/[^A-Z0-9]/g, '');
            e.target.value = value;
        });
    }
}

// Initialize settings
const taxSettings = new TaxSettings();

function saveSettings() {
    try {
        // Get personal details
        const name = document.getElementById('name').value.trim();
        const employeeId = document.getElementById('employeeId').value.trim();
        const designation = document.getElementById('designation').value.trim();
        const department = document.getElementById('department').value.trim();

        // Validate required fields
        if (!name || !employeeId) {
            throw new Error('Name and Employee ID are required');
        }

        // Save personal details
        const personalDetails = {
            name,
            id: employeeId,
            designation,
            department,
            lastUpdated: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('personalDetails', JSON.stringify(personalDetails));

        // Show success message
        alert('Settings saved successfully!');

        // Optionally redirect back to calculator
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error saving settings:', error);
        alert(error.message || 'Error saving settings. Please try again.');
    }
}

// Load existing settings when page loads
document.addEventListener('DOMContentLoaded', function() {
    try {
        const savedDetails = localStorage.getItem('personalDetails');
        if (savedDetails) {
            const details = JSON.parse(savedDetails);
            
            // Populate form fields
            document.getElementById('name').value = details.name || '';
            document.getElementById('employeeId').value = details.id || '';
            document.getElementById('designation').value = details.designation || '';
            document.getElementById('department').value = details.department || '';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}); 