const paypal = require("../services/paypal");

const handleCreatePlan = async (req, res) => {
  try {
    const token = await paypal.getAccessToken();
    const product = await paypal.createProduct(token, req.body.product);

    req.body.plan.product_id = product.id;
    const monthlyPlan = await paypal.createPlan(token, req.body.plan.monthly);
    const yearlyPlan = await paypal.createPlan(token, req.body.plan.yearly);

    res.status(200).json({
      monthlyPlanId: monthlyPlan.id,
      yearlyPlanId: yearlyPlan.id
    });
  } catch (err) {
    console.error("❌ Error in PayPal controller:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { handleCreatePlan };
