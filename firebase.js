import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJ0lI-zofeUtjOypurdX4Xa9dX09EwRRM",
  authDomain: "sitepedido-79bb0.firebaseapp.com",
  projectId: "sitepedido-79bb0",
  storageBucket: "sitepedido-79bb0.firebasestorage.app",
  messagingSenderId: "889662198209",
  appId: "1:889662198209:web:67c2d2f01df5d75b4f5f40"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
