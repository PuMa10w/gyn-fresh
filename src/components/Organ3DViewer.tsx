import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import type { Disease } from '../types';
import { isObstetricsLabel, repairText } from '../utils/textRepair';

type AtlasScene =
  | 'overview'
  | 'uterus'
  | 'endometrium'
  | 'cervix'
  | 'ovary'
  | 'tube'
  | 'pregnancy'
  | 'placenta'
  | 'labor'
  | 'oncology'
  | 'ultrasound';
type AtlasRisk = 'routine' | 'attention' | 'urgent';
type LinkedModalTab = 'quick' | 'diagnostics' | 'ultrasound' | 'treatment' | 'management' | 'patient-memo';

interface AnatomyHotspot {
  id: string;
  label: string;
  organ: string;
  clinicalMeaning: string;
  risk: AtlasRisk;
  position: [number, number, number];
  linkedTab?: LinkedModalTab;
}

interface Organ3DViewerProps {
  organType?: 'uterus' | 'ovary' | 'fallopian_tube';
  disease?: Disease;
  className?: string;
  onNavigateTab?: (tab: LinkedModalTab) => void;
}

const sceneLabels: Record<AtlasScene, string> = {
  overview: 'Обзор',
  uterus: 'Матка',
  endometrium: 'Эндометрий',
  cervix: 'Шейка',
  ovary: 'Яичники',
  tube: 'Трубы',
  pregnancy: 'Беременность',
  placenta: 'Плацента',
  labor: 'Роды',
  oncology: 'Онкогинекология',
  ultrasound: 'УЗИ-срез',
};

const riskLabels: Record<AtlasRisk, string> = {
  routine: 'планово',
  attention: 'контроль',
  urgent: 'срочно',
};

const sceneHotspots: Record<AtlasScene, AnatomyHotspot[]> = {
  overview: [
    {
      id: 'pelvic-overview-uterus',
      label: 'Матка и шейка',
      organ: 'матка',
      clinicalMeaning: 'Центральная зона для АМК, миомы, аденомиоза, полипов и акушерской оценки.',
      risk: 'routine',
      position: [0, 0.1, 0.72],
      linkedTab: 'quick',
    },
    {
      id: 'pelvic-overview-adnexa',
      label: 'Придатки',
      organ: 'яичники и трубы',
      clinicalMeaning: 'Оценивайте при боли, кистах, ВЗОМТ, перекруте и внематочной беременности.',
      risk: 'attention',
      position: [-1.1, 0.1, 0.46],
      linkedTab: 'diagnostics',
    },
  ],
  uterus: [
    {
      id: 'fibroid-node',
      label: 'Миоматозный узел',
      organ: 'миометрий',
      clinicalMeaning: 'Обратите внимание на тип узла, связь с полостью матки, кровотечение и репродуктивные планы.',
      risk: 'attention',
      position: [0.45, 0.28, 0.82],
      linkedTab: 'ultrasound',
    },
    {
      id: 'adenomyosis-zone',
      label: 'Аденомиоз',
      organ: 'миометрий',
      clinicalMeaning: 'Диффузное поражение миометрия часто требует экспертного УЗИ или МРТ при неясной картине.',
      risk: 'attention',
      position: [-0.12, -0.05, 0.85],
      linkedTab: 'ultrasound',
    },
    {
      id: 'endometrial-polyp',
      label: 'Полип эндометрия',
      organ: 'полость матки',
      clinicalMeaning: 'Фокус в полости матки: оцените АМК, бесплодие, возраст и необходимость гистологии.',
      risk: 'routine',
      position: [0.05, 0.62, 0.96],
      linkedTab: 'diagnostics',
    },
  ],
  endometrium: [
    {
      id: 'endometrium-thickness',
      label: 'Толщина эндометрия',
      organ: 'эндометрий',
      clinicalMeaning: 'Связана с фазой цикла, АМК, гиперплазией, бесплодием и риском неоплазии в постменопаузе.',
      risk: 'attention',
      position: [0.02, 0.46, 1.02],
      linkedTab: 'ultrasound',
    },
    {
      id: 'endometrium-focal-lesion',
      label: 'Фокус в полости',
      organ: 'полость матки',
      clinicalMeaning: 'Полип или субмукозный узел требует сопоставления с кровотечением, возрастом и репродуктивными планами.',
      risk: 'routine',
      position: [0.18, 0.62, 1.08],
      linkedTab: 'diagnostics',
    },
  ],
  cervix: [
    {
      id: 'cervix-screening-zone',
      label: 'Зона трансформации',
      organ: 'шейка матки',
      clinicalMeaning: 'Ключевая область для ВПЧ-ассоциированной патологии, цитологии, кольпоскопии и биопсии.',
      risk: 'attention',
      position: [0, -0.66, 0.82],
      linkedTab: 'diagnostics',
    },
    {
      id: 'cervix-length-risk',
      label: 'Длина шейки',
      organ: 'шейка матки',
      clinicalMeaning: 'В акушерстве короткая шейка меняет маршрут наблюдения и профилактики преждевременных родов.',
      risk: 'urgent',
      position: [0, -0.92, 0.92],
      linkedTab: 'management',
    },
  ],
  ovary: [
    {
      id: 'ovarian-cyst',
      label: 'Киста яичника',
      organ: 'яичник',
      clinicalMeaning: 'Важно описать размер, перегородки, солидные компоненты, кровоток и симптомы.',
      risk: 'attention',
      position: [-1.18, 0.1, 0.76],
      linkedTab: 'ultrasound',
    },
    {
      id: 'pcos-follicles',
      label: 'СПКЯ-паттерн',
      organ: 'яичник',
      clinicalMeaning: 'Схема показывает множественные фолликулы; диагноз нельзя ставить только по УЗИ.',
      risk: 'routine',
      position: [1.16, 0.12, 0.78],
      linkedTab: 'diagnostics',
    },
    {
      id: 'torsion-warning',
      label: 'Перекрут',
      organ: 'придатки',
      clinicalMeaning: 'Острая боль, тошнота и увеличенный яичник требуют срочной оценки.',
      risk: 'urgent',
      position: [1.0, -0.18, 0.66],
      linkedTab: 'quick',
    },
  ],
  tube: [
    {
      id: 'ectopic-ampulla',
      label: 'Внематочная беременность',
      organ: 'маточная труба',
      clinicalMeaning: 'Задержка, боль, кровянистые выделения и положительный ХГЧ требуют срочного алгоритма.',
      risk: 'urgent',
      position: [1.05, 0.38, 0.62],
      linkedTab: 'quick',
    },
    {
      id: 'hydrosalpinx',
      label: 'Гидросальпинкс',
      organ: 'маточная труба',
      clinicalMeaning: 'Трубный фактор важен при бесплодии и планировании ВРТ.',
      risk: 'attention',
      position: [-1.05, 0.32, 0.62],
      linkedTab: 'diagnostics',
    },
  ],
  pregnancy: [
    {
      id: 'placenta-low',
      label: 'Низкая плацентация',
      organ: 'плацента',
      clinicalMeaning: 'Положение плаценты уточняется по сроку беременности и данным УЗИ.',
      risk: 'attention',
      position: [0.34, -0.32, 0.94],
      linkedTab: 'ultrasound',
    },
    {
      id: 'cervix-length',
      label: 'Шейка матки',
      organ: 'шейка',
      clinicalMeaning: 'Длина шейки и акушерский анамнез определяют маршрут наблюдения.',
      risk: 'attention',
      position: [0, -0.92, 0.9],
      linkedTab: 'management',
    },
  ],
  placenta: [
    {
      id: 'placenta-location',
      label: 'Локализация плаценты',
      organ: 'плацента',
      clinicalMeaning: 'Низкое расположение или предлежание влияет на осмотр, риск кровотечения и план родоразрешения.',
      risk: 'attention',
      position: [0.38, -0.18, 1.02],
      linkedTab: 'ultrasound',
    },
    {
      id: 'placenta-abruption',
      label: 'Отслойка',
      organ: 'плацента',
      clinicalMeaning: 'Боль, гипертонус, кровотечение и нарушение состояния плода требуют срочного акушерского алгоритма.',
      risk: 'urgent',
      position: [-0.24, -0.04, 1.03],
      linkedTab: 'quick',
    },
  ],
  labor: [
    {
      id: 'labor-descent',
      label: 'Продвижение головки',
      organ: 'родовой канал',
      clinicalMeaning: 'При затяжных родах оценивают динамику раскрытия, станцию, позицию и признаки клинического несоответствия.',
      risk: 'attention',
      position: [0, -1.16, 0.78],
      linkedTab: 'management',
    },
    {
      id: 'labor-fetal-distress',
      label: 'Дистресс плода',
      organ: 'плод',
      clinicalMeaning: 'Патологическая КТГ меняет тактику и может потребовать ускорения родоразрешения.',
      risk: 'urgent',
      position: [0.26, -0.2, 1.08],
      linkedTab: 'quick',
    },
  ],
  oncology: [
    {
      id: 'cervix-risk',
      label: 'Шейка матки',
      organ: 'шейка',
      clinicalMeaning: 'При подозрении на CIN/рак важны цитология, ВПЧ, кольпоскопия и биопсия.',
      risk: 'attention',
      position: [0, -0.72, 0.92],
      linkedTab: 'diagnostics',
    },
    {
      id: 'endometrium-risk',
      label: 'Эндометрий',
      organ: 'эндометрий',
      clinicalMeaning: 'АМК в пери- и постменопаузе требует исключения гиперплазии и рака эндометрия.',
      risk: 'attention',
      position: [0, 0.4, 0.96],
      linkedTab: 'diagnostics',
    },
  ],
  ultrasound: [
    {
      id: 'ultrasound-probe-view',
      label: 'Трансвагинальный срез',
      organ: 'малый таз',
      clinicalMeaning: 'Схема помогает понять, где искать эндометрий, миометрий, яичники и свободную жидкость.',
      risk: 'routine',
      position: [0, 0, 1.02],
      linkedTab: 'ultrasound',
    },
  ],
};

const getDiseaseScene = (disease?: Disease, organType?: Organ3DViewerProps['organType']): AtlasScene => {
  if (!disease) {
    if (organType === 'ovary') return 'ovary';
    if (organType === 'fallopian_tube') return 'tube';
    return 'overview';
  }

  if (disease.atlasScene && disease.atlasScene in sceneLabels) return disease.atlasScene as AtlasScene;
  const text = repairText(`${disease.name} ${disease.subtitle} ${disease.icd} ${disease.description}`).toLowerCase();
  if (/род|затяжн|роды|родоразреш/.test(text) || /^O6|^O7/.test(disease.icd ?? '')) return 'labor';
  if (/плацент|кровотеч.*беремен|предлеж|отслойк/.test(text) || ['O44', 'O45', 'O46'].some((code) => disease.icd?.startsWith(code))) return 'placenta';
  if (/шейк|цервик|cin|дисплаз|ицн/.test(text)) return 'cervix';
  if (/эндометр|полип|гиперплаз|амк|кровотеч/.test(text)) return 'endometrium';
  if (disease.icd?.startsWith('O') || isObstetricsLabel(disease.subtitle) || /беремен|преэкламп/.test(text)) return 'pregnancy';
  if (/рак|cin|дисплаз|неоплаз|онко|злокаче|карцин/.test(text)) return 'oncology';
  if (/внематоч|труб|сальпинг|гидросальпинкс/.test(text)) return 'tube';
  if (/яичник|кист|спкя|апоплекс|перекрут|овари/.test(text)) return 'ovary';
  if (/узи|сонограф|эхограф/.test(text)) return 'ultrasound';
  return 'uterus';
};

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const makeMaterial = (color: string, opacity = 0.92, roughness = 0.72) =>
  new THREE.MeshStandardMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    roughness,
    metalness: 0.03,
  });

const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
    else material?.dispose?.();
  });
};

const createTube = (points: THREE.Vector3[], color: string, radius = 0.055) => {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 36, radius, 14, false);
  return new THREE.Mesh(geometry, makeMaterial(color, 0.9));
};

const addBasePelvis = (group: THREE.Group, scene: AtlasScene) => {
  const uterusMaterial = makeMaterial(scene === 'pregnancy' ? '#E7A9A4' : '#D996A2', 0.9);
  const cervixMaterial = makeMaterial('#C98291', 0.94);
  const endometriumMaterial = makeMaterial('#FFF2EC', 0.86);
  const tubeMaterial = makeMaterial('#E8B7AA', 0.9);
  const ovaryMaterial = makeMaterial('#E3A08D', 0.92);
  const ligamentMaterial = makeMaterial('#F1CBBB', 0.22);
  ligamentMaterial.side = THREE.DoubleSide;

  const pelvicGlow = new THREE.Mesh(
    new THREE.TorusGeometry(1.72, 0.012, 12, 96),
    new THREE.MeshBasicMaterial({ color: '#F4C5B4', transparent: true, opacity: 0.26 }),
  );
  pelvicGlow.rotation.x = Math.PI / 2;
  pelvicGlow.position.set(0, 0.02, -0.03);
  group.add(pelvicGlow);

  const uterus = new THREE.Mesh(new THREE.SphereGeometry(0.72, 48, 32), uterusMaterial);
  uterus.scale.set(scene === 'pregnancy' ? 1.18 : 0.82, scene === 'pregnancy' ? 1.35 : 1.08, 0.52);
  uterus.position.y = scene === 'pregnancy' ? 0.05 : 0.18;
  uterus.name = 'Матка';
  group.add(uterus);

  const serosa = new THREE.Mesh(new THREE.SphereGeometry(0.735, 64, 36), makeMaterial('#F6C8B8', 0.18));
  serosa.scale.copy(uterus.scale).multiplyScalar(1.015);
  serosa.position.copy(uterus.position);
  serosa.name = 'Серозный контур матки';
  group.add(serosa);

  const endometrium = new THREE.Mesh(new THREE.SphereGeometry(0.42, 40, 20), endometriumMaterial);
  endometrium.scale.set(0.55, 0.86, 0.08);
  endometrium.position.set(0, scene === 'pregnancy' ? 0.16 : 0.28, 0.55);
  endometrium.name = 'Эндометрий';
  group.add(endometrium);

  const cavityLine = createTube([
    new THREE.Vector3(0, scene === 'pregnancy' ? 0.66 : 0.72, 0.72),
    new THREE.Vector3(0, scene === 'pregnancy' ? 0.28 : 0.34, 0.82),
    new THREE.Vector3(0, scene === 'pregnancy' ? -0.18 : -0.08, 0.7),
  ], '#FFF7EF', 0.018);
  cavityLine.name = 'Полость матки';
  group.add(cavityLine);

  const cervix = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.62, 36), cervixMaterial);
  cervix.rotation.x = Math.PI / 2;
  cervix.position.set(0, scene === 'pregnancy' ? -0.9 : -0.68, 0.12);
  cervix.name = 'Шейка матки';
  group.add(cervix);

  const cervicalCanal = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.66, 24), makeMaterial('#FFF7EF', 0.88));
  cervicalCanal.rotation.x = Math.PI / 2;
  cervicalCanal.position.copy(cervix.position);
  cervicalCanal.position.z += 0.02;
  cervicalCanal.name = 'Цервикальный канал';
  group.add(cervicalCanal);

  const leftTube = createTube([
    new THREE.Vector3(-0.45, 0.55, 0.08),
    new THREE.Vector3(-0.86, 0.62, 0.15),
    new THREE.Vector3(-1.18, 0.36, 0.08),
  ], tubeMaterial.color.getHexString ? `#${tubeMaterial.color.getHexString()}` : '#E8B7AA');
  const rightTube = createTube([
    new THREE.Vector3(0.45, 0.55, 0.08),
    new THREE.Vector3(0.86, 0.62, 0.15),
    new THREE.Vector3(1.18, 0.36, 0.08),
  ], '#E8B7AA');
  leftTube.name = 'Левая маточная труба';
  rightTube.name = 'Правая маточная труба';
  group.add(leftTube, rightTube);

  [-1, 1].forEach((side) => {
    for (let index = 0; index < 5; index += 1) {
      const fimbria = createTube([
        new THREE.Vector3(side * 1.14, 0.33, 0.11),
        new THREE.Vector3(side * (1.3 + index * 0.018), 0.18 + index * 0.055, 0.12),
      ], '#F0B8AA', 0.018);
      fimbria.name = side < 0 ? 'Левые фимбрии' : 'Правые фимбрии';
      group.add(fimbria);
    }
  });

  const ovaryGeometry = new THREE.SphereGeometry(0.25, 32, 22);
  const leftOvary = new THREE.Mesh(ovaryGeometry.clone(), ovaryMaterial);
  leftOvary.scale.set(1.18, 0.86, 0.72);
  leftOvary.position.set(-1.38, 0.22, 0.08);
  const rightOvary = new THREE.Mesh(ovaryGeometry.clone(), ovaryMaterial.clone());
  rightOvary.scale.set(1.18, 0.86, 0.72);
  rightOvary.position.set(1.38, 0.22, 0.08);
  group.add(leftOvary, rightOvary);

  [-1.38, 1.38].forEach((x) => {
    for (let index = 0; index < 5; index += 1) {
      const follicle = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 10), makeMaterial('#FFF7EF', 0.7));
      follicle.position.set(x + (Math.cos(index * 1.4) * 0.11), 0.22 + (Math.sin(index * 1.8) * 0.07), 0.26);
      follicle.name = 'Фолликул';
      group.add(follicle);
    }
  });

  const leftLigament = new THREE.Mesh(new THREE.CircleGeometry(0.62, 48), ligamentMaterial);
  leftLigament.scale.set(1.15, 0.42, 1);
  leftLigament.rotation.set(Math.PI / 2, 0, -0.2);
  leftLigament.position.set(-0.86, 0.22, -0.02);
  const rightLigament = leftLigament.clone();
  rightLigament.material = ligamentMaterial.clone();
  rightLigament.rotation.set(Math.PI / 2, 0, 0.2);
  rightLigament.position.set(0.86, 0.22, -0.02);
  group.add(leftLigament, rightLigament);

  if (scene === 'pregnancy' || scene === 'placenta' || scene === 'labor') {
    const sac = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 20), makeMaterial('#F8D6C7', 0.78));
    sac.scale.set(0.78, 0.92, 0.42);
    sac.position.set(-0.05, 0.2, 0.76);
    const placenta = new THREE.Mesh(new THREE.SphereGeometry(0.18, 28, 16), makeMaterial('#B97886', 0.9));
    placenta.scale.set(1.35, 0.62, 0.22);
    placenta.position.set(0.34, -0.18, 0.82);
    group.add(sac, placenta);
  }

  if (scene === 'endometrium') {
    const thickenedLayer = new THREE.Mesh(new THREE.SphereGeometry(0.45, 48, 22), makeMaterial('#FFF0E8', 0.94));
    thickenedLayer.scale.set(0.44, 0.98, 0.1);
    thickenedLayer.position.set(0, 0.34, 0.92);
    thickenedLayer.name = 'Акцентированный эндометрий';
    const focalLesion = new THREE.Mesh(new THREE.SphereGeometry(0.075, 22, 14), makeMaterial('#D8B878', 0.95));
    focalLesion.position.set(0.18, 0.56, 1.02);
    focalLesion.name = 'Фокальное образование в полости';
    group.add(thickenedLayer, focalLesion);
  }

  if (scene === 'cervix') {
    const transformationZone = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 16, 48), makeMaterial('#D8B878', 0.96));
    transformationZone.rotation.x = Math.PI / 2;
    transformationZone.position.set(0, -0.68, 0.45);
    transformationZone.name = 'Зона трансформации';
    const cervixLengthLine = createTube([
      new THREE.Vector3(0.2, -0.42, 0.62),
      new THREE.Vector3(0.2, -0.96, 0.62),
    ], '#C84F5F', 0.018);
    cervixLengthLine.name = 'Маркер длины шейки';
    group.add(transformationZone, cervixLengthLine);
  }

  if (scene === 'placenta') {
    const placentaBed = new THREE.Mesh(new THREE.SphereGeometry(0.28, 40, 20), makeMaterial('#B97886', 0.96));
    placentaBed.scale.set(1.55, 0.62, 0.2);
    placentaBed.position.set(0.18, -0.1, 1.0);
    placentaBed.name = 'Плацентарная площадка';
    const abruptionZone = new THREE.Mesh(new THREE.SphereGeometry(0.12, 28, 14), makeMaterial('#C84F5F', 0.88));
    abruptionZone.scale.set(1.1, 0.42, 0.12);
    abruptionZone.position.set(-0.24, -0.02, 1.1);
    abruptionZone.name = 'Маркер отслойки';
    group.add(placentaBed, abruptionZone);
  }

  if (scene === 'labor') {
    const birthCanal = createTube([
      new THREE.Vector3(0, -0.48, 0.34),
      new THREE.Vector3(0, -0.86, 0.46),
      new THREE.Vector3(0, -1.22, 0.62),
    ], '#E8A08C', 0.09);
    birthCanal.name = 'Родовой канал';
    const fetalHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 22), makeMaterial('#F8D6C7', 0.95));
    fetalHead.position.set(0, -1.06, 0.78);
    fetalHead.name = 'Предлежащая часть';
    const descentArrow = createTube([
      new THREE.Vector3(0.34, -0.32, 1.0),
      new THREE.Vector3(0.18, -0.76, 0.9),
      new THREE.Vector3(0.04, -1.14, 0.78),
    ], '#D8B878', 0.028);
    descentArrow.name = 'Направление продвижения';
    group.add(birthCanal, fetalHead, descentArrow);
  }

  if (scene === 'ovary') {
    [-1.38, 1.38].forEach((x) => {
      for (let index = 0; index < 7; index += 1) {
        const follicle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 10), makeMaterial('#FFF7EF', 0.94));
        follicle.position.set(x + (Math.cos(index) * 0.12), 0.22 + (Math.sin(index * 1.7) * 0.09), 0.28);
        group.add(follicle);
      }
    });
  }

  if (scene === 'ultrasound') {
    const wedge = new THREE.Mesh(
      new THREE.CircleGeometry(0.92, 48, Math.PI * 1.08, Math.PI * 0.84),
      new THREE.MeshBasicMaterial({ color: '#F8D6C7', transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
    );
    wedge.position.set(0, -0.08, 0.92);
    group.add(wedge);
  }
};

const createHotspotMesh = (hotspot: AnatomyHotspot) => {
  const color = hotspot.risk === 'urgent' ? '#C84F5F' : hotspot.risk === 'attention' ? '#D996A2' : '#D8B878';
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 28, 18),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }),
  );
  mesh.position.set(...hotspot.position);
  mesh.userData.hotspotId = hotspot.id;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.135, 0.008, 8, 36),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 }),
  );
  ring.rotation.x = Math.PI / 2;
  mesh.add(ring);
  return mesh;
};

export const Organ3DViewer: React.FC<Organ3DViewerProps> = ({
  organType = 'uterus',
  disease,
  className = '',
  onNavigateTab,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [selectedScene, setSelectedScene] = useState<AtlasScene>(() => getDiseaseScene(disease, organType));
  const [selectedHotspot, setSelectedHotspot] = useState<AnatomyHotspot | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);

  const defaultScene = useMemo(() => getDiseaseScene(disease, organType), [disease, organType]);
  const displayDisease = repairText(disease?.name ?? 'женская анатомия');
  const hotspots = useMemo<AnatomyHotspot[]>(() => {
    const baseHotspots = sceneHotspots[selectedScene];
    const diseaseHotspots = disease?.atlasHotspots?.map((hotspot, index) => ({
      id: hotspot.id || `disease-hotspot-${index}`,
      label: repairText(hotspot.label),
      organ: repairText(hotspot.organ),
      clinicalMeaning: repairText(hotspot.clinicalMeaning),
      risk: (hotspot.risk === 'urgent' || hotspot.risk === 'attention' || hotspot.risk === 'routine' ? hotspot.risk : 'attention') as AtlasRisk,
      position: [0.18 + index * 0.12, 0.28 - index * 0.08, 1.12] as [number, number, number],
      linkedTab: hotspot.linkedTab as LinkedModalTab | undefined,
    })) ?? [];
    return [...baseHotspots, ...diseaseHotspots];
  }, [disease?.atlasHotspots, selectedScene]);

  useEffect(() => {
    setSelectedScene(defaultScene);
    setSelectedHotspot(null);
  }, [defaultScene, disease?.id]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    cleanupRef.current?.();
    cleanupRef.current = null;
    setIsReady(false);

    if (!hasWebGL()) {
      setWebglAvailable(false);
      setIsReady(true);
      return undefined;
    }

    setWebglAvailable(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.08, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'anatomy-atlas-canvas';
    stage.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    addBasePelvis(group, selectedScene);

    const hotspotMeshes = hotspots.map(createHotspotMesh);
    hotspotMeshes.forEach((mesh) => group.add(mesh));

    const ambient = new THREE.HemisphereLight(0xfff7ef, 0x6c4b53, 1.55);
    const key = new THREE.DirectionalLight(0xffffff, 1.45);
    key.position.set(3.2, 3.8, 4.6);
    const rim = new THREE.DirectionalLight(0xe8a08c, 0.65);
    rim.position.set(-3.5, 1.6, 2.2);
    scene.add(ambient, key, rim);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const drag = { active: false, x: 0, y: 0, moved: 0, rotX: -0.08, rotY: 0.08, zoom: 4.2, pinch: 0 };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(280, Math.floor(rect.width));
      const height = Math.max(320, Math.floor(rect.height));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const pickHotspot = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hotspotMeshes, false)[0];
      if (!hit) return false;
      const hotspot = hotspots.find((entry) => entry.id === hit.object.userData.hotspotId);
      if (hotspot) {
        setSelectedHotspot((current) => (current?.id === hotspot.id ? null : hotspot));
        return true;
      }
      return false;
    };

    const onPointerDown = (event: PointerEvent) => {
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.moved = 0;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.rotY += dx * 0.008;
      drag.rotX += dy * 0.006;
      drag.rotX = Math.max(-0.75, Math.min(0.55, drag.rotX));
      drag.x = event.clientX;
      drag.y = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (drag.active && drag.moved < 8) pickHotspot(event.clientX, event.clientY);
      drag.active = false;
      renderer.domElement.releasePointerCapture?.(event.pointerId);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      drag.zoom = Math.max(2.8, Math.min(5.4, drag.zoom + event.deltaY * 0.003));
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const [a, b] = Array.from(event.touches);
        drag.pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && drag.pinch > 0) {
        event.preventDefault();
        const [a, b] = Array.from(event.touches);
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        drag.zoom = Math.max(2.8, Math.min(5.4, drag.zoom - (distance - drag.pinch) * 0.01));
        drag.pinch = distance;
      }
    };

    const resetView = () => {
      drag.rotX = -0.08;
      drag.rotY = 0.08;
      drag.zoom = 4.2;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('dblclick', resetView);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', resize);

    resize();
    setIsReady(true);

    let frameId = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      group.rotation.x += (drag.rotX - group.rotation.x) * 0.08;
      group.rotation.y += (drag.rotY - group.rotation.y) * 0.08;
      if (!reducedMotion && !drag.active) group.rotation.y += 0.0015;
      camera.position.z += (drag.zoom - camera.position.z) * 0.12;

      hotspotMeshes.forEach((mesh, index) => {
        const pulse = reducedMotion ? 1 : 1 + Math.sin(Date.now() * 0.004 + index) * 0.12;
        mesh.scale.setScalar(pulse);
      });
      renderer.render(scene, camera);
    };
    animate();

    cleanupRef.current = () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('dblclick', resetView);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [selectedScene, hotspots]);

  const resetScene = () => {
    setSelectedScene(defaultScene);
    setSelectedHotspot(null);
  };

  return (
    <motion.section
      className={`anatomy-atlas-shell ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      aria-label={`3D атлас: ${displayDisease}`}
    >
      <header className="anatomy-atlas-header">
        <span className="anatomy-atlas-eyebrow">Интерактивная женская анатомия</span>
        <h3>3D-схема: {sceneLabels[selectedScene]}</h3>
        <p>
          Учебная визуализация показывает анатомическую зону, клинические маркеры и быстрый переход к диагностике,
          УЗИ или лечению. Не заменяет осмотр и инструментальную диагностику.
        </p>
      </header>

      <div className="anatomy-atlas-layout">
        <div className="anatomy-atlas-viewport">
          {!isReady && (
            <div className="anatomy-atlas-skeleton" role="status">
              <span className="atlas-skeleton-orbit" />
              <strong>Загрузка 3D-модели...</strong>
              <small>Готовим анатомические слои и клинические маркеры</small>
            </div>
          )}

          {webglAvailable ? (
            <div ref={stageRef} className="anatomy-atlas-stage" aria-label="WebGL 3D модель женских органов" />
          ) : (
            <div className="anatomy-atlas-fallback" role="img" aria-label="Схема женских органов без WebGL">
              <svg viewBox="0 0 320 280" aria-hidden="true">
                <defs>
                  <linearGradient id="atlasUterus" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F6C8B8" />
                    <stop offset="1" stopColor="#D996A2" />
                  </linearGradient>
                </defs>
                <path d="M160 64 C126 66 110 92 112 128 C114 172 136 196 160 198 C184 196 206 172 208 128 C210 92 194 66 160 64Z" fill="url(#atlasUterus)" />
                <path d="M116 98 C76 86 50 104 34 132" fill="none" stroke="#D996A2" strokeWidth="10" strokeLinecap="round" />
                <path d="M204 98 C244 86 270 104 286 132" fill="none" stroke="#D996A2" strokeWidth="10" strokeLinecap="round" />
                <ellipse cx="34" cy="136" rx="22" ry="16" fill="#E8A08C" />
                <ellipse cx="286" cy="136" rx="22" ry="16" fill="#E8A08C" />
                <rect x="142" y="190" width="36" height="58" rx="18" fill="#B97886" />
                <circle cx="202" cy="116" r="8" fill="#C84F5F" />
                <circle cx="116" cy="134" r="8" fill="#D8B878" />
              </svg>
              <strong>WebGL недоступен</strong>
              <span>Показываем статичную схему с теми же клиническими маркерами.</span>
            </div>
          )}

          <div className="anatomy-atlas-hint">Поверните модель одним пальцем. Двойной тап сбрасывает вид.</div>
        </div>

        <aside className="anatomy-atlas-panel">
          <div className="anatomy-scene-rail" aria-label="Сцены 3D атласа">
            {(Object.keys(sceneLabels) as AtlasScene[]).map((scene) => (
              <button
                key={scene}
                type="button"
                className={`anatomy-scene-chip ${selectedScene === scene ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedScene(scene);
                  setSelectedHotspot(null);
                }}
              >
                {sceneLabels[scene]}
              </button>
            ))}
          </div>

          <div className="anatomy-hotspot-list">
            {hotspots.map((hotspot) => (
              <button
                type="button"
                key={hotspot.id}
                className={`anatomy-hotspot-card risk-${hotspot.risk} ${selectedHotspot?.id === hotspot.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedHotspot(hotspot)}
              >
                <span className="anatomy-hotspot-meta">{hotspot.organ} · {riskLabels[hotspot.risk]}</span>
                <strong>{hotspot.label}</strong>
                <span>{hotspot.clinicalMeaning}</span>
              </button>
            ))}
          </div>

          <div className="anatomy-atlas-actions">
            <button type="button" className="anatomy-action-button" onClick={resetScene}>Сбросить сцену</button>
            {selectedHotspot?.linkedTab && onNavigateTab ? (
              <button type="button" className="anatomy-action-button is-primary" onClick={() => onNavigateTab(selectedHotspot.linkedTab!)}>
                К разделу карточки
              </button>
            ) : null}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            className={`anatomy-hotspot-sheet risk-${selectedHotspot.risk}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <button type="button" className="anatomy-sheet-close" onClick={() => setSelectedHotspot(null)} aria-label="Закрыть маркер">×</button>
            <span>{selectedHotspot.organ} · {riskLabels[selectedHotspot.risk]}</span>
            <h4>{selectedHotspot.label}</h4>
            <p>{selectedHotspot.clinicalMeaning}</p>
            {selectedHotspot.linkedTab && onNavigateTab ? (
              <button type="button" className="anatomy-sheet-link" onClick={() => onNavigateTab(selectedHotspot.linkedTab!)}>
                Перейти к связанному разделу
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
