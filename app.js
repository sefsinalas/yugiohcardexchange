// Use Appwrite SDK installed via npm to avoid CDN-related issues.
import { Client, Account, Databases, Storage, ID, Query } from 'cdn.jsdelivr.net/npm/appwrite@18.1.1';
import env from './env.js';

const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = env.APPWRITE_DATABASE_ID;
const POSTS_COLLECTION = env.APPWRITE_POSTS_COLLECTION_ID;
const BUCKET_ID = env.APPWRITE_BUCKET_ID;

const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const accountSection = document.getElementById('account');
const phoneEl = document.getElementById('phone');
const profilePicEl = document.getElementById('profilePic');
const saveAccountBtn = document.getElementById('saveAccount');
const sellSection = document.getElementById('sell');
const titleEl = document.getElementById('title');
const priceEl = document.getElementById('price');
const descEl = document.getElementById('description');
const photosEl = document.getElementById('photos');
const createPostBtn = document.getElementById('createPost');
const sortEl = document.getElementById('sort');
const postList = document.getElementById('postList');

registerBtn.addEventListener('click', async () => {
  try {
    await account.create(ID.unique(), emailEl.value, passwordEl.value);
    await account.createEmailSession(emailEl.value, passwordEl.value);
    await checkUser();
  } catch (e) {
    alert(e);
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    await account.createEmailSession(emailEl.value, passwordEl.value);
    await checkUser();
  } catch (e) {
    alert(e);
  }
});

logoutBtn.addEventListener('click', async () => {
  await account.deleteSession('current');
  await checkUser();
});

async function checkUser() {
  try {
    await account.get();
    logoutBtn.style.display = 'inline';
    accountSection.style.display = 'block';
    sellSection.style.display = 'block';
    const prefs = await account.getPrefs();
    phoneEl.value = prefs.phone || '';
  } catch (e) {
    logoutBtn.style.display = 'none';
    accountSection.style.display = 'none';
    sellSection.style.display = 'none';
  }
  loadPosts();
}

checkUser();

saveAccountBtn.addEventListener('click', async () => {
  try {
    const user = await account.get();
    let photoURL = null;
    const file = profilePicEl.files[0];
    if (file) {
      const fileId = ID.unique();
      await storage.createFile(BUCKET_ID, fileId, file);
      photoURL = storage.getFileView(BUCKET_ID, fileId);
    }
    await account.updatePrefs({
      phone: phoneEl.value,
      photoURL
    });
    alert('Account saved');
  } catch (e) {
    alert(e);
  }
});

createPostBtn.addEventListener('click', async () => {
  try {
    const user = await account.get();
    const files = Array.from(photosEl.files);
    const urls = [];
    for (const f of files) {
      const id = ID.unique();
      await storage.createFile(BUCKET_ID, id, f);
      urls.push(storage.getFileView(BUCKET_ID, id));
    }
    await databases.createDocument(DB_ID, POSTS_COLLECTION, ID.unique(), {
      uid: user.$id,
      title: titleEl.value,
      price: Number(priceEl.value),
      description: descEl.value,
      images: urls,
      phone: phoneEl.value,
      status: 'open',
      created: Date.now()
    });
    titleEl.value = '';
    priceEl.value = '';
    descEl.value = '';
    photosEl.value = '';
    loadPosts();
  } catch (e) {
    alert(e);
  }
});

sortEl.addEventListener('ionChange', loadPosts);

async function loadPosts() {
  postList.innerHTML = '';
  const queries = [Query.equal('status', 'open')];
  if (sortEl.value === 'date') {
    queries.push(Query.orderDesc('created'));
  } else if (sortEl.value === 'low') {
    queries.push(Query.orderAsc('price'));
  } else if (sortEl.value === 'high') {
    queries.push(Query.orderDesc('price'));
  }
  try {
    const snap = await databases.listDocuments(DB_ID, POSTS_COLLECTION, queries);
    for (const docSnap of snap.documents) {
      const data = docSnap;
      const card = document.createElement('ion-card');
      card.innerHTML = `
        <ion-card-header>
          <ion-card-title>${data.title}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Price: $${data.price}</p>
          <p>${data.description}</p>
        </ion-card-content>
      `;
      for (const url of data.images) {
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        card.appendChild(img);
      }
      const phone = data.phone || '';
      const waBtn = document.createElement('ion-button');
      waBtn.href = `https://wa.me/${phone}?text=I'm%20interested%20in%20your%20card%20${encodeURIComponent(data.title)}`;
      waBtn.target = '_blank';
      waBtn.innerText = 'Contact via WhatsApp';
      waBtn.fill = 'outline';
      card.appendChild(waBtn);
      try {
        const current = await account.get();
        if (current.$id === data.uid) {
          const closeBtn = document.createElement('ion-button');
          closeBtn.innerText = 'Close';
          closeBtn.addEventListener('click', async () => {
            await databases.updateDocument(DB_ID, POSTS_COLLECTION, docSnap.$id, { status: 'closed' });
            loadPosts();
          });
          card.appendChild(closeBtn);
        }
      } catch (_) {}
      postList.appendChild(card);
    }
  } catch (e) {
    console.error(e);
  }
}
