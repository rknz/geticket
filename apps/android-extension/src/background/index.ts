import { validateExtensionMessage } from "@get-ticket/security";
import { dispatchSafeNotification } from "@get-ticket/notifications";
import {
  GetTicketRepository,
  createChromeLocalStorageAdapter,
} from "@get-ticket/storage";

const repo = new GetTicketRepository(createChromeLocalStorageAdapter());

chrome.runtime.onMessage.addListener((rawMessage, _sender, sendResponse) => {
  const validated = validateExtensionMessage(rawMessage);
  if (!validated.ok) {
    sendResponse({ ok: false, error: validated.error });
    return false;
  }

  const msg = validated.message;
  if (msg.type === "GET_STATE") {
    void repo.load().then((state) => sendResponse({ ok: true, state }));
    return true;
  }

  if (msg.type === "OPEN_OFFICIAL_HANDOFF") {
    void chrome.tabs.create({ url: msg.url }).then(() => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === "SCHEDULE_RELEASE_REMINDER") {
    const when = Date.parse(msg.triggerAtIso);
    if (!Number.isNaN(when) && when > Date.now() && chrome.alarms?.create) {
      chrome.alarms.create(`release:${msg.profileId}`, { when });
      sendResponse({ ok: true });
    } else {
      sendResponse({
        ok: false,
        error: "Alarms API is not supported in this browser or reminder time is invalid.",
      });
    }
    return false;
  }

  sendResponse({ ok: true });
  return false;
});

if (chrome.alarms?.onAlarm) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (!alarm.name.startsWith("release:")) return;
    const profileId = alarm.name.slice("release:".length);
    void dispatchSafeNotification(
      {
        id: `gt-kiwi-reminder-${profileId}-${Date.now()}`,
        title: "Get Ticket — Release Reminder",
        message:
          "Your configured ticket release reminder is due. Open the official Bangladesh Railway e-ticket site manually.",
      },
      chrome.notifications ?? null,
    );
  });
}
