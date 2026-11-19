# Get Ticket

**Get Ticket** হলো ব্যক্তিগত ব্যবহারের জন্য Bangladesh Railway ticket search, planning এবং booking-assistance browser extension প্রকল্প। লক্ষ্য হলো দুটি হালকা extension: Chrome/Edge desktop এবং Kiwi Browser Android।

## বর্তমান অবস্থা

প্রকল্পটির **v0.1.0 (Steps 1–15, Option A — Manual / Reference-Only + Official-Site Handoff Mode)** সম্পন্ন হয়েছে এবং Chrome/Edge Desktop ও Kiwi Android-এর জন্য আলাদা unpacked build তৈরি হয়েছে (`npm.cmd run build`)। তবে কোনো live Railway API বা automated polling চালু করা হয়নি (অফিসিয়াল অনুমোদন ছাড়া নিষিদ্ধ), এবং Chrome/Edge/Kiwi real-device manual verification এখনো বাকি।

শুরু করার আগে পড়ুন:

1. [Master project plan](docs/PROJECT_MASTER.md)
2. [Feasibility gate](docs/FEASIBILITY_GATE.md)
3. [Document-control rules](docs/DOCUMENT_CONTROL.md)
4. [Backup and release guide](docs/BACKUP_AND_RELEASE.md)
5. [UI direction](docs/UI_DIRECTION.md)
6. [Asset inventory](docs/ASSET_INVENTORY.md)
7. [Security and lightweight engineering rules](docs/SECURITY_AND_PERFORMANCE.md)
8. [Phased low-credit build playbook](docs/PHASED_BUILD_PLAYBOOK.md)
9. [Current implementation state](docs/IMPLEMENTATION_STATE.md)
10. [Data and evidence registry](docs/DATA_AND_EVIDENCE_REGISTRY.md)
11. [Premium UI implementation brief](docs/UI_IMPLEMENTATION_BRIEF.md)
12. [Class, coach, and seat-direction preference engine](docs/PREFERENCE_ENGINE.md)
13. [Owner-provided assumptions awaiting verification](docs/ASSUMPTION_REGISTER.md)
14. [Live service status and booking-handoff rules](docs/SERVICE_STATUS_AND_BOOKING_HANDOFF.md)
15. [Public e-ticket site inspection, 17 November 2026](docs/PHASE0_PUBLIC_SITE_INSPECTION_2026-11-17.md)
16. [Complete feature catalogue and implementation status](docs/FEATURE_CATALOG.md)
17. [Desktop and Android Kiwi delivery plan](docs/PLATFORM_DELIVERY_PLAN.md)
18. [Owner-approved step-by-step execution contract](docs/STEP_BY_STEP_EXECUTION.md)
19. [Step 1 official source and terms audit](docs/PHASE0_SOURCE_TERMS_AUDIT_2026-11-17.md)
20. [Step 2 desktop and Kiwi capability test plan](docs/PHASE0_CAPABILITY_TEST_PLAN_2026-11-19.md)
21. [Step 3 Phase 0 review and owner decision](docs/PHASE0_REVIEW_AND_RECOMMENDATION_2026-11-19.md)
22. [Step 14 security, accessibility, permissions, and package-size audit](docs/SECURITY_AND_RELEASE_AUDIT_2026-11-19.md)
23. [Step 15 Chrome, Edge, and Kiwi installation guide](docs/INSTALLATION_GUIDE_CHROME_EDGE_KIWI.md)

## গুরুত্বপূর্ণ সীমা

- শুধু অনুমোদিত ও যাচাইকৃত official data source ব্যবহার করা যাবে।
- CAPTCHA, OTP, queue, rate-limit, anti-bot protection বা payment automation করা যাবে না।
- কোনো তথ্য অনুপস্থিত হলে সেটিকে sold out বলা যাবে না।
- payment এবং final booking confirmation ব্যবহারকারী নিজে করবেন।
- Kiwi compatibility ও Bangladesh Railway data access যাচাই ছাড়া কোনো feature-কে supported বলা যাবে না।

## ভবিষ্যৎ installation লক্ষ্য

পরবর্তী release-এ প্রতিটি supported browser-এর জন্য আলাদা installable package ও ধাপে ধাপে installation guide থাকবে। এখন install করার মতো কোনো build নেই।
