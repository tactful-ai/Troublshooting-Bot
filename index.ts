import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { FlowCoordinator } from "./src/FlowCoordinator";
import { Bugsnag, Bus, SDK } from "automation-sdk";
import { Triggers } from "automation-sdk";
import configs from "./configs";
import { RedisExpiredEvents, Tenants } from "automation-sdk";
import { DialogController } from "automation-sdk";
import { Dialog } from "automation-sdk";
const util = require("util");
const bodyParser = require("body-parser");
const app: Express = express();
dotenv.config({ path: `./.env` });

const flowCoordinator = new FlowCoordinator();

try {
  console.log("configs.REDIS_URL ===>", configs.REDIS_URL);

  RedisExpiredEvents({
    url: configs.REDIS_URL!,
  });
} catch (error) {
  console.log("RedisExpiredEvents errors ==> ", error);
}
const port = process.env.PORT;
console.log(`poooorttt=====================> ${port}`);
async function startServer() {
  await new Promise<void>((resolve, reject) => {
    app.listen(port);
    handleServer();
    resolve();
    console.log("finish* start");
  });
  console.log(`Server is listening on port ${port}`);
}

startServer()
  .then(() => {
    console.log("finish* handle");

    console.log("======================================");
    flowCoordinator.setupFlows();
    console.log("finish* setup");
    flowCoordinator.syncFlows();
    console.log("finish* sync");
  })
  .catch((err) => {
    console.log(err);
  });

function handleServer() {
  const sdkConfigs = {
    serviceName: "partner",
    RedisConfig: {
      url: process.env.REDIS_URL,
      contextTTL: process.env.CONTEXT_REDIS_TTL,
      dialogTTL: process.env.DIALOG_REDIS_TTL,
      localizationTTL: process.env.LOCALIZATION_REDIS_TTL,
    },
    ApiConfig: {
      Services: {
        channels: {
          baseUrl: process.env.CHANNELS_HOST_URL,
        },
        livechat: {
          baseUrl: process.env.LIVECHAT_HOST_URL,
        },
        AI: {
          basePathAI: process.env.AI_API_HOST_URL,
          basePathNlu: process.env.AI_NLU_HOST_URL,
          nluModel: process.env.NLU_MODEL,
          minConfidence: process.env.MIN_CONFIDENCE,
          aiDummyIntents: process.env.AI_DUMMY_INTENTS,
        },
        AutomationAPI: {
          baseUrl: process.env.AUTOMATION_API_HOST_URL,
        },
      },
      TokenConfigs: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        tokenEndpoint: process.env.TOKEN_URL,
      },
    },
    BusConfig: {
      broker: process.env.BUS_BROKER || "redis",
      namespace: process.env.STAGE || "development",
      messageExpiration: process.env.BUS_MESSAGE_EXPIRATION || 3600000,
      url: process.env.BUS_URL,
    },
    Tenants: {
      baseUrl: process.env.TENANTS_HOST_URL,
    },
    Bugsnag: {
      type: process.env.MONITOR_TYPE,
      service: process.env.BUGSNAG_SERVICE_NAME,
      appVersion: "1.0",
      key: "123",
    },
  };
  console.log("########## sdk config ==> ", sdkConfigs);
  const sdk = new SDK(sdkConfigs);
  app.use(bodyParser.json());
  // Bugsnag.notifyError('Partner Error!', 1, 'test partner error!');
  Bugsnag.instance.onError(
    "Test error release",
    "",
    "Error Application has crashed!"
  );

  //Server status endpoint
  app.get("/status", (req: Request, res: Response) => {
    res.send("Automation service is working!");
  });

  Bus.getInstance().startConsuming();
  console.log(
    `BASTAWESYYYYYYY=======>>>>${Triggers.EXECUTE_FLOWS_AUTOMATION_EVENTS}.${process.env.SERVICE_NAME}`
  );
  Bus.getInstance().on(
    `${Triggers.EXECUTE_FLOWS_AUTOMATION_EVENTS}.${process.env.SERVICE_NAME}`,
    async (msg: any, cb: any) => {
      console.log("Intentc from bus intent  execute======> ", msg);
      cb();
      const message = msg.body;
      // const channelType = message.tactfulMessage.channelInfo.type;//EX:facebook, webchat
      // const matchedFlow:any = flowCoordinator.flowManager.getFlowByDetails(message.matchedFlow);
      const partnerFlow = flowCoordinator.flowManager.getFlowByDetails(
        `${message.matchedFlow.defaultFlowId}`
      );

      console.log("matchedFlow ==========>", partnerFlow);
      // const matchedFlow = flowCoordinator.getFlowByTrigger(Triggers.INTENT, message.value, channelType);
      partnerFlow?.run(message.tactfulMessage);
    }
  );

  Bus.getInstance().on(
    `${Triggers.RESUME_FLOWS_AUTOMATION_EVENTS}.${process.env.SERVICE_NAME}`,
    //`tactful.message.troubleshootingChatbot`,
    async (msg: any, cb: any) => {
      console.log("Intentc from bus intent resume ======> ", msg);
      cb();
      const message = msg.body;
      const conversationId = message.tactfulMessage.tactfulUserId!;
      const cacheClient = sdk.redisDialogClient;
      const dialogController = new DialogController(
        conversationId,
        cacheClient!
      );
      const cachedDialog = await dialogController.getDialog();
      console.log(`THE CAHSE DIALOG ========>>>>>>>> ${cachedDialog}`);
      const dialog = Dialog.fromJSON(cachedDialog, dialogController);
      console.log(`THE DIALOG ========>>>>>>>> ${JSON.stringify(dialog)}`);

      await dialog.resume(message.tactfulMessage);
    }
  );
  console.log("ERPPPPPP=========>>>>>", process.env.ERP_API_HOST);
}
