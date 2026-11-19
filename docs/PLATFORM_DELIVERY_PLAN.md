# Platform Delivery Plan — Desktop and Android Kiwi

## Target platforms

| Platform | Target | Build approach | Support claim rule |
| --- | --- | --- | --- |
| Desktop | Google Chrome on Windows 11 | Separate Manifest V3 build | Test on supported Chrome version before release |
| Desktop | Microsoft Edge on Windows 11 | Separate Manifest V3 build | Test on supported Edge version before release |
| Android | Kiwi Browser | Separate Kiwi manifest/build and capability adapter | Test on real Android device/browser version before claiming support |

## Android compatibility truth

No browser extension can honestly guarantee identical behaviour on every Android brand, OS release, battery policy, or browser version. Get Ticket will use responsive UI and feature detection, then show `Not supported in this browser` or documented limitations where required. It will not promise uninterrupted monitoring when Android suspends, kills, or closes Kiwi.

## Required capability checks

| Capability | Chrome | Edge | Kiwi Android | Fallback if unavailable |
| --- | --- | --- | --- | --- |
| Extension install | Test | Test | Real-device test | Installation guide / unsupported notice |
| Popup/dashboard | Test | Test | Real-device test | Open dashboard in tab if supported |
| Local storage | Test | Test | Real-device test | Disable persistence-dependent feature |
| Notifications | Test | Test | Real-device test | In-app alert / explain limitation |
| Alarms/background lifecycle | Test | Test | Real-device test | Reminder-only/manual refresh mode |
| Content script/tab action | Test | Test | Real-device test | Official site handoff only |
| Restart recovery | Test | Test | Real-device test | Restore saved state when browser resumes |

## Planned application structure

```text
apps/
  desktop-extension/
    src/
      background/          # event-driven MV3 service-worker logic
      content/             # narrowly scoped official-site UI integration
      popup/               # compact status + shortcuts
      dashboard/           # primary desktop UI
      options/             # settings and privacy controls
      platform/            # Chrome/Edge capability adapter
    assets/
      icons/
      branding/
  android-extension/
    src/
      background/
      content/
      popup/
      dashboard/
      options/
      platform/            # Kiwi feature detection and fallbacks
    assets/
      icons/
      branding/
packages/
  shared-core/src/{types,validators,utilities}/
  railway-engine/src/{providers,availability,timetable}/
  route-intelligence/src/{station-graph,route-search,segment-validation}/
  scheduler/src/{monitoring,release-planner,retry-policy}/
  notifications/src/
  storage/src/
  security/src/
  ui-components/src/
```

These are planned directories only. Code and manifests are created only in their approved implementation step.
