import {
  bool,
  Canister,
  ic,
  init,
  nat64,
  query,
  Record,
  SecureHash,
  text,
  update,
  Vec,
  Void,
} from 'azle';
import { v4 as uuidv4 } from 'uuid';

const Session = Record({
  createdAt: nat64,
  length: nat64,
});

type Identifier = text;
type Password = SecureHash; // Use SecureHash for password hashing
type Apikey = text;

let SessionLength: number = 10;

const UsersDB = new Vec<Record<Identifier, Password>>();

const SessionStore = new Vec<Record<Apikey, Session>>();

export default Canister({
  init: init(async () => {
    await ic.setTimer(BigInt(10), () => {
      const currentTime = ic.time();
      SessionStore.forEach((sessionRecord, index) => {
        const session = sessionRecord.unwrap();
        if (session && currentTime > session.createdAt + session.length) {
          SessionStore.splice(index, 1);
        }
      });
    });
  }),

  // User
  SignUp: update(
    [Identifier, Password],
    Apikey,
    async (identifier: Identifier, password: Password) => {
      try {
        const apikey = uuidv4();
        if (UsersDB.find((user) => user.identifier === identifier)) {
          throw new Error(`User with id ${identifier} already exists`);
        }

        UsersDB.push(Record({ identifier, password }));
        const newSession: typeof Session = {
          createdAt: ic.time(),
          length: BigInt(SessionLength * 10 ** 9),
        };
        SessionStore.push(Record({ apikey, session: newSession }));
        return apikey;
      } catch (error) {
        throw new Error('An error occurred during SignUp');
      }
    }
  ),

  SignIn: update(
    [Identifier, Password],
    Apikey,
    async (id: Identifier, password: Password) => {
      try {
        const user = UsersDB.find((u) => u.identifier === id);
        if (user) {
          if (user.password.validate(password)) {
            const key = uuidv4();
            const newSession: typeof Session = {
              createdAt: ic.time(),
              length: BigInt(SessionLength * 10 ** 9),
            };
            SessionStore.push(Record({ apikey: key, session: newSession }));
            return key;
          }
        }
        throw new Error('Invalid credentials');
      } catch (error) {
        throw new Error('An error occurred during SignIn');
      }
    }
  ),

  // Session
  HasSession: query([Apikey], bool, async (apiKey: Apikey) => {
    try {
      const currentTime = ic.time();
      const sessionRecord = SessionStore.find((record) => record.apikey === apiKey);
      if (sessionRecord) {
        const session = sessionRecord.unwrap().session;
        return currentTime <= session.createdAt + session.length;
      }
      return false;
    } catch (error) {
      throw new Error('An error occurred during HasSession');
    }
  }),

  SetSessionLength: update([nat64], Void, async (length: nat64) => {
    if (length > 0) {
      SessionLength = Number(length);
    }
  }),
});

// Document endpoints for your api here brother
