import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getApkVersion } from "@utils/getApkVersion";
import { TGTG } from "@class/TgTg.class";
import { Main } from "@class/Main.class";
import User, { UserDocument } from "@schema/Users.schema";
import Notifications from "@server/schema/notifications.schema";
import { FavoritesCronJob } from "@utils/CronJobFavoritesBuilder";
import { MongooseError } from "mongoose";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  if (!req.body.email) {
    return res.status(400).json({ status: "KO", message: "Missing email" });
  }

  try {
    const apkVersion = await getApkVersion();
    const { email, password } = req.body;

    if (!password) {
      return res.status(400).json({ status: "KO", message: "password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ status: "KO", message: "Email already registered" });
    }

    const TooGood = new TGTG(email, apkVersion);
    const pollingId = await TooGood.Login();

    const user = new User({
      email,
      password: bcrypt.hashSync(password, 10),
      active: false,
      initInfo: {
        pollingId,
        apkVersion,
      },
      notif: {
        active: false,
        method: "",
        info: "",
      },
    });
    await user.save();

    res
      .status(201)
      .json({ status: "OK", message: "Email registered successfully" });
  } catch (err) {
    console.error("Failed to register:", err);
    res.status(500).json({ status: "KO", message: "Failed to register" });
  }
});

router.post("/validateRegister", async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ status: "KO", message: "Missing email or code" });
  }

  try {
    const user = await User.findOne({ email });

    // Validate the user's state
    if (!user) {
      return res
        .status(404)
        .json({ status: "KO", message: "Email not registered" });
    }
    if (user.active) {
      return res
        .status(400)
        .json({ status: "KO", message: "Email already validated" });
    }
    if (!user.initInfo) {
      console.error("User data is incomplete:", user);
      return res
        .status(500)
        .json({ status: "KO", message: "User data is incomplete." });
    }

    const TooGood = new TGTG(email, user.initInfo.apkVersion);
    try {
      await TooGood.AuthByRequestPin(code, user.initInfo.pollingId);
      const info = await TooGood.Polling(user.initInfo.pollingId);

      await user.updateOne({
        active: true,
        login: {
          accessToken: info.accessToken,
          refreshToken: info.refreshToken,
          tokenAge: info.tokenAge,
          userId: info.userId,
          cookie: info.cookie,
        },
      });

      const updatedUser = await User.findOne({ email });

      if (updatedUser && updatedUser.login) {
        const mainInstance = new Main(
          email,
          user.initInfo.apkVersion,
          updatedUser.login.accessToken,
          updatedUser.login.refreshToken,
          updatedUser.login.userId,
          updatedUser.login.tokenAge,
          updatedUser.login.cookie
        );
        await FavoritesCronJob(mainInstance);
      } else {
        console.error(
          "Failed to initialize Main after validation:",
          updatedUser
        );
      }
    } catch (err: any) {
      return res.status(400).json({ status: "KO", message: err.message });
    }

    res
      .status(200)
      .json({ status: "OK", message: "Account is registered", data: user });
  } catch (err) {
    console.error("Failed to validate:", err);
    res.status(500).json({ status: "KO", message: "Failed to validate" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(401).json({ message: "User is unkown" });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  let userToken = jwt.sign(
    {
      id: user._id,
      isAdmin: user.isAdmin,
      Subscription: user.subscription,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "365 days" }
  );

  res.setHeader("jwt", userToken);
  res.json({
    status: "OK",
    message: "Login successful",
    data: {
      jwt: userToken,
    },
  });
});

router.put("/setpassword", async (req: Request, res: Response) => {
  if (!req.body || req.body.password)
    return res.status(400).send("Body is invalid or does not exist");

  if (!req.header("jwt")) return res.status(400).send("Missing JWT in header");

  const jwtInfo = jwt.verify(
    req.header("jwt") as string,
    process.env.JWT_SECRET as string
  ) as {
    id: string;
    isAdmin: boolean;
    Subscription: string;
  };

  try {
    await User.findByIdAndUpdate(
      { _id: jwtInfo.id },
      { $set: { password: req.body.password } }
    );
    return res.send({
      status: "OK",
      message: `Password updated correctly for ${jwtInfo.id}`,
    });
  } catch (e: MongooseError | any) {
    return res.status(400).send({ status: "KO", message: e.message });
  }
});

router.post("/set-notif", async (req: Request, res: Response) => {
  const { method, info } = req.body;
  if (!method || !info) {
    return res
      .status(400)
      .json({ status: "KO", message: "Missing method or info" });
  }
  if (!req.header("jwt"))
    return res
      .status(400)
      .send({ status: "KO", message: "Missing JWT in header" });

  const jwtInfo = jwt.verify(
    req.header("jwt") as string,
    process.env.JWT_SECRET as string
  ) as {
    id: string;
    isAdmin: boolean;
    Subscription: string;
  };

  try {
    await User.findByIdAndUpdate(
      { _id: jwtInfo.id },
      { $set: { notif: { active: true, method, info, quantity: 0 } } }
    );
    return res.send({
      status: "OK",
      message: `Notification method updated correctly for ${jwtInfo.id}`,
    });
  } catch (e: MongooseError | any) {
    return res.status(400).send({ status: "KO", message: e.message });
  }
});

router.get("/refresh-jwt", async (req: Request, res: Response) => {
  const jwtInfo = jwt.verify(
    req.header("jwt") as string,
    process.env.JWT_SECRET as string
  ) as {
    id: string;
    isAdmin: boolean;
    Subscription: string;
  };

  if (!jwtInfo) {
    return res.status(400).json({ status: "KO", message: "Missing JWT" });
  }

  const user = await User.findById(jwtInfo.id);
  if (!user) {
    return res.status(400).json({ status: "KO", message: "User not found" });
  }

  if (jwtInfo.Subscription !== user.subscription) {
    let userToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        Subscription: user.subscription,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "365 days" }
    );
    return res.status(400).json({ status: "OK", message: "Subscription changed", data: userToken });
  }
  return res.status(400).json({ status: "KO", message: "Subscription not changed" });
});

export default router;
