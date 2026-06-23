import Progress    from "../models/Progress.js";
import { getUserId } from "../utils/getUserId.js";

// GET /api/progress
export const getProgress = async (req, res, next) => {
  try {
    const userId   = await getUserId(req.auth.payload.sub);
    let   progress = await Progress.findOne({ userId });

    if (!progress) progress = await Progress.create({ userId });

    res.json(progress);
  } catch (err) {
    next(err);
  }
};

// PUT /api/progress
export const updateProgress = async (req, res, next) => {
  try {
    const userId = await getUserId(req.auth.payload.sub);
    const { currentLevel, tutorialSeen, minigamesCompleted, flags, completedAt } = req.body;

    const $set = { updatedAt: new Date() };

    if (currentLevel       !== undefined) $set.currentLevel       = currentLevel;
    if (tutorialSeen       !== undefined) $set.tutorialSeen       = tutorialSeen;
    if (minigamesCompleted !== undefined) $set.minigamesCompleted = minigamesCompleted;
    if (completedAt        !== undefined) $set.completedAt        = completedAt;

    // Merge de flags individuales (evita sobreescribir el objeto entero)
    if (flags) {
      for (const [key, value] of Object.entries(flags)) {
        $set[`flags.${key}`] = value;
      }
    }

    const progress = await Progress.findOneAndUpdate(
      { userId },
      { $set },
      { new: true }
    );

    res.json(progress);
  } catch (err) {
    next(err);
  }
};