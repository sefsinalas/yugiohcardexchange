import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, addDoc, collection, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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
    await createUserWithEmailAndPassword(auth, emailEl.value, passwordEl.value);
  } catch (e) {
    alert(e);
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    await signInWithEmailAndPassword(auth, emailEl.value, passwordEl.value);
  } catch (e) {
    alert(e);
  }
});

logoutBtn.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (user) {
    logoutBtn.style.display = 'inline';
    accountSection.style.display = 'block';
    sellSection.style.display = 'block';
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      phoneEl.value = data.phone || '';
    }
  } else {
    logoutBtn.style.display = 'none';
    accountSection.style.display = 'none';
    sellSection.style.display = 'none';
  }
  loadPosts();
});

saveAccountBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;
  let photoURL = null;
  const file = profilePicEl.files[0];
  if (file) {
    const imgRef = storageRef(storage, `profilePics/${user.uid}`);
    await uploadBytes(imgRef, file);
    photoURL = await getDownloadURL(imgRef);
  }
  await setDoc(doc(db, 'users', user.uid), {
    phone: phoneEl.value,
    photoURL
  }, { merge: true });
  alert('Account saved');
});

createPostBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return;
  const files = Array.from(photosEl.files);
  const urls = [];
  for (const f of files) {
    const r = storageRef(storage, `posts/${user.uid}/${Date.now()}_${f.name}`);
    await uploadBytes(r, f);
    urls.push(await getDownloadURL(r));
  }
  await addDoc(collection(db, 'posts'), {
    uid: user.uid,
    title: titleEl.value,
    price: Number(priceEl.value),
    description: descEl.value,
    images: urls,
    status: 'open',
    created: Date.now()
  });
  titleEl.value = '';
  priceEl.value = '';
  descEl.value = '';
  photosEl.value = '';
  loadPosts();
});

sortEl.addEventListener('ionChange', loadPosts);

async function loadPosts() {
  postList.innerHTML = '';
  let q = query(collection(db, 'posts'), where('status', '==', 'open'));
  if (sortEl.value === 'date') {
    q = query(q, orderBy('created', 'desc'));
  } else if (sortEl.value === 'low') {
    q = query(q, orderBy('price', 'asc'));
  } else if (sortEl.value === 'high') {
    q = query(q, orderBy('price', 'desc'));
  }
  const snap = await getDocs(q);
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<h3>${data.title}</h3>` +
      `<p>Price: $${data.price}</p>` +
      `<p>${data.description}</p>`;
    for (const url of data.images) {
      const img = document.createElement('img');
      img.src = url;
      div.appendChild(img);
    }
    const userDoc = await getDoc(doc(db, 'users', data.uid));
    const phone = userDoc.exists() ? userDoc.data().phone : '';
    const waBtn = document.createElement('a');
    waBtn.href = `https://wa.me/${phone}?text=I'm%20interested%20in%20your%20card%20${encodeURIComponent(data.title)}`;
    waBtn.target = '_blank';
    waBtn.textContent = 'Contact via WhatsApp';
    div.appendChild(waBtn);
    if (auth.currentUser && auth.currentUser.uid === data.uid) {
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.addEventListener('click', async () => {
        await updateDoc(doc(db, 'posts', docSnap.id), { status: 'closed' });
        loadPosts();
      });
      div.appendChild(closeBtn);
    }
    postList.appendChild(div);
  }
}

