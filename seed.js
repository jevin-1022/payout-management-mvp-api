require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Vendor = require("./models/Vendor");
const Payout = require("./models/Payout");
const Audit = require("./models/Audit");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    await User.deleteMany();
    await Vendor.deleteMany();
    await Payout.deleteMany();
    await Audit.deleteMany();

    const opsPass = await bcrypt.hash("ops123", 10);
    const finPass = await bcrypt.hash("fin123", 10);

    const users = await User.create([
      { email: "ops@demo.com", password: opsPass, role: "OPS" },
      { email: "finance@demo.com", password: finPass, role: "FINANCE" }
    ]);
    const opsUser = users[0];
    const financeUser = users[1];

    const vendors = await Vendor.create([
      {
        name: "ABC Traders",
        upi_id: "abc@upi",
        bank_account: "1234567890",
        ifsc: "HDFC0001234",
        is_active: true
      },
      {
        name: "XYZ Supplies",
        upi_id: "xyz@upi",
        bank_account: "9876543210",
        ifsc: "ICIC0005678",
        is_active: true
      },
      {
        name: "Global Services",
        upi_id: null,
        bank_account: "5555555555",
        ifsc: "SBIN0009999",
        is_active: true
      }
    ]);

    const payouts = await Payout.create([
      {
        vendor: vendors[0]._id,
        amount: 5000,
        mode: "UPI",
        note: "Office supplies",
        status: "Draft",
        created_by: opsUser._id
      },
      {
        vendor: vendors[1]._id,
        amount: 12000,
        mode: "IMPS",
        note: "Monthly payment",
        status: "Submitted",
        created_by: opsUser._id
      },
      {
        vendor: vendors[2]._id,
        amount: 8000,
        mode: "NEFT",
        note: "Service charge",
        status: "Approved",
        created_by: opsUser._id
      },
      {
        vendor: vendors[0]._id,
        amount: 3000,
        mode: "UPI",
        note: "Extra charges",
        status: "Rejected",
        decision_reason: "Amount mismatch",
        created_by: opsUser._id
      }
    ]);

    await Audit.create([
      { payout: payouts[0]._id, action: "CREATED", performed_by: opsUser._id },
      { payout: payouts[1]._id, action: "CREATED", performed_by: opsUser._id },
      { payout: payouts[1]._id, action: "SUBMITTED", performed_by: opsUser._id },
      { payout: payouts[2]._id, action: "CREATED", performed_by: opsUser._id },
      { payout: payouts[2]._id, action: "SUBMITTED", performed_by: opsUser._id },
      { payout: payouts[2]._id, action: "APPROVED", performed_by: financeUser._id },
      { payout: payouts[3]._id, action: "CREATED", performed_by: opsUser._id },
      { payout: payouts[3]._id, action: "SUBMITTED", performed_by: opsUser._id },
      { payout: payouts[3]._id, action: "REJECTED", performed_by: financeUser._id, reason: "Amount mismatch" }
    ]);

    console.log("✅ Users, Vendors, Payouts & Audits Seeded Successfully");
    process.exit();

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seed();