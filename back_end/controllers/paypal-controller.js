const paypal = require("../services/paypal");

const handleCreatePlan = async (request, response) => {
  try {
    const token = await paypal.getAccessToken();
    const product = await paypal.createProduct(token, request.body.product);

    request.body.plan.product_id = product.id;
    const monthlyPlan = await paypal.createPlan(token, request.body.plan.monthly);
    const yearlyPlan = await paypal.createPlan(token, request.body.plan.yearly);

    response.status(200).json({
      monthlyPlanId: monthlyPlan.id,
      yearlyPlanId: yearlyPlan.id
    });
  } catch (error) {
    console.error("❌ Error in PayPal controller:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { handleCreatePlan };
