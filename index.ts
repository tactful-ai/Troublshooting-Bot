import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { FlowCoordinator } from './src/FlowCoordinator';
import { Bugsnag, Bus, SDK } from 'automation-sdk';
import { Triggers } from 'automation-sdk';
import configs from './configs';
import { RedisExpiredEvents, Tenants } from 'automation-sdk';
import { DialogController } from 'automation-sdk';
import { Dialog } from 'automation-sdk';
const util = require('util');
const bodyParser = require('body-parser');
const app: Express = express();
dotenv.config({ path: `./.env.development` });
//Setup your Skills
const flowCoordinator = new FlowCoordinator();

try {
  console.log("configs.REDIS_URL ===>", configs.REDIS_URL);
  RedisExpiredEvents({
    url: configs.REDIS_URL!,
  });
}
catch (error) {
  console.log("RedisExpiredEvents errors ==> ", error);
}
const port = process.env.PORT;
async function startServer() {
  await new Promise<void>((resolve, reject) => {
    app.listen(port)
    handleServer();
    resolve();
    console.log("finish* start")
  });
  console.log(`Server is listening on port ${port}`);
}

startServer().then(() => {
  console.log("finish* handle")
  flowCoordinator.setupFlows();
  console.log("finish* setup")
  flowCoordinator.syncFlows();
  console.log("finish* sync")
})
  .catch(err => {
    console.log(err);
  });

function handleServer() {
  const sdkConfigs = {
    serviceName: process.env.SERVICE_NAME || 'partner',
    RedisConfig: {
      url: configs.REDIS_URL,
      // TTL: configs.REDIS_TTL
      contextTTL: configs.CONTEXT_REDIS_TTL,
      dialogTTL: configs.DIALOG_REDIS_TTL,
      localizationTTL: configs.LOCALIZATION_REDIS_TTL,
    },
    ApiConfig:
    {
      Services: {
        channels: {
          baseUrl: configs.CHANNELS_HOST_URL,
        },
        livechat: {
          baseUrl: configs.LIVECHAT_HOST_URL,
        },
        AI: {
          basePathAI: configs.AI_API_HOST_URL,
          basePathNlu: configs.AI_NLU_HOST_URL,
          nluModel: configs.NLU_MODEL,
          minConfidence: configs.MIN_CONFIDENCE,
          aiDummyIntents: configs.AI_DUMMY_INTENTS
        },
        AutomationAPI: {
          baseUrl: configs.AUTOMATION_API_HOST_URL,
        },
      },
      TokenConfigs: {
        clientId: configs.CLIENT_ID,
        clientSecret: configs.CLIENT_SECRET,
        tokenEndpoint: configs.TOKEN_URL
      }
    },
    BusConfig: {
      broker: configs.BUS_BROKER || 'redis',
      namespace: configs.STAGE || 'development',
      messageExpiration: configs.BUS_MESSAGE_EXPIRATION || 3600000,
      url: configs.BUS_URL || configs.REDIS_URL
    },
    Tenants: {
      baseUrl: configs.TENANTS_HOST_URL,
    },
    Bugsnag: {
      type: configs.MONITOR_TYPE,
      service: configs.BUGSNAG_SERVICE_NAME,
      appVersion: configs.BUGSNAG_APP_VERSION,
      key: configs.BUGSNAG_KEY,
    }
  }
  console.log("########## sdk config ==> ", sdkConfigs);
  const sdk = new SDK(sdkConfigs);
  app.use(bodyParser.json());
  // Bugsnag.notifyError('Partner Error!', 1, 'test partner error!');
  Bugsnag.instance.onError("Test error release", '', 'Error Application has crashed!');
  
  //Server status endpoint
  app.get('/status', (req: Request, res: Response) => {
    res.send('Automation service is working!');
  });

  Bus.getInstance().startConsuming();
  Bus.getInstance().on(`${Triggers.EXECUTE_FLOWS_AUTOMATION_EVENTS}.${process.env.SERVICE_NAME}`, async (msg: any, cb: any) => {
    console.log('Intentc from bus intent  execute======> ', msg);
    cb();
    const message = msg.body;
    // const channelType = message.tactfulMessage.channelInfo.type;//EX:facebook, webchat
    // const matchedFlow:any = flowCoordinator.flowManager.getFlowByDetails(message.matchedFlow);
    const partnerFlow = flowCoordinator.flowManager.getFlowByDetails(`${message.matchedFlow.defaultFlowId}`);
    console.log("matchedFlow ==========>", partnerFlow)
    // const matchedFlow = flowCoordinator.getFlowByTrigger(Triggers.INTENT, message.value, channelType);
    partnerFlow?.run(message.tactfulMessage);
  });

  Bus.getInstance().on(`${Triggers.RESUME_FLOWS_AUTOMATION_EVENTS}.${process.env.SERVICE_NAME}`, async (msg: any, cb: any) => {
    console.log('Intentc from bus intent resume ======> ', msg);
    cb();
    const message = msg.body;
    const conversationId = message.tactfulMessage.tactfulUserId!;
    const cacheClient = sdk.redisDialogClient;
    const dialogController = new DialogController(conversationId, cacheClient!);
    const cachedDialog = await dialogController.getDialog();
    const dialog = Dialog.fromJSON(cachedDialog, dialogController);
    await dialog.resume(message.tactfulMessage);
  });
}