import { AuthTokenService, FlowManager, Triggers } from "automation-sdk";
import { TactfulMessage } from "@tactful/common";
import { facebookGreet, facebookMainMenu } from "./facebook-flows";
import { webchatGreet, webchatMainMenu } from "./webchat-flows";
import { whatsappGreet, whatsappMainMenu } from "./whatsapp-flows";
import axios from "axios";
import configs from "../configs";

export class FlowCoordinator {
    flowManager: FlowManager;
    authTokenService?: AuthTokenService;
    constructor() {
        this.flowManager = new FlowManager();
        this.authTokenService = AuthTokenService.configure({
            clientId: configs.CLIENT_ID,
            clientSecret: configs.CLIENT_SECRET,
            tokenEndpoint: configs.TOKEN_URL
        })
    }

    setupFlows() {
        this.flowManager.setupNewFlow(facebookGreet());
        this.flowManager.setupNewFlow(facebookMainMenu());
        /////////////////webchat////////////////////
        this.flowManager.setupNewFlow(webchatGreet());
        this.flowManager.setupNewFlow(webchatMainMenu());
        // ////////////////whatsapp//////////////////////////
        this.flowManager.setupNewFlow(whatsappGreet());
        this.flowManager.setupNewFlow(whatsappMainMenu());
        console.log("after setuuuuuup all ==> ", JSON.stringify(FlowManager.flowTriggers))

        ///////////////////////////////////////////////////////////
        // this.flowManager.setupNewFlow(conversationAssignedToQueue());
        // this.flowManager.setupNewFlow(service());
        // this.flowManager.setupNewFlow(demo());
    }

    getFlowByTrigger(trigger: Triggers, intent: string, platformType: string) {
        return this.flowManager.getFlowByTrigger(trigger, intent, platformType);
    }

    async syncFlows() {
        const url = `${process.env.AUTOMATION_API_HOST_URL}/default-flows/sync`;
        const defaultFlowsData = this.flowManager.getDefaultFlowsData();
        const body = JSON.parse(JSON.stringify(defaultFlowsData));
        try {
            const token = await this.authTokenService?.getToken();
            const response = await axios.post(url, body, {headers: {Authorization: token}});
            console.log('synced flows with api', response.status);
            console.log(defaultFlowsData);
        } catch(error){
            console.log('Could not sync with api', error);
        }
    }

    async handleIncommingMessage(tactfulMessage: TactfulMessage) {
        //     console.log('received message =============', tactfulMessage);
        //     const conversationId = tactfulMessage.tactfulUserId;
        //     if (!conversationId) return;
        //     const cacheClient = RedisClient.dialogInstance
        //     ;
        //     const dialogController = new DialogController(conversationId, cacheClient);

        //     // const dialog = new LocalStorage().findDialog(conversationId);
        //     const dialogJson = await dialogController.getDialog();
        //     if (dialogJson) {
        //         const dialog = Dialog.fromJSON(dialogJson, dialogController);
        //         // console.log("accccccccccept ==> ",acceptHandover)
        //         // if(acceptHandover)return;
        //         const resume = await dialog.resume(tactfulMessage);
        //         console.log('resume -----------', resume);
        //         if (!resume ) {
        //             // console.log("accccccccccept resume==> ",acceptHandover)
        //             const acceptHandover = Boolean(await dialog.context.getParam("accept_handover"))//////
        //             console.log("acceptHandover =====> ",acceptHandover)
        //             if(acceptHandover)return;
        //             console.log('starting new dialog no resume');
        //             this.flowManager.publishIntent(tactfulMessage);
        //             dialogController.deleteDialog();
        //         }
        //         return;
        //     }
        //     console.log('starting new dialog no conversation');
        //     this.flowManager.publishIntent(tactfulMessage);
        //     // if (!conversation || !await conversation.resume(tactfulMessage)) {
        //     //     //get skill
        //     //     const matchedFlow = await this.getFlowByMessage(tactfulMessage);
        //     //     //create convo + pass skill
        //     //     if (matchedFlow) {
        //     //         console.log("matched flow", matchedFlow);
        //     //         const cacheClient = new RedisClient();
        //     //         const context = new Context(conversationId, cacheClient);
        //     //         const newDialog = new Dialog(conversationId, matchedFlow, context);
        //     //         //convo.resume
        //     //         await newDialog.resume(tactfulMessage);
        //     //     }
        //     //     else {
        //     //         //say I can't understand please try again
        //     //         // const confusionRply = prepareTextMessage(tactfulMessage, ' can not understand, please try again!');
        //     //         // await channels.say(confusionRply);
        //     //         // producer.produceText(tactfulMessage, 'can not understand, please try again!');

        //     //     }
        //     // }
    }
}

