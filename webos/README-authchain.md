# NovaDesk AuthChain Password System

This update adds a blockchain-style local authentication system.

## Behaviour

• First load prompts the user to create a display name and password.
• A recovery phrase is generated and shown once.
• Subsequent loads require the last password that was set.
• Password reset requires the recovery phrase.
• Setup, login and password reset actions are recorded in a local AuthChain ledger.
• The AuthChain Vault app can verify and display the password ledger.

## Important notes

• This is a local educational blockchain-style system.
• It does not use a real blockchain network.
• It does not send passwords anywhere.
• Password hashes and ledger data are stored in browser localStorage.
• If browser site data is cleared, the local identity and recovery ledger will be removed.

## Files to add or replace

• app-authchain.js
• github-index.html or index.html
• novadesk.html
• main.js
• app-realism.js

For GitHub Pages, rename `github-index.html` to `index.html`.
