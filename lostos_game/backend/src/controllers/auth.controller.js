import User from "../models/User.js";

export const login = async (req, res, next) => {
  try {
    const payload = req.auth.payload;
    const auth0Id = payload.sub;

    const namespace = "https://skere-api";
    const email = payload[`${namespace}/email`] || "";

    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = await User.create({ auth0Id, email, username: null, usernameSet: false });
      console.log("🆕 Usuario nuevo creado:", auth0Id);
    } else if (email && user.email !== email) {
      user.email = email;
      await user.save();
    }

    res.json({
      message: "Login exitoso",
      user,
      needsUsername: !user.usernameSet,
    });
  } catch (error) {
    next(error);
  }
};

export const setUsername = async (req, res, next) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { username } = req.body;

    const clean = (username || "").trim();

    if (clean.length < 3 || clean.length > 20) {
      const err = new Error("El nombre de usuario debe tener entre 3 y 20 caracteres.");
      err.status = 400;
      throw err;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      const err = new Error("Solo se permiten letras, números y guiones bajos.");
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ auth0Id });
    if (!user) {
      const err = new Error("Usuario no encontrado");
      err.status = 404;
      throw err;
    }

    const taken = await User.findOne({ username: clean });
    if (taken && String(taken._id) !== String(user._id)) {
      const err = new Error("Ese nombre de usuario ya está en uso.");
      err.status = 409;
      throw err;
    }

    user.username = clean;
    user.usernameSet = true;
    await user.save();

    res.json({ message: "Username guardado", user });
  } catch (error) {
    next(error);
  }
};