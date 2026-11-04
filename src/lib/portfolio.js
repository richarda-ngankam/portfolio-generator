export const THEMES = [
  { id: 'une', name: 'Une', description: 'Couverture de magazine', cls: 'theme-une' },
  { id: 'ardoise', name: 'Ardoise', description: 'CV en deux colonnes', cls: 'theme-ardoise' },
  { id: 'frise', name: 'Frise', description: 'Chronologie verticale', cls: 'theme-frise' },
  { id: 'affiche', name: 'Affiche', description: 'Typographie XXL', cls: 'theme-affiche' },
  { id: 'bento', name: 'Bento', description: 'Grille de tuiles', cls: 'theme-bento' },
  { id: 'carnet', name: 'Carnet', description: 'Cahier de notes', cls: 'theme-carnet' },
  { id: 'terminal', name: 'Terminal', description: 'Éditeur de code', cls: 'theme-terminal' },
  { id: 'pop', name: 'Pop', description: 'Couleurs et contrastes', cls: 'theme-pop' },
  { id: 'suisse', name: 'Suisse', description: 'Grille structurée', cls: 'theme-suisse' },
  { id: 'galerie', name: 'Galerie', description: 'Portfolio créatif sombre', cls: 'theme-galerie' },
]

export const SECTION_DEFS = [
  { id: 'identity', fields: ['name', 'profession', 'tagline', 'bio', 'city', 'country', 'photo'] },
  { id: 'contacts', fields: ['email', 'phone', 'github', 'linkedin', 'customLinks'] },
  { id: 'experience', fields: ['experiences'] },
  { id: 'education', fields: ['education'] },
  { id: 'skills', fields: ['skills'] },
  { id: 'languages', fields: ['languages'] },
  { id: 'certifications', fields: ['certifications'] },
  { id: 'projects', fields: ['projects'] },
  { id: 'hobbies', fields: ['hobbies'] },
  { id: 'custom', fields: ['customTitle', 'customContent'] },
]

export const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2)

export function slugify(s) {
  return (
    String(s || 'portfolio')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'portfolio'
  )
}

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '')

// Un portfolio VIDE. Les clés accentuées sont celles attendues par db.js.
export function createPortfolio(themeId, langue = 'fr') {
  return {
    id: uid(),
    titre: '',
    langue,
    themeId,
    couleurAccent: '#6478df',
    couleurFond: '#ffffff',
    formePhoto: 'round',
    ordreSections: SECTION_DEFS.map((s) => s.id),
    sectionsMasquées: [],
    titresRenommés: {},
    statut: 'brouillon',
    visibilité: 'privé',
    slug: '',
    contactsAffichés: { email: true, phone: true, github: true, linkedin: true },
    versions: [],
    dateModification: new Date().toISOString(),
    publishedSnapshot: null,
    publication: { active: false, title: '', description: '', image: '' },
    name: '',
    profession: '',
    tagline: '',
    bio: '',
    city: '',
    country: '',
    photo: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    customLinks: [],
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    hobbies: [],
    customTitle: '',
    customContent: '',
  }
}