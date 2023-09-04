# Automation SDK Partner #


The Automation-SDK-Partner is a project that utilizes the Automation-SDK, enabling users to create custom automation flows for messaging platforms (Facebook, WhatsApp and Webchcat). These created flows are dynamic and can be used to create simple or complex flows using a set of steps. Furthermore, this project has a command-line interface (CLI) that makes it easy to create and customize automation flows using code templates.

|Latest Version | Stable Version |
| --- | --- |
| v1.0.24 | --- |

## How do I get set up? ##

* `npm run login` ([Guide](https://sitalks.atlassian.net/wiki/spaces/Janus/pages/1943175169/AWS+Code+Artifact+Login))
* `npm install`
* `npm run build`
* `sh setup.sh`

## How do I run? ##
In case of you need to run locally
* ```npm run dev```
In case of you need to run locally and use other services of QA and redis bus/cach
* ```npm run qa```


## Features ##

### Listeners

By providing the suitable values of the environment variables to the SDK Configs object, the partner could listen to "TactfulBus" (which is considered a message queuing service) events. The available listeners are:

- **INTENT**: Partner can listen to intent. After receiving a message and parsing it using the NLU-Service, we can get the intent of that message. Depending on the intent value, a specific flow will be triggered.
- **MESSAGE**: By receiving any message from one of the messaging platforms (e.g., Facebook), the partner can listen to this message and take an action by triggering a specific flow.
- **BUS_EVENTS** and **AUTOMATION_EVENTS**: Depend on firing events from TactfulBus or Automation-SDK-Partner itself, the target flow can be up and running.

### Command-Line-Interface

By using the following command `npm run generate`, The command will prompt you to provide some information about the flow you want to create, including the messaging platform you're targeting and the types of actions you want to include in your flow.

Once you've created your flow file, you can customize it using the Automation SDK package. The flow file includes a variety of pre-built components that you can use to create your custom automation flows. The CLI asks you some questions, and you have to choose what you want. Examples of these questions are:

- "Enter the filename:"
- "Choose The Flow Type:" (e.g., Facebook, WhatsApp or Webchat)

## Usage ##

Once the package and its dependencies are installed, you can use this command

```npm run generate```

After creating the file which contains your new flow, you probably have code like this:

```javascript
import { FacebookFlow, Triggers } from 'automation-sdk';

export function greet() {
    const greetingFlow = new FacebookFlow("greeting", "sdk", "1.0");
    greetingFlow
        .on(Triggers.INTENT, "RESTART")
        .text([['Welcome to the first flow', 1]])
    return greetingFlow;
}
```
In this example, `greetingFlow` is a new instance of `FacebookFlow`, which has a "greeting" name, "sdk" category with the 1.0 version number. You can access the available steps for `FacebookFlow` using the greetingFlow instance. In the example, we used `on` and `text` steps, and there were a set of steps like:

* text
* randomText
* userInput
* carousel
* quickReply
* dynamicCarousel
* dynamicQuickReply
* setVariable
* config
* action
* fire
* jump
* api
* on
* if
* check
* setReminder
* stopReminder

You can follow the guidelines of the Automation-SDK [Documentation](https://sitalks.atlassian.net/wiki/spaces/Janus/pages/1942913624/Steps) (steps section) to learn more about these steps.

## Documentation ##

[Automation SDK Partner Documentation](https://sitalks.atlassian.net/wiki/spaces/Janus/pages/1939505157/Automation+SDK+Partner)


## Changelog Document ##

For the latest chenges browse the [Changelog](./CHANGELOG.md )
