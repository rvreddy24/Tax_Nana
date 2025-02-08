function runTaxTests() {
    const testCases = [
        {
            regime: 'old',
            income: 500000,
            expected: 0  // Below rebate limit
        },
        {
            regime: 'old',
            income: 750000,
            expected: 65000  // Basic calculation
        },
        {
            regime: 'new',
            income: 1500000,
            expected: 234000  // Higher slab
        },
        {
            regime: 'old',
            income: 5000000,
            expected: 1364000  // With surcharge
        }
    ];

    testCases.forEach((test, index) => {
        const calculator = new TaxCalculator(test.regime);
        const result = calculator.calculateTax(test.income);
        console.log(`Test ${index + 1}:`, {
            expected: test.expected,
            got: result,
            passed: Math.abs(result - test.expected) <= 1  // Allow ±1 for rounding
        });
    });
} 