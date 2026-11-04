// Description des sections et de leurs champs (libellés en français)
export const SECTIONS = {
  identity: {
    label: 'Identité',
    fields: [
      { key: 'name', label: 'Nom complet', max: 100 },
      { key: 'profession', label: 'Profession', max: 120 },
      { key: 'tagline', label: 'Accroche', max: 180 },
      { key: 'bio', label: 'Biographie courte', type: 'textarea', max: 500 },
      { key: 'city', label: 'Ville', max: 80 },
      { key: 'country', label: 'Pays', max: 80 },
    ],
  },
  contacts: {
    label: 'Contacts',
    fields: [
      { key: 'email', label: 'Email', type: 'email', max: 150 },
      { key: 'phone', label: 'Téléphone', type: 'tel', max: 35 },
      { key: 'github', label: 'GitHub', type: 'url', max: 250 },
      { key: 'linkedin', label: 'LinkedIn', type: 'url', max: 250 },
    ],
    list: 'customLinks',
  },
  experience: { label: 'Expériences', list: 'experiences' },
  education: { label: 'Formation', list: 'education' },
  skills: { label: 'Compétences', list: 'skills' },
  languages: { label: 'Langues', list: 'languages' },
  certifications: { label: 'Certifications', list: 'certifications' },
  projects: { label: 'Projets', list: 'projects' },
  hobbies: { label: 'Loisirs', list: 'hobbies' },
  custom: {
    label: 'Section libre',
    fields: [
      { key: 'customTitle', label: 'Titre de la section', max: 100 },
      { key: 'customContent', label: 'Contenu de la section', type: 'textarea', max: 1500 },
    ],
  },
}

// Description des listes (une carte par élément)
export const LISTS = {
  customLinks: {
    label: 'Lien',
    add: 'Ajouter un lien',
    fields: [
      { key: 'name', label: 'Nom du lien', max: 250 },
      { key: 'url', label: 'URL', type: 'url', max: 250 },
    ],
  },
  experiences: {
    label: 'Expérience',
    add: 'Ajouter une expérience',
    current: 'En cours / Poste actuel',
    fields: [
      { key: 'position', label: 'Poste', max: 250 },
      { key: 'company', label: 'Entreprise', max: 250 },
      { key: 'startDate', label: 'Début', type: 'month' },
      { key: 'endDate', label: 'Fin', type: 'month' },
      { key: 'description', label: 'Description', type: 'textarea', max: 1500 },
    ],
  },
  education: {
    label: 'Formation',
    add: 'Ajouter une formation',
    current: 'En cours',
    fields: [
      { key: 'degree', label: 'Diplôme / Formation', max: 250 },
      { key: 'school', label: 'Établissement', max: 250 },
      { key: 'startDate', label: 'Début', type: 'month' },
      { key: 'endDate', label: 'Fin', type: 'month' },
      { key: 'description', label: 'Description', type: 'textarea', max: 1500 },
    ],
  },
  skills: {
    label: 'Compétence',
    add: 'Ajouter une compétence',
    fields: [
      { key: 'name', label: 'Compétence', max: 250 },
      { key: 'level', label: 'Niveau', max: 250 },
    ],
  },
  languages: {
    label: 'Langue',
    add: 'Ajouter une langue',
    fields: [
      { key: 'name', label: 'Langue', max: 250 },
      { key: 'level', label: 'Niveau', max: 250 },
    ],
  },
  certifications: {
    label: 'Certification',
    add: 'Ajouter une certification',
    fields: [
      { key: 'name', label: 'Titre', max: 250 },
      { key: 'organization', label: 'Organisme', max: 250 },
      { key: 'year', label: 'Année', type: 'year' },
      { key: 'link', label: 'Lien', type: 'url', max: 250 },
    ],
  },
  projects: {
    label: 'Projet',
    add: 'Ajouter un projet',
    fields: [
      { key: 'title', label: 'Titre', max: 250 },
      { key: 'description', label: 'Description', type: 'textarea', max: 1500 },
      { key: 'link', label: 'Lien', type: 'url', max: 250 },
    ],
  },
  hobbies: {
    label: 'Loisir',
    add: 'Ajouter un loisir',
    fields: [
      { key: 'name', label: 'Loisir', max: 250 },
      { key: 'description', label: 'Description', max: 250 },
    ],
  },
}

// Ordre effectif des sections : l'ordre enregistré, plus les sections éventuellement manquantes
export function orderedSections(ordreSections = []) {
  const known = ordreSections.filter((id) => SECTIONS[id])
  const missing = Object.keys(SECTIONS).filter((id) => !known.includes(id))
  return [...known, ...missing]
}