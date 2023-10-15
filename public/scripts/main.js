'use strict';

// public key generated from here 
// https://web-push-codelab.glitch.me/
const applicationServerPublicKey = 'BHLnEHQb98H7RbSVD8tELjbLK_lwlXDzvqtWiT-js3iGbl6pqYVTU6J8f7mZcP9wT2AxBDjFak2Nnp8lZFk__cY';

const pushButton = document.querySelector('.js-push-btn');
const sendWebPush = document.querySelector('.js-send-push-btn');

let isSubscribed = false;
let swRegistration = null;

// Register service provider for web push
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('./scripts/sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    initializeUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}


function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function initializeUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  sendWebPush.addEventListener('click', function() {
    const title = 'Push Codelab';
    const options = {
      body: 'Yeah It is working.',
      icon: 'images/push-icon.png',
      // You can add more options here
    };
  
    if (isSubscribed) {
      showLocalNotification(title, options, swRegistration); 
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

function showLocalNotification(title, options, swRegistration) {
  swRegistration.showNotification(title, options);
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(error) {
    console.error('Failed to subscribe the user: ', error);
    updateBtn();
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then((subscription) => {
    subscription
      .unsubscribe()
      .then((successful) => {
        isSubscribed = false;
        console.log("You've successfully unsubscribed");
      })
      .catch((e) => {
        console.log("Unsubscribing failed");
      });
  })
  .catch(function(error) {
    console.error('Failed to subscribe the user: ', error);
    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}
