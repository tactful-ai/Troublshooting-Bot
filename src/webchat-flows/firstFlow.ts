import {
  WebchatFlow,
  FlowButton,
  Triggers,
  Card,
  UrlButton,
  IExecuteParam,
} from "automation-sdk";
import flow from "automation-sdk";
export function firstFlow() {
  const firstFlow = new flow.WebchatFlow("partner_welcome", "greeting");

  firstFlow.text([["Thank you for the Feedback"]]);

  return firstFlow;
}
