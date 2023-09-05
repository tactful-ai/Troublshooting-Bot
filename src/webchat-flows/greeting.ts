import { Triggers, WebchatFlow, WhatsappFlow } from "automation-sdk";

export function webchatGreet() {
  const greetingFlow = new WebchatFlow("partner_welcome", "greeting");
  greetingFlow
    .on(Triggers.INTENT, "GREETINGS")
    // .on(Triggers.INTENT, "RESTART")
    // .randomText([
    //   ["Hello {{userInfo.name}}", 1],
    //   ["Hi {{userInfo.name}}", 1],
    //   ["Hey {{userInfo.name}}", 1],
    //   ["Welcome {{userInfo.name}}", 1],
    //   ["Good to see you {{userInfo.name}}", 1],
    //   ["Hi there {{userInfo.name}}", 1],
    // ])
    .text(["Hello OMAR BASTWAWESY"])

    .translate("PROFILE_GREETING", "en", "Hello partner")
    .translate("PROFILE_GREETING", "ar", "مرحبا الشريك")
    .translate("PROFILE_GREETING", "nl", "Hallo partner")

    .text([["{{translate.PROFILE_GREETING}} {{userInfo.name}}", 1]])
    .fire(Triggers.INTENT, "MAIN_MENU");
  return greetingFlow;
}
