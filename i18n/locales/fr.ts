export default {
  auth: {
    login: 'Connexion',
    subtitle: 'Connectez-vous à ChatLive',
    github: 'Continuer avec GitHub',
    dev: 'Connexion Dev (Test Local)',
    consent: 'En vous connectant, vous acceptez nos {terms} et notre {privacy} relative à la protection de vos données personnelles (RGPD).',
    terms: 'Conditions d\'Utilisation',
    privacy: 'Politique de Confidentialité'
  },
  sidebar: {
    home: 'Accueil',
    newServer: 'Nouveau serveur',
    channels: 'Salons',
    createChannel: 'Créer un salon',
    logout: 'Se déconnecter',
    online: 'En ligne',
    settings: 'Paramètres du compte',
    homeTab: 'Accueil',
    friends: 'Amis',
    dms: 'Messages Privés',
    noDms: 'Aucune discussion privée.',
    defaultUser: 'Utilisateur'
  },
  chat: {
    welcome: 'Bienvenue sur ChatLive',
    welcomeSubtitle: 'Sélectionnez un serveur dans la barre latérale gauche ou créez-en un nouveau pour commencer à discuter avec votre communauté.',
    generalDesc: 'Salon de discussion général',
    placeholder: 'Envoyer un message dans #{name}',
    send: 'Envoyer le message',
    deleteMessage: 'Supprimer le message',
    statusOnline: 'En ligne',
    statusOffline: 'Hors ligne',
    friendDefault: 'Ami',
    dmWelcomeTitle: 'Début de la conversation privée',
    dmWelcomeDesc: 'C\'est le tout début de vos messages privés avec {name}.',
    dmPlaceholder: 'Envoyer un message privé à {name}',
    lightMode: 'Activer le mode clair',
    darkMode: 'Activer le mode sombre',
    emptyTitle: 'C\'est le début !',
    emptyDesc1: 'Envoyez votre premier message dans le salon',
    emptyDesc2: 'pour démarrer la conversation.',
    typingSingle: 'est en train d\'écrire…',
    typingAnd: 'et',
    typingMultiple: 'écrivent…',
    confirmDelete: 'Supprimer ce message ?',
    deleteConfirm: 'Supprimer',
    deleteCancel: 'Annuler'
  },
  modal: {
    createChannelTitle: 'Créer un nouveau salon',
    createChannelDesc: 'Les salons permettent d\'organiser vos discussions par thèmes.',
    channelPlaceholder: 'Nom du salon (ex: general)',
    create: 'Créer',
    cancel: 'Annuler',
    createServerTitle: 'Créer un nouvel espace',
    createServerDesc: 'Donnez un nom à votre serveur pour commencer à discuter avec votre communauté.',
    serverPlaceholder: 'Nom du serveur',
    settingsTitle: 'Paramètres du compte & RGPD',
    close: 'Fermer'
  },
  settings: {
    myProfile: 'Mon Profil',
    gdprTab: 'Données & RGPD',
    displayName: 'Nom d\'affichage (Droit de rectification)',
    namePlaceholder: 'Votre nouveau nom',
    save: 'Enregistrer',
    portabilityTitle: 'Portabilité des données (Art. 20)',
    portabilityDesc: 'Vous disposez du droit d\'obtenir et de réutiliser vos données personnelles pour vos propres besoins. Téléchargez une archive JSON structurée de l\'ensemble de votre profil, de vos serveurs créés et de tous vos messages envoyés.',
    downloadBtn: 'Télécharger mes données (JSON)',
    erasureTitle: 'Droit à l\'effacement / l\'oubli (Art. 17)',
    erasureDesc: 'Cette action est irréversible. Elle supprimera définitivement votre profil utilisateur, vos serveurs possédés, vos salons et l\'intégralité de vos messages de notre base de données.',
    deleteBtn: 'Supprimer mon compte',
    deleteWarning: '⚠️ Attention : Pour confirmer, veuillez saisir le mot {word} ci-dessous.',
    deleteWord: 'SUPPRIMER',
    deletePlaceholder: 'Saisissez {word}',
    confirmBtn: 'Confirmer l\'effacement',
    appLanguage: 'Langue de l\'application'
  },
  toasts: {
    profileUpdated: 'Profil mis à jour',
    profileUpdatedDesc: 'Votre nom d\'affichage a été modifié avec succès.',
    exportStarted: 'Exportation lancée',
    exportStartedDesc: 'Le téléchargement de vos données personnelles va démarrer.',
    accountDeleted: 'Compte supprimé',
    accountDeletedDesc: 'Votre compte et toutes vos données ont été définitivement effacés.',
    error: 'Erreur',
    profileUpdateError: 'Impossible de mettre à jour le profil.',
    exportError: 'Impossible de télécharger vos données.',
    deleteError: 'Impossible de supprimer votre compte.',
    success: 'Succès'
  },
  privacy: {
    back: 'Retour à la connexion',
    badge: 'Conforme RGPD',
    title: 'Politique de Confidentialité',
    subtitle: 'Chez ChatLive, nous protégeons vos données personnelles. Découvrez comment nous collectons, utilisons et protégeons vos informations.',
    lastUpdated: 'Dernière mise à jour : 22 mai 2026',
    section1: {
      title: 'Responsable du traitement',
      content: 'L\'application {app} est gérée par l\'équipe de développement du projet. Pour toute question ou demande concernant la protection de vos données personnelles, vous pouvez nous contacter directement à l\'adresse e-mail : {email}.'
    },
    section2: {
      title: 'Données personnelles collectées',
      subtitle: 'Nous collectons uniquement les données strictement nécessaires au fonctionnement et à l\'amélioration du service de chat en direct :',
      item1Title: 'Données de profil (depuis GitHub OAuth) :',
      item1Text: ' Nom complet / Pseudo, Adresse e-mail, URL de la photo de profil (avatar).',
      item2Title: 'Contenus créés :',
      item2Text: ' Messages de chat envoyés, serveurs et salons créés.',
      item3Title: 'Données de session :',
      item3Text: ' Identifiants de session chiffrés sous forme de cookies (requis pour vous maintenir connecté en toute sécurité).'
    },
    section3: {
      title: 'Finalité et Base Légale',
      subtitle: 'Conformément à l\'article 6 du RGPD, le traitement de vos données repose sur les bases suivantes :',
      item1Title: 'Exécution d\'un contrat (Art. 6.1.b du RGPD) :',
      item1Text: ' Fourniture du service de chat, de l\'authentification et de la mise en relation avec d\'autres utilisateurs.',
      item2Title: 'Votre consentement (Art. 6.1.a du RGPD) :',
      item2Text: ' Fourni de manière explicite au moment de votre connexion.'
    },
    section4: {
      title: 'Durée de conservation des données',
      content: 'Vos données personnelles de profil et vos messages sont conservés tant que votre compte est actif. Si vous décidez de supprimer votre compte via l\'espace paramètres de l\'application, l\'intégralité de vos données de profil, vos serveurs et vos messages seront définitivement et immédiatement purgés de nos bases de données de manière sécurisée et irréversible (Droit à l\'oubli).'
    },
    section5: {
      title: 'Vos Droits RGPD',
      subtitle: 'Le RGPD vous octroie des droits fondamentaux sur vos données. Dans l\'espace Paramètres du compte de ChatLive, vous pouvez exercer ces droits en toute autonomie :',
      item1Title: 'Droit de rectification (Art. 16) :',
      item1Text: ' Vous pouvez modifier votre nom d\'affichage à tout moment.',
      item2Title: 'Droit à l\'effacement / à l\'oubli (Art. 17) :',
      item2Text: ' Vous pouvez supprimer votre compte à tout moment pour détruire instantanément toutes vos données.',
      item3Title: 'Droit d\'accès et à la portabilité (Art. 15 & 20) :',
      item3Text: ' Vous pouvez télécharger l\'intégralité de vos données personnelles sous forme d\'un fichier JSON structuré en un seul clic.'
    },
    section6: {
      title: 'Sécurité des données',
      content: 'Nous mettons en œuvre des mesures de sécurité techniques avancées pour protéger vos informations, notamment l\'utilisation du protocole HTTPS pour tous les échanges réseau, le hachage des informations sensibles et le chiffrement fort des sessions de connexion (via nuxt-auth-utils).'
    },
    footer: 'ChatLive © 2026 - Développé dans le respect de votre vie privée.'
  },
  terms: {
    back: 'Retour à la connexion',
    badge: 'CGU de ChatLive',
    title: 'Conditions Générales d\'Utilisation',
    subtitle: 'Règles et conditions d\'accès à la plateforme de chat en direct ChatLive.',
    lastUpdated: 'Dernière mise à jour : 22 mai 2026',
    section1: {
      title: 'Acceptation des conditions',
      content: 'L\'accès et l\'utilisation de ChatLive sont soumis à l\'acceptation pleine et entière des présentes Conditions Générales d\'Utilisation. En vous connectant à notre application via GitHub OAuth ou via le mode développeur, vous déclarez accepter ces conditions sans réserve.'
    },
    section2: {
      title: 'Description du Service',
      content: 'ChatLive est une application de communication collaborative en temps réel. Elle permet aux utilisateurs inscrits de créer des serveurs de discussion, de définir des salons (channels), et d\'échanger des messages écrits instantanés. Le service est fourni gratuitement en l\'état actuel de son développement.'
    },
    section3: {
      title: 'Comportement de l\'utilisateur',
      subtitle: 'En utilisant ChatLive, vous vous engagez à respecter les règles de bienséance et de légalité en vigueur :',
      item1: 'Aucun contenu haineux, menaçant, raciste, homophobe, diffamatoire ou illicite ne sera toléré dans les messages ou le nom des salons.',
      item2: 'Aucune activité malveillante ou tentative d\'interruption du service de messagerie en temps réel n\'est tolérée.',
      item3: 'Tout manquement pourra entraîner le blocage ou la suppression immédiate et définitive de votre compte utilisateur.'
    },
    section4: {
      title: 'Responsabilité',
      content: 'Les messages envoyés par les utilisateurs relèvent de leur entière et unique responsabilité individuelle. L\'éditeur de ChatLive ne peut en aucun cas être tenu responsable des propos tenus par les utilisateurs sur les serveurs ou les salons de discussion. L\'éditeur s\'efforce de maintenir le service disponible sans garantie d\'interruption.'
    },
    section5: {
      title: 'Propriété intellectuelle',
      content: 'Le code source de ChatLive est régi par la licence open-source spécifiée dans le projet. Les marques, logos et interfaces graphiques restent la propriété exclusive de ChatLive et de ses créateurs.'
    },
    footer: 'Conditions Générales d\'Utilisation'
  },
  invite: {
    buttonTooltip: 'Inviter des membres',
    modalTitle: 'Inviter des amis sur {server}',
    modalDesc: 'Partagez ce lien avec vos amis pour leur donner accès à votre serveur.',
    copyBtn: 'Copier le lien',
    copiedBtn: 'Lien copié !',
    toastSuccess: 'Lien copié',
    toastSuccessDesc: 'Le lien d\'invitation a été copié dans votre presse-papiers.',
    joiningTitle: 'Rejoindre le serveur...',
    joiningSubtitle: 'Veuillez patienter pendant que nous vous ajoutons au serveur.',
    joinErrorTitle: 'Erreur d\'invitation',
    joinErrorDesc: 'Ce lien d\'invitation est invalide, expiré ou vous n\'avez pas les droits nécessaires pour rejoindre.',
    backHome: 'Retour à l\'accueil',
    confirmTitle: 'Rejoindre un espace',
    confirmDesc: 'Vous avez été invité à rejoindre le serveur {server}.',
    createdBy: 'Créé par',
    joinBtn: 'Rejoindre le serveur',
    cancelBtn: 'Plus tard',
    joiningProgress: 'Rejoindre...'
  },
  friends: {
    title: 'Amis',
    tabOnline: 'En ligne',
    tabAll: 'Tous',
    tabPending: 'En attente',
    tabAdd: 'Ajouter un ami',
    onlineCount: 'En ligne — {count}',
    noOnline: 'Personne n\'est disponible pour l\'instant.',
    statusOnline: 'En ligne',
    chatBtn: 'Discuter',
    allCount: 'Tous les amis — {count}',
    noFriends: 'Vous n\'avez pas encore d\'amis. Essayez d\'en ajouter !',
    pendingCount: 'Demandes en attente — {count}',
    noPending: 'Aucune demande d\'ami en attente.',
    requestReceived: 'Demande reçue',
    requestSent: 'Demande envoyée',
    acceptBtn: 'Accepter',
    cancelRequestBtn: 'Annuler',
    addFriendTitle: 'Ajouter un ami',
    addFriendDesc: 'Vous pouvez ajouter un ami avec son adresse e-mail ou en recherchant son pseudonyme.',
    addEmailLabel: 'Ajouter via adresse e-mail',
    addEmailPlaceholder: 'Saisissez l\'e-mail de votre ami...',
    sendRequestBtn: 'Envoyer la demande',
    searchUsersLabel: 'Rechercher des utilisateurs',
    searchUsersPlaceholder: 'Saisissez un pseudonyme...',
    addBtn: 'Ajouter',
    noUserFound: 'Aucun utilisateur trouvé correspondant à "{query}".',
    closeAlertBtn: 'Fermer',
    toastRequestSent: 'Demande d\'ami envoyée !',
    toastError: 'Une erreur est survenue.'
  }
}
