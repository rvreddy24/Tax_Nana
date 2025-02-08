function getFormData() {
    // Helper function to safely get input value
    const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? Number(element.value) || 0 : 0;
    };

    // Helper function to safely get checkbox value
    const getChecked = (id) => {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    };

    return {
        // Income components
        basicSalary: getValue('basicSalary'),
        splPay: getValue('splPay'),
        da: getValue('da'),
        hra: getValue('hra'),
        ahra: getValue('ahra'),
        sca: getValue('sca'),
        telIncr: getValue('telIncr'),
        cca: getValue('cca'),
        pha: getValue('pha'),
        gpf: getValue('gpf'),
        tsgli: getValue('tsgli'),
        gis: getValue('gis'),
        pTax: getValue('pTax'),
        swf: getValue('swf'),
        cmrf: getValue('cmrf'),
        greenFund: getValue('greenFund'),
        advTax: getValue('advTax'),

        // Optional fields
        bonus: getValue('bonus'),
        conveyance: getValue('conveyance'),
        otherAllowances: getValue('otherAllowances'),
        rentPaid: getValue('rentPaid'),
        
        // Deductions
        ppf: getValue('ppf'),
        epf: getValue('epf'),
        elss: getValue('elss'),
        homeLoanPrincipal: getValue('homeLoanPrincipal'),
        selfHealth: getValue('selfHealth'),
        parentHealth: getValue('parentHealth'),
        homeLoanInterest: getValue('homeLoanInterest'),
        
        // Checkboxes
        isLetOut: getChecked('isLetOut'),
        parentsSenior: getChecked('parentsSenior')
    };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function calculateAndDisplayTax() {
    try {
        const data = getFormData();
        
        // Log the input data for debugging
        console.log('Input data:', data);
        
        // Calculate monthly totals with proper number conversion
        const monthlyData = {
            basicSalary: parseFloat(data.basicSalary) || 0,
            splPay: parseFloat(data.splPay) || 0,
            da: parseFloat(data.da) || 0,
            hra: parseFloat(data.hra) || 0,
            ahra: parseFloat(data.ahra) || 0,
            sca: parseFloat(data.sca) || 0,
            telIncr: parseFloat(data.telIncr) || 0,
            cca: parseFloat(data.cca) || 0,
            pha: parseFloat(data.pha) || 0,
            principalAllowances: 0,
            gpf: parseFloat(data.gpf) || 0,
            tsgli: parseFloat(data.tsgli) || 0,
            gis: parseFloat(data.gis) || 0,
            pTax: parseFloat(data.pTax) || 0,
            swf: parseFloat(data.swf) || 0,
            cmrf: parseFloat(data.cmrf) || 0,
            greenFund: parseFloat(data.greenFund) || 0,
            advTax: parseFloat(data.advTax) || 0
        };

        // Calculate gross total
        monthlyData.grossTotal = parseFloat(
            monthlyData.basicSalary +
            monthlyData.splPay +
            monthlyData.da +
            monthlyData.hra +
            monthlyData.ahra +
            monthlyData.sca +
            monthlyData.telIncr +
            monthlyData.cca +
            monthlyData.pha
        );

        // Calculate total deductions
        monthlyData.totalDeductions = parseFloat(
            monthlyData.gpf +
            monthlyData.tsgli +
            monthlyData.gis +
            monthlyData.pTax +
            monthlyData.swf +
            monthlyData.cmrf +
            monthlyData.greenFund +
            (monthlyData.advTax / 12)
        );

        // Calculate net amount
        monthlyData.netAmount = parseFloat(monthlyData.grossTotal - monthlyData.totalDeductions);

        // Log the calculated data for debugging
        console.log('Monthly data:', monthlyData);

        // Show results section
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        resultsSection.style.display = 'block';

        // Generate monthly statement
        const monthlyStatement = generateMonthlyStatement(monthlyData);
        if (!monthlyStatement) {
            throw new Error('Failed to generate monthly statement');
        }

        // Update the tax breakdown div
        const taxBreakdownDiv = document.querySelector('.tax-breakdown');
        taxBreakdownDiv.innerHTML = monthlyStatement;

        // Make sure the download button is visible
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
            downloadBtn.style.alignItems = 'center';
            downloadBtn.style.gap = '0.5rem';
        }

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Tax calculation error:', error);
        // Show the actual error message for debugging
        alert(`Error: ${error.message}`);
    }
}

function generateMonthlyStatement(monthlyData) {
    return `
        <div class="tax-breakdown-container">
            <h3>Statement showing the Month wise Income of</h3>
            
            <table class="tax-table">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Basic Pay</th>
                        <th>SPL Pay/ PP</th>
                        <th>D.A</th>
                        <th>HRA</th>
                        <th>AHRA</th>
                        <th>SCA</th>
                        <th>Tel. Incr</th>
                        <th>CCA</th>
                        <th>PHA</th>
                        <th>Principal Allowances</th>
                        <th>Gross Total</th>
                        <th>GPF</th>
                        <th>TSGLI</th>
                        <th>GIS</th>
                        <th>P.Tax</th>
                        <th>SWF/EWF</th>
                        <th>CMRF/MF</th>
                        <th>Green Fund</th>
                        <th>Adv. Tax</th>
                        <th>Total Deductions</th>
                        <th>Net Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateMonthlyRows(monthlyData)}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Grand Totals</td>
                        <td>${formatCurrency(monthlyData.basicSalary * 12)}</td>
                        <td>${formatCurrency(monthlyData.splPay * 12)}</td>
                        <td>${formatCurrency(monthlyData.da * 12)}</td>
                        <td>${formatCurrency(monthlyData.hra * 12)}</td>
                        <td>${formatCurrency(monthlyData.ahra * 12)}</td>
                        <td>${formatCurrency(monthlyData.sca * 12)}</td>
                        <td>${formatCurrency(monthlyData.telIncr * 12)}</td>
                        <td>${formatCurrency(monthlyData.cca * 12)}</td>
                        <td>${formatCurrency(monthlyData.pha * 12)}</td>
                        <td>${formatCurrency(monthlyData.principalAllowances * 12)}</td>
                        <td>${formatCurrency(monthlyData.grossTotal * 12)}</td>
                        <td>${formatCurrency(monthlyData.gpf * 12)}</td>
                        <td>${formatCurrency(monthlyData.tsgli * 12)}</td>
                        <td>${formatCurrency(monthlyData.gis * 12)}</td>
                        <td>${formatCurrency(monthlyData.pTax * 12)}</td>
                        <td>${formatCurrency(monthlyData.swf * 12)}</td>
                        <td>${formatCurrency(monthlyData.cmrf * 12)}</td>
                        <td>${formatCurrency(monthlyData.greenFund * 12)}</td>
                        <td>${formatCurrency(monthlyData.advTax)}</td>
                        <td>${formatCurrency(monthlyData.totalDeductions * 12)}</td>
                        <td>${formatCurrency(monthlyData.netAmount * 12)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary elements
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressSteps = document.querySelectorAll('.progress-step');
    const sections = document.querySelectorAll('.form-section');
    let currentStep = 0;

    // Initialize
    updateUI();

    // Previous button click
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    // Next button click
    nextBtn.addEventListener('click', () => {
        if (currentStep < sections.length - 1) {
            if (validateCurrentSection()) {
                currentStep++;
                updateUI();
                
                // If we're on the last step, show monthly statement
                if (currentStep === sections.length - 1) {
                    calculateAndDisplayTax();
                }
            }
        }
    });

    // Progress step clicks
    progressSteps.forEach((step, index) => {
        step.addEventListener('click', () => {
            if (index <= currentStep + 1 && validateCurrentSection()) {
                currentStep = index;
                updateUI();
            }
        });
    });

    function updateUI() {
        // Hide all sections
        sections.forEach(section => section.classList.add('hidden'));
        
        // Show current section
        sections[currentStep].classList.remove('hidden');
        
        // Update progress steps
        progressSteps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update buttons
        prevBtn.style.display = currentStep === 0 ? 'none' : 'flex';
        
        if (currentStep === sections.length - 1) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'flex';
            nextBtn.innerHTML = currentStep === sections.length - 2 
                ? '<i class="fas fa-table"></i> Show Monthly Statement'
                : 'Next <i class="fas fa-arrow-right"></i>';
        }

        // Scroll section into view
        sections[currentStep].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateCurrentSection() {
        const currentSection = sections[currentStep];
        const requiredInputs = currentSection.querySelectorAll('input[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('invalid');
                showError(input, 'This field is required');
            } else {
                input.classList.remove('invalid');
                removeError(input);
            }
        });

        return isValid;
    }

    function showError(input, message) {
        let errorDiv = input.parentElement.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            input.parentElement.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        input.classList.add('invalid');
    }

    function removeError(input) {
        const errorDiv = input.parentElement.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('invalid');
    }

    // Add this to your existing event listeners
    window.addEventListener('financialYearChanged', function() {
        updateFYDisplay();
        updateArrearsYearDropdown();
        calculateAndDisplayTax();
    });

    function updateFYDisplay() {
        const currentFY = localStorage.getItem('currentFinancialYear');
        if (currentFY) {
            const fyText = `${currentFY}-${(parseInt(currentFY) + 1).toString().slice(2)}`;
            
            // Update all FY displays
            document.querySelectorAll('[data-fy-display]').forEach(element => {
                element.textContent = fyText;
            });
            
            // Update specific elements
            const currentFYElement = document.getElementById('currentFY');
            if (currentFYElement) {
                currentFYElement.textContent = fyText;
            }
            
            const selectedFYElement = document.getElementById('selectedFY');
            if (selectedFYElement) {
                selectedFYElement.textContent = fyText;
            }
        }
    }

    // Call this when the page loads
    updateFYDisplay();

    updateArrearsYearDropdown();
});

function updateSettingsInfo() {
    const lastUpdated = localStorage.getItem('taxSettingsLastUpdated') || 'Default';
    const formattedDate = lastUpdated === 'Default' ? 'Default' : 
        new Date(lastUpdated).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    document.getElementById('lastUpdated').textContent = formattedDate;
}

// Update when storage changes
window.addEventListener('storage', function(e) {
    if (e.key === 'taxSettings' || e.key === 'currentFinancialYear') {
        updateSettingsInfo();
        updateFYDisplay();
    }
});

// Debounce function to prevent too many calculations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add this function to generate financial years
function generateFinancialYears() {
    const currentFY = localStorage.getItem('currentFinancialYear');
    const years = [];
    
    // Generate array of 4 years (current and 3 previous)
    for (let i = 0; i < 4; i++) {
        const year = parseInt(currentFY) - i;
        years.push({
            value: year,
            label: `${year}-${(year + 1).toString().slice(2)}`
        });
    }
    return years;
}

// Add this function to update the arrears year dropdown
function updateArrearsYearDropdown() {
    const arrearsYearSelect = document.getElementById('arrearsYear');
    if (arrearsYearSelect) {
        const years = generateFinancialYears();
        
        arrearsYearSelect.innerHTML = `
            <option value="">Select Year</option>
            ${years.map(year => `
                <option value="${year.value}">${year.label}</option>
            `).join('')}
        `;
    }
}

function generateMonthlyRows(breakdown) {
    const currentFY = localStorage.getItem('currentFinancialYear');
    if (!currentFY) {
        console.error('Financial year not set');
        return '';
    }

    const startYear = parseInt(currentFY);
    const endYear = startYear + 1;
    
    const months = [
        `Apr-${startYear}`, `May-${startYear}`, `Jun-${startYear}`, 
        `Jul-${startYear}`, `Aug-${startYear}`, `Sep-${startYear}`, 
        `Oct-${startYear}`, `Nov-${startYear}`, `Dec-${startYear}`, 
        `Jan-${endYear}`, `Feb-${endYear}`, `Mar-${endYear}`
    ];

    try {
        return months.map(month => `
            <tr>
                <td>${month}</td>
                <td>${formatCurrency(breakdown.basicSalary)}</td>
                <td>${formatCurrency(breakdown.splPay)}</td>
                <td>${formatCurrency(breakdown.da)}</td>
                <td>${formatCurrency(breakdown.hra)}</td>
                <td>${formatCurrency(breakdown.ahra)}</td>
                <td>${formatCurrency(breakdown.sca)}</td>
                <td>${formatCurrency(breakdown.telIncr)}</td>
                <td>${formatCurrency(breakdown.cca)}</td>
                <td>${formatCurrency(breakdown.pha)}</td>
                <td>${formatCurrency(breakdown.principalAllowances)}</td>
                <td>${formatCurrency(breakdown.grossTotal)}</td>
                <td>${formatCurrency(breakdown.gpf)}</td>
                <td>${formatCurrency(breakdown.tsgli)}</td>
                <td>${formatCurrency(breakdown.gis)}</td>
                <td>${formatCurrency(breakdown.pTax)}</td>
                <td>${formatCurrency(breakdown.swf)}</td>
                <td>${formatCurrency(breakdown.cmrf)}</td>
                <td>${formatCurrency(breakdown.greenFund)}</td>
                <td>${formatCurrency(breakdown.advTax / 12)}</td>
                <td>${formatCurrency(breakdown.totalDeductions)}</td>
                <td>${formatCurrency(breakdown.netAmount)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error generating rows:', error);
        return '';
    }
}

function validateArrearYear(input) {
    const currentFY = parseInt(localStorage.getItem('currentFinancialYear'));
    const enteredYear = parseInt(input.value);
    
    // Validate year is within acceptable range (not future and not too old)
    if (enteredYear > currentFY) {
        showError(input, 'Year cannot be in the future');
        input.value = '';
        return false;
    }
    
    if (enteredYear < currentFY - 3) {
        showError(input, 'Year cannot be more than 3 years old');
        input.value = '';
        return false;
    }
    
    // If valid, show the full FY format
    removeError(input);
    const helperText = input.parentElement.nextElementSibling;
    helperText.textContent = `FY ${enteredYear}-${(enteredYear + 1).toString().slice(2)}`;
    return true;
}

function downloadPDF() {
    try {
        // Check if html2pdf is loaded
        if (typeof html2pdf === 'undefined') {
            throw new Error('PDF generation library not loaded');
        }

        // Check if we have data to download
        const taxBreakdown = document.querySelector('.tax-breakdown');
        if (!taxBreakdown || !taxBreakdown.innerHTML.trim()) {
            alert('Please calculate tax first before downloading PDF');
            return;
        }

        // Get personal details
        const personalDetails = JSON.parse(localStorage.getItem('personalDetails') || '{}');
        if (!personalDetails.name || !personalDetails.id) {
            alert('Please configure personal details in settings before downloading PDF');
            return;
        }

        const currentFY = localStorage.getItem('currentFinancialYear');
        
        // Create a temporary div for PDF content
        const pdfContent = document.createElement('div');
        pdfContent.className = 'pdf-content';
        
        // Add header with title and details
        pdfContent.innerHTML = `
            <div class="pdf-header">
                <h2>ANNEXURE - 1 (Financial Year ${currentFY}-${(parseInt(currentFY) + 1).toString().slice(2)})</h2>
                <div class="statement-title">
                    Statement showing the Month wise Income of
                </div>
                <div class="employee-details">
                    <p>${personalDetails.name || 'N/A'}</p>
                    <p>Employee Id.No: ${personalDetails.id || 'N/A'}</p>
                </div>
            </div>
            <div class="tax-breakdown">
                ${document.querySelector('.tax-breakdown').innerHTML}
            </div>
            <div class="signature-section">
                <div class="signature-box">
                    <p>Signature of the Drawing Officer</p>
                </div>
                <div class="signature-box">
                    <p>Signature of the Employee</p>
                </div>
            </div>
        `;

        // PDF options
        const opt = {
            margin: 0.5,
            filename: `monthly_statement_${currentFY}-${(parseInt(currentFY) + 1).toString().slice(2)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false
            },
            jsPDF: { 
                unit: 'in', 
                format: 'a4', 
                orientation: 'landscape'
            }
        };

        // Add PDF-specific styles
        const style = document.createElement('style');
        style.textContent = `
            .pdf-content {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #000;
            }
            .pdf-header {
                text-align: center;
                margin-bottom: 20px;
            }
            .statement-title {
                margin: 10px 0;
            }
            .employee-details {
                text-align: left;
                margin: 10px 0;
            }
            .tax-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10px;
            }
            .tax-table th, .tax-table td {
                border: 1px solid #000;
                padding: 4px;
                text-align: right;
            }
            .tax-table th {
                background-color: #f0f0f0;
            }
            .signature-section {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
            }
            .signature-box {
                text-align: center;
            }
        `;
        pdfContent.appendChild(style);

        // Show loading state
        const downloadBtn = document.querySelector('#downloadBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        downloadBtn.disabled = true;

        // Generate PDF with better error handling
        html2pdf()
            .set(opt)
            .from(pdfContent)
            .save()
            .then(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            })
            .catch(error => {
                console.error('PDF generation failed:', error);
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
                alert('Failed to generate PDF. Please try again.');
            });

    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF. Please try again or contact support.');
    }
} 