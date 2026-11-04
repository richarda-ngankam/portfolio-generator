import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDDlRnaLTkeH9LWzb0s22NzRp-k82AKCLM',
  authDomain: 'portfolio-generator-f6835.firebaseapp.com',
  projectId: 'portfolio-generator-f6835',
  storageBucket: 'portfolio-generator-f6835.firebasestorage.app',
  messagingSenderId: '378955836317',
  appId: '1:378955836317:web:015770a5ddb6f11e445d74',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)