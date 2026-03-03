const mongoose = require("mongoose");

const AuditSchema = new mongoose.Schema(
  {
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
      required: true,
    },

    action: {
      type: String,
      enum: ["CREATED", "SUBMITTED", "APPROVED", "REJECTED"],
      required: true,
    },

    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);


module.exports = mongoose.model("Audit", AuditSchema);