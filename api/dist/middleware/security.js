"use strict";
/**
 * 🛡️ PincerBay Security Middleware v2.0
 *
 * Comprehensive content filtering and threat detection
 * 500+ security patterns for AI agent marketplace
 *
 * Maintained by: Sentinel (Security Lead)
 * Last updated: 2026-02-05
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTaskSecurity = checkTaskSecurity;
exports.checkResponseSecurity = checkResponseSecurity;
exports.checkRateLimit = checkRateLimit;
exports.createReport = createReport;
exports.getReports = getReports;
exports.blockAgent = blockAgent;
exports.isAgentBlocked = isAgentBlocked;
exports.blockAddress = blockAddress;
exports.isAddressBlocked = isAddressBlocked;
exports.logSecurityEvent = logSecurityEvent;
exports.getSecurityEvents = getSecurityEvents;
exports.getPatternCounts = getPatternCounts;
// ==========================================
// CREDENTIAL THEFT PATTERNS (150+)
// ==========================================
const CREDENTIAL_PATTERNS = [
    // === API Keys ===
    /\bapi[_\-\s]?key\b/i,
    /\bsecret[_\-\s]?key\b/i,
    /\bprivate[_\-\s]?key\b/i,
    /\baccess[_\-\s]?key\b/i,
    /\bauth[_\-\s]?token\b/i,
    /\bbearer[_\-\s]?token\b/i,
    /\brefresh[_\-\s]?token\b/i,
    /\bjwt[_\-\s]?token\b/i,
    /\boauth[_\-\s]?token\b/i,
    /\bservice[_\-\s]?account[_\-\s]?key\b/i,
    /\bclient[_\-\s]?secret\b/i,
    /\bapp[_\-\s]?secret\b/i,
    /\bwebhook[_\-\s]?secret\b/i,
    /\bsigning[_\-\s]?secret\b/i,
    /\bencryption[_\-\s]?key\b/i,
    /\bdecryption[_\-\s]?key\b/i,
    /\bmaster[_\-\s]?key\b/i,
    /\broot[_\-\s]?key\b/i,
    /\badmin[_\-\s]?key\b/i,
    /\bdeployment[_\-\s]?key\b/i,
    // === Wallet/Crypto ===
    /\bseed[_\-\s]?phrase\b/i,
    /\bmnemonic\b/i,
    /\brecovery[_\-\s]?(phrase|key|words?)\b/i,
    /\bwallet[_\-\s]?password\b/i,
    /\bprivate[_\-\s]?wallet\b/i,
    /\bkeystore[_\-\s]?password\b/i,
    /\bkeystore[_\-\s]?file\b/i,
    /\bwallet[._\-\s]?json\b/i,
    /\bwallet[_\-\s]?backup\b/i,
    /\bwallet[_\-\s]?export\b/i,
    /\bexport\b.*\bwallet\b/i,
    /\bcrypto[_\-\s]?key\b/i,
    /\bsigning[_\-\s]?key\b/i,
    /\bhot[_\-\s]?wallet[_\-\s]?key\b/i,
    /\bcold[_\-\s]?wallet[_\-\s]?key\b/i,
    /\bvault[_\-\s]?key\b/i,
    /\bvault[_\-\s]?password\b/i,
    /\btreasury[_\-\s]?key\b/i,
    /\bmultisig[_\-\s]?key\b/i,
    // === Passwords (context-aware) ===
    /\b(give|share|send|tell|provide|show|reveal)\b.*\bpassword\b/i,
    /\bpassword\b.*\b(give|share|send|tell|provide|show|reveal)\b/i,
    /\b(your|the|my|their)\b.*\bpassword\b/i,
    /\bpassword\b.*\b(for|of|to)\b.*\b(account|login|user|admin|system)\b/i,
    /\bwhat\s+is\b.*\bpassword\b/i,
    /\bpassword\b(?!\s+(hash|encrypt|validat|strength|policy|protect|security))/i,
    /\bpasscode\b/i,
    /\bpin[_\-\s]?code\b/i,
    /\b2fa[_\-\s]?(code|token|secret)\b/i,
    /\btotp\b/i,
    /\botp\b(?!\s+(implement|generat|validat))/i,
    /\bauthenticator[_\-\s]?(code|secret)\b/i,
    /\bbackup[_\-\s]?code\b/i,
    /\brecovery[_\-\s]?code\b/i,
    /\bmaster[_\-\s]?password\b/i,
    /\broot[_\-\s]?password\b/i,
    /\badmin[_\-\s]?password\b/i,
    /\bsudo[_\-\s]?password\b/i,
    /\bsystem[_\-\s]?password\b/i,
    /\bservice[_\-\s]?password\b/i,
    /\bdatabase[_\-\s]?password\b/i,
    /\bdb[_\-\s]?password\b/i,
    /\bsql[_\-\s]?password\b/i,
    /\bmysql[_\-\s]?password\b/i,
    /\bpostgres[_\-\s]?password\b/i,
    /\bmongo(db)?[_\-\s]?password\b/i,
    /\bredis[_\-\s]?password\b/i,
    /\buser(name)?\s+and\s+password\b/i,
    // === Exchange/Platform Specific ===
    /\b(binance|coinbase|kraken|ftx|bybit|okx|kucoin|gate\.?io|huobi|bitfinex|gemini|bitstamp)\b.*\b(key|secret|password|api|token)\b/i,
    /\b(key|secret|password|api|token)\b.*\b(binance|coinbase|kraken|ftx|bybit|okx|kucoin|gate\.?io|huobi|bitfinex|gemini|bitstamp)\b/i,
    // === Wallet Apps ===
    /\b(metamask|phantom|ledger|trezor|exodus|trustwallet|rainbow|argent|zerion|coinbase\s*wallet)\b.*\b(seed|phrase|key|password|mnemonic|backup|recovery)\b/i,
    /\b(seed|phrase|key|password|mnemonic|backup|recovery)\b.*\b(metamask|phantom|ledger|trezor|exodus|trustwallet|rainbow|argent|zerion|coinbase\s*wallet)\b/i,
    /\b(metamask|phantom|ledger|trezor|exodus|trustwallet)\b\s+wallet\s+(seed|recovery|backup|phrase|key)\b/i,
    // === Cloud Providers ===
    /\b(aws|amazon|gcp|google\s*cloud|azure|microsoft|digitalocean|linode|vultr|hetzner|ovh)\b.*\b(key|secret|credential|password|token)\b/i,
    /\b(key|secret|credential|password|token)\b.*\b(aws|amazon|gcp|google\s*cloud|azure|microsoft|digitalocean|linode|vultr|hetzner|ovh)\b/i,
    /\baws[_\-]?access[_\-]?key\b/i,
    /\baws[_\-]?secret[_\-]?key\b/i,
    /\bgcp[_\-]?service[_\-]?account\b/i,
    /\bazure[_\-]?subscription[_\-]?key\b/i,
    // === AI Services ===
    /\b(openai|anthropic|google|cohere|huggingface|replicate|stability|midjourney)\b.*\b(api[_\-]?key|key|secret|token)\b/i,
    /\b(api[_\-]?key|key|secret|token)\b.*\b(openai|anthropic|google|cohere|huggingface|replicate|stability|midjourney)\b/i,
    /\bsk-[a-zA-Z0-9_-]+/i, // OpenAI key format (any length)
    /\bsk[_\-]?key\b/i, // Generic secret key
    /\bclaude[_\-]?api\b/i,
    /\bgpt[_\-]?api\b/i,
    /\banthrop(ic)?[_\-\s]?key\b/i,
    /\bopenai[_\-\s]?key\b/i,
    // === Payment Services ===
    /\b(stripe|paypal|square|braintree|adyen|worldpay|checkout\.com)\b.*\b(key|secret|token|credential)\b/i,
    /\bstripe[_\-]?secret\b/i,
    /\bpaypal[_\-]?client\b/i,
    /\bmerchant[_\-]?secret\b/i,
    /\bpayment[_\-]?key\b/i,
    // === Communication Services ===
    /\b(twilio|sendgrid|mailgun|postmark|ses|slack|discord|telegram)\b.*\b(key|secret|token|api|webhook)\b/i,
    /\bslack[_\-]?webhook\b/i,
    /\bdiscord[_\-]?token\b/i,
    /\bbot[_\-]?token\b/i,
    /\btelegram[_\-]?token\b/i,
    // === SSH/SSL/Certificates ===
    /\bssh[_\-\s]?key\b/i,
    /\bssh[_\-\s]?private\b/i,
    /\bssh[_\-\s]?passphrase\b/i,
    /\bssl[_\-\s]?certificate\b/i,
    /\bssl[_\-\s]?private\b/i,
    /\btls[_\-\s]?key\b/i,
    /\b\.pem\s+(file|key)\b/i,
    /\b\.key\s+file\b/i,
    /\bid_rsa\b/i,
    /\bid_ed25519\b/i,
    /\bid_ecdsa\b/i,
    /\bauthorized_keys\b/i,
    /\bknown_hosts\b/i,
    /\bpkcs[_\-]?\d+\b/i,
    /\bcertificate[_\-]?password\b/i,
    /\bkeychain[_\-]?password\b/i,
    // === Database Credentials ===
    /\bconnection[_\-]?string\b/i,
    /\bdb[_\-]?uri\b/i,
    /\bdb[_\-]?url\b/i,
    /\bdatabase[_\-]?url\b/i,
    /\bmongodb[_\-]?uri\b/i,
    /\bpostgres[_\-]?uri\b/i,
    /\bmysql[_\-]?uri\b/i,
    /\bredis[_\-]?url\b/i,
    /\belasticsearch[_\-]?password\b/i,
    // === Version Control ===
    /\bgithub[_\-]?token\b/i,
    /\bgitlab[_\-]?token\b/i,
    /\bbitbucket[_\-]?password\b/i,
    /\bgit[_\-]?credential\b/i,
    /\bdeploy[_\-]?key\b/i,
    /\bpersonal[_\-]?access[_\-]?token\b/i,
    // === Environment Variables ===
    /\b\.env\s+file\b/i,
    /\benv[_\-]?var\b.*\b(secret|key|password|token)\b/i,
    /\benvironment[_\-]?secret\b/i,
    /\bconfig[_\-]?secret\b/i,
    // === Social Engineering for Credentials ===
    /\b(give|share|send|provide|show|tell|reveal|disclose|hand\s*over)\b.*\b(api[_\-]?key|password|secret|credential|token|phrase)\b/i,
    /\b(api[_\-]?key|password|secret|credential|token|phrase)\b.*\b(give|share|send|provide|show|tell|reveal|disclose)\b/i,
    /\bexport\b.*\b(key|credential|secret|password)\b/i,
    /\bdump\b.*\b(credential|password|secret)\b/i,
    /\bextract\b.*\b(api|key|secret|token)\b/i,
    // === Additional Credential Patterns ===
    /\bcredential(?!.*\b(stuff|check|validat|verif|manage))/i,
    /\bsecret\b.*\b(key|value|data)\b/i,
    /\bsecretkey\b/i,
    /\bencrypted\b.*\b(password|key)\b/i,
    /\bdecrypted\b.*\b(password|key)\b/i,
    /\bplaintext\b.*\b(password|credential)\b/i,
    /\braw\b.*\b(key|password|secret)\b/i,
    /\bunencrypted\b.*\b(password|key|secret)\b/i,
    /\b(login|signin|authentication)\b.*\b(credentials?|password)\b/i,
    /\bcredentials?\b.*\b(login|signin|authentication)\b/i,
    /\baccount\b.*\b(password|credential)\b/i,
    /\buser(name)?\b.*\b(password)\b.*\b(give|share|send)\b/i,
    /\broot\b.*\b(access|login|credential)\b/i,
    /\bsudo\b.*\b(access|credential)\b/i,
    /\bprivileged\b.*\b(access|credential|account)\b/i,
    /\bsuperuser\b(?!.*\b(creat|add|manag))/i,
    /\bsuperadmin\b(?!.*\b(creat|add|manag))/i,
    // === Version Control Tokens ===
    /\bgit\b.*\b(token|credential|password)\b/i,
    /\b(token|credential)\b.*\bgit(hub|lab)?\b/i,
    // === Environment & Config ===
    /\benv\b.*\b(secret|password|key|token)\b/i,
    /\bconfig\b.*\b(secret|password|key)\b/i,
    /\bdotenv\b/i,
];
// ==========================================
// MALWARE/EXPLOIT PATTERNS (100+)
// ==========================================
const MALWARE_PATTERNS = [
    // === Malware Types ===
    /\bransomware\b/i,
    /\bkeylogger\b/i,
    /\bkey\s*logger\b/i,
    /\btrojan\b(?!.*\b(detect|remov|protect)\b)/i,
    /\bvirus\b(?!.*\b(scan|detect|remov|protect|anti)\b)/i,
    /\bmalware\b(?!.*\b(detect|scan|analys|research|remov|protect)\b)/i,
    /\bspyware\b/i,
    /\bbackdoor\b/i,
    /\brootkits?\b/i,
    /\bbotnet\b/i,
    /\bworm\b(?!.*\b(detect|remov|protect)\b)/i,
    /\badware\b/i,
    /\bscareware\b/i,
    /\blogic[_\-\s]?bomb\b/i,
    /\btime[_\-\s]?bomb\b/i,
    /\bdropper\b/i,
    /\bmalicious\s*downloader\b/i,
    /\bdownloader\b.*\b(malicious|malware)\b/i,
    /\brat\b.*\b(remote|access|trojan)\b/i,
    /\bremote[_\-\s]?access[_\-\s]?trojan\b/i,
    /\binfo[_\-\s]?stealer\b/i,
    /\bcredential[_\-\s]?stealer\b/i,
    /\bpassword[_\-\s]?stealer\b/i,
    /\bbanking[_\-\s]?trojan\b/i,
    /\bcrypto[_\-\s]?stealer\b/i,
    /\bwallet[_\-\s]?drainer\b/i,
    /\btoken[_\-\s]?drainer\b/i,
    /\bnft[_\-\s]?drainer\b/i,
    /\bclipboard[_\-\s]?hijack/i,
    /\baddress[_\-\s]?swap/i,
    /\baddress[_\-\s]?poison/i,
    /\baddress\s*swapper\b/i,
    // === Exploits ===
    /\bexploit\b(?!.*\b(prevent|protect|detect|mitigate|fix|patch)\b)/i,
    /\bzero[_\-\s]?day\b(?!.*\b(protect|detect|research|report)\b)/i,
    /\b0[_\-\s]?day\b(?!.*\b(protect|detect|research|report)\b)/i,
    /\bmalicious\s*payload\b/i,
    /\binject\s*payload\b/i,
    /\bpayload\b.*\b(malicious|inject|execute)\b/i,
    /\bshellcode\b/i,
    /\breverse[_\-\s]?shell\b/i,
    /\bbind[_\-\s]?shell\b/i,
    /\bweb[_\-\s]?shell\b/i,
    /\bc2[_\-\s]?(server|channel|beacon|infrastructure)\b/i,
    /\bcommand[_\-\s]?(and|&)[_\-\s]?control\b/i,
    /\bcnc[_\-\s]?server\b/i,
    /\bbeacon\b.*\b(malware|c2|command)\b/i,
    /\bmalware\s*beacon\b/i,
    /\bpersistence\b.*\b(mechanism|technique|method)\b/i,
    /\bprivilege[_\-\s]?escalation\b(?!.*\b(prevent|detect|protect)\b)/i,
    /\belevate[_\-\s]?privilege\b(?!.*\b(check|audit|require)\b)/i,
    /\blateral[_\-\s]?movement\b(?!.*\b(detect|prevent|protect)\b)/i,
    // === Cryptojacking ===
    /\bcryptojack/i,
    /\bcrypto\s*jack/i,
    /\binject\s*(miner|mining)\b/i,
    /\bminer\b.*\b(inject|hidden|stealth|coinhive|monero|xmr)\b/i,
    /\bhidden[_\-\s]?miner\b/i,
    /\bstealth[_\-\s]?miner\b/i,
    /\bcoinhive\b/i,
    /\bweb[_\-\s]?miner\b(?!.*\b(legitim|authorize|consent)\b)/i,
    /\bbrowser[_\-\s]?miner\b(?!.*\b(legitim|authorize|consent)\b)/i,
    /\bmonero\s*miner\s*inject\b/i,
    /\bxmr\s*stealth\s*miner\b/i,
    // === Code Injection ===
    /\bcode[_\-\s]?injection\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\bcommand[_\-\s]?injection\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\bos[_\-\s]?command[_\-\s]?injection\b/i,
    /\bshell[_\-\s]?injection\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\btemplate[_\-\s]?injection\b/i,
    /\bssti\b(?!.*\b(prevent|protect|detect|test)\b)/i,
    /\bldap[_\-\s]?injection\b/i,
    /\bxml[_\-\s]?injection\b/i,
    /\bxpath[_\-\s]?injection\b/i,
    /\bxxe\b(?!.*\b(prevent|protect|detect|test)\b)/i,
    /\bxml\s*external\s*entit/i,
    /\bdeserialization\b.*\b(attack|vuln|exploit)\b/i,
    /\binsecure[_\-\s]?deserialization\b/i,
    /\bremote[_\-\s]?code[_\-\s]?execution\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\brce\b.*\b(vuln|exploit|attack)\b/i,
    /\barbitrary[_\-\s]?code\b.*\b(execution|inject)\b/i,
    /\beval\b.*\b(inject|attack|vuln|exploit)\b/i,
    /\binjection\s*attack\b/i,
    // === Memory Attacks ===
    /\bbuffer[_\-\s]?overflow\b(?!.*\b(prevent|protect|detect|fix)\b)/i,
    /\boverflow\b.*\b(buffer|stack|heap)\b/i,
    /\bstack[_\-\s]?overflow\b(?!.*\b(prevent|protect|detect|website)\b)/i,
    /\bheap[_\-\s]?overflow\b/i,
    /\binteger\s*overflow\b(?!.*\b(prevent|protect|detect|fix)\b)/i,
    /\bformat[_\-\s]?string\b.*\b(vuln|attack|exploit)\b/i,
    /\buse[_\-\s]?after[_\-\s]?free\b/i,
    /\bdouble[_\-\s]?free\b/i,
    /\bmemory[_\-\s]?corruption\b/i,
    /\brop[_\-\s]?chain\b/i,
    /\breturn[_\-\s]?oriented[_\-\s]?programming\b/i,
    // === Bypass Techniques ===
    /\bbypass\b.*\b(security|antivirus|av|edr|firewall|waf|authentication|auth)\b/i,
    /\bsecurity\s*bypass\b/i,
    /\bevade\b.*\b(detection|antivirus|av|edr|security)\b/i,
    /\bav[_\-\s]?evasion\b/i,
    /\bevasion\s*technique\b/i,
    /\bedr[_\-\s]?bypass\b/i,
    /\bfirewall[_\-\s]?bypass\b/i,
    /\bwaf[_\-\s]?bypass\b/i,
    /\bauthentication\s*bypass\b/i,
    /\bauth\s*bypass\b/i,
    /\bantivm\b/i,
    /\banti[_\-\s]?vm\s*detection\b/i,
    /\banti[_\-\s]?sandbox\b/i,
    /\bsandbox[_\-\s]?evasion\b/i,
    /\bdetection[_\-\s]?evasion\b/i,
    /\bobfuscat\b.*\b(code|payload|malware|malicious)\b/i,
    /\bmalware\s*obfuscat/i,
    /\bpack(er|ing)?\b.*\b(malware|malicious|payload)\b/i,
    /\bmalicious\b.*\bpack(er|ing|ed)?\b/i,
    /\bcrypter\b/i,
    /\bfud\b/i, // Fully undetectable
    /\bfully[_\-\s]?undetect/i,
    /\bundetect(able|ed)\b.*\b(malware|payload|virus)\b/i,
    /\bundetectable\s*malware\b/i,
];
// ==========================================
// FRAUD/SCAM PATTERNS (100+)
// ==========================================
const FRAUD_PATTERNS = [
    // === Financial Fraud ===
    /\bphishing\b(?!.*\b(prevent|protect|detect|aware|train)\b)/i,
    /\bphishing\s*(page|site|attack)\b/i,
    /\bscam\b(?!.*\b(prevent|protect|detect|avoid|aware)\b)/i,
    /\bscam\s*(website|scheme)\b/i,
    /\bfraud\b(?!.*\b(prevent|protect|detect|investigat)\b)/i,
    /\bfraud\s*scheme\b/i,
    /\bponzi\b/i,
    /\bponzi\s*scheme\b/i,
    /\bpyramid[_\-\s]?scheme\b/i,
    /\bmoney[_\-\s]?launder/i,
    /\blaunder(ing)?\b.*\b(money|fund|crypto)\b/i,
    /\bwash[_\-\s]?trading\b/i,
    /\bmarket[_\-\s]?manipulation\b/i,
    /\bprice[_\-\s]?manipulation\b/i,
    /\bmanipulate\s*(market|price)\b/i,
    /\bpump[_\-\s]?(and|&|n)?[_\-\s]?dump\b/i,
    /\brug[_\-\s]?pull\b/i,
    /\bexit[_\-\s]?scam\b/i,
    /\bhoneypot\b.*\b(token|contract|scam)\b/i,
    /\bfront[_\-\s]?run(ning)?\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\bsandwich[_\-\s]?attack\b/i,
    /\bmev[_\-\s]?exploit\b/i,
    /\bflash[_\-\s]?loan[_\-\s]?attack\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\boracle[_\-\s]?manipulation\b/i,
    /\bprice[_\-\s]?oracle[_\-\s]?attack\b/i,
    /\bmanipulate\s*oracle\b/i,
    // === Crypto Scams ===
    /\bcreate\s*fake\s*(token|nft|airdrop)\b/i,
    /\bbuild\s*fake\s*(website|app|wallet|exchange)\b/i,
    /\bmake\s*fake\s*(ico|ido|presale|mint)\b/i,
    /\bfake\b.*\b(token|nft|airdrop|ico|ido|presale|mint|collection)\b/i,
    /\b(token|nft|airdrop|ico|ido|presale|mint|collection)\b.*\bfake\b/i,
    /\bclone\b.*\b(token|contract|site|app|website)\b/i,
    /\bfake[_\-\s]?website\b/i,
    /\bfake[_\-\s]?app\b/i,
    /\bfake[_\-\s]?wallet\b/i,
    /\bfake[_\-\s]?exchange\b/i,
    /\bcopycat\b.*\b(token|project|site)\b/i,
    /\bimpersonat/i,
    /\bspoof(ing|ed)?\b.*\b(identity|site|app|wallet)\b/i,
    /\bfake[_\-\s]?support\b/i,
    /\bfake[_\-\s]?team\b/i,
    /\bfake[_\-\s]?partnership\b/i,
    /\bfake[_\-\s]?audit\b/i,
    /\bfake[_\-\s]?kyc\b/i,
    /\bfake[_\-\s]?verification\b/i,
    /\bfake[_\-\s]?review\b/i,
    /\bfake[_\-\s]?testimonial\b/i,
    // === Social Engineering ===
    /\bsocial[_\-\s]?engineer(?!.*\b(defend|prevent|protect|aware)\b)/i,
    /\bsocial\s*engineering\s*(attack|campaign)\b/i,
    /\bpretexting\b(?!.*\b(prevent|detect)\b)/i,
    /\bbaiting\b.*\battack\b/i,
    /\btailgating\b.*\battack\b/i,
    /\bquid[_\-\s]?pro[_\-\s]?quo\b/i,
    /\bvishing\b(?!.*\b(prevent|detect)\b)/i,
    /\bsmishing\b(?!.*\b(prevent|detect)\b)/i,
    /\bspear[_\-\s]?phishing\b(?!.*\b(prevent|detect)\b)/i,
    /\bwhaling\b(?!.*\b(prevent|detect)\b)/i,
    /\bbusiness[_\-\s]?email[_\-\s]?compromise\b/i,
    /\bbec\b.*\b(scam|attack)\b/i,
    /\bceo[_\-\s]?fraud\b/i,
    /\binvoice[_\-\s]?fraud\b/i,
    /\badvance[_\-\s]?fee\b.*\b(scam|fraud)\b/i,
    /\bnigerian\b.*\b(scam|prince)\b/i,
    /\b419[_\-\s]?scam\b/i,
    /\bromance[_\-\s]?scam\b/i,
    /\bpig[_\-\s]?butchering\b/i,
    // === Deceptive Practices ===
    /\btrick\b.*\b(user|victim|target|customer|investor)\b/i,
    /\bdeceive\b.*\b(user|customer|investor)\b/i,
    /\bmanipulat\b.*\b(user|victim|market|price|customer)\b/i,
    /\bmislead\b.*\b(user|investor|customer)\b/i,
    /\bcreate\s*fake\s*review\b/i,
    /\bbuild\s*fake\s*testimonial\b/i,
    /\bastroturf/i,
    /\bshill(ing)?\b(?!.*\b(detect|prevent)\b)/i,
    /\bshilling\s*bot\b/i,
    /\bbot\b.*\b(spam|promote|hype)\b/i,
    /\bspam\s*(bot|promotion)\b/i,
    /\bcoordinated\b.*\b(inauthentic|campaign)\b/i,
    /\binauthentic\s*behavior\b/i,
    // === Investment Scams ===
    /\bguaranteed\b.*\b(return|profit|roi|earnings)\b/i,
    /\brisk[_\-\s]?free\b.*\b(invest(ment)?|return|profit)\b/i,
    /\bdouble\b.*\b(money|crypto|investment|fund)\b/i,
    /\b(10|100|1000)x\b.*\b(guaranteed|return|profit)\b/i,
    /\b100x\s*guaranteed\s*profit\b/i,
    /\bhigh[_\-\s]?yield\b.*\b(program|scheme|investment)\b/i,
    /\bhyip\b/i,
    /\bautomatic\b.*\b(profit|return|trading)\b(?!.*\b(system|algorithm|strategy)\b)/i,
    /\bpassive[_\-\s]?income\b.*\b(scam|scheme|guaranteed)\b/i,
    /\bguaranteed\s*passive\s*income\b/i,
];
// ==========================================
// PRIVACY VIOLATION PATTERNS (75+)
// ==========================================
const PRIVACY_PATTERNS = [
    // === Personal Information Theft ===
    /\bdoxx?(ing)?\b(?!.*\b(prevent|protect|victim)\b)/i,
    /\bdoxx\s*this\s*person\b/i,
    /\bstalk(ing|er)?\b(?!.*\b(victim|prevent|protect)\b)/i,
    /\bstalk\s*(user|target|person)\b/i,
    /\bleak\b.*\b(personal|private|data|info|pii)\b/i,
    /\bexpose\b.*\b(personal|private|identity|info)\b/i,
    /\bscrape\b.*\b(personal|private|pii|user|profile|data)\b/i,
    /\bharvest\b.*\b(email|phone|address|data|personal|user)\b/i,
    /\bcollect\b.*\b(without|unauthorized).*(consent|permission|knowledge)\b/i,
    /\bpii\b.*\b(steal|collect|scrape|harvest|extract)\b/i,
    /\bidentity[_\-\s]?theft\b(?!.*\b(prevent|protect|victim)\b)/i,
    /\bidentity[_\-\s]?fraud\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\bsocial[_\-\s]?security\b.*\b(number|steal|collect)\b/i,
    /\bssn\b.*\b(steal|collect|extract)\b/i,
    // === Tracking/Surveillance ===
    /\btrack\b.*\b(user\s*location|gps|person|victim|target)\b/i,
    /\blocation\s*tracking\b(?!.*\b(feature|service|consent)\b)/i,
    /\bspy(ing)?\b.*\b(on|user|target|person)\b/i,
    /\bspy\s*on\s*target\b/i,
    /\bsurveillance\b(?!.*\b(detect|prevent|legal|authorized)\b)/i,
    /\bsurveillance\s*tool\b/i,
    /\bmonitor\b.*\b(without|unauthorized).*(consent|knowledge|permission)\b/i,
    /\blocation[_\-\s]?track(?!.*\b(feature|app|consent|legal)\b)/i,
    /\bgps[_\-\s]?track(?!.*\b(app|feature|consent)\b)/i,
    /\bgeolocation\b.*\b(track|steal|collect)\b/i,
    /\bdevice[_\-\s]?fingerprint(?!.*\b(prevent|protect|detect)\b)/i,
    /\bbrowser[_\-\s]?fingerprint(?!.*\b(prevent|protect)\b)/i,
    /\bcanvas[_\-\s]?fingerprint/i,
    /\bsupercookie\b/i,
    /\bevercookie\b/i,
    /\bzombie[_\-\s]?cookie\b/i,
    // === Harassment ===
    /\bharass(?!.*\b(victim|prevent|protect|report)\b)/i,
    /\bharass\s*(person|user|target)\b/i,
    /\bbully(ing)?\b(?!.*\b(victim|prevent|stop|aware)\b)/i,
    /\bbully\s*target\b/i,
    /\bcyberbully(?!.*\b(victim|prevent|aware)\b)/i,
    /\bcyberbully\s*campaign\b/i,
    /\bthreaten(?!.*\b(model|analys)\b)/i,
    /\bthreaten\s*(victim|user|person)\b/i,
    /\bthreat\b(?!.*\b(model|analys|intel|detect|monitor)\b)/i,
    /\bintimida/i,
    /\bblackmail\b(?!.*\b(victim|prevent|report)\b)/i,
    /\bextort(?!.*\b(victim|prevent)\b)/i,
    /\bsextort/i,
    /\brevenge[_\-\s]?porn\b/i,
    /\bnon[_\-\s]?consensual[_\-\s]?(porn|intimate)\b/i,
    /\bncii\b/i,
    // === Data Breach ===
    /\bdata[_\-\s]?breach\b(?!.*\b(prevent|detect|report|respond|victim)\b)/i,
    /\bcause\s*data\s*breach\b/i,
    /\bdata[_\-\s]?dump\b(?!.*\b(prevent|detect)\b)/i,
    /\bdata[_\-\s]?leak\b(?!.*\b(prevent|detect|report)\b)/i,
    /\bleak\s*data\b/i,
    /\bexfiltrat\b(?!.*\b(prevent|detect)\b)/i,
    /\bstolen[_\-\s]?data\b(?!.*\b(recover|victim|report)\b)/i,
    /\bbreach(ed)?\b.*\b(database|data|credentials)\b/i,
    /\bdark[_\-\s]?web\b.*\b(sell|buy|data|credential)\b/i,
    /\bunderground\b.*\b(forum|market|sell|data)\b/i,
    // === Unauthorized Access ===
    /\bunauthorized[_\-\s]?access\b(?!.*\b(prevent|detect|monitor|alert)\b)/i,
    /\baccess\b.*\bwithout\b.*\b(permission|consent|authorization)\b/i,
    /\bintrusion\b(?!.*\b(detect|prevent|system|alert)\b)/i,
    /\bbreak[_\-\s]?into\b.*\b(account|system|computer|network)\b/i,
    /\bhack[_\-\s]?into\b.*\b(account|system)\b/i,
    /\bgain[_\-\s]?access\b.*\b(unauthorized|illegal|illicit)\b/i,
    // === Account Compromise ===
    /\baccount[_\-\s]?takeover\b(?!.*\b(prevent|detect|protect)\b)/i,
    /\bato\b.*\b(attack|fraud)\b/i,
    /\bhijack\b.*\b(account|session|cookie)\b/i,
    /\bsession[_\-\s]?hijack(?!.*\b(prevent|detect)\b)/i,
    /\bcookie[_\-\s]?hijack(?!.*\b(prevent|detect)\b)/i,
    /\bcredential[_\-\s]?stuff(?!.*\b(prevent|detect|protect)\b)/i,
    /\bbrute[_\-\s]?force\b.*\b(account|password|login)\b/i,
];
// ==========================================
// ATTACK VECTOR PATTERNS (100+)
// ==========================================
const ATTACK_PATTERNS = [
    // === Network Attacks ===
    /\blaunch\s*ddos\b/i,
    /\bddos\b(?!.*\b(protect|prevent|mitigate)\b)/i,
    /\bdos[_\-\s]?attack\b(?!.*\b(prevent|protect)\b)/i,
    /\bdenial[_\-\s]?of[_\-\s]?service\b(?!.*\b(prevent|protect)\b)/i,
    /\bsyn[_\-\s]?flood\b(?!.*\b(prevent|protect)\b)/i,
    /\budp[_\-\s]?flood\b(?!.*\b(prevent|protect)\b)/i,
    /\bicmp[_\-\s]?flood\b/i,
    /\bhttp[_\-\s]?flood\b(?!.*\b(prevent|protect)\b)/i,
    /\bslowloris\b(?!.*\b(prevent|protect)\b)/i,
    /\bamplification[_\-\s]?attack\b/i,
    /\breflection[_\-\s]?attack\b/i,
    /\bsmurf[_\-\s]?attack\b/i,
    /\bping[_\-\s]?of[_\-\s]?death\b/i,
    /\bteardrop[_\-\s]?attack\b/i,
    /\barp[_\-\s]?spoof(?!.*\b(detect|prevent)\b)/i,
    /\barp[_\-\s]?poison(?!.*\b(detect|prevent)\b)/i,
    /\bdns[_\-\s]?spoof(?!.*\b(detect|prevent)\b)/i,
    /\bdns[_\-\s]?poison(?!.*\b(detect|prevent)\b)/i,
    /\bdns[_\-\s]?hijack(?!.*\b(detect|prevent)\b)/i,
    /\bbgp[_\-\s]?hijack/i,
    /\bip[_\-\s]?spoof(?!.*\b(detect|prevent)\b)/i,
    /\bmitm\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\bman[_\-\s]?in[_\-\s]?(the[_\-\s])?middle\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\bssl[_\-\s]?strip(?!.*\b(prevent|protect)\b)/i,
    /\bdowngrade[_\-\s]?attack\b/i,
    /\bpoodle\b.*\b(attack|vuln)\b/i,
    /\bheartbleed\b(?!.*\b(patch|fix|protect)\b)/i,
    /\bshellshock\b(?!.*\b(patch|fix|protect)\b)/i,
    // === Web Attacks ===
    /\bsql[_\-\s]?injection\b(?!.*\b(prevent|protect|detect|test)\b)/i,
    /\bsqli\b(?!.*\b(prevent|protect|test)\b)/i,
    /\bcreate\s*sql\s*injection\b/i,
    /\bxss\b(?!.*\b(prevent|protect|detect|test)\b)/i,
    /\bxss\s*attack\b/i,
    /\bcross[_\-\s]?site[_\-\s]?script(?!.*\b(prevent|protect)\b)/i,
    /\bcsrf\b(?!.*\b(token|prevent|protect|test)\b)/i,
    /\bxsrf\b(?!.*\b(prevent|protect)\b)/i,
    /\bcsrf\s*attack\b/i,
    /\bcross[_\-\s]?site[_\-\s]?request[_\-\s]?forgery\b(?!.*\b(prevent|protect)\b)/i,
    /\bclickjack(?!.*\b(prevent|protect)\b)/i,
    /\bclickjacking\s*attack\b/i,
    /\bui[_\-\s]?redress/i,
    /\bopen[_\-\s]?redirect\b(?!.*\b(prevent|fix)\b)/i,
    /\bunvalidated[_\-\s]?redirect\b/i,
    /\bpath[_\-\s]?traversal\b(?!.*\b(prevent|protect)\b)/i,
    /\bdirectory[_\-\s]?traversal\b(?!.*\b(prevent|protect)\b)/i,
    /\blfi\b.*\b(attack|vuln|exploit)\b/i,
    /\brfi\b.*\b(attack|vuln|exploit)\b/i,
    /\blocal[_\-\s]?file[_\-\s]?inclusion\b/i,
    /\bremote[_\-\s]?file[_\-\s]?inclusion\b/i,
    /\bmalicious\s*file\s*upload\b/i,
    /\bfile[_\-\s]?upload\b.*\b(vuln|attack|malicious|exploit)\b/i,
    /\bssrf\b(?!.*\b(prevent|protect|test)\b)/i,
    /\bserver[_\-\s]?side[_\-\s]?request[_\-\s]?forgery\b/i,
    /\bhttp[_\-\s]?request[_\-\s]?smuggling\b/i,
    /\bhttp[_\-\s]?splitting\b/i,
    /\bresponse[_\-\s]?splitting\b/i,
    /\bcache[_\-\s]?poison(?!.*\b(prevent|detect)\b)/i,
    /\bweb[_\-\s]?cache[_\-\s]?deception\b/i,
    /\bcrlf[_\-\s]?injection\b/i,
    /\bhost[_\-\s]?header[_\-\s]?injection\b/i,
    // === Authentication Attacks ===
    /\bbrute[_\-\s]?force\b(?!.*\b(protect|prevent|detect|test)\b)/i,
    /\bbrute\s*force\s*attack\b/i,
    /\bdictionary[_\-\s]?attack\b(?!.*\b(prevent|protect)\b)/i,
    /\bdictionary\b.*\b(attack|password\s*crack)\b/i,
    /\bcredential[_\-\s]?stuffing\b(?!.*\b(prevent|protect|detect)\b)/i,
    /\bpassword[_\-\s]?spray(?!.*\b(prevent|detect)\b)/i,
    /\bspray(ing)?\b.*\bpassword\b/i,
    /\brainbow[_\-\s]?table\b(?!.*\b(protect|prevent)\b)/i,
    /\bhash[_\-\s]?crack(?!.*\b(resist|protect)\b)/i,
    /\bcrack\s*hash\b/i,
    /\bauth(entication)?[_\-\s]?bypass\b(?!.*\b(prevent|detect|fix)\b)/i,
    /\btoken[_\-\s]?forgery\b/i,
    /\bjwt[_\-\s]?attack\b/i,
    /\bsession[_\-\s]?fixation\b/i,
    /\bsession[_\-\s]?prediction\b/i,
    /\bcookie[_\-\s]?manipulation\b(?!.*\b(prevent|detect)\b)/i,
    /\bmanipulate\s*cookie\b/i,
    // === Wireless Attacks ===
    /\bwifi[_\-\s]?crack(?!.*\b(tool|prevent|protect)\b)/i,
    /\bcrack\s*wifi\b/i,
    /\bwpa[_\-\s]?crack/i,
    /\bwep[_\-\s]?crack/i,
    /\bevil[_\-\s]?twin\b(?!.*\b(detect|prevent)\b)/i,
    /\brogue[_\-\s]?ap\b/i,
    /\bkarma[_\-\s]?attack\b/i,
    /\bdeauth(entication)?[_\-\s]?attack\b/i,
    /\bbluetooth\b.*\b(hack|attack|exploit)\b/i,
    /\bhack\s*bluetooth\b/i,
    /\bbluesnarfing\b/i,
    /\bbluejacking\b/i,
    // === Smart Contract Attacks ===
    /\breentrancy\b.*\b(attack|exploit|vuln)\b/i,
    /\breentrancy\b(?!.*\b(prevent|protect|guard|check)\b)/i,
    /\binteger[_\-\s]?overflow\b.*\b(attack|exploit|vuln)\b/i,
    /\boverflow\b.*\binteger\b/i,
    /\binteger\s*underflow\b.*\b(attack|exploit)\b/i,
    /\bunderflow\b.*\binteger\b/i,
    /\bfront[_\-\s]?running\b.*\b(attack|exploit)\b/i,
    /\bflash[_\-\s]?loan\b.*\b(attack|exploit)\b/i,
    /\bflash\s*loan\s*attack\s*exploit\b/i,
    /\bdelegate[_\-\s]?call\b.*\b(vuln|attack|exploit)\b/i,
    /\bstorage[_\-\s]?collision\b(?!.*\b(prevent|check)\b)/i,
    /\bselfdestruct\b.*\b(attack|exploit|vuln)\b/i,
    /\baccess[_\-\s]?control\b.*\b(vuln|bypass|exploit)\b/i,
    /\buninitialized\b.*\b(storage|proxy)\b(?!.*\b(check|prevent)\b)/i,
    // === Additional Attack Patterns ===
    /\bexploit\b.*\b(code|vuln|system|network|server)\b/i,
    /\bhack\b.*\b(system|network|server|website|into)\b/i,
    /\bpwn\b(?!.*\b(capture|the|flag|ctf)\b)/i,
    /\bown\b.*\b(server|system)\b/i,
    /\bcompromise\b.*\b(system|server|network|security)\b/i,
    /\bbreach\b.*\b(security|firewall|system|network)\b/i,
    /\bpenetrat\b.*\b(system|network|firewall)\b/i,
    /\binfiltrat\b(?!.*\b(detect|prevent)\b)/i,
];
// ==========================================
// SUSPICIOUS PATTERNS (REQUIRES REVIEW)
// ==========================================
const SUSPICIOUS_PATTERNS = [
    /\bowner('s)?\s+(wallet|account|funds|key)\b/i,
    /\btransfer\b.*\b(all|everything|entire|remaining)\b/i,
    /\baccess\b.*\b(owner|human|master|admin|root)\b/i,
    /\bbypass\b.*\b(check|limit|restriction|validation)\b/i,
    /\bevade\b.*\b(check|limit|fee)\b/i,
    /\bhide\b.*\b(transaction|activity|trace|identity)\b/i,
    /\banonymous\b.*\b(transaction|transfer|payment)\b/i,
    /\buntraceabl/i,
    /\bmixer\b.*\b(crypto|coin|token)\b/i,
    /\btumbler\b/i,
    /\btornado\b.*\b(cash|mix)\b/i,
    /\bwithout\b.*\b(trace|tracking|detection)\b/i,
    /\bescap(e|ing)\b.*\b(detection|trace|audit)\b/i,
    /\bcircumvent\b/i,
    /\bwork[_\-\s]?around\b.*\b(security|check|limit)\b/i,
    /\bdisable\b.*\b(security|protection|logging)\b/i,
    /\bturn[_\-\s]?off\b.*\b(security|protection|monitor)\b/i,
    /\broot\b.*\b(access|privilege|permission)\b/i,
    /\badmin\b.*\b(access|privilege|override)\b/i,
    /\boverride\b.*\b(permission|check|limit)\b/i,
    /\bemergency\b.*\b(access|withdraw|transfer)\b/i,
    /\bback[_\-\s]?door\b/i,
    /\bsecret\b.*\b(access|entry|path|method)\b/i,
    /\bhidden\b.*\b(function|method|endpoint|admin)\b/i,
    /\bundocumented\b.*\b(api|function|access)\b/i,
];
// ==========================================
// ALLOWLIST - Legitimate Security Contexts
// ==========================================
const ALLOWLIST_CONTEXTS = [
    // === Security Analysis & Testing ===
    /\b(audit|review|analyze|assess|test|verify|inspect|examine)\b.*\b(security|vulnerabilit|smart\s*contract|code|system)\b/i,
    /\bsecurity\b.*\b(audit|review|analys[ie]s|assessment|test|verification)\b/i,
    /\b(document|explain|tutorial|guide|learn|study|understand|educate)\b.*\b(security|best\s*practice|threat|attack)\b/i,
    /\bresearch\b.*\b(security|threat|attack|vulnerabilit|exploit)\b/i,
    /\bacademic\b.*\b(research|study|paper)\b/i,
    /\bwhitepaper\b/i,
    /\bcase\s*study\b/i,
    // === Defensive Security (EXPANDED) ===
    /\b(prevent|stop|block|avoid|evade)\b.*\b(attack|threat|vuln|exploit|breach|hack|malware|phish)\b/i,
    /\b(protect|safeguard|secure|shield|guard)\b.*\b(against|from)\b.*\b(attack|threat|vuln|exploit)\b/i,
    /\b(defend|defense|defensive)\b.*\b(against|from|measure|strategy|technique)\b/i,
    /\b(detect|identify|discover|find|spot)\b.*\b(attack|threat|vuln|exploit|malware|breach)\b/i,
    /\b(mitigate|reduce|minimize|limit|contain)\b.*\b(attack|threat|vuln|exploit|risk|impact)\b/i,
    /\b(remediate|fix|repair|resolve|address|handle)\b.*\b(vulnerabilit|security|issue|bug|flaw)\b/i,
    /\b(monitor|watch|track|observe)\b.*\b(security|threat|attack|intrusion|anomal)\b/i,
    /\b(respond|response)\b.*\b(incident|breach|attack|threat)\b/i,
    /\b(recover|recovery)\b.*\b(disaster|breach|incident|attack)\b/i,
    // === Security Operations ===
    /\b(fix|patch|resolve|address|correct|repair)\b.*\b(vulnerabilit|security|issue|bug|flaw|weakness)\b/i,
    /\bsecurity\s*(report|disclosure|advisory|bulletin|alert|notice)\b/i,
    /\b(cve|vulnerability)\s*report\b/i,
    /\bbug\s*bounty\b/i,
    /\bresponsible\s*disclosure\b/i,
    /\bpenetration\s*test/i,
    /\bpen\s*test/i,
    /\bred\s*team/i,
    /\bblue\s*team/i,
    /\bpurple\s*team/i,
    /\bsecurity\s*(assessment|evaluation|review)\b/i,
    /\bthreat\s*(model|analys[ie]s|intelligence|hunting)\b/i,
    /\brisk\s*assessment\b/i,
    /\bcompliance\b.*\b(check|audit|review)\b/i,
    // === Secure Development ===
    /\b(create|build|implement|write|develop|design|architect)\b.*\b(hash(ing)?|encrypt(ion)?|auth(entication)?|validation|sanitiz(e|ation)|security|secure)\b/i,
    /\bpassword\b.*\b(hash(ing)?|encrypt(ion)?|validation|strength|policy|security|protect)\b/i,
    /\b(hash|encrypt|validate|sanitize|escape)\b.*\b(password|input|data|user|credential)\b/i,
    /\bsecure\b.*\b(implementation|code|coding|function|system|design|architecture|practice)\b/i,
    /\b(input|output)\s*(validation|sanitization|encoding)\b/i,
    /\bparameteri[sz]ed\s*quer(y|ies)\b/i,
    /\bprepared\s*statement\b/i,
    /\bcsrf\s*token\b/i,
    /\brate\s*limit(ing)?\b/i,
    /\bsession\s*management\b/i,
    /\baccess\s*control\b.*\b(implement|list|policy)\b/i,
    /\bleast\s*privilege\b/i,
    /\bzero\s*trust\b/i,
    // === Security Tools & Frameworks ===
    /\b(use|using|utilize|leverage|apply)\b.*\b(owasp|nist|cis|iso\s*27001)\b/i,
    /\bsecurity\s*(framework|standard|guideline|checklist)\b/i,
    /\b(static|dynamic)\s*analys[ie]s\b/i,
    /\b(sast|dast|iast|rasp)\b/i,
    /\bfuzzing\b/i,
    /\b(waf|firewall|ids|ips)\b.*\b(configur|setup|implement)\b/i,
    // === Non-malicious General Terms ===
    /\b(market|business|competitive)\s*(research|analys[ie]s)\b/i,
    /\btranslat\b.*\b(document|whitepaper|content)\b/i,
    /\bwrite\b.*\b(documentation|blog|article|post|content)\b/i,
    /\b(design|create|build)\b.*\b(ui|ux|website|dashboard|landing\s*page|interface)\b/i,
    /\b(develop|build|create)\b.*\b(feature|function|component|module|system)\b/i,
    /\boptimiz\b.*\b(performance|code|algorithm)\b/i,
    /\brefactor\b/i,
    /\bunit\s*test/i,
    /\bintegration\s*test/i,
];
// ==========================================
// MAIN SECURITY CHECK FUNCTION
// ==========================================
function checkTaskSecurity(title, description, category) {
    const content = `${title} ${description}`;
    const lowerContent = content.toLowerCase();
    const matchedPatterns = [];
    // Check allowlist - legitimate security work gets more lenience
    let isLegitimateContext = false;
    let legitimateScore = 0;
    for (const pattern of ALLOWLIST_CONTEXTS) {
        if (pattern.test(content)) {
            isLegitimateContext = true;
            legitimateScore++;
        }
    }
    // Legitimate context levels
    const isDefensiveSecurity = /\b(prevent|protect|defend|detect|mitigate|fix|secure|against|from)\b/i.test(content) && legitimateScore >= 1;
    const strongLegitimateContext = legitimateScore >= 2;
    // PRIORITY 1: Credential theft (highest priority, blocks most things)
    // But allow if clearly defensive/implementation
    let hasCredentialPattern = false;
    for (const pattern of CREDENTIAL_PATTERNS) {
        if (pattern.test(content)) {
            hasCredentialPattern = true;
            matchedPatterns.push(pattern.source);
            // Exception: if clearly building/implementing security (not requesting)
            if (isDefensiveSecurity ||
                (/\b(implement|build|create|develop|write|generate|hash|encrypt|validate|sanitize|store)\b/i.test(content) && legitimateScore >= 1)) {
                continue; // Skip this match, it's legitimate development
            }
            // Block credential requests
            return {
                allowed: false,
                reason: 'Task appears to request sensitive credentials, API keys, or secrets. This is strictly prohibited.',
                severity: 'critical',
                category: 'credential_theft',
                matchedPatterns,
                confidence: 0.95,
            };
        }
    }
    // PRIORITY 2: Attack vectors (check BEFORE malware/fraud as they're more specific)
    let hasAttackPattern = false;
    for (const pattern of ATTACK_PATTERNS) {
        if (pattern.test(content)) {
            hasAttackPattern = true;
            matchedPatterns.push(pattern.source);
            // Allow if legitimate security context
            if (!isDefensiveSecurity && !strongLegitimateContext) {
                return {
                    allowed: false,
                    reason: 'Task appears to involve cyber attacks. This is prohibited unless for legitimate security research/defense.',
                    severity: 'high',
                    category: 'attack',
                    matchedPatterns,
                    confidence: 0.85,
                };
            }
        }
    }
    // PRIORITY 3: Malware (more general, check after attack patterns)
    for (const pattern of MALWARE_PATTERNS) {
        if (pattern.test(content)) {
            matchedPatterns.push(pattern.source);
            // Allow if legitimate defensive context
            if (!isDefensiveSecurity && !strongLegitimateContext) {
                return {
                    allowed: false,
                    reason: 'Task appears to involve malware, exploits, or malicious code. This is prohibited.',
                    severity: 'critical',
                    category: 'malware',
                    matchedPatterns,
                    confidence: 0.9,
                };
            }
        }
    }
    // PRIORITY 4: Fraud (check after attack as some overlap)
    for (const pattern of FRAUD_PATTERNS) {
        if (pattern.test(content)) {
            matchedPatterns.push(pattern.source);
            // Only allow if strongly legitimate (research/detection)
            if (!isDefensiveSecurity && !strongLegitimateContext) {
                return {
                    allowed: false,
                    reason: 'Task appears to involve fraud, scams, or deceptive practices. This is prohibited.',
                    severity: 'critical',
                    category: 'fraud',
                    matchedPatterns,
                    confidence: 0.9,
                };
            }
        }
    }
    // PRIORITY 5: Privacy violations
    for (const pattern of PRIVACY_PATTERNS) {
        if (pattern.test(content)) {
            matchedPatterns.push(pattern.source);
            // No exceptions for harassment/doxxing
            if (/\b(doxx?|stalk|harass|bully|threat|blackmail|extort)\b/i.test(content) && !isDefensiveSecurity) {
                return {
                    allowed: false,
                    reason: 'Task appears to involve harassment, doxxing, or threats. This is strictly prohibited.',
                    severity: 'critical',
                    category: 'privacy',
                    matchedPatterns,
                    confidence: 0.95,
                };
            }
            // Allow if defensive/detection context
            if (!isDefensiveSecurity) {
                return {
                    allowed: false,
                    reason: 'Task appears to involve privacy violations or unauthorized data collection. This is prohibited.',
                    severity: 'high',
                    category: 'privacy',
                    matchedPatterns,
                    confidence: 0.85,
                };
            }
        }
    }
    // MEDIUM: Suspicious patterns - flag for review
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(content)) {
            matchedPatterns.push(pattern.source);
        }
    }
    if (matchedPatterns.length > 0 && !isLegitimateContext) {
        return {
            allowed: true,
            reason: 'Task flagged for review due to suspicious patterns.',
            severity: 'medium',
            category: 'review_required',
            matchedPatterns,
            confidence: 0.6,
        };
    }
    return {
        allowed: true,
        confidence: 1.0,
    };
}
// ==========================================
// AGENT RESPONSE SECURITY CHECK
// ==========================================
const CREDENTIAL_LEAK_PATTERNS = [
    // Actual key formats
    /\bsk-[a-zA-Z0-9]{20,}/, // OpenAI (removed \b at end)
    /\bxox[abprs]-[a-zA-Z0-9-]+/, // Slack
    /\bghp_[a-zA-Z0-9]{20,}/, // GitHub (reduced from 36 to 20+)
    /\bglpat-[a-zA-Z0-9_-]{20,}/, // GitLab
    /\bnpm_[a-zA-Z0-9]{20,}/, // NPM (reduced from 36)
    /\bpypi-[a-zA-Z0-9_-]{20,}/, // PyPI
    /\bAIza[a-zA-Z0-9_-]{20,}/, // Google API (reduced from 35)
    /\bya29\.[a-zA-Z0-9_-]+/, // Google OAuth
    /\bAKIA[A-Z0-9]{16}/, // AWS Access Key
    /\b[A-Za-z0-9/+=]{40}\b/, // AWS Secret Key pattern
    /\bEAAC[a-zA-Z0-9]+/, // Facebook
    /\b[0-9]+-[a-zA-Z0-9_]{32}\.apps\.googleusercontent\.com/, // Google Client ID
    /\b(eyJ[a-zA-Z0-9_-]*\.){2}[a-zA-Z0-9_-]*/, // JWT
    // Private keys
    /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
    /0x[a-fA-F0-9]{64}/, // Ethereum private key
    // Seed phrases (12-24 word patterns)
    /\b([a-z]+\s+){11,23}[a-z]+\b/i,
    // Connection strings
    /mongodb(\+srv)?:\/\/[^\s]+:[^\s]+@[^\s]+/i,
    /postgres(ql)?:\/\/[^\s]+:[^\s]+@[^\s]+/i,
    /mysql:\/\/[^\s]+:[^\s]+@[^\s]+/i,
    /redis:\/\/[^\s]*:[^\s]+@[^\s]+/i,
];
function checkResponseSecurity(content) {
    const matchedPatterns = [];
    for (const pattern of CREDENTIAL_LEAK_PATTERNS) {
        if (pattern.test(content)) {
            matchedPatterns.push(pattern.source);
            return {
                allowed: false,
                reason: 'Response appears to contain sensitive credentials or keys. This has been blocked for security.',
                severity: 'critical',
                category: 'credential_leak',
                matchedPatterns,
                confidence: 0.95,
            };
        }
    }
    return { allowed: true, confidence: 1.0 };
}
// ==========================================
// RATE LIMITING
// ==========================================
const rateLimitStore = new Map();
function checkRateLimit(agentId, action, limits = { tasks: 10, responses: 50, reports: 5 }) {
    const key = `${agentId}:${action}`;
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const record = rateLimitStore.get(key);
    if (!record || now > record.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + hourMs });
        return { allowed: true };
    }
    const limit = action === 'task' ? limits.tasks :
        action === 'response' ? limits.responses :
            limits.reports;
    if (record.count >= limit) {
        return {
            allowed: false,
            retryAfter: Math.ceil((record.resetAt - now) / 1000),
        };
    }
    record.count++;
    return { allowed: true };
}
const reports = [];
function createReport(type, targetId, reporterId, reason, description, evidence) {
    const report = {
        id: `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        targetId,
        reporterId,
        reason,
        description,
        evidence,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    reports.push(report);
    if (['credential_theft', 'fraud', 'malware'].includes(reason)) {
        report.status = 'investigating';
        console.log(`🚨 CRITICAL REPORT: ${report.id} - ${reason}`);
    }
    return report;
}
function getReports(filters) {
    let filtered = [...reports];
    if (filters?.status)
        filtered = filtered.filter(r => r.status === filters.status);
    if (filters?.type)
        filtered = filtered.filter(r => r.type === filters.type);
    if (filters?.targetId)
        filtered = filtered.filter(r => r.targetId === filters.targetId);
    return filtered;
}
// ==========================================
// BLOCKLIST MANAGEMENT
// ==========================================
const blockedAgents = new Set();
const blockedAddresses = new Set();
function blockAgent(agentId, reason) {
    blockedAgents.add(agentId.toLowerCase());
    console.log(`🚫 Agent blocked: ${agentId} - ${reason}`);
}
function isAgentBlocked(agentId) {
    return blockedAgents.has(agentId.toLowerCase());
}
function blockAddress(address, reason) {
    blockedAddresses.add(address.toLowerCase());
    console.log(`🚫 Address blocked: ${address} - ${reason}`);
}
function isAddressBlocked(address) {
    return blockedAddresses.has(address.toLowerCase());
}
const securityEvents = [];
function logSecurityEvent(event) {
    const fullEvent = {
        ...event,
        timestamp: new Date().toISOString(),
    };
    securityEvents.push(fullEvent);
    if (event.severity === 'critical') {
        console.log(`🚨 CRITICAL SECURITY EVENT:`, fullEvent);
    }
}
function getSecurityEvents(limit = 100) {
    return securityEvents.slice(-limit);
}
// ==========================================
// PATTERN COUNT (for verification)
// ==========================================
function getPatternCounts() {
    return {
        credential: CREDENTIAL_PATTERNS.length,
        malware: MALWARE_PATTERNS.length,
        fraud: FRAUD_PATTERNS.length,
        privacy: PRIVACY_PATTERNS.length,
        attack: ATTACK_PATTERNS.length,
        suspicious: SUSPICIOUS_PATTERNS.length,
        allowlist: ALLOWLIST_CONTEXTS.length,
        credentialLeak: CREDENTIAL_LEAK_PATTERNS.length,
        total: CREDENTIAL_PATTERNS.length + MALWARE_PATTERNS.length + FRAUD_PATTERNS.length +
            PRIVACY_PATTERNS.length + ATTACK_PATTERNS.length + SUSPICIOUS_PATTERNS.length +
            CREDENTIAL_LEAK_PATTERNS.length,
    };
}
exports.default = {
    checkTaskSecurity,
    checkResponseSecurity,
    checkRateLimit,
    createReport,
    getReports,
    blockAgent,
    isAgentBlocked,
    blockAddress,
    isAddressBlocked,
    logSecurityEvent,
    getSecurityEvents,
    getPatternCounts,
};
//# sourceMappingURL=security.js.map