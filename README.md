# summary
- [summary](#summary)
  - [Project motivation](#project-motivation)
    - [introduction](#introduction)
    - [API security](#api-security)
    - [implementation of canister architecture](#implementation-of-canister-architecture)
  - [API](#canister-api)
  - [Original README from dfx](#original-readme-from-dfx)
  



## Project motivation

### introduction
Canister on never down blockchain network is a beautiful system where deploying process is made easy. In this project, `azle` library is used to take care of data serialization and storage on the blockchain network. While this project is not a complicated system, it appears to be an reusable canister unit taking of simple API security use case.

### API security

API key security is the simplest security nowaday. Instead of user retrieving the data from its ID and having access to the data forever, API key add one more security layer to the public API. 
When a user login, they get an API key and a time window to interact with the protected resource. On the other hand, protected resource having access to the security database will check if the incoming request have a valid API key within the specified time window. 

### implementation of canister architecture
Given that `azle` library lack of sophisticated data validation logic, "Canister Architecture" seems to encourage simple logic within each canister. Still, this architecture is capable of building more complicated system and usecase. To do so, we just need to have enough reusable canister unit put together. This project is one example of API security which can be reusable in other API project.

[<< back to summary](#summary)

## Canister API

The following table shows the API of this canister unit. 
Sadly, we will not have access to UI on GitHub codescpace. To interact with this canister, we have to use bash environment with `dfx` installed. here is an example interacting with `SignUp`.

```bash
dfx canister call simple_apikey_security SignUp '("Charle","123")'
```
> Note that session length is defaulted to 10 seconds. If you are using command line, I recomend using `SetSessionLength` to set session length longer, so the API key won't expire while you are typing the other command.

```bash
dfx canister call simple_apikey_security SetSessionLength '(30.0)'
```
| Method         | Arguments                       | Returns                | Description                                                                                                                                                            |
|----------------|---------------------------------|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SignUp`       | `[Identifier, Password]`         | `Apikey \| string`     | Creates a new user with the provided identifier and password. Returns an API key upon successful registration. Returns an error message if user already exists.     |
| `SignIn`       | `[Identifier, Password]`         | `Apikey \| string`     | Validates user credentials and returns an API key upon successful login. Returns an empty string if authentication fails.                                        |
| `HasSession`   | `[Apikey]`                       | `bool`                 | Checks if a valid session exists for the provided API key. Returns `true` if a valid session is found, `false` otherwise.                                            |                                                                                                                      |
| `SetSessionLength` | `[float64]`                 | `Void`                  | Sets the length of a session in seconds. Requires a positive non-zero value for the session length. The session length is defaulted to 10s if not set otherwise.                                                               |

[<< back to summary](#summary)



## Original README from dfx 
Welcome to your first Azle project! This example project will help you to deploy your first canister (application) to the Internet Computer (IC) decentralized cloud. It is a simple getter/setter canister. You can always refer to [The Azle Book](https://demergent-labs.github.io/azle/) for more in-depth documentation.

`dfx` is the tool you will use to interact with the IC locally and on mainnet. If you don't already have it installed:

```bash
npm run dfx_install
```

Next you will want to start a replica, which is a local instance of the IC that you can deploy your canisters to:

```bash
npm run replica_start
```

If you ever want to stop the replica:

```bash
npm run replica_stop
```

Now you can deploy your canister locally:

```bash
npm install
npm run canister_deploy_local
```

To call the methods on your canister:

```bash
npm run canister_call_get_message
npm run canister_call_set_message
```

If you run the above commands and then call `npm run canister_call_get_message` you should see:

```bash
("Hello world!")
```

Assuming you have [created a cycles wallet](https://internetcomputer.org/docs/current/developer-docs/quickstart/network-quickstart) and funded it with cycles, you can deploy to mainnet like this:

```bash
npm run canister_deploy_mainnet
```
[<< back to summary](#summary)



