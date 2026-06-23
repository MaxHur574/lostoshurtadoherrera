import User from "../models/User.js";

/**
 * Dado el sub de Auth0, retorna el _id de MongoDB del usuario.
 * Lanza un error 404 si el usuario no existe.
 */
export async function getUserId(auth0Id) {
  const user = await User.findOne({ auth0Id }).select("_id").lean();
  if (!user) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
  return user._id;
}