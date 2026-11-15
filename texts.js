/* ============================================================
   texts.js — усі тексти сайту в одному місці
   Змінюйте або перекладайте тексти тут, app.js чіпати не треба.
   ============================================================ */
window.TEXTS = {
  /* Загальне */
  pageTitle: 'Cosmic Dynamics',
  brandFirst: 'COSMIC',
  brandSecond: 'DYNAMICS',
  title: 'Inner Solar System & Kepler Laws Visualization',
  userName: 'Alex Peterson',
  searchPlaceholder: 'Search phenomena...',
  simulationDate: 'Simulation Date:',
  copyright: 'Copyright © Cosmic Dynamics. All rights reserved.',

  /* Область планет (заглушка) */
  planetAreaPlaceholder: 'Planet area',

  /* Бічне меню: групи та пункти.
     label = текст у меню, value = що показується внизу сторінки */
  keplerGroup: 'Kepler Laws',
  keplerItems: [
    {label: 'General Introduction',        value: 'General Introduction'},
    {label: 'Kepler 1: Elliptical Orbits', value: 'Elliptical Orbits'},
    {label: 'Kepler 2: Equal Areas',       value: 'Equal Areas'},
    {label: 'Kepler 3: Harmonics',         value: 'Harmonics'}
  ],
  lagrangeGroup: 'Lagrange Points',
  lagrangeItems: [
    {label: 'What are L-Points?',            value: 'What are L-Points?'},
    {label: 'Three-Body Problem',            value: 'Three-Body Problem'},
    {label: 'L1, L2, L3, L4, L5 Detailed',   value: 'Earth-Moon L2'}
  ],
  navItems: ['Celestial Objects', 'Orbits', 'Simulations', 'User Profile'],

  /* Панель керування */
  speed: 'Speed',
  view2d: '2D',
  view3d: '3D',
  showLabels: 'Show labels',
  focusOnEarth: 'Focus on Earth',

  /* Нижні блоки */
  keplerFocusLabel: 'Current Kepler focus:',
  keplerFocusDefault: 'Earth',
  lpointFocusLabel: 'Current L-Point focus:',
  lpointFocusDefault: 'Earth-Moon L2',

  /* Службові підписи (для доступності) */
  menuAria: 'Menu',
  sectionsAria: 'Sections',
  searchAria: 'Search',
  zoomInAria: 'Zoom in',
  zoomOutAria: 'Zoom out'
};