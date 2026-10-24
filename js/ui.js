

import {
  photoSection,
  frameSection,
  logoSection,
} from './dom.js';


export const closeAllSections = () => {
  photoSection.open = false;
  frameSection.open = false;
  logoSection.open = false;
};

export const openSection = (targetSection) => {
  closeAllSections();
  targetSection.open = true;
};
