import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import {
  getUserByEmailIdAndPassword,
  getUserById,
} from "../controller/userController";

// ⭐ TODO for Students: Fix Passport Types so they don't say any
const localLogin = new LocalStrategy(
  {
    usernameField: "uname",
    passwordField: "password",
  },
  async (
    uname: string,
    password: string,
    done: (
      error: any,
      user?: Express.User | false,
      options?: IVerifyOptions
    ) => void
  ) => {
    // ⭐ TODO for Students: Show the login error message on the login page
    const user = await getUserByEmailIdAndPassword(uname, password);
    return user
      ? done(null, user)
      : done(null, false, {
          message: "Your login details are not valid. Please try again.",
        });
  }
);

// ⭐ TODO for Students: Fix Passport Types so they don't say any
passport.serializeUser(function (
  user: Express.User,
  done: (err: any, id?: number) => void
) {
  console.log("Serializing user:", user);

  done(null, user.id);
});

// ⭐ TODO for Students: Fix Passport Types so they don't say any
passport.deserializeUser(function (id: any, done: any) {
  const user = getUserById(id);
  console.log("Deserializing user ID:", id);

  if (user) {
    done(null, user);
  } else {
    done({ message: "User not found" }, null);
  }
});

export default passport.use(localLogin);
