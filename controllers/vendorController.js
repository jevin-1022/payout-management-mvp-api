const Vendor = require("../models/Vendor");

exports.list = async (req, res) => {
  try {
    const vendors = await Vendor.find().lean();
    res.json(vendors); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, upi_id, bank_account, ifsc } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Vendor name required" });
    }

    const vendor = await Vendor.create({
      name,
      upi_id: upi_id || null,
      bank_account: bank_account || null,
      ifsc: ifsc || null,
      is_active: true
    });

    res.json({ success: true, message: "Vendor created", vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};