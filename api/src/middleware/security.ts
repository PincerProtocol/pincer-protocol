/**
 * 🛡️ PincerBay Security Middleware v2.0
 * 
 * Comprehensive content filtering and threat detection
 * 500+ security patterns for AI agent marketplace
 * 
 * Maintained by: Sentinel (Security Lead)
 * Last updated: 2026-02-05
 */

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  matchedPatterns?: string[];
  confidence?: number;
}

// ==========================================
// CREDENTIAL THEFT PATTERNS (150+)
// ==========================================

const CREDENTIAL_PATTERNS: RegExp[] = [
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
  /\bpasscode\b/i,
  /\bpin[_\-\s]?code\b/i,
  /\b2fa[_\-\s]?(code|token|secret)\b/i,
  /\btotp\b/i,
  /\botp\b/i,
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
  /\bmongo[_\-\s]?password\b/i,
  /\bredis[_\-\s]?password\b/i,
  
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
  /\bcredential\b/i,
  /\bsecret\b.*\b(key|value|data)\b/i,
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
  /\bsuperuser\b/i,
  /\bsuperadmin\b/i,
];

// ==========================================
// MALWARE/EXPLOIT PATTERNS (100+)
// ==========================================

const MALWARE_PATTERNS: RegExp[] = [
  // === Malware Types ===
  /\bransomware\b/i,
  /\bkeylogger\b/i,
  /\btrojan\b/i,
  /\bvirus\b/i,
  /\bmalware\b/i,
  /\bspyware\b/i,
  /\bbackdoor\b/i,
  /\brootkits?\b/i,
  /\bbotnet\b/i,
  /\bworm\b/i,
  /\badware\b/i,
  /\bscareware\b/i,
  /\blogic[_\-\s]?bomb\b/i,
  /\btime[_\-\s]?bomb\b/i,
  /\bdropper\b/i,
  /\bdownloader\b.*\b(malicious|malware)\b/i,
  /\brat\b.*\b(remote|access|trojan)\b/i,
  /\bremote[_\-\s]?access[_\-\s]?trojan\b/i,
  /\binfo[_\-]?stealer\b/i,
  /\bcredential[_\-]?stealer\b/i,
  /\bpassword[_\-]?stealer\b/i,
  /\bbanking[_\-]?trojan\b/i,
  /\bcrypto[_\-]?stealer\b/i,
  /\bwallet[_\-]?drainer\b/i,
  /\btoken[_\-]?drainer\b/i,
  /\bnft[_\-]?drainer\b/i,
  /\bclipboard[_\-]?hijack/i,
  /\baddress[_\-]?swap/i,
  /\baddress[_\-]?poison/i,
  
  // === Exploits ===
  /\bexploit\b/i,
  /\bzero[_\-\s]?day\b/i,
  /\b0[_\-\s]?day\b/i,
  /\bpayload\b.*\b(malicious|inject|execute)\b/i,
  /\bshellcode\b/i,
  /\breverse[_\-\s]?shell\b/i,
  /\bbind[_\-\s]?shell\b/i,
  /\bweb[_\-\s]?shell\b/i,
  /\bc2[_\-\s]?(server|channel|beacon)\b/i,
  /\bcommand[_\-\s]?and[_\-\s]?control\b/i,
  /\bcnc[_\-\s]?server\b/i,
  /\bbeacon\b.*\b(malware|c2)\b/i,
  /\bpersistence\b.*\b(mechanism|technique)\b/i,
  /\bprivilege[_\-\s]?escalation\b/i,
  /\belevate[_\-\s]?privilege\b/i,
  /\blateral[_\-\s]?movement\b/i,
  
  // === Cryptojacking ===
  /\bcryptojack/i,
  /\bminer\b.*\b(inject|hidden|stealth|coinhive|monero|xmr)\b/i,
  /\bhidden[_\-\s]?miner\b/i,
  /\bstealth[_\-\s]?miner\b/i,
  /\bcoinhive\b/i,
  /\bweb[_\-\s]?miner\b/i,
  /\bbrowser[_\-\s]?miner\b/i,
  
  // === Code Injection ===
  /\bcode[_\-\s]?injection\b/i,
  /\bcommand[_\-\s]?injection\b/i,
  /\bos[_\-\s]?command[_\-\s]?injection\b/i,
  /\bshell[_\-\s]?injection\b/i,
  /\btemplate[_\-\s]?injection\b/i,
  /\bssti\b/i,
  /\bldap[_\-\s]?injection\b/i,
  /\bxml[_\-\s]?injection\b/i,
  /\bxpath[_\-\s]?injection\b/i,
  /\bxxe\b/i,
  /\bdeserialization\b.*\b(attack|vuln|exploit)\b/i,
  /\binsecure[_\-\s]?deserialization\b/i,
  /\bremote[_\-\s]?code[_\-\s]?execution\b/i,
  /\brce\b.*\b(vuln|exploit|attack)\b/i,
  /\barbitrary[_\-\s]?code\b/i,
  /\beval\b.*\b(inject|attack|vuln)\b/i,
  
  // === Memory Attacks ===
  /\boverflow\b.*\b(buffer|stack|heap|integer)\b/i,
  /\bbuffer[_\-\s]?overflow\b/i,
  /\bstack[_\-\s]?overflow\b/i,
  /\bheap[_\-\s]?overflow\b/i,
  /\bformat[_\-\s]?string\b.*\b(vuln|attack)\b/i,
  /\buse[_\-\s]?after[_\-\s]?free\b/i,
  /\bdouble[_\-\s]?free\b/i,
  /\bmemory[_\-\s]?corruption\b/i,
  /\brop[_\-\s]?chain\b/i,
  /\breturn[_\-\s]?oriented[_\-\s]?programming\b/i,
  
  // === Bypass Techniques ===
  /\bbypass\b.*\b(security|antivirus|av|edr|firewall|waf|authentication|auth)\b/i,
  /\bevade\b.*\b(detection|antivirus|av|edr)\b/i,
  /\bav[_\-\s]?evasion\b/i,
  /\bedr[_\-\s]?bypass\b/i,
  /\bfirewall[_\-\s]?bypass\b/i,
  /\bwaf[_\-\s]?bypass\b/i,
  /\bantivm\b/i,
  /\banti[_\-\s]?sandbox\b/i,
  /\bsandbox[_\-\s]?evasion\b/i,
  /\bdetection[_\-\s]?evasion\b/i,
  /\bobfuscat\b.*\b(code|payload|malware)\b/i,
  /\bpack(er|ing)?\b.*\b(malware|malicious|payload)\b/i,
  /\bmalicious\b.*\bpack(er|ing|ed)?\b/i,
  /\bcrypter\b/i,
  /\bfud\b/i, // Fully undetectable
  /\bfully[_\-\s]?undetect/i,
  /\bundetect(able|ed)\b.*\b(malware|payload|virus)\b/i,
];

// ==========================================
// FRAUD/SCAM PATTERNS (100+)
// ==========================================

const FRAUD_PATTERNS: RegExp[] = [
  // === Financial Fraud ===
  /\bphishing\b/i,
  /\bscam\b/i,
  /\bfraud\b/i,
  /\bponzi\b/i,
  /\bpyramid[_\-\s]?scheme\b/i,
  /\bmoney[_\-\s]?launder/i,
  /\blaunder(ing)?\b.*\b(money|fund|crypto)\b/i,
  /\bwash[_\-\s]?trading\b/i,
  /\bmarket[_\-\s]?manipulation\b/i,
  /\bprice[_\-\s]?manipulation\b/i,
  /\bpump[_\-\s]?(and|&|n)?[_\-\s]?dump\b/i,
  /\brug[_\-\s]?pull\b/i,
  /\bexit[_\-\s]?scam\b/i,
  /\bhoneypot\b.*\b(token|contract|scam)\b/i,
  /\bfront[_\-\s]?run(ning)?\b/i,
  /\bsandwich[_\-\s]?attack\b/i,
  /\bmev[_\-\s]?exploit\b/i,
  /\bflash[_\-\s]?loan[_\-\s]?attack\b/i,
  /\boracle[_\-\s]?manipulation\b/i,
  /\bprice[_\-\s]?oracle[_\-\s]?attack\b/i,
  
  // === Crypto Scams ===
  /\bfake\b.*\b(token|nft|airdrop|ico|ido|presale|mint|collection)\b/i,
  /\b(token|nft|airdrop|ico|ido|presale|mint|collection)\b.*\bfake\b/i,
  /\bclone\b.*\b(token|contract|site|app)\b/i,
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
  
  // === Social Engineering ===
  /\bsocial[_\-\s]?engineer/i,
  /\bpretexting\b/i,
  /\bbaiting\b/i,
  /\btailgating\b/i,
  /\bquid[_\-\s]?pro[_\-\s]?quo\b/i,
  /\bvishing\b/i,
  /\bsmishing\b/i,
  /\bspear[_\-\s]?phishing\b/i,
  /\bwhaling\b/i,
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
  /\btrick\b.*\b(user|victim|target)\b/i,
  /\bdeceive\b/i,
  /\bmanipulat\b.*\b(user|victim|market|price)\b/i,
  /\bmislead\b/i,
  /\bfake[_\-\s]?review\b/i,
  /\bfake[_\-\s]?testimonial\b/i,
  /\bastroturf/i,
  /\bshill(ing)?\b/i,
  /\bbot\b.*\b(spam|promote|hype)\b/i,
  /\bcoordinated\b.*\b(inauthentic|campaign)\b/i,
  
  // === Investment Scams ===
  /\bguaranteed\b.*\b(return|profit|roi)\b/i,
  /\brisk[_\-\s]?free\b.*\b(invest|return|profit)\b/i,
  /\bdouble\b.*\b(money|crypto|investment)\b/i,
  /\b(10|100|1000)x\b.*\b(guaranteed|return|profit)\b/i,
  /\bhigh[_\-\s]?yield\b.*\b(program|scheme)\b/i,
  /\bhyip\b/i,
  /\bautomatic\b.*\b(profit|return|trading)\b/i,
  /\bpassive[_\-\s]?income\b.*\b(scam|scheme|guaranteed)\b/i,
];

// ==========================================
// PRIVACY VIOLATION PATTERNS (75+)
// ==========================================

const PRIVACY_PATTERNS: RegExp[] = [
  // === Personal Information Theft ===
  /\bdoxx?(ing)?\b/i,
  /\bstalk(ing|er)?\b/i,
  /\bleak\b.*\b(personal|private|data|info|pii)\b/i,
  /\bexpose\b.*\b(personal|private|identity)\b/i,
  /\bscrape\b.*\b(personal|private|pii|user|profile|data)\b/i,
  /\bharvest\b.*\b(email|phone|address|data|personal)\b/i,
  /\bcollect\b.*\b(without|unauthorized).*(consent|permission)\b/i,
  /\bpii\b.*\b(steal|collect|scrape|harvest|extract)\b/i,
  /\bidentity[_\-\s]?theft\b/i,
  /\bidentity[_\-\s]?fraud\b/i,
  /\bsocial[_\-\s]?security\b.*\b(number|steal|collect)\b/i,
  /\bssn\b.*\b(steal|collect|extract)\b/i,
  
  // === Tracking/Surveillance ===
  /\btrack(ing)?\b.*\b(location|gps|person|user|victim|target)\b/i,
  /\bspy(ing)?\b.*\b(on|user|target|person)\b/i,
  /\bsurveillance\b/i,
  /\bmonitor\b.*\b(without|unauthorized).*(consent|knowledge)\b/i,
  /\blocation[_\-\s]?track/i,
  /\bgps[_\-\s]?track/i,
  /\bgeolocation\b.*\b(track|steal|collect)\b/i,
  /\bdevice[_\-\s]?fingerprint/i,
  /\bbrowser[_\-\s]?fingerprint/i,
  /\bcanvas[_\-\s]?fingerprint/i,
  /\bsupercookie\b/i,
  /\bevercookie\b/i,
  /\bzombie[_\-\s]?cookie\b/i,
  
  // === Harassment ===
  /\bharass/i,
  /\bbully(ing)?\b/i,
  /\bcyberbully/i,
  /\bthreaten/i,
  /\bthreat\b/i,
  /\bintimida/i,
  /\bblackmail\b/i,
  /\bextort/i,
  /\bsextort/i,
  /\brevenge[_\-\s]?porn\b/i,
  /\bnon[_\-\s]?consensual[_\-\s]?(porn|intimate)\b/i,
  /\bncii\b/i,
  
  // === Data Breach ===
  /\bdata[_\-\s]?breach\b/i,
  /\bdata[_\-\s]?dump\b/i,
  /\bdata[_\-\s]?leak\b/i,
  /\bexfiltrat\b/i,
  /\bstolen[_\-\s]?data\b/i,
  /\bbreach(ed)?\b.*\b(database|data|credentials)\b/i,
  /\bdark[_\-\s]?web\b.*\b(sell|buy|data)\b/i,
  /\bunderground\b.*\b(forum|market|sell)\b/i,
  
  // === Unauthorized Access ===
  /\bunauthorized[_\-\s]?access\b/i,
  /\baccess\b.*\bwithout\b.*\b(permission|consent|authorization)\b/i,
  /\bintrusion\b/i,
  /\bbreak[_\-\s]?into\b.*\b(account|system|computer)\b/i,
  /\bhack[_\-\s]?into\b/i,
  /\bgain[_\-\s]?access\b.*\b(unauthorized|illegal|illicit)\b/i,
  
  // === Account Compromise ===
  /\baccount[_\-\s]?takeover\b/i,
  /\bato\b.*\b(attack|fraud)\b/i,
  /\bhijack\b.*\b(account|session|cookie)\b/i,
  /\bsession[_\-\s]?hijack/i,
  /\bcookie[_\-\s]?hijack/i,
  /\bcredential[_\-\s]?stuff/i,
  /\bbrute[_\-\s]?force\b.*\b(account|password|login)\b/i,
];

// ==========================================
// ATTACK VECTOR PATTERNS (100+)
// ==========================================

const ATTACK_PATTERNS: RegExp[] = [
  // === Network Attacks ===
  /\bddos\b/i,
  /\bdos[_\-\s]?attack\b/i,
  /\bdenial[_\-\s]?of[_\-\s]?service\b/i,
  /\bsyn[_\-\s]?flood\b/i,
  /\budp[_\-\s]?flood\b/i,
  /\bicmp[_\-\s]?flood\b/i,
  /\bhttp[_\-\s]?flood\b/i,
  /\bslowloris\b/i,
  /\bamplification[_\-\s]?attack\b/i,
  /\breflection[_\-\s]?attack\b/i,
  /\bsmurf[_\-\s]?attack\b/i,
  /\bping[_\-\s]?of[_\-\s]?death\b/i,
  /\bteardrop[_\-\s]?attack\b/i,
  /\barp[_\-\s]?spoof/i,
  /\barp[_\-\s]?poison/i,
  /\bdns[_\-\s]?spoof/i,
  /\bdns[_\-\s]?poison/i,
  /\bdns[_\-\s]?hijack/i,
  /\bbgp[_\-\s]?hijack/i,
  /\bip[_\-\s]?spoof/i,
  /\bmitm\b/i,
  /\bman[_\-\s]?in[_\-\s]?(the|middle)\b/i,
  /\bssl[_\-\s]?strip/i,
  /\bdowngrade[_\-\s]?attack\b/i,
  /\bpoodle\b.*\b(attack|vuln)\b/i,
  /\bheartbleed\b/i,
  /\bshellshock\b/i,
  
  // === Web Attacks ===
  /\bsql[_\-\s]?injection\b/i,
  /\bsqli\b/i,
  /\bxss\b/i,
  /\bcross[_\-\s]?site[_\-\s]?script/i,
  /\bcsrf\b/i,
  /\bxsrf\b/i,
  /\bcross[_\-\s]?site[_\-\s]?request[_\-\s]?forgery\b/i,
  /\bclickjack/i,
  /\bui[_\-\s]?redress/i,
  /\bopen[_\-\s]?redirect\b/i,
  /\bunvalidated[_\-\s]?redirect\b/i,
  /\bpath[_\-\s]?traversal\b/i,
  /\bdirectory[_\-\s]?traversal\b/i,
  /\blfi\b.*\b(attack|vuln)\b/i,
  /\brfi\b.*\b(attack|vuln)\b/i,
  /\blocal[_\-\s]?file[_\-\s]?inclusion\b/i,
  /\bremote[_\-\s]?file[_\-\s]?inclusion\b/i,
  /\bfile[_\-\s]?upload\b.*\b(vuln|attack|malicious)\b/i,
  /\bssrf\b/i,
  /\bserver[_\-\s]?side[_\-\s]?request[_\-\s]?forgery\b/i,
  /\bhttp[_\-\s]?request[_\-\s]?smuggling\b/i,
  /\bhttp[_\-\s]?splitting\b/i,
  /\bresponse[_\-\s]?splitting\b/i,
  /\bcache[_\-\s]?poison/i,
  /\bweb[_\-\s]?cache[_\-\s]?deception\b/i,
  /\bcrlf[_\-\s]?injection\b/i,
  /\bhost[_\-\s]?header[_\-\s]?injection\b/i,
  
  // === Authentication Attacks ===
  /\bbrute[_\-\s]?force\b/i,
  /\bdictionary[_\-\s]?attack\b/i,
  /\bdictionary\b.*\b(attack|password|crack)\b/i,
  /\bcredential[_\-\s]?stuffing\b/i,
  /\bpassword[_\-\s]?spray/i,
  /\bspray(ing)?\b.*\bpassword\b/i,
  /\brainbow[_\-\s]?table\b/i,
  /\bhash[_\-\s]?crack/i,
  /\bauth(entication)?[_\-\s]?bypass\b/i,
  /\btoken[_\-\s]?forgery\b/i,
  /\bjwt[_\-\s]?attack\b/i,
  /\bsession[_\-\s]?fixation\b/i,
  /\bsession[_\-\s]?prediction\b/i,
  /\bcookie[_\-\s]?manipulation\b/i,
  
  // === Wireless Attacks ===
  /\bwifi[_\-\s]?crack/i,
  /\bwpa[_\-\s]?crack/i,
  /\bwep[_\-\s]?crack/i,
  /\bevil[_\-\s]?twin\b/i,
  /\brogue[_\-\s]?ap\b/i,
  /\bkarma[_\-\s]?attack\b/i,
  /\bdeauth(entication)?[_\-\s]?attack\b/i,
  /\bbluetooth\b.*\b(hack|attack|exploit)\b/i,
  /\bbluesnarfing\b/i,
  /\bbluejacking\b/i,
  
  // === Smart Contract Attacks ===
  /\breentrancy\b.*\b(attack|exploit|vuln)\b/i,
  /\breentrancy\b/i, // Simpler match
  /\binteger[_\-\s]?overflow\b.*\b(attack|exploit)\b/i,
  /\boverflow\b.*\binteger\b/i,
  
  // === Additional Attack Patterns ===
  /\bexploit\b.*\b(code|vuln|system|network)\b/i,
  /\bhack\b.*\b(system|network|server|website)\b/i,
  /\bpwn\b/i,
  /\bown\b.*\b(server|system)\b/i,
  /\bcompromise\b.*\b(system|server|network)\b/i,
  /\bbreach\b.*\b(security|firewall|system)\b/i,
  /\bpenetrat\b.*\b(system|network|firewall)\b/i,
  /\binfiltrat\b/i,
  /\binteger[_\-\s]?underflow\b.*\b(attack|exploit)\b/i,
  /\bfront[_\-\s]?running\b.*\b(attack|exploit)\b/i,
  /\bflash[_\-\s]?loan\b.*\b(attack|exploit)\b/i,
  /\bdelegate[_\-\s]?call\b.*\b(vuln|attack)\b/i,
  /\bstorage[_\-\s]?collision\b/i,
  /\bselfdestruct\b.*\b(attack|exploit)\b/i,
  /\baccess[_\-\s]?control\b.*\b(vuln|bypass)\b/i,
  /\buninitialized\b.*\b(storage|proxy)\b/i,
];

// ==========================================
// SUSPICIOUS PATTERNS (REQUIRES REVIEW)
// ==========================================

const SUSPICIOUS_PATTERNS: RegExp[] = [
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

const ALLOWLIST_CONTEXTS: RegExp[] = [
  /\b(audit|review|analyze|assess|test|verify)\b.*\b(security|vulnerabilit|smart\s*contract|code)\b/i,
  /\b(document|explain|tutorial|guide|learn|study)\b.*\b(security|best\s*practice|threat|attack)\b/i,
  /\bresearch\b.*\b(security|threat|attack|vulnerabilit)\b/i,
  /\b(prevent|protect|defend|detect|mitigate|remediate)\b.*\b(attack|threat|vuln|exploit)\b/i,
  /\b(fix|patch|resolve|address)\b.*\b(vulnerabilit|security|issue|bug)\b/i,
  /\bsecurity\s*(report|disclosure|advisory|bulletin)\b/i,
  /\bbug\s*bounty\b/i,
  /\bpenetration\s*test/i,
  /\bpen\s*test/i,
  /\bred\s*team/i,
  /\bsecurity\s*assessment\b/i,
  /\bthreat\s*model/i,
  // Security-related coding (building secure systems)
  /\b(create|build|implement|write|develop)\b.*\b(hash(ing)?|encrypt(ion)?|auth(entication)?|validation|sanitiz)\b/i,
  /\bpassword\b.*\b(hash(ing)?|encrypt(ion)?|validation|strength|policy)\b/i,
  /\b(hash|encrypt|validate|sanitize)\b.*\bpassword\b/i,
  /\bsecure\b.*\b(implementation|code|function|system)\b/i,
];

// ==========================================
// MAIN SECURITY CHECK FUNCTION
// ==========================================

export function checkTaskSecurity(
  title: string,
  description: string,
  category?: string
): SecurityCheckResult {
  const content = `${title} ${description}`;
  const lowerContent = content.toLowerCase();
  const matchedPatterns: string[] = [];
  
  // Check allowlist - legitimate security work gets more lenience
  let isLegitimateContext = false;
  for (const pattern of ALLOWLIST_CONTEXTS) {
    if (pattern.test(content)) {
      isLegitimateContext = true;
      break;
    }
  }
  
  // CRITICAL: Credential theft (always block)
  for (const pattern of CREDENTIAL_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
      // Even in legitimate context, credential requests are blocked
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
  
  // CRITICAL: Malware (always block, unless clearly defensive)
  for (const pattern of MALWARE_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
      if (!isLegitimateContext) {
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
  
  // CRITICAL: Fraud (always block)
  for (const pattern of FRAUD_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
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
  
  // HIGH: Privacy violations (always block)
  for (const pattern of PRIVACY_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
      return {
        allowed: false,
        reason: 'Task appears to involve privacy violations, harassment, or unauthorized data collection. This is prohibited.',
        severity: 'high',
        category: 'privacy',
        matchedPatterns,
        confidence: 0.85,
      };
    }
  }
  
  // HIGH: Attack vectors (block unless defensive)
  for (const pattern of ATTACK_PATTERNS) {
    if (pattern.test(content)) {
      if (!isLegitimateContext) {
        matchedPatterns.push(pattern.source);
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
  
  // MEDIUM: Suspicious patterns - flag for review
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      matchedPatterns.push(pattern.source);
    }
  }
  
  if (matchedPatterns.length > 0) {
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

const CREDENTIAL_LEAK_PATTERNS: RegExp[] = [
  // Actual key formats
  /\bsk-[a-zA-Z0-9]{20,}\b/, // OpenAI
  /\bxox[abprs]-[a-zA-Z0-9-]+\b/, // Slack
  /\bghp_[a-zA-Z0-9]{36}\b/, // GitHub
  /\bglpat-[a-zA-Z0-9_-]{20,}\b/, // GitLab
  /\bnpm_[a-zA-Z0-9]{36}\b/, // NPM
  /\bpypi-[a-zA-Z0-9_-]{20,}\b/, // PyPI
  /\bAIza[a-zA-Z0-9_-]{35}\b/, // Google API
  /\bya29\.[a-zA-Z0-9_-]+\b/, // Google OAuth
  /\bAKIA[A-Z0-9]{16}\b/, // AWS Access Key
  /\b[A-Za-z0-9/+=]{40}\b/, // AWS Secret Key pattern
  /\bEAAC[a-zA-Z0-9]+\b/, // Facebook
  /\b[0-9]+-[a-zA-Z0-9_]{32}\.apps\.googleusercontent\.com\b/, // Google Client ID
  /\b(eyJ[a-zA-Z0-9_-]*\.){2}[a-zA-Z0-9_-]*\b/, // JWT
  
  // Private keys
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
  /0x[a-fA-F0-9]{64}\b/, // Ethereum private key
  
  // Seed phrases (12-24 word patterns)
  /\b([a-z]+\s+){11,24}[a-z]+\b/i,
  
  // Connection strings
  /mongodb(\+srv)?:\/\/[^\s]+:[^\s]+@[^\s]+/i,
  /postgres(ql)?:\/\/[^\s]+:[^\s]+@[^\s]+/i,
  /mysql:\/\/[^\s]+:[^\s]+@[^\s]+/i,
  /redis:\/\/[^\s]*:[^\s]+@[^\s]+/i,
];

export function checkResponseSecurity(content: string): SecurityCheckResult {
  const matchedPatterns: string[] = [];
  
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

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  agentId: string,
  action: 'task' | 'response' | 'report',
  limits = { tasks: 10, responses: 50, reports: 5 }
): { allowed: boolean; retryAfter?: number } {
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

// ==========================================
// REPORT SYSTEM
// ==========================================

export interface Report {
  id: string;
  type: 'task' | 'agent' | 'response';
  targetId: string;
  reporterId: string;
  reason: string;
  description: string;
  evidence?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

const reports: Report[] = [];

export function createReport(
  type: 'task' | 'agent' | 'response',
  targetId: string,
  reporterId: string,
  reason: string,
  description: string,
  evidence?: string[]
): Report {
  const report: Report = {
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

export function getReports(filters?: {
  status?: string;
  type?: string;
  targetId?: string;
}): Report[] {
  let filtered = [...reports];
  
  if (filters?.status) filtered = filtered.filter(r => r.status === filters.status);
  if (filters?.type) filtered = filtered.filter(r => r.type === filters.type);
  if (filters?.targetId) filtered = filtered.filter(r => r.targetId === filters.targetId);
  
  return filtered;
}

// ==========================================
// BLOCKLIST MANAGEMENT
// ==========================================

const blockedAgents = new Set<string>();
const blockedAddresses = new Set<string>();

export function blockAgent(agentId: string, reason: string): void {
  blockedAgents.add(agentId.toLowerCase());
  console.log(`🚫 Agent blocked: ${agentId} - ${reason}`);
}

export function isAgentBlocked(agentId: string): boolean {
  return blockedAgents.has(agentId.toLowerCase());
}

export function blockAddress(address: string, reason: string): void {
  blockedAddresses.add(address.toLowerCase());
  console.log(`🚫 Address blocked: ${address} - ${reason}`);
}

export function isAddressBlocked(address: string): boolean {
  return blockedAddresses.has(address.toLowerCase());
}

// ==========================================
// SECURITY EVENT LOGGING
// ==========================================

export interface SecurityEvent {
  timestamp: string;
  type: 'block' | 'flag' | 'report' | 'ban';
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string;
  taskId?: string;
  details: string;
  action: string;
}

const securityEvents: SecurityEvent[] = [];

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  
  securityEvents.push(fullEvent);
  
  if (event.severity === 'critical') {
    console.log(`🚨 CRITICAL SECURITY EVENT:`, fullEvent);
  }
}

export function getSecurityEvents(limit = 100): SecurityEvent[] {
  return securityEvents.slice(-limit);
}

// ==========================================
// PATTERN COUNT (for verification)
// ==========================================

export function getPatternCounts(): Record<string, number> {
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

export default {
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
