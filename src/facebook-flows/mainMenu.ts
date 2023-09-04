
import { FacebookFlow, FlowButton, Triggers } from 'automation-sdk';


export function facebookMainMenu() {
    const fixedQuickReplies = new FacebookFlow("partner_mainMenu", "greeting");
    fixedQuickReplies
        .on(Triggers.INTENT, "MAIN_MENU")

        .translate('TALK_TO_AGENT_BUTTON', 'en', 'Customer Service')
        .translate('TALK_TO_AGENT_BUTTON', 'ar', 'خدمة العملاء')
        .translate('TALK_TO_AGENT_BUTTON', 'nl', 'Kundendienst')

        .translate('END_CONVERSATION_BUTTON', 'en', 'End Conversation')
        .translate('END_CONVERSATION_BUTTON', 'ar', 'انهاء المحادثة')
        .translate('END_CONVERSATION_BUTTON', 'nl', 'Gespräch beenden')

        .translate('GREETING_FLOW_MESSAGE', 'en', 'I can help you in one of the following services')
        .translate('GREETING_FLOW_MESSAGE', 'ar', 'يمكنني مساعدتك في إحدى الخدمات التالية')
        .translate('GREETING_FLOW_MESSAGE', 'nl', 'ik kan je helpen met een van de volgende diensten')

        .translate('END_CONVERSATION', 'en', 'Conversation ended')
        .translate('END_CONVERSATION', 'ar', 'تم انهاء المحادثة')
        .translate('END_CONVERSATION', 'nl', 'Das Gespräch ist beendet')

        .translate('TICKETING', 'en', 'Submit a Ticket')
        .translate('TICKETING', 'ar', 'انشاء طلب دعم')
        .translate('TICKETING', 'nl', 'Een ticket indienen')

        .quickReply("{{translate.GREETING_FLOW_MESSAGE}}", [
            new FlowButton("4", "{{translate.TICKETING}}", "ticket_creation",
                new FacebookFlow("ticket_creation", "sub").fire(Triggers.INTENT, "CREATE_TICKET")),
            new FlowButton("5", "{{translate.TALK_TO_AGENT_BUTTON}}", "talk_to_agent",
                new FacebookFlow("talk_to_agent", "sub").fire(Triggers.INTENT, "HELP")),
            new FlowButton("6", "{{translate.END_CONVERSATION_BUTTON}}", "end_conversation",
                new FacebookFlow("end_conversation", "sub").text([['{{translate.END_CONVERSATION}}']])),
        ])

    return fixedQuickReplies;
}
