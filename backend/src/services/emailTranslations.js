/**
 * Email Translations for ISRS
 * Supports: English (en), French (fr), Spanish (es)
 *
 * Usage:
 *   const { t } = require('./emailTranslations');
 *   const subject = t('magicLinkSubject', language);
 */

const emailTranslations = {
  en: {
    // ============================================
    // MAGIC LINK AUTHENTICATION EMAIL
    // ============================================
    magicLinkSubject: 'Your Secure Login Link - ISRS Member Portal',
    magicLinkGreeting: 'Hello',
    magicLinkIntro: 'You requested to log in to the <strong>International Shellfish Restoration Society</strong> member portal.',
    magicLinkButton: '🔐 Log In to ISRS Portal',
    magicLinkExpiry: 'This secure link will expire in <strong>15 minutes</strong> for your protection.',
    magicLinkIgnore: 'If you didn\'t request this login link, you can safely ignore this email.',
    magicLinkSecurityTitle: '🔒 Security Reminder:',
    magicLinkSecurityText: 'Never share this link with anyone. ISRS will never ask for your login credentials via email.',
    magicLinkTroubleTitle: 'Trouble clicking the button?',
    magicLinkTroubleCopy: 'Copy and paste this link into your browser:',

    // ============================================
    // REGISTRATION CONFIRMATION EMAIL
    // ============================================
    regConfirmSubject: 'Registration Confirmed',
    regConfirmHeader: 'Registration Confirmed!',
    regConfirmHeaderSubtitle: 'You\'re all set for',
    regConfirmGreeting: 'Dear',
    regConfirmIntro: 'Thank you for registering for <strong>{conferenceName}</strong>! We\'re excited to have you join us for this premier gathering of shellfish restoration professionals from around the world.',

    regDetailsTitle: 'Registration Details',
    regDetailsId: 'Registration ID:',
    regDetailsType: 'Registration Type:',
    regDetailsDate: 'Conference Date:',
    regDetailsEmail: 'Email:',

    regPaymentTitle: 'Payment Information',
    regPaymentRegFee: 'Registration Fee:',
    regPaymentDiscount: 'Discount Applied:',
    regPaymentTotal: 'Total Amount:',
    regPaymentStatus: 'Payment Status:',
    regPaymentMethod: 'Payment Method:',
    regPaymentPaid: 'Paid',
    regPaymentPending: 'Pending',

    regSessionsTitle: 'Your Selected Sessions',
    regSessionsNone: 'You haven\'t selected any specific sessions yet. You can add sessions through your member portal.',
    regSessionDate: 'Date:',
    regSessionTime: 'Time:',
    regSessionRoom: 'Room:',

    regNextStepsTitle: 'Next Steps',
    regNextStep1: 'Check your email for payment confirmation (if applicable)',
    regNextStep2: 'Review the conference schedule and select additional sessions',
    regNextStep3: 'Book your accommodations early for the best rates',
    regNextStep4: 'Join our conference community on social media',

    regImportantInfoTitle: 'Important Information',
    regImportantCancellation: '<strong>Cancellation Policy:</strong> Full refunds available until 30 days before the conference. 50% refund until 14 days before. No refunds after that, but registrations are transferable.',
    regImportantBadge: '<strong>Conference Badge:</strong> Please bring a photo ID to pick up your badge at registration.',
    regImportantAccessibility: '<strong>Accessibility:</strong> Need accommodations? Contact us at',

    regQuestionsText: 'Questions about your registration? Contact our conference team:',
    regSeeYouText: 'We can\'t wait to see you at',

    // ============================================
    // PAYMENT RECEIPT EMAIL
    // ============================================
    receiptSubject: 'Payment Receipt',
    receiptHeader: '✓ Payment Received',
    receiptHeaderSubtitle: 'Your registration is confirmed',
    receiptGreeting: 'Dear',
    receiptIntro: 'Thank you for your payment! This email serves as your official receipt for your {conferenceName} registration. Your payment has been successfully processed and your registration is now confirmed.',

    receiptDetailsTitle: 'Receipt Details',
    receiptDate: 'Receipt Date:',
    receiptTransactionId: 'Transaction ID:',
    receiptRegistrationId: 'Registration ID:',
    receiptPaymentMethod: 'Payment Method:',

    receiptChargesTitle: 'Charges',
    receiptRegistrationFee: 'Registration Fee:',
    receiptDiscount: 'Discount:',
    receiptTotal: 'Total Paid:',

    receiptBillingTitle: 'Billing Address',
    receiptNoBilling: 'No billing address provided',

    receiptTaxTitle: 'Tax Information',
    receiptTaxNote: 'ISRS is a 501(c)(3) nonprofit organization (pending IRS approval). This payment may be tax-deductible to the extent allowed by law. Tax ID: 92-3615411',
    receiptTaxDisclaimer: 'Please consult with your tax advisor regarding the deductibility of this payment.',

    receiptQuestionsTitle: 'Questions About This Receipt?',
    receiptQuestionsText: 'If you have questions about this receipt or need an amended copy, please contact:',

    receiptSaveText: 'Please save this receipt for your records.',

    // ============================================
    // CONFERENCE REMINDER EMAIL
    // ============================================
    reminderSubject: 'Reminder',
    reminderSubjectSuffix: 'is Coming Up!',
    reminderHeader: '📅 Conference Reminder',
    reminderHeaderSubtitle: 'We\'re excited to see you soon!',
    reminderGreeting: 'Dear',
    reminderIntro: '<strong>{conferenceName}</strong> is just around the corner! We\'re thrilled that you\'ll be joining us for this important gathering of shellfish restoration professionals from around the world.',

    reminderDetailsTitle: '📍 Conference Details',
    reminderDates: '📅 Dates:',
    reminderLocation: '📍 Location:',
    reminderRegId: '🎫 Registration ID:',

    reminderSessionsTitle: '📋 Your Registered Sessions',
    reminderSessionsNone: 'You haven\'t registered for specific sessions yet.',
    reminderAddSessions: 'Add sessions to your schedule',

    reminderPrepTitle: '✅ Final Preparations',
    reminderPrep1: '📱 <strong>Download the Conference App:</strong> Access the full schedule, speaker bios, and networking features',
    reminderPrep2: '🏨 <strong>Confirm Your Accommodations:</strong> Make sure your hotel reservation is set',
    reminderPrep3: '🎫 <strong>Print or Save Your Registration:</strong> You\'ll need your registration ID to pick up your badge',
    reminderPrep4: '🌐 <strong>Join the Conversation:</strong> Follow',
    reminderPrep4Suffix: 'on social media for updates',

    reminderHotelTitle: '🏨 Recommended Accommodations',
    reminderHotelContact: 'Contact:',
    reminderHotelWebsite: 'Website:',
    reminderHotelRate: 'Conference Rate:',
    reminderHotelBookBy: 'Book by:',

    reminderResourcesTitle: '🔗 Helpful Links',
    reminderViewSchedule: 'View Full Schedule',
    reminderViewMap: 'Conference Venue Map',
    reminderViewGuidelines: 'Health & Safety Guidelines',

    reminderExcitedText: 'We\'re counting down the days until we see you in person! If you have any last-minute questions, don\'t hesitate to reach out to our conference team.',
    reminderSeeYouText: 'See you soon at',

    // ============================================
    // COMMON ELEMENTS (used across templates)
    // ============================================
    signatureTeam: 'The ISRS Conference Team',
    signatureName: 'International Shellfish Restoration Society',
    signatureEmail: 'conference@shellfish-restoration.org',
    signatureWebsite: 'www.shellfish-restoration.org',

    footerNonprofit: 'ISRS is a 501(c)(3) nonprofit organization (pending IRS approval)',
    footerTaxId: 'Tax ID: 92-3615411',
    footerAddress: 'International Shellfish Restoration Society',

    footerUnsubscribe: 'You\'re receiving this email because you registered for an ISRS conference.',
    footerManagePreferences: 'Manage email preferences',

    // Formatting helpers (not translated, but needed for template consistency)
    currency: '$',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h' // 12-hour vs 24-hour
  },

  fr: {
    // ============================================
    // E-MAIL D'AUTHENTIFICATION PAR LIEN MAGIQUE
    // ============================================
    magicLinkSubject: 'Votre Lien de Connexion Sécurisé - Portail Membre ISRS',
    magicLinkGreeting: 'Bonjour',
    magicLinkIntro: 'Vous avez demandé à vous connecter au portail membre de la <strong>Société Internationale pour la Restauration des Mollusques</strong>.',
    magicLinkButton: '🔐 Se Connecter au Portail ISRS',
    magicLinkExpiry: 'Ce lien sécurisé expirera dans <strong>15 minutes</strong> pour votre protection.',
    magicLinkIgnore: 'Si vous n\'avez pas demandé ce lien de connexion, vous pouvez ignorer cet e-mail en toute sécurité.',
    magicLinkSecurityTitle: '🔒 Rappel de Sécurité :',
    magicLinkSecurityText: 'Ne partagez jamais ce lien avec qui que ce soit. ISRS ne vous demandera jamais vos identifiants de connexion par e-mail.',
    magicLinkTroubleTitle: 'Problème pour cliquer sur le bouton ?',
    magicLinkTroubleCopy: 'Copiez et collez ce lien dans votre navigateur :',

    // ============================================
    // E-MAIL DE CONFIRMATION D'INSCRIPTION
    // ============================================
    regConfirmSubject: 'Inscription Confirmée',
    regConfirmHeader: 'Inscription Confirmée !',
    regConfirmHeaderSubtitle: 'Vous êtes prêt pour',
    regConfirmGreeting: 'Cher/Chère',
    regConfirmIntro: 'Merci de vous être inscrit(e) à <strong>{conferenceName}</strong> ! Nous sommes ravis de vous accueillir à ce rassemblement de premier plan de professionnels de la restauration des mollusques du monde entier.',

    regDetailsTitle: 'Détails de l\'Inscription',
    regDetailsId: 'ID d\'Inscription :',
    regDetailsType: 'Type d\'Inscription :',
    regDetailsDate: 'Date de la Conférence :',
    regDetailsEmail: 'E-mail :',

    regPaymentTitle: 'Informations de Paiement',
    regPaymentRegFee: 'Frais d\'Inscription :',
    regPaymentDiscount: 'Réduction Appliquée :',
    regPaymentTotal: 'Montant Total :',
    regPaymentStatus: 'Statut du Paiement :',
    regPaymentMethod: 'Méthode de Paiement :',
    regPaymentPaid: 'Payé',
    regPaymentPending: 'En Attente',

    regSessionsTitle: 'Vos Sessions Sélectionnées',
    regSessionsNone: 'Vous n\'avez pas encore sélectionné de sessions spécifiques. Vous pouvez ajouter des sessions via votre portail membre.',
    regSessionDate: 'Date :',
    regSessionTime: 'Heure :',
    regSessionRoom: 'Salle :',

    regNextStepsTitle: 'Prochaines Étapes',
    regNextStep1: 'Vérifiez votre e-mail pour la confirmation de paiement (si applicable)',
    regNextStep2: 'Consultez le programme de la conférence et sélectionnez des sessions supplémentaires',
    regNextStep3: 'Réservez votre hébergement tôt pour les meilleurs tarifs',
    regNextStep4: 'Rejoignez notre communauté de conférence sur les réseaux sociaux',

    regImportantInfoTitle: 'Informations Importantes',
    regImportantCancellation: '<strong>Politique d\'Annulation :</strong> Remboursement complet disponible jusqu\'à 30 jours avant la conférence. Remboursement de 50 % jusqu\'à 14 jours avant. Aucun remboursement après, mais les inscriptions sont transférables.',
    regImportantBadge: '<strong>Badge de Conférence :</strong> Veuillez apporter une pièce d\'identité avec photo pour récupérer votre badge à l\'inscription.',
    regImportantAccessibility: '<strong>Accessibilité :</strong> Besoin d\'aménagements ? Contactez-nous à',

    regQuestionsText: 'Des questions sur votre inscription ? Contactez notre équipe de conférence :',
    regSeeYouText: 'Nous avons hâte de vous voir à',

    // ============================================
    // E-MAIL DE REÇU DE PAIEMENT
    // ============================================
    receiptSubject: 'Reçu de Paiement',
    receiptHeader: '✓ Paiement Reçu',
    receiptHeaderSubtitle: 'Votre inscription est confirmée',
    receiptGreeting: 'Cher/Chère',
    receiptIntro: 'Merci pour votre paiement ! Cet e-mail sert de reçu officiel pour votre inscription à {conferenceName}. Votre paiement a été traité avec succès et votre inscription est maintenant confirmée.',

    receiptDetailsTitle: 'Détails du Reçu',
    receiptDate: 'Date du Reçu :',
    receiptTransactionId: 'ID de Transaction :',
    receiptRegistrationId: 'ID d\'Inscription :',
    receiptPaymentMethod: 'Méthode de Paiement :',

    receiptChargesTitle: 'Frais',
    receiptRegistrationFee: 'Frais d\'Inscription :',
    receiptDiscount: 'Réduction :',
    receiptTotal: 'Total Payé :',

    receiptBillingTitle: 'Adresse de Facturation',
    receiptNoBilling: 'Aucune adresse de facturation fournie',

    receiptTaxTitle: 'Informations Fiscales',
    receiptTaxNote: 'ISRS est une organisation à but non lucratif 501(c)(3) (en attente d\'approbation IRS). Ce paiement peut être déductible d\'impôts dans la mesure permise par la loi. ID Fiscal : 92-3615411',
    receiptTaxDisclaimer: 'Veuillez consulter votre conseiller fiscal concernant la déductibilité de ce paiement.',

    receiptQuestionsTitle: 'Questions sur ce Reçu ?',
    receiptQuestionsText: 'Si vous avez des questions sur ce reçu ou si vous avez besoin d\'une copie modifiée, veuillez contacter :',

    receiptSaveText: 'Veuillez conserver ce reçu pour vos dossiers.',

    // ============================================
    // E-MAIL DE RAPPEL DE CONFÉRENCE
    // ============================================
    reminderSubject: 'Rappel',
    reminderSubjectSuffix: 'Approche !',
    reminderHeader: '📅 Rappel de Conférence',
    reminderHeaderSubtitle: 'Nous sommes impatients de vous voir bientôt !',
    reminderGreeting: 'Cher/Chère',
    reminderIntro: '<strong>{conferenceName}</strong> approche à grands pas ! Nous sommes ravis que vous vous joigniez à nous pour ce rassemblement important de professionnels de la restauration des mollusques du monde entier.',

    reminderDetailsTitle: '📍 Détails de la Conférence',
    reminderDates: '📅 Dates :',
    reminderLocation: '📍 Lieu :',
    reminderRegId: '🎫 ID d\'Inscription :',

    reminderSessionsTitle: '📋 Vos Sessions Enregistrées',
    reminderSessionsNone: 'Vous ne vous êtes pas encore inscrit(e) à des sessions spécifiques.',
    reminderAddSessions: 'Ajouter des sessions à votre emploi du temps',

    reminderPrepTitle: '✅ Préparatifs Finaux',
    reminderPrep1: '📱 <strong>Téléchargez l\'Application de Conférence :</strong> Accédez au programme complet, aux biographies des intervenants et aux fonctionnalités de réseautage',
    reminderPrep2: '🏨 <strong>Confirmez Votre Hébergement :</strong> Assurez-vous que votre réservation d\'hôtel est confirmée',
    reminderPrep3: '🎫 <strong>Imprimez ou Enregistrez Votre Inscription :</strong> Vous aurez besoin de votre ID d\'inscription pour récupérer votre badge',
    reminderPrep4: '🌐 <strong>Rejoignez la Conversation :</strong> Suivez',
    reminderPrep4Suffix: 'sur les réseaux sociaux pour les mises à jour',

    reminderHotelTitle: '🏨 Hébergements Recommandés',
    reminderHotelContact: 'Contact :',
    reminderHotelWebsite: 'Site Web :',
    reminderHotelRate: 'Tarif Conférence :',
    reminderHotelBookBy: 'Réserver avant le :',

    reminderResourcesTitle: '🔗 Liens Utiles',
    reminderViewSchedule: 'Voir le Programme Complet',
    reminderViewMap: 'Plan du Lieu de Conférence',
    reminderViewGuidelines: 'Directives Santé et Sécurité',

    reminderExcitedText: 'Nous comptons les jours jusqu\'à ce que nous vous voyions en personne ! Si vous avez des questions de dernière minute, n\'hésitez pas à contacter notre équipe de conférence.',
    reminderSeeYouText: 'À bientôt à',

    // ============================================
    // ÉLÉMENTS COMMUNS
    // ============================================
    signatureTeam: 'L\'Équipe de Conférence ISRS',
    signatureName: 'Société Internationale pour la Restauration des Mollusques',
    signatureEmail: 'conference@shellfish-restoration.org',
    signatureWebsite: 'www.shellfish-restoration.org',

    footerNonprofit: 'ISRS est une organisation à but non lucratif 501(c)(3) (en attente d\'approbation IRS)',
    footerTaxId: 'ID Fiscal : 92-3615411',
    footerAddress: 'Société Internationale pour la Restauration des Mollusques',

    footerUnsubscribe: 'Vous recevez cet e-mail parce que vous vous êtes inscrit(e) à une conférence ISRS.',
    footerManagePreferences: 'Gérer les préférences e-mail',

    // Formatting helpers
    currency: '$',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },

  es: {
    // ============================================
    // CORREO DE AUTENTICACIÓN POR ENLACE MÁGICO
    // ============================================
    magicLinkSubject: 'Su Enlace de Inicio de Sesión Seguro - Portal de Miembros ISRS',
    magicLinkGreeting: 'Hola',
    magicLinkIntro: 'Ha solicitado iniciar sesión en el portal de miembros de la <strong>Sociedad Internacional para la Restauración de Moluscos</strong>.',
    magicLinkButton: '🔐 Iniciar Sesión en el Portal ISRS',
    magicLinkExpiry: 'Este enlace seguro expirará en <strong>15 minutos</strong> para su protección.',
    magicLinkIgnore: 'Si no solicitó este enlace de inicio de sesión, puede ignorar este correo de forma segura.',
    magicLinkSecurityTitle: '🔒 Recordatorio de Seguridad:',
    magicLinkSecurityText: 'Nunca comparta este enlace con nadie. ISRS nunca le pedirá sus credenciales de inicio de sesión por correo electrónico.',
    magicLinkTroubleTitle: '¿Problema al hacer clic en el botón?',
    magicLinkTroubleCopy: 'Copie y pegue este enlace en su navegador:',

    // ============================================
    // CORREO DE CONFIRMACIÓN DE REGISTRO
    // ============================================
    regConfirmSubject: 'Registro Confirmado',
    regConfirmHeader: '¡Registro Confirmado!',
    regConfirmHeaderSubtitle: 'Está listo para',
    regConfirmGreeting: 'Estimado/a',
    regConfirmIntro: '¡Gracias por registrarse en <strong>{conferenceName}</strong>! Estamos emocionados de tenerlo/a con nosotros en esta reunión principal de profesionales de restauración de moluscos de todo el mundo.',

    regDetailsTitle: 'Detalles del Registro',
    regDetailsId: 'ID de Registro:',
    regDetailsType: 'Tipo de Registro:',
    regDetailsDate: 'Fecha de la Conferencia:',
    regDetailsEmail: 'Correo Electrónico:',

    regPaymentTitle: 'Información de Pago',
    regPaymentRegFee: 'Tarifa de Registro:',
    regPaymentDiscount: 'Descuento Aplicado:',
    regPaymentTotal: 'Monto Total:',
    regPaymentStatus: 'Estado del Pago:',
    regPaymentMethod: 'Método de Pago:',
    regPaymentPaid: 'Pagado',
    regPaymentPending: 'Pendiente',

    regSessionsTitle: 'Sus Sesiones Seleccionadas',
    regSessionsNone: 'Aún no ha seleccionado sesiones específicas. Puede agregar sesiones a través de su portal de miembros.',
    regSessionDate: 'Fecha:',
    regSessionTime: 'Hora:',
    regSessionRoom: 'Sala:',

    regNextStepsTitle: 'Próximos Pasos',
    regNextStep1: 'Verifique su correo electrónico para la confirmación de pago (si corresponde)',
    regNextStep2: 'Revise el programa de la conferencia y seleccione sesiones adicionales',
    regNextStep3: 'Reserve su alojamiento temprano para las mejores tarifas',
    regNextStep4: 'Únase a nuestra comunidad de conferencia en las redes sociales',

    regImportantInfoTitle: 'Información Importante',
    regImportantCancellation: '<strong>Política de Cancelación:</strong> Reembolso completo disponible hasta 30 días antes de la conferencia. Reembolso del 50% hasta 14 días antes. Sin reembolsos después, pero los registros son transferibles.',
    regImportantBadge: '<strong>Credencial de Conferencia:</strong> Por favor traiga una identificación con foto para recoger su credencial en el registro.',
    regImportantAccessibility: '<strong>Accesibilidad:</strong> ¿Necesita adaptaciones? Contáctenos en',

    regQuestionsText: '¿Preguntas sobre su registro? Contacte a nuestro equipo de conferencia:',
    regSeeYouText: 'Esperamos verlo/a en',

    // ============================================
    // CORREO DE RECIBO DE PAGO
    // ============================================
    receiptSubject: 'Recibo de Pago',
    receiptHeader: '✓ Pago Recibido',
    receiptHeaderSubtitle: 'Su registro está confirmado',
    receiptGreeting: 'Estimado/a',
    receiptIntro: '¡Gracias por su pago! Este correo electrónico sirve como su recibo oficial para su registro en {conferenceName}. Su pago ha sido procesado exitosamente y su registro ahora está confirmado.',

    receiptDetailsTitle: 'Detalles del Recibo',
    receiptDate: 'Fecha del Recibo:',
    receiptTransactionId: 'ID de Transacción:',
    receiptRegistrationId: 'ID de Registro:',
    receiptPaymentMethod: 'Método de Pago:',

    receiptChargesTitle: 'Cargos',
    receiptRegistrationFee: 'Tarifa de Registro:',
    receiptDiscount: 'Descuento:',
    receiptTotal: 'Total Pagado:',

    receiptBillingTitle: 'Dirección de Facturación',
    receiptNoBilling: 'No se proporcionó dirección de facturación',

    receiptTaxTitle: 'Información Fiscal',
    receiptTaxNote: 'ISRS es una organización sin fines de lucro 501(c)(3) (pendiente de aprobación del IRS). Este pago puede ser deducible de impuestos en la medida permitida por la ley. ID Fiscal: 92-3615411',
    receiptTaxDisclaimer: 'Por favor consulte con su asesor fiscal sobre la deducibilidad de este pago.',

    receiptQuestionsTitle: '¿Preguntas Sobre Este Recibo?',
    receiptQuestionsText: 'Si tiene preguntas sobre este recibo o necesita una copia modificada, por favor contacte a:',

    receiptSaveText: 'Por favor guarde este recibo para sus registros.',

    // ============================================
    // CORREO DE RECORDATORIO DE CONFERENCIA
    // ============================================
    reminderSubject: 'Recordatorio',
    reminderSubjectSuffix: '¡Se Acerca!',
    reminderHeader: '📅 Recordatorio de Conferencia',
    reminderHeaderSubtitle: '¡Estamos emocionados de verlo/a pronto!',
    reminderGreeting: 'Estimado/a',
    reminderIntro: '¡<strong>{conferenceName}</strong> está a la vuelta de la esquina! Estamos encantados de que se una a nosotros para esta importante reunión de profesionales de restauración de moluscos de todo el mundo.',

    reminderDetailsTitle: '📍 Detalles de la Conferencia',
    reminderDates: '📅 Fechas:',
    reminderLocation: '📍 Ubicación:',
    reminderRegId: '🎫 ID de Registro:',

    reminderSessionsTitle: '📋 Sus Sesiones Registradas',
    reminderSessionsNone: 'Aún no se ha registrado para sesiones específicas.',
    reminderAddSessions: 'Agregar sesiones a su horario',

    reminderPrepTitle: '✅ Preparativos Finales',
    reminderPrep1: '📱 <strong>Descargue la Aplicación de Conferencia:</strong> Acceda al programa completo, biografías de oradores y funciones de networking',
    reminderPrep2: '🏨 <strong>Confirme Su Alojamiento:</strong> Asegúrese de que su reserva de hotel esté confirmada',
    reminderPrep3: '🎫 <strong>Imprima o Guarde Su Registro:</strong> Necesitará su ID de registro para recoger su credencial',
    reminderPrep4: '🌐 <strong>Únase a la Conversación:</strong> Siga',
    reminderPrep4Suffix: 'en las redes sociales para actualizaciones',

    reminderHotelTitle: '🏨 Alojamientos Recomendados',
    reminderHotelContact: 'Contacto:',
    reminderHotelWebsite: 'Sitio Web:',
    reminderHotelRate: 'Tarifa de Conferencia:',
    reminderHotelBookBy: 'Reserve antes del:',

    reminderResourcesTitle: '🔗 Enlaces Útiles',
    reminderViewSchedule: 'Ver Programa Completo',
    reminderViewMap: 'Mapa del Lugar de Conferencia',
    reminderViewGuidelines: 'Pautas de Salud y Seguridad',

    reminderExcitedText: '¡Estamos contando los días hasta verlo/a en persona! Si tiene alguna pregunta de último momento, no dude en comunicarse con nuestro equipo de conferencia.',
    reminderSeeYouText: 'Nos vemos pronto en',

    // ============================================
    // ELEMENTOS COMUNES
    // ============================================
    signatureTeam: 'El Equipo de Conferencia ISRS',
    signatureName: 'Sociedad Internacional para la Restauración de Moluscos',
    signatureEmail: 'conference@shellfish-restoration.org',
    signatureWebsite: 'www.shellfish-restoration.org',

    footerNonprofit: 'ISRS es una organización sin fines de lucro 501(c)(3) (pendiente de aprobación del IRS)',
    footerTaxId: 'ID Fiscal: 92-3615411',
    footerAddress: 'Sociedad Internacional para la Restauración de Moluscos',

    footerUnsubscribe: 'Está recibiendo este correo porque se registró para una conferencia ISRS.',
    footerManagePreferences: 'Administrar preferencias de correo',

    // Formatting helpers
    currency: '$',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  }
};

/**
 * Translation helper function
 * @param {string} key - Translation key
 * @param {string} language - Language code ('en', 'fr', 'es')
 * @param {object} variables - Variables to replace in the translation (e.g., {conferenceName})
 * @returns {string} Translated string
 */
function t(key, language = 'en', variables = {}) {
  // Get translation, fallback to English
  let translation = emailTranslations[language]?.[key] || emailTranslations.en[key] || key;

  // Replace variables in the format {variableName}
  Object.keys(variables).forEach(varKey => {
    const placeholder = `{${varKey}}`;
    translation = translation.replace(new RegExp(placeholder, 'g'), variables[varKey]);
  });

  return translation;
}

/**
 * Get all translations for a specific language
 * @param {string} language - Language code
 * @returns {object} All translations for that language
 */
function getAllTranslations(language = 'en') {
  return emailTranslations[language] || emailTranslations.en;
}

/**
 * Check if a language is supported
 * @param {string} language - Language code to check
 * @returns {boolean}
 */
function isLanguageSupported(language) {
  return ['en', 'fr', 'es'].includes(language);
}

module.exports = {
  t,
  getAllTranslations,
  isLanguageSupported,
  emailTranslations
};
