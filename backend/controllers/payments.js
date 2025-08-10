const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Shop = require('../models/Shop');

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private (Customer)
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId, amount, currency = 'usd' } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Amount in cents
      currency: currency,
      metadata: {
        orderId: orderId.toString(),
        customerId: req.user.id.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    order.paymentInfo.paymentIntentId = paymentIntent.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment intent creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm-payment
// @access  Private (Customer)
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID and Order ID are required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentInfo.paymentStatus = 'completed';
        order.paymentInfo.transactionId = paymentIntent.id;
        order.paymentInfo.paidAt = new Date();
        
        // Update order status to confirmed if it's still placed
        if (order.status === 'placed') {
          order.status = 'confirmed';
        }

        await order.save();

        // Emit real-time event
        if (req.io) {
          req.io.to(`shop_${order.shop}`).emit('payment_received', {
            orderId: order._id,
            amount: order.pricing.total
          });
        }

        res.status(200).json({
          success: true,
          message: 'Payment confirmed successfully',
          data: {
            orderId: order._id,
            paymentStatus: order.paymentInfo.paymentStatus
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        paymentStatus: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment confirmation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      
      // Update order status
      if (paymentIntent.metadata.orderId) {
        const order = await Order.findById(paymentIntent.metadata.orderId);
        if (order) {
          order.paymentInfo.paymentStatus = 'completed';
          order.paymentInfo.transactionId = paymentIntent.id;
          order.paymentInfo.paidAt = new Date();
          
          if (order.status === 'placed') {
            order.status = 'confirmed';
          }
          
          await order.save();
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed!', failedPayment.id);
      
      // Update order status
      if (failedPayment.metadata.orderId) {
        const order = await Order.findById(failedPayment.metadata.orderId);
        if (order) {
          order.paymentInfo.paymentStatus = 'failed';
          await order.save();
        }
      }
      break;

    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!', paymentMethod.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Create Stripe customer
// @route   POST /api/payments/create-customer
// @access  Private (Customer)
exports.createCustomer = async (req, res, next) => {
  try {
    const { email, name, phone } = req.body;

    const customer = await stripe.customers.create({
      email: email || req.user.email,
      name: name || req.user.name,
      phone: phone || req.user.phone,
      metadata: {
        userId: req.user.id.toString()
      }
    });

    res.status(200).json({
      success: true,
      data: {
        customerId: customer.id
      }
    });
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Customer creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get customer payment methods
// @route   GET /api/payments/payment-methods
// @access  Private (Customer)
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.status(200).json({
      success: true,
      data: paymentMethods.data
    });
  } catch (error) {
    console.error('Payment methods retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};
