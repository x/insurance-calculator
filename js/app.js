const app = () => ({
    input: {
        deductable: 2000,
        oopMax: 6850,
        copay: 30,
        coinsurance: 20,
        copayOnlyAfterDeductable: false,
        premiumCost: 250,
        premiumFrequency: "month",
        claimCost: 150,
        numClaims: 2,
        claimFrequency: "month"
    },

    out: {
        numClaimsPerYear: 0,
        numClaimsBeforeDeductable: 0,
        numClaimsAfterDeductable: 0,
        costClaimsBeforeDeductable: 0,
        costCopayBeforeDeductable: 0,
        costCopayAfterDeductable: 0,
        costCoinsuranceBeforeDeductable: 0,
        costCoinsuranceAfterDeductable: 0,
        costTotalBeforeDeductable: 0,
        costTotalAfterDeductable: 0,
        costTotalOnInsurance: 0,
        costTotalOutOfPocket: 0,
        costTotal: 0,
    },

    totalPremiumCost: function() {
        if (this.input.premiumFrequency === "week") {
            return 52 * this.input.premiumCost;
        }
        if (this.input.premiumFrequency === "month") {
            return 12 * this.input.premiumCost;
        }
        if (this.input.premiumFrequency === "year") {
            return this.input.premiumCost;
        }
    },
    
    claimsPerYear: function() {
        if (this.input.claimFrequency === "week") {
            return 52 * this.input.numClaims;
        }
        if (this.input.claimFrequency === "month") {
            return 12 * this.input.numClaims;
        }
        if (this.input.claimFrequency === "year") {
            return this.input.numClaims;
        }
    },

    formatMoney: function(num) {
        return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    },

    calculate: function() {
        let numClaimsPerYear = this.claimsPerYear();
        let deductableRemaining = this.input.deductable;
        
        let numClaimsBeforeDeductable = 0;
        let numClaimsAfterDeductable = 0;
        let costClaimsBeforeDeductable = 0;
        let costCopayBeforeDeductable = 0;
        let costCopayAfterDeductable = 0;
        let costCoinsuranceAfterDeductable = 0;
        let costTotalOutOfPocket = 0;
        
        let coinsurance = this.input.claimCost * (this.input.coinsurance / 100);

        let i = 0;
        for (; i < numClaimsPerYear; i++) {
            // TODO: How do I handle the costs of the claim that overlaps a deductable...
            if (deductableRemaining > 0) {
                numClaimsBeforeDeductable += 1;

                // Cost of the claim
                deductableRemaining -= this.input.claimCost;
                costClaimsBeforeDeductable += this.input.claimCost;
                costTotalOutOfPocket += this.input.claimCost;

                // Cost of the copay
                if (!this.input.copayOnlyAfterDeductable) {
                    costCopayBeforeDeductable += this.input.copay;
                    costTotalOutOfPocket += this.input.copay;
                }
            } else {
                numClaimsAfterDeductable += 1;

                // Cost of the copay
                costCopayAfterDeductable += this.input.copay;
                costTotalOutOfPocket += this.input.copay;

                // Cost of the coinsurance
                costCoinsuranceAfterDeductable += coinsurance;
                costTotalOutOfPocket += coinsurance;
            }
            if (costTotalOutOfPocket >= this.input.oopMax) {
                break;
            }
        }

        this.out = {
            numClaimsPerYear: numClaimsPerYear,
            numClaimsBeforeDeductable: numClaimsBeforeDeductable,
            numClaimsAfterDeductable: numClaimsAfterDeductable,
            costClaimsBeforeDeductable: costClaimsBeforeDeductable,
            costCopayBeforeDeductable: costCopayBeforeDeductable,
            costCopayAfterDeductable: costCopayAfterDeductable,
            costCoinsuranceAfterDeductable: costCoinsuranceAfterDeductable,
            costTotalBeforeDeductable: costClaimsBeforeDeductable + costCopayBeforeDeductable,
            costTotalAfterDeductable: costCopayAfterDeductable + costCoinsuranceAfterDeductable,
            costTotalOnInsurance: this.totalPremiumCost(),
            costTotalOutOfPocket: costTotalOutOfPocket,
            costTotal: this.totalPremiumCost() + costTotalOutOfPocket,
        }
    }
});