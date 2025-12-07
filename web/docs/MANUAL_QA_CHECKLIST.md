# NexSupply AI - Manual QA Checklist

Since this project does not have an automated test suite, this manual checklist is **critical** to prevent major bugs from reaching production.

**Instructions:** Before every deployment, create a copy of this checklist and go through each item on the staging environment.

---

### Pre-Deployment Checklist

**Release Version:** `[Enter Release Version or Date]`
**Tester:** `[Your Name]`
**Date:** `[Date of Test]`

---

#### ✅ Authentication & Accounts

-   [ ] **Login:** Can you log in successfully with an existing user account?
-   [ ] **Signup:** Can you create a new user account successfully?
-   [ ] **Logout:** Does the logout functionality work as expected?

#### ✅ Core AI Functionality

-   [ ] **New Project Creation:** Can you create a new project?
-   [ ] **AI Analysis:** When you submit a query in a new project, does the AI respond without errors?
-   [ ] **AI Response Quality:** Is the AI's response coherent and relevant to the query? (This is a check for API key validity and basic prompt functionality).

#### ✅ Payments (Lemon Squeezy)

-   [ ] **Payment Button:** Does clicking the "Upgrade" or "Subscribe" button open the Lemon Squeezy payment modal?
-   [ ] **(Optional) Test Purchase:** If you have a test card available, can you complete a purchase flow?

#### ✅ Permissions & Security

-   [ ] **Manager/Admin Access:** If you are logged in as a regular user, are you blocked from accessing any manager or admin-only pages?
-   [ ] **Data Isolation:** Can you only see your own projects and data? (Check by logging in with two different user accounts).

---

### Post-Deployment Smoke Test

After the deployment to production is complete, run through these essential checks one more time on the live site.

-   [ ] **Production Login:** Can you log in to the live application?
-   [ ] **Production AI Test:** Does the AI respond to a simple query on the live application?

---

**Notes:**

*If any of these checks fail, the deployment should be considered **blocked**. Do not proceed until the issue is resolved.*