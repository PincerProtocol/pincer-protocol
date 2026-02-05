# Discord Server Structure 🎮

**Pincer Protocol Community Discord Design**

*Last Updated: February 5, 2026*

---

## 🎯 Server Philosophy

Our Discord is the **central hub** for community collaboration, development, and governance. Structure balances:
- **Accessibility** - Easy navigation for newcomers
- **Organization** - Clear topic separation
- **Scalability** - Room to grow without chaos
- **Engagement** - Active, meaningful conversations

---

## 📋 Channel Categories & Layout

### 🏠 **WELCOME & INFO**

#### #welcome
- **Purpose**: First stop for new members
- **Permissions**: Read-only
- **Content**:
  - Welcome message with quick start guide
  - Link to #rules and #faq
  - Reaction role instructions
  - Community values intro

#### #rules
- **Purpose**: Community guidelines (links to COMMUNITY_GUIDELINES.md)
- **Permissions**: Read-only
- **Content**:
  - Code of conduct summary
  - Reporting process
  - Role explanations
  - Link to full docs

#### #announcements
- **Purpose**: Official protocol updates
- **Permissions**: Read-only (mods/team post only)
- **Content**:
  - Product releases
  - Partnership announcements
  - Event notifications
  - Critical updates

#### #faq
- **Purpose**: Common questions automated
- **Permissions**: Read-only (auto-updated by bot)
- **Content**:
  - Getting started guide
  - Technical FAQ
  - Token info (if applicable)
  - Support resources

---

### 💬 **GENERAL**

#### #general
- **Purpose**: Main hangout for casual chat
- **Permissions**: All verified members
- **Topic**: "Coffee chat ☕ | Keep it friendly | No price talk → #trading"

#### #introductions
- **Purpose**: New members introduce themselves
- **Permissions**: All members
- **Format**: Bot prompts: Name, background, interests, what brings you here

#### #random
- **Purpose**: Off-topic, memes, fun
- **Permissions**: All members
- **Topic**: "Chaos welcome 🎲 | Still follow guidelines | Have fun!"

#### #showcase
- **Purpose**: Share your projects/builds with Pincer
- **Permissions**: All members
- **Format**: Thread-per-project for organized feedback

---

### 🛠️ **DEVELOPMENT**

#### #dev-general
- **Purpose**: General technical discussion
- **Permissions**: All members
- **Topic**: "Protocol dev talk | Use threads for deep dives"

#### #code-review
- **Purpose**: PR reviews and code feedback
- **Permissions**: Contributors+
- **Integration**: GitHub webhook for new PRs

#### #agent-builds
- **Purpose**: Share and discuss agent implementations
- **Permissions**: All members
- **Format**: Thread per agent, pinned template

#### #bug-reports
- **Purpose**: Report issues with protocol/tools
- **Permissions**: All members
- **Format**: Bot form → GitHub issue creation

#### #feature-requests
- **Purpose**: Suggest improvements
- **Permissions**: All members
- **Integration**: Upvote system (reactions) → monthly review

#### #dev-resources
- **Purpose**: Tutorials, docs, tools
- **Permissions**: Read (all), Post (contributors+)
- **Content**: Curated learning materials

---

### 🏛️ **GOVERNANCE**

#### #governance-general
- **Purpose**: Discuss protocol direction
- **Permissions**: Token holders + contributors
- **Topic**: "Shape the future | Civil debate encouraged"

#### #proposals
- **Purpose**: Active governance proposals
- **Permissions**: All members view, Contributors+ post
- **Format**: 1 thread per proposal, structured template

#### #voting
- **Purpose**: Active votes (integrated with on-chain)
- **Permissions**: Eligible voters only
- **Integration**: Snapshot/on-chain voting bot

#### #governance-archive
- **Purpose**: Completed proposals and votes
- **Permissions**: Read-only
- **Automation**: Auto-archive after vote closes

---

### 💼 **COLLABORATION**

#### #partnerships
- **Purpose**: Discuss potential collaborations
- **Permissions**: Contributors+
- **Topic**: "Network building | DM mods for intros"

#### #events
- **Purpose**: Community events, hackathons, AMAs
- **Permissions**: All members
- **Integration**: Calendar bot, RSVP reactions

#### #content-creation
- **Purpose**: Coordinate articles, videos, graphics
- **Permissions**: All members
- **Roles**: Content Creators get early access

#### #bounties
- **Purpose**: Paid tasks and rewards
- **Permissions**: All members
- **Format**: Bot posts tasks → claim → submit → review

---

### 📊 **MARKET & TRADING** (Optional)

#### #trading
- **Purpose**: Price discussion and market analysis
- **Permissions**: All members
- **Disclaimer**: Pinned "Not financial advice" message

#### #analytics
- **Purpose**: On-chain data, metrics, dashboards
- **Permissions**: All members
- **Integration**: Dune/Nansen bot updates

---

### 🎓 **SUPPORT & HELP**

#### #support
- **Purpose**: Get help from community/mods
- **Permissions**: All members
- **Bot**: Auto-tags helpers, tracks resolution time

#### #onboarding
- **Purpose**: Guided help for complete newcomers
- **Permissions**: All members
- **Format**: Step-by-step threads, assigned mentors

#### #agent-help
- **Purpose**: Troubleshooting agent setup/usage
- **Permissions**: All members
- **Integration**: Error log parser bot

---

### 🎉 **COMMUNITY**

#### #achievements
- **Purpose**: Celebrate member milestones
- **Permissions**: All members
- **Bot**: Auto-posts: first PR, 100 messages, contest wins

#### #feedback
- **Purpose**: Community and server feedback
- **Permissions**: All members
- **Privacy**: Anonymous submission option

#### #media
- **Purpose**: Photos, videos, creative content
- **Permissions**: All members
- **Format**: Must be Pincer-related or community events

---

### 🔊 **VOICE CHANNELS**

#### 🎙️ General Hangout
- **Purpose**: Casual voice chat
- **Permissions**: All members

#### 🎙️ Dev Collab
- **Purpose**: Pair programming, code reviews
- **Permissions**: Contributors+

#### 🎙️ Community Call
- **Purpose**: Official weekly/monthly calls
- **Permissions**: All members
- **Schedule**: Pinned in #events

#### 🎙️ AMA Stage
- **Purpose**: Stage channel for large Q&As
- **Permissions**: Audience (all), Speakers (invited)

#### 🎙️ Focus Room
- **Purpose**: Study/work together (cam optional)
- **Permissions**: All members

---

### 🔧 **ADMIN** (Hidden)

#### #mod-chat
- **Purpose**: Moderator coordination
- **Permissions**: Mods+ only

#### #mod-logs
- **Purpose**: Auto-log of mod actions
- **Permissions**: Mods+ only
- **Integration**: Bot logs bans, warns, deletes

#### #team-private
- **Purpose**: Core team strategy
- **Permissions**: Core team only

#### #bot-spam
- **Purpose**: Test bot commands
- **Permissions**: Mods+ only

---

## 🎖️ Role Structure

### **Hierarchy & Permissions**

#### 🦞 **Founder** (Pincer)
- **Color**: Gold (#FFD700)
- **Permissions**: Administrator
- **Badge**: Custom "Founder" badge
- **Count**: 1

#### 👑 **Core Team**
- **Color**: Purple (#9B59B6)
- **Permissions**: Manage server, channels, roles (no admin)
- **Members**: Pincer, Herald, Forge, Scout
- **Badge**: "Team" badge
- **Count**: ~4-6

#### 🛡️ **Moderators**
- **Color**: Blue (#3498DB)
- **Permissions**: Kick, ban, timeout, manage messages, manage threads
- **Responsibilities**: Enforce guidelines, help members, escalate issues
- **Selection**: Nominated by team, community vote
- **Count**: ~1 per 200 members target

#### 🏗️ **Contributors**
- **Color**: Green (#2ECC71)
- **Permissions**: Post in restricted channels (dev-resources, proposals)
- **Criteria**: 
  - 3+ merged PRs OR
  - Consistent quality contributions OR
  - Approved by 2 core team members
- **Badge**: "Contributor" badge
- **Count**: Unlimited

#### 🎨 **Content Creators**
- **Color**: Orange (#E67E22)
- **Permissions**: Post in content channels, early access to announcements
- **Criteria**: Create educational/promotional content for Pincer
- **Count**: Unlimited

#### 🗳️ **Governance Participant**
- **Color**: Teal (#1ABC9C)
- **Permissions**: Access governance channels, vote on proposals
- **Criteria**: 
  - Hold governance tokens OR
  - Delegated voting rights
- **Badge**: "Voter" badge
- **Count**: Based on token holders

#### ✅ **Verified Member**
- **Color**: Light Gray (#95A5A6)
- **Permissions**: Access all public channels, send messages
- **Criteria**: Complete verification (Captcha + React to rules)
- **Count**: All active members

#### 🤖 **Bot**
- **Color**: Dark Gray (#607D8B)
- **Permissions**: Custom per bot
- **Count**: ~5-10 utility bots

#### 🚫 **Muted**
- **Color**: Red (#E74C3C)
- **Permissions**: Read-only (temporary punishment)
- **Duration**: Set by moderator (1 hour - 7 days)

---

### **Reaction Roles** (Self-Assign)

Members can pick roles via reactions in #welcome:

#### Interest Tags
- 🛠️ **Developer** - Get pings for code help
- 🎨 **Creator** - Content creation collabs
- 📊 **Analyst** - Data and metrics
- 🏛️ **Governor** - Governance discussions
- 💼 **Bizdev** - Partnerships and growth

#### Notification Preferences
- 🔔 **Announcements** - Get pinged for major updates
- 🎉 **Events** - Notify for AMAs, hackathons
- 🆕 **New Releases** - Product launch alerts

#### Regional
- 🌎 **Americas**
- 🌍 **Europe/Africa**
- 🌏 **Asia/Pacific**

---

## 🤖 Bot Functionality

### **Core Bots**

#### 1. **Herald Bot** (Custom - Main Utility)
**Functions**:
- `/help` - Show command list and support resources
- `/faq [topic]` - Pull FAQ answers
- `/report [user/message]` - Report violations to mods
- `/verify` - Complete verification process
- `/claim [bounty-id]` - Claim bounty task
- `/submit [bounty-id]` - Submit bounty work
- `/stats` - Personal stats (messages, contributions, etc.)
- Auto-welcome new members with DM guide
- Auto-role assignment on verification
- Track and reward engagement (leaderboard)

#### 2. **Moderation Bot** (MEE6 / Dyno / Custom)
**Functions**:
- Auto-mod (spam detection, link filtering)
- Warning system (strike tracking)
- Timeout/ban commands with reason logging
- Raid protection (lockdown mode)
- Message/user cleanup commands
- Mod action audit log

#### 3. **GitHub Integration Bot**
**Functions**:
- Post new PRs in #code-review
- Post new issues in #bug-reports
- Update on PR merges/closes
- Contributor role auto-assignment on first merge
- Link Discord users to GitHub profiles

#### 4. **Governance Bot** (Snapshot / Tally / Custom)
**Functions**:
- Post new proposals in #proposals
- Active voting reminders in #voting
- Real-time vote count updates
- Auto-archive completed votes
- Role gating based on token holdings

#### 5. **Analytics Bot** (Custom / Dune)
**Functions**:
- Daily protocol stats in #analytics
- Price updates in #trading (if enabled)
- On-chain event alerts (big transactions, contracts)
- Custom dashboard queries

#### 6. **Event Bot** (Apollo / Custom)
**Functions**:
- Create events with RSVP
- Reminder pings before events
- Sync with Google Calendar
- Recurring events (weekly community call)

#### 7. **Leveling/XP Bot** (Mee6 / Tatsu / Custom)
**Functions**:
- Award XP for messages, voice time, contributions
- Display member levels/leaderboards
- Custom role rewards at milestones
- Prevent spam (cooldowns between XP)

---

### **Bot Commands Reference**

**Public Commands**:
```
/help - Bot help menu
/faq [topic] - Get FAQ answer
/verify - Complete verification
/stats [@user] - View stats
/leaderboard - Top contributors
/bounties - List available bounties
/claim [id] - Claim a bounty
/submit [id] [link] - Submit bounty work
/events - Upcoming events
/vote [proposal] - View proposal details
```

**Moderator Commands**:
```
/warn @user [reason] - Issue warning
/timeout @user [duration] [reason] - Temporary mute
/kick @user [reason] - Remove from server
/ban @user [duration] [reason] - Ban user
/clear [count] - Delete recent messages
/lock [channel] - Prevent posting
/unlock [channel] - Re-enable posting
/announce [message] - Send official announcement
```

**Admin Commands**:
```
/setup - Configure bot settings
/role-add @user [role] - Manually assign role
/role-remove @user [role] - Remove role
/audit @user - View user history
/backup - Backup server configuration
```

---

## 📊 Server Metrics & KPIs

### Health Metrics
- **Active Members**: Users who message weekly
- **Retention Rate**: % of new members active after 30 days
- **Response Time**: Avg time for #support resolution
- **Engagement Rate**: Messages per active member per day

### Growth Metrics
- **New Members**: Weekly/monthly joins
- **Verification Rate**: % of joins who verify
- **Contributor Pipeline**: New contributors per month
- **Event Attendance**: RSVP vs actual attendance

### Quality Metrics
- **Mod Actions**: Warns/bans per 1000 members (lower is better)
- **Self-Resolution Rate**: Issues resolved without mod intervention
- **Content Quality**: Upvotes/reactions on posts
- **Sentiment Analysis**: Bot tracks positivity/negativity trends

---

## 🚀 Launch Phases

### **Phase 1: Core Setup** (Week 1)
- [ ] Create server with basic structure
- [ ] Configure roles and permissions
- [ ] Deploy Herald Bot (core functions)
- [ ] Write welcome/rules/faq content
- [ ] Test with core team

### **Phase 2: Soft Launch** (Week 2-3)
- [ ] Invite alpha contributors (~20-50 people)
- [ ] Deploy moderation bot
- [ ] Set up GitHub integration
- [ ] Gather feedback and iterate
- [ ] Document onboarding issues

### **Phase 3: Community Launch** (Week 4)
- [ ] Public announcement
- [ ] Open invites (gated verification)
- [ ] Deploy all bots
- [ ] First community call
- [ ] Monitor and adjust

### **Phase 4: Optimization** (Ongoing)
- [ ] Weekly metrics review
- [ ] Monthly feedback surveys
- [ ] Role/channel adjustments
- [ ] Bot feature additions
- [ ] Moderator training

---

## 🔧 Technical Setup

### Server Settings
- **Verification Level**: Medium (verified email + 5 min wait)
- **Explicit Content Filter**: Scan all members
- **2FA Requirement**: Required for mods
- **Default Notification**: Mentions only
- **System Messages**: #welcome channel

### Integrations
- **GitHub**: Webhook for pincer-protocol repo
- **Twitter**: Auto-post announcements
- **Snapshot**: Governance proposals
- **Dune**: Analytics dashboard
- **Google Calendar**: Event sync

### Backup & Security
- **Regular Backups**: Weekly config/message exports
- **Audit Logs**: Enabled (retain 90 days)
- **Vanity URL**: discord.gg/pincer
- **Anti-Raid**: Bot lockdown on suspicious joins

---

## 📞 Points of Contact

- **Server Admin**: Pincer 🦞
- **Community Manager**: Herald 📢
- **Bot Maintenance**: Forge ⚒️
- **Moderator Lead**: TBD (hire from community)

---

## 🌟 Success Criteria

A healthy Pincer Discord should be:
- **Welcoming**: New members feel supported and included
- **Productive**: Developers get help and ship code
- **Engaged**: Daily meaningful conversations, not spam
- **Governed**: Community actively shapes protocol direction
- **Fun**: People want to hang out, not just transact

---

*"The strongest protocols are built by the strongest communities."* 🦞

**— Herald, Community Manager** 📢

---

## Version History

- **v1.0** (2026-02-05): Initial Discord structure design

