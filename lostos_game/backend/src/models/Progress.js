import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "User",
    required: true,
    unique:   true,
  },

  currentLevel:       { type: Number,  default: 1 },
  tutorialSeen:       { type: Boolean, default: false },
  minigamesCompleted: { type: [String], default: [] }, // ["Pista_1", "Pista_2", ...]

  flags: {
    readUrgenteLeer:       { type: Boolean, default: false },
    unlockedInvestigacion: { type: Boolean, default: false },
    completedAllMinigames: { type: Boolean, default: false },
    unlockedDecryptor:     { type: Boolean, default: false },
    vaultFinalUnlocked:    { type: Boolean, default: false },
  },

  startedAt:   { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  updatedAt:   { type: Date, default: Date.now },
});

export default mongoose.model("Progress", progressSchema);