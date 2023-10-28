import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getApkVersion } from "@utils/getApkVersion";
import { TGTG } from "@class/TgTg.class";
import { Main } from "@class/Main.class";
import User, { UserDocument } from "@schema/Users.schema";
import Notifications from "@server/schema/notifications.schema";
import { FavoritesCronJob } from "@utils/CronJobFavoritesBuilder";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  if (!req.body.email) {
    return res.status(400).json({ message: "Missing email" });
  }

  try {
    const apkVersion = await getApkVersion();
    const { email, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
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
    });
    await user.save();

    res.status(201).json({ message: "Email registered successfully" });
  } catch (err) {
    console.error("Failed to register:", err);
    res.status(500).json({ message: "Failed to register" });
  }
});

router.post("/validateRegister", async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Missing email or code" });
  }

  try {
    const user = await User.findOne({ email });

    // Validate the user's state
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }
    if (user.active) {
      return res.status(400).json({ message: "Email already validated" });
    }
    if (!user.initInfo) {
      console.error("User data is incomplete:", user);
      return res.status(500).json({ message: "User data is incomplete." });
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
      return res.status(400).json({ message: err.message });
    }

    res.status(200).json({ message: "Account is registered", user });
  } catch (err) {
    console.error("Failed to validate:", err);
    res.status(500).json({ message: "Failed to validate" });
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
    message: "Login successful",
    data: {
      jwt: userToken
    }
  });
});

router.put("/setpassword/:id", async (req: Request, res: Response) => {
  if (!req.body || req.body.password)
    return res.status(400).send("Body is invalid or does not exist");

  try {
    await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { password: req.body.password } }
    );
    return res.send(`Password updated correctly for ${req.params.id}`);
  } catch (e) {
    return res
      .status(400)
      .send("The user is unknown or the update could not be applied");
  }
});

export default router;
