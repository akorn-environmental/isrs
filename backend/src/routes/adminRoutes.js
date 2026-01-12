const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply auth middleware to all admin routes
router.use(requireAuth);

// Admin routes
router.get('/stats', adminController.getStats);
router.get('/icsr-data', adminController.getICSRData);
router.get('/test-connection', adminController.testConnection);
router.post('/enhance', adminController.runEnhancement);
router.post('/cleanup', adminController.performCleanup);
router.get('/export', adminController.prepareExport);
router.get('/board-members', adminController.getBoardMembers);
router.get('/registration-stats', adminController.getRegistrationStats);

// Contacts CRUD
router.get('/contacts', adminController.getContacts);
router.post('/contacts', adminController.createContact);
router.put('/contacts/:id', adminController.updateContact);
router.delete('/contacts/:id', adminController.deleteContact);

// Organizations CRUD
router.get('/organizations', adminController.getOrganizations);
router.post('/organizations', adminController.createOrganization);
router.put('/organizations/:id', adminController.updateOrganization);
router.delete('/organizations/:id', adminController.deleteOrganization);

// Board Votes CRUD
router.get('/votes', adminController.getVotes);
router.post('/votes', adminController.createVote);
router.put('/votes/:id', adminController.updateVote);
router.delete('/votes/:id', adminController.deleteVote);

// Conferences CRUD
router.get('/conferences', adminController.getConferences);
router.post('/conferences', adminController.createConference);
router.put('/conferences/:id', adminController.updateConference);
router.delete('/conferences/:id', adminController.deleteConference);

// Funding Prospects CRUD
router.get('/funding', adminController.getFunding);
router.post('/funding', adminController.createFunding);
router.put('/funding/:id', adminController.updateFunding);
router.delete('/funding/:id', adminController.deleteFunding);

// Funding Lead Assignment
router.get('/funding/available-leads', adminController.getAvailableLeads);
router.post('/funding/:id/assign-leads', adminController.assignFundingLeads);
router.post('/funding/:id/notify-leads', adminController.notifyFundingLeads);

// Email & AI features
router.post('/send-email', adminController.sendEmail);
router.post('/ai-query', adminController.aiQuery);

// Contact Management Features
router.post('/contacts/import/analyze', upload.single('file'), adminController.analyzeImportFile);
router.post('/contacts/import/execute', adminController.executeContactImport);
router.get('/contacts/export', adminController.exportContacts);
router.get('/contacts/duplicates', adminController.detectDuplicates);
router.post('/contacts/merge', adminController.mergeContacts);
router.post('/contacts/bulk-update', adminController.bulkUpdateContacts);
router.post('/contacts/bulk-delete', adminController.bulkDeleteContacts);

// Conference Registration Management
router.get('/conference/registrations', adminController.getConferenceRegistrations);
router.get('/conference/stats', adminController.getConferenceStats);
router.put('/conference/registration/:id/payment-status', adminController.updatePaymentStatus);
router.get('/conference/attendees', adminController.getAttendeeProfiles);
router.get('/conference/payments', adminController.getPaymentTransactions);

// Data Enrichment
router.get('/data-quality-report', adminController.getDataQualityReport);
router.post('/contacts/enrich-preview', adminController.previewContactEnrichment);
router.post('/contacts/enrich-apply', adminController.applyContactEnrichment);
router.post('/organizations/enrich-websites', adminController.enrichOrganizationWebsites);

module.exports = router;
