You are reviewing the cost and revenue calculation logic in this project.

1. Verify that all the following fields are present and named clearly:
   - costRate (number)
   - billRate (number)
   - monthlyHours (number)
   - projectDuration (number in months)

2. Check that the following formulas are implemented correctly:

   - margin = (billRate - costRate) / billRate
   - monthlyCost = monthlyHours * costRate
   - monthlyRevenue = monthlyHours * billRate
   - totalCost = monthlyCost * projectDuration
   - totalRevenue = monthlyRevenue * projectDuration
   - profit = totalRevenue - totalCost

3. If currency conversion is used, ensure that costRate and billRate are recalculated before calculating totals.

4. If any fields or formulas are missing or incorrect, suggest fixes.

Respond in clear steps and code if needed.
