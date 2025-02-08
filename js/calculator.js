class TaxCalculator {
    constructor(regime = 'old') {
        this.regime = regime;
        this.currentFY = this.getCurrentFinancialYear();
        this.loadSettings();
        this.validateSettings();
        this.displayCurrentFY();
    }

    getCurrentFinancialYear() {
        const savedFY = localStorage.getItem('currentFinancialYear');
        if (savedFY) {
            return parseInt(savedFY);
        }
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        return currentMonth < 3 ? currentYear - 1 : currentYear;
    }

    displayCurrentFY() {
        const fyElement = document.getElementById('currentFY');
        if (fyElement) {
            fyElement.textContent = `${this.currentFY}-${(this.currentFY + 1).toString().slice(2)}`;
        }
    }

    validateSettings() {
        // Check if settings are configured
        if (!localStorage.getItem(`taxSettings_${this.currentFY}`)) {
            throw new Error('Tax settings not configured. Please configure settings first.');
        }
    }

    loadSettings() {
        // Reload settings if they've changed
        const savedSettings = localStorage.getItem(`taxSettings_${this.currentFY}`);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.constants = settings[this.regime.toUpperCase() + '_REGIME'];
        }
    }

    calculateHRAExemption(basicSalary, hraReceived, rentPaid, isMetroCity) {
        const metroRate = isMetroCity ? TAX_CONSTANTS.HRA.METRO_RATE : TAX_CONSTANTS.HRA.NON_METRO_RATE;
        
        const exemption1 = hraReceived;
        const exemption2 = rentPaid - (basicSalary * TAX_CONSTANTS.HRA.BASIC_RATE);
        const exemption3 = basicSalary * metroRate;

        return Math.min(exemption1, exemption2, exemption3);
    }

    calculateTaxableIncome(income, deductions) {
        let taxableIncome = income;
        
        // Apply deductions only for old regime
        if (this.regime === 'old') {
            taxableIncome -= deductions;
        }
        
        // Apply standard deduction
        taxableIncome -= this.constants.STANDARD_DEDUCTION;
        return Math.max(0, taxableIncome);
    }

    calculateTax(taxableIncome) {
        // Get detailed breakdown for better visibility
        const breakdown = this.calculateDetailedTax(taxableIncome);
        return breakdown.totalTax;
    }

    calculateDetailedTax(income, deductions = 0) {
        const breakdown = {
            grossIncome: income,
            deductions: deductions,
            standardDeduction: this.constants.STANDARD_DEDUCTION,
            taxableIncome: 0,
            slabwiseTax: [],
            basicTax: 0,
            rebate: 0,
            surcharge: 0,
            cess: 0,
            totalTax: 0
        };

        // Calculate taxable income
        breakdown.taxableIncome = Math.max(0, income - deductions - this.constants.STANDARD_DEDUCTION);

        // Calculate slab-wise tax
        let remainingIncome = breakdown.taxableIncome;
        let prevLimit = 0; // Start from 0 instead of basic exemption

        for (const slab of this.constants.SLABS) {
            if (remainingIncome <= 0) break;

            const slabLimit = slab.limit === Infinity ? remainingIncome : slab.limit - prevLimit;
            const slabIncome = Math.min(remainingIncome, slabLimit);
            const slabTax = slabIncome * slab.rate;

            if (slabTax > 0) {
                breakdown.slabwiseTax.push({
                    from: prevLimit,
                    to: slab.limit === Infinity ? 'Above' : slab.limit,
                    rate: slab.rate * 100,
                    income: slabIncome,
                    tax: slabTax
                });
                breakdown.basicTax += slabTax;
            }

            remainingIncome -= slabIncome;
            prevLimit = slab.limit;
        }

        // Apply rebate under section 87A
        if (breakdown.taxableIncome <= this.constants.REBATE_LIMIT) {
            breakdown.rebate = Math.min(breakdown.basicTax, this.constants.REBATE_AMOUNT);
            breakdown.basicTax -= breakdown.rebate;
        }

        // Calculate surcharge if applicable
        if (breakdown.taxableIncome > TAX_CONSTANTS.SURCHARGE.INCOME_LIMITS.LEVEL_1) {
            breakdown.surcharge = this.calculateSurcharge(breakdown.basicTax, breakdown.taxableIncome);
        }

        // Add health and education cess (4%)
        const taxBeforeCess = breakdown.basicTax + breakdown.surcharge;
        breakdown.cess = Math.round(taxBeforeCess * 0.04);

        // Calculate total tax
        breakdown.totalTax = Math.round(taxBeforeCess + breakdown.cess);

        return breakdown;
    }

    calculateSurcharge(tax, totalIncome) {
        let surcharge = 0;
        const limits = TAX_CONSTANTS.SURCHARGE.INCOME_LIMITS;
        const rates = TAX_CONSTANTS.SURCHARGE.RATES;

        // Calculate surcharge based on income slabs
        if (totalIncome > limits.LEVEL_4) {
            surcharge = tax * rates.LEVEL_4;
        } else if (totalIncome > limits.LEVEL_3) {
            surcharge = tax * rates.LEVEL_3;
        } else if (totalIncome > limits.LEVEL_2) {
            surcharge = tax * rates.LEVEL_2;
        } else if (totalIncome > limits.LEVEL_1) {
            surcharge = tax * rates.LEVEL_1;
        }

        // Apply marginal relief
        const nextLimit = this.getNextSurchargeLimit(totalIncome);
        if (nextLimit) {
            const incomeExcess = totalIncome - nextLimit;
            const taxWithSurcharge = tax + surcharge;
            const taxAtLimit = this.calculateTax(nextLimit);
            const marginalIncrease = taxWithSurcharge - taxAtLimit;

            if (marginalIncrease > incomeExcess) {
                surcharge -= (marginalIncrease - incomeExcess);
            }
        }

        return Math.round(surcharge);
    }

    getNextSurchargeLimit(income) {
        const limits = TAX_CONSTANTS.SURCHARGE.INCOME_LIMITS;
        if (income > limits.LEVEL_4) return limits.LEVEL_4;
        if (income > limits.LEVEL_3) return limits.LEVEL_3;
        if (income > limits.LEVEL_2) return limits.LEVEL_2;
        if (income > limits.LEVEL_1) return limits.LEVEL_1;
        return 0;
    }

    calculateSection89Relief(currentYearIncome, arrears) {
        const taxWithArrears = this.calculateTax(currentYearIncome);
        const taxWithoutArrears = this.calculateTax(currentYearIncome - arrears);
        return taxWithArrears - taxWithoutArrears;
    }
}

// Add event listener to reload calculator when settings change
window.addEventListener('storage', function(e) {
    if (e.key === 'taxSettings') {
        // Reload the calculator with new settings
        const calculator = new TaxCalculator(document.querySelector('.regime-btn.active').dataset.regime);
        calculateAndDisplayTax(); // Recalculate with new settings
    }
}); 