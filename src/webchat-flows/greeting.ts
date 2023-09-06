import {
  IExecuteParam,
  Triggers,
  WebchatFlow,
  WhatsappFlow,
} from "automation-sdk";

export function webchatGreet() {
  const greetingFlow = new WebchatFlow("partner_welcome", "greeting");
  greetingFlow
    .on(Triggers.INTENT, "GREETINGS") //4
    // .on(Triggers.INTENT, "RESTART")
    .translate("PROFILE_GREETING", "en", "Hello partner")
    .translate("PROFILE_GREETING", "ar", "مرحبا الشريك")
    .translate("PROFILE_GREETING", "nl", "Hallo partner")

    .text([["Hello partner", 1]])

    .userInput({
      question: "How can i help you?",

      contextParam: "userQuestion", // contextParam is the name of the variable that will be created
    })
    .text([["USER QUESTION {{params.userQuestion}}"]])
    // .api(
    //   "http://localhost:6000/slack/question",
    //   "POST",
    //   undefined,
    //   { "question": "{{params.userQuestion}}" }
    // )
    // .action(($: IExecuteParam) => {
    //   console.log(`RESPONEEEEEEEEEE =====>>>>>${$.context.api.response}`);
    // })
    // Call Slack API
    // Response of the Slack API

    .text([["Your answer is Bastawesy", 1]]);

  //.fire(Triggers.INTENT, "MAIN_MENU");
  // TODO==> after welcome message  >> what is your issue
  //Todo ==>
  //TODO  ==> textInput
  //Todo ==> take the input and send it to the backend
  //Todo ==> backend will send the response as (TEXT)
  //Todo ==> what else

  return greetingFlow;
}
