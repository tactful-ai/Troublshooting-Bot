import {
  WebchatFlow,
  FlowButton,
  Triggers,
  Card,
  UrlButton,
  IExecuteParam,
} from "automation-sdk";
import flow from "automation-sdk";
export function thirdFlow() {
  const thirdFlow = new flow.WebchatFlow("partner_welcome", "greeting");

  thirdFlow
    // .check("{{config.isLogged}}", "=", "true")
    .text([["one of our team will contact you soon"]]);

  return thirdFlow;
}
