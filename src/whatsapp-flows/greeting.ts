
import { Triggers, WhatsappFlow } from 'automation-sdk';


export function whatsappGreet() {
    const greetingFlow = new WhatsappFlow("partner_welcome", "greeting");
    greetingFlow
        // .on(Triggers.INTENT, "RESTART")
        .on(Triggers.INTENT, "GREETINGS")

        .translate('PROFILE_GREETING', 'en', 'Hello partner')
        .translate('PROFILE_GREETING', 'ar', 'مرحبا الشريك')
        .translate('PROFILE_GREETING', 'nl', 'Hallo partner')

        .text([
            ['{{translate.PROFILE_GREETING}} {{userInfo.name}}', 1],
        ])
        .fire(Triggers.INTENT, "MAIN_MENU")
    return greetingFlow;
}
