Prompt for Cursor: Team & Cost Calculator Application

On Home Page, Project Cost Calculator

Your app must include these sections and features:

1. Project Settings
Monthly Hours (number): Total project hours per month.

Project Duration (months) (number): Number of months for the project.

Currency (dropdown): Select the project’s base currency (e.g. USD, EUR, GBP).

2. Add Team Member
Role: Dropdown with predefined roles (e.g. Senior Developer, QA Engineer, Technical Lead) – source from a roles catalog.

Name: Free text input.

Location: Dropdown (country or region of the team member).

Bill Rate ($/hr): Hourly rate billed to client (in project currency).

Cost Rate ($/hr): Internal hourly cost for the team member (selectable currency).

Cost Currency: Dropdown (USD/EUR/GBP, etc) for the team member’s cost.

Allocation (%): Percentage allocation of this member to the project.

Add a button (“Add Team Member”) to save the member to a list.

3. Team Members & Cost Breakdown Table
Show a table of all team members and automatically calculate the following fields:

Role & Name

Location

Bill Rate

Cost Rate (display original and converted value if cost currency differs from project currency)

Margin %

Formula: ((Bill Rate - Cost Rate in Project Currency) / Bill Rate) * 100

Allocation %

Hours/Month

Formula: Project Monthly Hours * Allocation (%) / 100

Monthly Bill

Formula: Hours/Month * Bill Rate

Monthly Cost

Formula: Hours/Month * Cost Rate (in Project Currency)

Total Bill

Formula: Monthly Bill * Project Duration (months)

Total Cost

Formula: Monthly Cost * Project Duration (months)

Actions: Edit & Delete options

Include an “Export to Excel” button for downloading all table data to CSV or Excel.

4. Currency Conversion Logic
If a Team Member’s Cost Currency is different from the Project Settings Currency, fetch or use a fixed exchange rate (e.g. 1 EUR = 1.1 USD for mock/demo).

Show both the original Cost Rate and the rate converted to project currency (e.g. “€50.00/hr ($55.00/hr)”).

Perform all calculations in the Project Currency.

5. Summary Table (at the bottom)
Display summarized fields, calculated as follows:

Total Project Bill: Sum of all “Total Bill” values in the table.

Total Project Cost: Sum of all “Total Cost” values in the table.

Gross Margin %:

Formula: ((Total Project Bill - Total Project Cost) / Total Project Bill) * 100

Blended Rate:

Formula: Total Project Bill / (Project Duration (months) * Project Monthly Hours)

Show these summary values in a visually prominent way, using the currency from Project Settings.

Functional Requirements
When the Project Currency is changed, all underlying data and calculations must update to the new target currency (using fixed or mocked exchange rates, or API if available).

For each team member, display both the original cost rate and its value in the project currency.

Allow multiple team members. The table and summaries must update automatically every time someone is added, edited, or deleted.

All calculations and conversions should be dynamic and immediate upon data change.

Additional Requirements
Use a modern, clean design. Layout and UI sections must clearly follow the provided mockup.

Keep code modular: separate each main section as a component.

Mock exchange rates/data where APIs are unavailable.

TypeScript strongly preferred; plain JS is OK if necessary.

The main team table must be responsive and allow sorting.

Calculation Formulas
(For clarity, here are all formulas you must implement)

Margin % (per member):
((Bill Rate - Cost Rate (in Project Currency)) / Bill Rate) * 100

Hours/Month (per member):
Project Monthly Hours * (Allocation % / 100)

Monthly Bill (per member):
Hours/Month * Bill Rate

Monthly Cost (per member):
Hours/Month * Cost Rate (in Project Currency)

Total Bill (per member):
Monthly Bill * Project Duration (months)

Total Cost (per member):
Monthly Cost * Project Duration (months)

Total Project Bill:
sum of all Team Members' Total Bill

Total Project Cost:
sum of all Team Members' Total Cost

Gross Margin %:
((Total Project Bill - Total Project Cost) / Total Project Bill) * 100

Blended Rate:
Total Project Bill / (Project Duration * Monthly Hours)

Generate a complete and modular application with clearly commented code, following all listed requirements.