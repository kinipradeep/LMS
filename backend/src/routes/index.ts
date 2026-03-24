import { Router } from 'express';
import { login, me, signup } from '../controllers/auth.controller.js';
import { getCourseBySlug, getCourses, getPageBySlug, getPosts } from '../controllers/cms.controller.js';
import { courseModules, lessonById, myCourses, updateProgress } from '../controllers/lms.controller.js';
import { getQuiz, submitQuiz } from '../controllers/quiz.controller.js';
import { createOrder, paymentWebhook } from '../controllers/payment.controller.js';
import { requireAnyRole, requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { adminCourses, adminUsers } from '../controllers/admin.controller.js';
import { createCourse, publishCourse } from '../controllers/course-management.controller.js';
import { getConfig, upsertConfig } from '../controllers/config.controller.js';
import { generateQuizWithAI } from '../controllers/ai-quiz.controller.js';

export const router = Router();

router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, me);

router.get('/pages/:slug', getPageBySlug);
router.get('/posts', getPosts);
router.get('/courses', getCourses);
router.get('/courses/:slug', getCourseBySlug);

router.get('/my-courses', requireAuth, myCourses);
router.get('/lms/courses/:id/modules', requireAuth, courseModules);
router.get('/lessons/:id', requireAuth, lessonById);
router.post('/progress', requireAuth, updateProgress);

router.get('/quizzes/:id', requireAuth, getQuiz);
router.post('/quizzes/:id/submit', requireAuth, submitQuiz);

router.post('/payments/create-order', requireAuth, createOrder);
router.post('/payments/webhook', paymentWebhook);

router.get('/admin/courses', requireAuth, requireRole('ADMIN'), adminCourses);
router.get('/admin/users', requireAuth, requireRole('ADMIN'), adminUsers);
router.get('/admin/config', requireAuth, requireRole('ADMIN'), getConfig);
router.put('/admin/config', requireAuth, requireRole('ADMIN'), upsertConfig);

router.post('/creator/courses', requireAuth, requireAnyRole(['ADMIN', 'TRAINER']), createCourse);
router.patch('/creator/courses/:id/publish', requireAuth, requireAnyRole(['ADMIN', 'TRAINER']), publishCourse);
router.post('/creator/quizzes/generate', requireAuth, requireAnyRole(['ADMIN', 'TRAINER']), generateQuizWithAI);
