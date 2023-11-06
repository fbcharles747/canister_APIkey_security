import { bool, Canister, float64, ic, init, nat64, query, Record, StableBTreeMap, text, update, Vec, Void } from 'azle';
import { v4 as uuidv4 } from 'uuid'

const Session = Record({
  createdAt: nat64,
  length: nat64
})

const Identifier = text
const Password = text
const Apikey = text

let SessionLength: number = 10

const UsersDB = StableBTreeMap(Identifier, Password, 0)

const SessionStore = StableBTreeMap(Apikey, Session, 1)

export default Canister({
  init: init([], async () => {
    ic.setTimerInterval(BigInt(10), async () => {
      const keys: string[] = SessionStore.keys()
      keys.forEach((key) => {
        const session: typeof Session = SessionStore.get(key).Some;
        if (session && (ic.time() > (session.createdAt + session.length))) {
          SessionStore.remove(key);
        }
      })
    })
  }),
  // User
  SignUp: update([Identifier, Password], Apikey, async (identifier: string, password: string) => {
    const apikey: string = uuidv4()
    if (UsersDB.containsKey(identifier)) return `user with id=${identifier} already exists`

    UsersDB.insert(identifier, password)
    const newSession: typeof Session = {
      createdAt: ic.time(),
      length: BigInt(SessionLength * (10 ** 9)),
    }
    SessionStore.insert(apikey, newSession)
    return apikey
  }),
  SignIn: update(
    [Identifier, Password],
    Apikey,
    async (id: string, password: string) => {
      if (UsersDB.containsKey(id)) {
        if (password === UsersDB.get(id).Some) {
          const key: string = uuidv4()
          const newSession: typeof Session = {
            createdAt: ic.time(),
            length: BigInt(SessionLength * (10 ** 9)),
          }
          SessionStore.insert(key, newSession)
          console.log(`created time: ${newSession.createdAt}`)
          return key
        }
      }
      return ""
    }
  ),
  // Session
  HasSession: query(
    [Apikey],
    bool,
    async (apiKey: string) => {
      if (SessionStore.containsKey(apiKey)) {
        const userSession: typeof Session = SessionStore.get(apiKey).Some
        console.log(`session validate time ${ic.time()}`)
        return ic.time() <= (userSession.createdAt + userSession.length)
      }
      return false
    }
  ),
  SetSessionLength: update(
    [float64],
    Void,
    async (length: number) => {
      if (length > 0) {
        SessionLength = length
      }
    }
  ),
  // New Functions
  // Function 1: UpdatePassword
  UpdatePassword: update(
    [Identifier, Password, Password],
    bool,
    async (id: string, oldPassword: string, newPassword: string) => {
      if (UsersDB.containsKey(id) && UsersDB.get(id).Some === oldPassword) {
        UsersDB.insert(id, newPassword);
        return true;
      }
      return false;
    }
  ),
  // Function 2: DeleteUser
  DeleteUser: update(
    [Identifier],
    bool,
    async (id: string) => {
      if (UsersDB.containsKey(id)) {
        UsersDB.remove(id);
        return true;
      }
      return false;
    }
  ),
  // Function 3: GetSessionCreationTime
  GetSessionCreationTime: query(
    [Apikey],
    nat64,
    async (apiKey: string) => {
      if (SessionStore.containsKey(apiKey)) {
        const userSession: typeof Session = SessionStore.get(apiKey).Some;
        return userSession.createdAt;
      }
      return 0;
    }
  ),
  // Function 4: GetAllUserIds
  GetAllUserIds: query(
    [],
    Vec(Identifier),
    async () => {
      return UsersDB.keys();
    }
  ),
  // Function 5: GetUserCount
  GetUserCount: query(
    [],
    nat64,
    async () => {
      return UsersDB.size();
    }
  ),
  // Function 6: GetSessionCount
  GetSessionCount: query(
    [],
    nat64,
    async () => {
      return SessionStore.size();
    }
  ),
  // Function 7: ExtendSession
  ExtendSession: update(
    [Apikey, float64],
    bool,
    async (apiKey: string, extension: number) => {
      if (SessionStore.containsKey(apiKey)) {
        const userSession: typeof Session = SessionStore.get(apiKey).Some;
        userSession.length += BigInt(extension * (10 ** 9));
        SessionStore.insert(apiKey, userSession);
        return true;
      }
      return false;
    }
  ),
  // Function 8: RemoveSession
  RemoveSession: update(
    [Apikey],
    bool,
    async (apiKey: string) => {
      if (SessionStore.containsKey(apiKey)) {
        SessionStore.remove(apiKey);
        return true;
      }
      return false;
    }
  ),
});
