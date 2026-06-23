import User from "../models/User.js";

export const login = async (req, res, next) => {
  try {
    const payload = req.auth.payload;
    const auth0Id = payload.sub;

    const namespace = "https://skere-api";
    const email    = payload[`${namespace}/email`] || "";
    const username = payload[`${namespace}/name`] || email || auth0Id;

    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = await User.create({ auth0Id, username, email });
      console.log("🆕 Usuario nuevo creado:", auth0Id);
    } else if (email && user.email !== email) {
      user.email = email;
      await user.save();
    }

    res.json({ message: "Login exitoso", user });
  } catch (error) {
    next(error);
  }
};