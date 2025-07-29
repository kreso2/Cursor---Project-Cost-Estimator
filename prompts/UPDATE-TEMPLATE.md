# 🔄 Prompt Update Template

## 📅 Update Information
- **Date:** [YYYY-MM-DD]
- **Prompt:** [Name of the prompt being updated]
- **Type:** [Bug Fix / New Feature / Performance / Security / UI/UX]
- **Priority:** [High / Medium / Low]

## 🐛 Bug Fix Template

### Issue Description
**Problem:** [Detailed description of the problem]
**Impact:** [How it affects the application]
**Reproduction Steps:** [How to reproduce the problem]

### Solution
**Root Cause:** [What caused the problem]
**Fix:** [How it was resolved]
**Code Changes:** [Which code was changed]

### Updated Code
```typescript
// BEFORE (problematic code)
// [Old code that caused the problem]

// AFTER (fixed code)
// [New code that fixes the problem]
```

### Testing
**Test Cases:** [How to test the fix]
**Regression Testing:** [What else needs to be tested]

### Prevention
**Best Practices:** [How to avoid similar problems]
**Code Review Checklist:** [What to check in code review]

---

## ✨ New Feature Template

### Feature Description
**Name:** [Name of the functionality]
**Purpose:** [Why it's needed]
**User Story:** [How the user uses the functionality]

### Implementation
**Technical Approach:** [How it was implemented]
**Architecture:** [Where it fits in the existing architecture]
**Dependencies:** [Which libraries/APIs are used]

### Code Implementation
```typescript
// New component/service code
// [Kompletna implementacija]
```

### Integration Points
**Files Modified:** [Which files were changed]
**New Files:** [Which new files were created]
**Configuration:** [Which configurations are needed]

### Usage Examples
```typescript
// How to use the new feature
// [Usage examples]
```

### Testing
**Unit Tests:** [How to test the functionality]
**Integration Tests:** [How to test the integration]
**User Acceptance Tests:** [How the user tests]

---

## ⚡ Performance Optimization Template

### Performance Issue
**Problem:** [Što je bilo sporo/neefikasno]
**Metrics:** [Brojčani podaci prije optimizacije]
**Impact:** [Kako utječe na korisničko iskustvo]

### Optimization Strategy
**Approach:** [Kako je optimizirano]
**Techniques Used:** [Koje tehnike optimizacije]
**Trade-offs:** [Što je žrtvovano za performanse]

### Before vs After
```typescript
// BEFORE (slow implementation)
// [Stari kod]

// AFTER (optimized implementation)
// [Optimizirani kod]
```

### Performance Metrics
**Before:** [Brojčani podaci]
**After:** [Brojčani podaci]
**Improvement:** [Postotak poboljšanja]

### Implementation Steps
1. [Korak 1]
2. [Korak 2]
3. [Korak 3]

---

## 🔒 Security Update Template

### Security Issue
**Vulnerability:** [Opis sigurnosne ranjivosti]
**Risk Level:** [High / Medium / Low]
**Impact:** [Što se može dogoditi]

### Security Fix
**Solution:** [Kako je riješeno]
**Best Practices:** [Sigurnosne prakse]
**Validation:** [Kako validirati fix]

### Code Changes
```typescript
// BEFORE (vulnerable code)
// [Ranljiv kod]

// AFTER (secure code)
// [Siguran kod]
```

### Security Testing
**Penetration Testing:** [Kako testirati sigurnost]
**Code Review:** [Što provjeriti]
**Monitoring:** [Kako pratiti]

---

## 🎨 UI/UX Improvement Template

### Design Issue
**Problem:** [Što je bilo loše u dizajnu]
**User Feedback:** [Što korisnici kažu]
**Usability Impact:** [Kako utječe na korisnost]

### Design Solution
**Approach:** [Kako je poboljšano]
**Design Principles:** [Koji principi dizajna]
**Accessibility:** [Poboljšanja pristupačnosti]

### Code Changes
```typescript
// BEFORE (old UI)
// [Stari UI kod]

// AFTER (improved UI)
// [Poboljšani UI kod]
```

### User Testing
**Usability Testing:** [Kako testirati korisnost]
**Accessibility Testing:** [Kako testirati pristupačnost]
**User Feedback:** [Kako prikupiti feedback]

---

## 📋 Checklist for Prompt Updates

### Before Updating
- [ ] Identify problem/improvement
- [ ] Test solution
- [ ] Document changes
- [ ] Determine which prompt needs to be updated

### During Update
- [ ] Add update information
- [ ] Use appropriate template
- [ ] Include before/after code
- [ ] Add testing instructions
- [ ] Add prevention/best practices

### After Update
- [ ] Check if prompt is up to date
- [ ] Test if new code works
- [ ] Update project-rules.mdc if needed
- [ ] Document in changelog

---

## 🔄 Process Workflow

### 1. Problem Identification
```bash
# When you notice a problem:
1. Record in issues/notes
2. Determine priority
3. Determine category (bug/feature/performance)
4. Determine which prompt needs to be updated
```

### 2. Solution Development
```bash
# Develop solution:
1. Implement fix/feature
2. Test thoroughly
3. Document changes
4. Prepare code for prompt
```

### 3. Prompt Update
```bash
# Update prompt:
1. Open the appropriate prompt
2. Add new section using template
3. Include all relevant information
4. Check if prompt is complete
```

### 4. Validation
```bash
# Validate update:
1. Test if new code works
2. Check if prompt is clearly written
3. Check if it contains all necessary information
4. Update project-rules.mdc if needed
```

---

## 📚 Example Updates

### Example 1: Bug Fix in Admin Page
```markdown
## Recent Bug Fixes
### Issue: Admin page infinite loading
**Problem:** Admin page was stuck in loading state
**Root Cause:** Missing database tables (permissions, role_permissions)
**Solution:** Added SQL script to create missing tables
**Code Changes:** Updated Admin.tsx with error handling and timeout
```

### Example 2: New Feature - Currency Conversion
```markdown
## New Features
### Feature: Live Currency Conversion
**Description:** Real-time currency conversion with live exchange rates
**Implementation:** CurrencyService with caching and fallback
**Code:** [CurrencyService implementation]
**Usage:** [How to use in components]
```

### Example 3: Performance Optimization
```markdown
## Performance Optimizations
### Optimization: API Response Caching
**Problem:** Multiple API calls for same data
**Solution:** Implemented 5-minute cache for exchange rates
**Impact:** Reduced API calls by 80%
**Code:** [Caching implementation]
``` 