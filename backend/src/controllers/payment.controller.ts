import crypto from 'crypto';
import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { createOrderSchema } from '../utils/validators.js';

const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret
});

export const createOrder = async (req: Request, res: Response) => {
  const data = createOrderSchema.parse(req.body);
  const course = await prisma.course.findUnique({ where: { id: data.courseId } });
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const amountInPaise = Math.round(Number(course.price) * 100);
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `course-${course.id.slice(0, 8)}-${Date.now()}`,
    notes: { courseId: course.id, userId: req.auth!.userId }
  });

  const payment = await prisma.payment.create({
    data: {
      userId: req.auth!.userId,
      courseId: course.id,
      amount: course.price,
      status: 'CREATED',
      razorpayOrderId: order.id
    }
  });

  return res.status(201).json({ order, paymentId: payment.id, key: env.razorpayKeyId });
};

export const paymentWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  if (!signature) return res.status(400).json({ message: 'Missing signature' });

  const body = JSON.stringify(req.body);
  const digest = crypto
    .createHmac('sha256', env.razorpayWebhookSecret)
    .update(body)
    .digest('hex');

  if (digest !== signature) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  if (req.body.event === 'payment.captured') {
    const paymentEntity = req.body.payload.payment.entity;
    const updated = await prisma.payment.updateMany({
      where: { razorpayOrderId: paymentEntity.order_id },
      data: { status: 'PAID', razorpayPaymentId: paymentEntity.id }
    });

    if (updated.count > 0) {
      const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: paymentEntity.order_id } });
      if (payment) {
        await prisma.enrollment.upsert({
          where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
          create: { userId: payment.userId, courseId: payment.courseId, status: 'ACTIVE' },
          update: { status: 'ACTIVE' }
        });
      }
    }
  }

  return res.json({ status: 'ok' });
};
