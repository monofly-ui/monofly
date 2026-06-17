# SDS Token Generator (REST or Plugin)

- `run script:tokens:rest`
- Gets all variables and styles from Figma, and converts them to src/theme.css.
- Creates scripts/tokens/tokensCodeSyntaxes.js which is a script you can run in the JS console in Figma to update all the variable's codeSyntaxes with CSS that matches this repo.
- Includes some example plugins for how to get the same data without the Variables REST API.
    - Install plugins in Development
    - Run plugins, and copy plugin outputs into scripts/tokens/styles.json and scripts/tokens/tokens.json
    - Run `npm run script:tokens` (without `:rest`) and it will reference the JSON files directly without making a REST API request to update them