const Payout = require("../models/Payout");
const Audit = require("../models/Audit");

async function addAudit(payoutId, action, userId, reason = null) {
  await Audit.create({
    payout: payoutId,
    action,
    performed_by: userId,
    reason,
  });
}

exports.create = async (req, res) => {
  try {
    const { vendor_id, amount, mode, note } = req.body;

    if (!vendor_id || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payout data" });
    }

    const payout = await Payout.create({
      vendor: vendor_id, 
      amount,
      mode,
      note: note || null,
      status: "Draft",
      created_by: req.user.id,
    });

    await addAudit(payout._id, "CREATED", req.user.id);

    res.json({ success: true, message: "Draft Created", payout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.list = async (req, res) => {
  try {
    const { status, vendor } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (vendor) filter.vendor = vendor;

    const payouts = await Payout.find(filter).populate("vendor").lean();
    res.json(payouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.submit = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout || payout.status !== "Draft") {
      return res.status(400).json({ success: false, message: "Invalid status transition" });
    }

    payout.status = "Submitted";
    await payout.save();

    await addAudit(payout._id, "SUBMITTED", req.user.id);

    res.json({ success: true, message: "Submitted", payout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.approve = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout || payout.status !== "Submitted") {
      return res.status(400).json({ success: false, message: "Invalid status transition" });
    }

    payout.status = "Approved";
    await payout.save();

    await addAudit(payout._id, "APPROVED", req.user.id);

    res.json({ success: true, message: "Approved", payout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.reject = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ success: false, message: "Rejection reason required" });

    const payout = await Payout.findById(req.params.id);

    if (!payout || payout.status !== "Submitted") {
      return res.status(400).json({ success: false, message: "Invalid status transition" });
    }

    payout.status = "Rejected";
    payout.decision_reason = reason;
    await payout.save();

    await addAudit(payout._id, "REJECTED", req.user.id, reason);

    res.json({ success: true, message: "Rejected", payout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id).populate("vendor");

    if (!payout) return res.status(404).json({ success: false, message: "Payout not found" });

    const audits = await Audit.find({ payout: payout._id }).sort({ createdAt: 1 }).lean();

    res.json({ success: true, payout, audits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};