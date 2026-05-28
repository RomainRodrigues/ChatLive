export default {
  auth: {
    login: 'Login',
    subtitle: 'Log in to ChatLive',
    github: 'Continue with GitHub',
    dev: 'Dev Login (Local Test)',
    consent: 'By logging in, you accept our {terms} and our {privacy} regarding the protection of your personal data (GDPR).',
    terms: 'Terms of Use',
    privacy: 'Privacy Policy'
  },
  sidebar: {
    home: 'Home',
    newServer: 'New Server',
    channels: 'Channels',
    createChannel: 'Create a channel',
    logout: 'Log out',
    online: 'Online',
    settings: 'Account Settings'
  },
  chat: {
    welcome: 'Welcome to ChatLive',
    welcomeSubtitle: 'Select a server in the left sidebar or create a new one to start chatting with your community.',
    generalDesc: 'General chat channel',
    placeholder: 'Send a message in #{name}',
    send: 'Send message',
    deleteMessage: 'Delete message'
  },
  modal: {
    createChannelTitle: 'Create a new channel',
    createChannelDesc: 'Channels help organize your discussions by topics.',
    channelPlaceholder: 'Channel name (e.g. general)',
    create: 'Create',
    cancel: 'Cancel',
    createServerTitle: 'Create a new space',
    createServerDesc: 'Give your server a name to start chatting with your community.',
    serverPlaceholder: 'Server name',
    settingsTitle: 'Account Settings & GDPR',
    close: 'Close'
  },
  settings: {
    myProfile: 'My Profile',
    gdprTab: 'Data & GDPR',
    displayName: 'Display Name (Right to rectification)',
    namePlaceholder: 'Your new name',
    save: 'Save',
    portabilityTitle: 'Data Portability (Art. 20)',
    portabilityDesc: 'You have the right to obtain and reuse your personal data for your own purposes. Download a structured JSON archive of your profile, created servers, and all sent messages.',
    downloadBtn: 'Download my data (JSON)',
    erasureTitle: 'Right to Erasure / to be Forgotten (Art. 17)',
    erasureDesc: 'This action is irreversible. It will permanently delete your user profile, owned servers, channels, and all your messages from our database.',
    deleteBtn: 'Delete my account',
    deleteWarning: '⚠️ Warning: To confirm, please type the word {word} below.',
    deleteWord: 'DELETE',
    deletePlaceholder: 'Type {word}',
    confirmBtn: 'Confirm erasure'
  },
  toasts: {
    profileUpdated: 'Profile updated',
    profileUpdatedDesc: 'Your display name has been successfully modified.',
    exportStarted: 'Export started',
    exportStartedDesc: 'The download of your personal data will start.',
    accountDeleted: 'Account deleted',
    accountDeletedDesc: 'Your account and all your data have been permanently erased.',
    error: 'Error',
    profileUpdateError: 'Failed to update profile.',
    exportError: 'Failed to download your data.',
    deleteError: 'Failed to delete your account.',
    success: 'Success'
  },
  privacy: {
    back: 'Back to login',
    badge: 'GDPR Compliant',
    title: 'Privacy Policy',
    subtitle: 'At ChatLive, we protect your personal data. Discover how we collect, use, and secure your information.',
    lastUpdated: 'Last updated: May 22, 2026',
    section1: {
      title: 'Data Controller',
      content: 'The {app} application is managed by the project development team. For any questions or requests regarding the protection of your personal data, you can contact us directly at the e-mail address: {email}.'
    },
    section2: {
      title: 'Collected Personal Data',
      subtitle: 'We collect only the data strictly necessary for the operation and improvement of the live chat service:',
      item1Title: 'Profile Data (from GitHub OAuth):',
      item1Text: ' Full Name / Pseudo, Email address, profile photo URL (avatar).',
      item2Title: 'Created Content:',
      item2Text: ' Sent chat messages, created servers, and channels.',
      item3Title: 'Session Data:',
      item3Text: ' Encrypted session identifiers stored as cookies (required to keep you safely logged in).'
    },
    section3: {
      title: 'Purpose and Legal Basis',
      subtitle: 'In accordance with Article 6 of the GDPR, the processing of your data is based on the following grounds:',
      item1Title: 'Performance of a contract (Art. 6.1.b GDPR):',
      item1Text: ' Provision of the chat service, authentication, and connection with other users.',
      item2Title: 'Your consent (Art. 6.1.a GDPR):',
      item2Text: ' Provided explicitly at the time of your connection.'
    },
    section4: {
      title: 'Data Retention Period',
      content: 'Your profile personal data and messages are retained as long as your account is active. If you decide to delete your account via the application\'s settings, all of your profile data, servers, and messages will be permanently and immediately purged from our databases in a secure and irreversible manner (Right to be forgotten).'
    },
    section5: {
      title: 'Your GDPR Rights',
      subtitle: 'The GDPR grants you fundamental rights over your data. In ChatLive\'s Account Settings space, you can exercise these rights independently:',
      item1Title: 'Right to rectification (Art. 16):',
      item1Text: ' You can modify your display name at any time.',
      item2Title: 'Right to erasure / to be forgotten (Art. 17):',
      item2Text: ' You can delete your account at any time to instantly destroy all your data.',
      item3Title: 'Right of access and portability (Art. 15 & 20):',
      item3Text: ' You can download all your personal data as a structured JSON file in a single click.'
    },
    section6: {
      title: 'Data Security',
      content: 'We implement advanced technical security measures to protect your information, including the use of HTTPS for all network exchanges, hashing of sensitive information, and strong encryption of login sessions (via nuxt-auth-utils).'
    },
    footer: 'ChatLive © 2026 - Developed with respect for your privacy.'
  },
  terms: {
    back: 'Back to login',
    badge: 'ChatLive Terms',
    title: 'Terms of Service',
    subtitle: 'Rules and conditions of access to the ChatLive real-time messaging platform.',
    lastUpdated: 'Last updated: May 22, 2026',
    section1: {
      title: 'Acceptance of Terms',
      content: 'Access to and use of ChatLive are subject to full and complete acceptance of these Terms of Service. By logging into our application via GitHub OAuth or via developer mode, you declare your unreserved acceptance of these terms.'
    },
    section2: {
      title: 'Description of the Service',
      content: 'ChatLive is a real-time collaborative communication application. It allows registered users to create discussion servers, define channels, and exchange instant written messages. The service is provided free of charge in the current state of its development.'
    },
    section3: {
      title: 'User Conduct',
      subtitle: 'By using ChatLive, you agree to respect the rules of decency and legality in force:',
      item1: 'No hateful, threatening, racist, homophobic, defamatory, or unlawful content will be tolerated in messages or channel names.',
      item2: 'No malicious activity or attempt to disrupt the real-time messaging service is tolerated.',
      item3: 'Any breach may lead to the immediate and permanent block or deletion of your user account.'
    },
    section4: {
      title: 'Liability',
      content: 'Messages sent by users are under their full and unique individual responsibility. The publisher of ChatLive can in no way be held responsible for comments made by users on servers or discussion channels. The publisher strives to maintain the service available without a guarantee of interruption.'
    },
    section5: {
      title: 'Intellectual Property',
      content: 'The source code of ChatLive is governed by the open-source license specified in the project. Trademarks, logos, and graphic interfaces remain the exclusive property of ChatLive and its creators.'
    },
    footer: 'Terms of Service'
  },
  invite: {
    buttonTooltip: 'Invite members',
    modalTitle: 'Invite friends to {server}',
    modalDesc: 'Share this link with your friends to grant them access to your server.',
    copyBtn: 'Copy link',
    copiedBtn: 'Link copied!',
    toastSuccess: 'Link copied',
    toastSuccessDesc: 'The invite link has been copied to your clipboard.',
    joiningTitle: 'Joining server...',
    joiningSubtitle: 'Please wait while we add you to the server.',
    joinErrorTitle: 'Invite error',
    joinErrorDesc: 'This invite link is invalid, expired, or you do not have the required permissions to join.',
    backHome: 'Back to Home',
    confirmTitle: 'Join a Space',
    confirmDesc: 'You have been invited to join the server {server}.',
    createdBy: 'Created by',
    joinBtn: 'Join Server',
    cancelBtn: 'Later',
    joiningProgress: 'Joining...'
  }
}
