import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  deleteUser,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'

// Un document Firestore ne dépasse pas 1 Mo : on garde une marge
const MAX_BYTES = 900000

// Retire les valeurs "undefined" (Firestore les refuse)
const clean = (obj) => JSON.parse(JSON.stringify(obj))

function checkSize(data) {
  if (new Blob([JSON.stringify(data)]).size > MAX_BYTES) {
    throw new Error('Portfolio trop volumineux : réduis la taille des images.')
  }
}

function requireUid() {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Connecte-toi pour continuer.')
  return uid
}

export const DB = {
  /* ---------- COMPTES ---------- */
  onUser(callback) {
    return onAuthStateChanged(auth, callback)
  },

  async signUp(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (name) await updateProfile(cred.user, { displayName: name })
    await setDoc(
      doc(db, 'users', cred.user.uid),
      { name: name || '', createdAt: serverTimestamp() },
      { merge: true }
    )
    try {
      await sendEmailVerification(cred.user)
    } catch (e) {
      // L'envoi de l'email de vérification ne doit pas bloquer l'inscription
    }
    return cred.user
  },

  async signIn(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  },

  signOut() {
    return signOut(auth)
  },

  resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  },

  async saveSettings(settings) {
    const uid = requireUid()
    await setDoc(doc(db, 'users', uid), clean(settings), { merge: true })
  },

  async getSettings() {
    const uid = requireUid()
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data() : {}
  },

  // Supprime les portfolios, les copies publiées, le profil, puis le compte.
  // Firebase peut demander de se reconnecter (auth/requires-recent-login).
  async deleteAccount() {
    const user = auth.currentUser
    if (!user) throw new Error('Connecte-toi pour continuer.')
    const mine = await getDocs(
      query(collection(db, 'portfolios'), where('ownerId', '==', user.uid))
    )
    const pubs = await getDocs(
      query(collection(db, 'published'), where('ownerId', '==', user.uid))
    )
    const batch = writeBatch(db)
    mine.forEach((d) => batch.delete(d.ref))
    pubs.forEach((d) => batch.delete(d.ref))
    batch.delete(doc(db, 'users', user.uid))
    await batch.commit()
    await deleteUser(user)
  },

  /* ---------- PORTFOLIOS ---------- */
  async listPortfolios() {
    const uid = auth.currentUser?.uid
    if (!uid) return []
    const snap = await getDocs(
      query(collection(db, 'portfolios'), where('ownerId', '==', uid))
    )
    return snap.docs
      .map((d) => d.data())
      .sort((a, b) =>
        (b.dateModification || '').localeCompare(a.dateModification || '')
      )
  },

  async getPortfolio(id) {
    const snap = await getDoc(doc(db, 'portfolios', id))
    return snap.exists() ? snap.data() : null
  },

  async savePortfolio(p) {
    const uid = requireUid()
    const data = clean({
      ...p,
      ownerId: uid,
      dateModification: new Date().toISOString(),
    })
    checkSize(data)
    await setDoc(doc(db, 'portfolios', data.id), data)
    return data
  },

  async removePortfolio(id, slug) {
    requireUid()
    await deleteDoc(doc(db, 'portfolios', id))
    if (slug) {
      try {
        await deleteDoc(doc(db, 'published', slug))
      } catch (e) {
        // La copie publiée n'existait pas : rien à faire
      }
    }
  },

  /* ---------- PUBLICATION ---------- */
  // La page publique est une COPIE figée, distincte du brouillon.
  // Les contacts masqués n'y sont JAMAIS présents.
  async publish(p, previousSlug) {
    const uid = requireUid()
    const slug = p.slug
    if (!/^[a-z0-9-]{3,40}$/.test(slug || '')) {
      throw new Error(
        'Adresse invalide : 3 à 40 caractères (lettres minuscules, chiffres, tirets).'
      )
    }
    const visibility =
      p['visibilité'] === 'public'
        ? 'public'
        : p['visibilité'] === 'non listé'
        ? 'unlisted'
        : null
    if (!visibility) {
      throw new Error('Choisis « public » ou « non listé » pour publier.')
    }

    const existing = await getDoc(doc(db, 'published', slug))
    if (existing.exists() && existing.data().ownerId !== uid) {
      throw new Error('Cette adresse est déjà prise.')
    }

    const copy = clean(p)
    for (const k of ['email', 'phone', 'github', 'linkedin']) {
      if (!copy.contactsAffichés?.[k]) copy[k] = ''
    }
    delete copy.publishedSnapshot
    delete copy.versions

    const data = {
      ownerId: uid,
      slug,
      visibility,
      publishedAt: new Date().toISOString(),
      portfolio: copy,
    }
    checkSize(data)
    await setDoc(doc(db, 'published', slug), data)

    // Si l'adresse a changé, on retire l'ancienne copie
    if (previousSlug && previousSlug !== slug) {
      try {
        await deleteDoc(doc(db, 'published', previousSlug))
      } catch (e) {
        // Ancienne copie déjà absente
      }
    }
    return data
  },

  async unpublish(slug) {
    requireUid()
    await deleteDoc(doc(db, 'published', slug))
  },

  // Utilisable sans être connecté (page publique)
  async getPublished(slug) {
    const snap = await getDoc(doc(db, 'published', slug))
    return snap.exists() ? snap.data() : null
  },
}