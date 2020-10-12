import IGameUser from '../interfaces/GamerUser';
import path from 'path';
import { bcryptAsync, bcryptCheckAsync } from '../utils/bcrypt-async-helper';
const debug = require('debug')('game-project');
import { ApiError } from '../errors/apiError'

 
function returnAnyPromise<T>(val: T | null, err: string='Unknown Error', code:number=500): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (!val) { reject(new ApiError(err,code) )}
      else resolve(val);
    }, 0);
  })
}


export default class UserFacade {

  public static users:Array<IGameUser> = [
    { name: "Peter Pan", userName: "pp@b.dk", password: "secret", role: "user" },
    { name: "Donald Duck", userName: "dd@b.dk", password: "secret", role: "user" },
    { name: "admin", userName: "admin@a.dk", password: "secret", role: "admin" }
 ];
 

  static async addUser(user: IGameUser): Promise<string> {
    const hash = await bcryptAsync(user.password);
    let newUser = {
      ...user,
      password: hash
    }
    UserFacade.users.push(newUser);
    return returnAnyPromise<string>('User was added');
  }

  static async deleteUser(userName: string): Promise<string> {
    const remainingUsers = UserFacade.users.filter(u => u.userName != userName);
    UserFacade.users = [...remainingUsers]
    return returnAnyPromise<string>(`User ${userName} deleted`);
  }

  static async getAllUsers(): Promise<Array<IGameUser>> { 
    return returnAnyPromise<Array<IGameUser>>(UserFacade.users);
  }

  static async getUser(userName: string): Promise<IGameUser> {
    let user: IGameUser | undefined;
    user = UserFacade.users.find(u => u.userName === userName)
    if (user) {
      return returnAnyPromise<IGameUser>(user);
    }
    return returnAnyPromise<IGameUser>(null, 'User not found', 404);
    }


  static async checkUser(userName: string, password: string): Promise<boolean> {
    try {
      let user: IGameUser | undefined;
      user = await UserFacade.getUser(userName);
      return bcryptCheckAsync(password, user.password);
    }catch (err) {
      return returnAnyPromise<boolean>(false);
    }
  }
}
  async function test() {
    console.log("testing")
    await UserFacade.addUser({ name: "kim", userName: "kim@b.dk", password: "secret", role: "user" })
    await UserFacade.addUser({ name: "ole", userName: "ole@b.dk", password: "secret", role: "user" })
    const all = await (await UserFacade.getAllUsers()).length;
    debug("users",all);
    const peter = await UserFacade.getUser("kim@b.dk");
    debug("Found Kim",peter.userName)
    await UserFacade.deleteUser("ole@b.dk");
    try {
        const donald = await UserFacade.getUser("ole@b.dk")
    } catch (err) {
       debug("Could not find ole",err)
    }
    try{
    const ok= await UserFacade.checkUser("kim@b.dk","secret");
    debug("Password and user was OK",ok)
    await UserFacade.checkUser("pp@b.dk","wrong password");
    debug("I should not get here")
    } catch (err){
      debug("Password did not match")
    }
  
}
//test();
