const express = require('express');
const router = express.Router();
const {
  getAdminStats, getAllUsers, toggleBlockUser, approveRecruiter,
  deleteUser, getAllJobsAdmin, toggleJobApproval,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.put('/users/:id/approve', approveRecruiter);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAllJobsAdmin);
router.put('/jobs/:id/approve', toggleJobApproval);

module.exports = router;
