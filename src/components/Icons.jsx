import React from 'react';

const IconWrapper = ({ children, color }) => (
  <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color || "#d9b2ab"} />
        <stop offset="100%" stopColor={color ? `${color}dd` : "#a96f7c"} />
      </linearGradient>
    </defs>
    {children}
  </svg>
);

export const gynIcons = {
  endometriosis: (
    <IconWrapper>
      <path d="M30,10 C20,10 15,20 15,30 C15,45 30,55 30,55 C30,55 45,45 45,30 C45,20 40,10 30,10 Z" fill="url(#grad)" opacity="0.8"/>
      <circle cx="30" cy="30" r="8" fill="white" opacity="0.9"/>
      <path d="M25,25 L35,35 M35,25 L25,35" stroke="#e88d9e" strokeWidth="2" strokeLinecap="round"/>
    </IconWrapper>
  ),
  pcos: (
    <IconWrapper>
      <circle cx="30" cy="30" r="20" fill="none" stroke="url(#grad)" strokeWidth="3"/>
      <circle cx="22" cy="22" r="3" fill="url(#grad)"/>
      <circle cx="38" cy="22" r="3" fill="url(#grad)"/>
      <circle cx="22" cy="38" r="3" fill="url(#grad)"/>
      <circle cx="38" cy="38" r="3" fill="url(#grad)"/>
      <circle cx="30" cy="15" r="3" fill="url(#grad)"/>
      <circle cx="30" cy="45" r="3" fill="url(#grad)"/>
    </IconWrapper>
  ),
  fibroids: (
    <IconWrapper>
      <path d="M30,15 C15,15 10,25 10,35 C10,45 20,50 30,50 C40,50 50,45 50,35 C50,25 45,15 30,15 Z" fill="url(#grad)" opacity="0.6"/>
      <circle cx="25" cy="30" r="6" fill="white" opacity="0.8"/>
      <circle cx="35" cy="35" r="8" fill="white" opacity="0.8"/>
      <circle cx="28" cy="42" r="4" fill="white" opacity="0.8"/>
    </IconWrapper>
  ),
  "cervical-cancer": (
    <IconWrapper>
      <path d="M30,10 C20,10 15,20 15,30 C15,40 20,45 30,45 C40,45 45,40 45,30 C45,20 40,10 30,10 Z" fill="url(#grad)" opacity="0.7"/>
      <path d="M20,25 Q30,20 40,25" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M20,35 Q30,40 40,35" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="30" cy="30" r="4" fill="white"/>
    </IconWrapper>
  ),
  pid: (
    <IconWrapper>
      <path d="M30,15 C20,15 15,25 15,30 C15,40 30,50 30,50 C30,50 45,40 45,30 C45,25 40,15 30,15 Z" fill="url(#grad)" opacity="0.8"/>
      <path d="M20,25 L40,35 M40,25 L20,35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </IconWrapper>
  ),
  vaginitis: (
    <IconWrapper>
      <circle cx="30" cy="30" r="15" fill="none" stroke="url(#grad)" strokeWidth="3"/>
      <path d="M25,25 Q30,20 35,25 T35,35 T25,35 T25,25" fill="url(#grad)" opacity="0.6"/>
    </IconWrapper>
  ),
  cervicitis: (
    <IconWrapper>
      <path d="M30,10 C20,10 15,20 15,30 C15,40 20,45 30,45 C40,45 45,40 45,30 C45,20 40,10 30,10 Z" fill="url(#grad)" opacity="0.7"/>
      <circle cx="30" cy="25" r="5" fill="white" opacity="0.8"/>
      <circle cx="30" cy="40" r="5" fill="white" opacity="0.8"/>
    </IconWrapper>
  ),
  bartholinitis: (
    <IconWrapper>
      <circle cx="30" cy="30" r="12" fill="url(#grad)" opacity="0.8"/>
      <circle cx="30" cy="30" r="5" fill="white"/>
      <path d="M25,45 Q30,50 35,45" stroke="white" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  aub: (
    <IconWrapper>
      <path d="M30,15 L30,45" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M20,25 L40,25" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20,35 L40,35" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round"/>
    </IconWrapper>
  ),
  hyperplasia: (
    <IconWrapper>
      <rect x="20" y="20" width="20" height="20" rx="5" fill="url(#grad)" opacity="0.8"/>
      <path d="M25,30 L35,30 M30,25 L30,35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </IconWrapper>
  ),
  salpingitis: (
    <IconWrapper>
      <path d="M15,25 Q22,15 30,25 Q38,35 45,25" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <path d="M15,35 Q22,25 30,35 Q38,45 45,35" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <circle cx="30" cy="30" r="4" fill="#e88d9e" opacity="0.5"/>
    </IconWrapper>
  ),
  toa: (
    <IconWrapper>
      <circle cx="30" cy="30" r="16" fill="url(#grad)" opacity="0.4"/>
      <circle cx="30" cy="30" r="10" fill="url(#grad)" opacity="0.6"/>
      <circle cx="30" cy="30" r="4" fill="white"/>
      <path d="M20,20 L40,40 M40,20 L20,40" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    </IconWrapper>
  ),
  pelvioperitonitis: (
    <IconWrapper>
      <path d="M15,30 Q30,10 45,30" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <path d="M15,30 Q30,50 45,30" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <path d="M25,25 L35,35 M35,25 L25,35" stroke="white" strokeWidth="2"/>
    </IconWrapper>
  ),
  endometritis: (
    <IconWrapper>
      <path d="M22,15 L22,45 L38,45 L38,15 Z" fill="url(#grad)" opacity="0.5"/>
      <path d="M26,25 L34,25 M26,30 L34,30 M26,35 L34,35" stroke="white" strokeWidth="2"/>
      <circle cx="30" cy="20" r="2" fill="white"/>
    </IconWrapper>
  ),
  "chronic-pain": (
    <IconWrapper>
      <path d="M30,15 C30,15 20,25 20,35 C20,42 25,48 30,48 C35,48 40,42 40,35 C40,25 30,15 30,15Z" fill="url(#grad)" opacity="0.6"/>
      <path d="M26,30 Q30,26 34,30" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="27" cy="27" r="1.5" fill="white"/>
      <circle cx="33" cy="27" r="1.5" fill="white"/>
    </IconWrapper>
  ),
  poi: (
    <IconWrapper>
      <circle cx="30" cy="30" r="15" fill="none" stroke="url(#grad)" strokeWidth="2" strokeDasharray="4 3"/>
      <circle cx="30" cy="30" r="8" fill="url(#grad)" opacity="0.4"/>
      <path d="M25,30 L35,30 M30,25 L30,35" stroke="white" strokeWidth="2"/>
    </IconWrapper>
  ),
  hyperprolactinemia: (
    <IconWrapper>
      <path d="M25,20 C25,15 35,15 35,20 C35,25 30,28 30,28 C30,28 25,25 25,20Z" fill="url(#grad)" opacity="0.7"/>
      <path d="M28,28 L28,40 M32,28 L32,40" stroke="url(#grad)" strokeWidth="2"/>
      <circle cx="28" cy="42" r="2" fill="url(#grad)" opacity="0.5"/>
      <circle cx="32" cy="42" r="2" fill="url(#grad)" opacity="0.5"/>
    </IconWrapper>
  ),
  hypogonadism: (
    <IconWrapper>
      <circle cx="24" cy="30" r="10" fill="url(#grad)" opacity="0.4"/>
      <circle cx="36" cy="30" r="10" fill="url(#grad)" opacity="0.4"/>
      <path d="M30,25 L30,35" stroke="white" strokeWidth="2"/>
    </IconWrapper>
  ),
  "ovarian-resistance": (
    <IconWrapper>
      <circle cx="30" cy="30" r="14" fill="none" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M22,30 L38,30" stroke="white" strokeWidth="3"/>
      <path d="M26,26 L26,34 M34,26 L34,34" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  polyp: (
    <IconWrapper>
      <path d="M28,45 L28,25 C28,18 32,18 32,25 L32,45" fill="url(#grad)" opacity="0.7"/>
      <circle cx="30" cy="18" r="6" fill="url(#grad)" opacity="0.9"/>
      <path d="M30,45 L30,50" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "cervical-polyp": (
    <IconWrapper>
      <ellipse cx="30" cy="35" rx="10" ry="14" fill="url(#grad)" opacity="0.5"/>
      <ellipse cx="30" cy="20" rx="5" ry="7" fill="url(#grad)" opacity="0.8"/>
      <path d="M30,13 L30,8" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  cyst: (
    <IconWrapper>
      <circle cx="30" cy="30" r="16" fill="none" stroke="url(#grad)" strokeWidth="2"/>
      <circle cx="30" cy="30" r="14" fill="url(#grad)" opacity="0.2"/>
      <circle cx="30" cy="30" r="6" fill="url(#grad)" opacity="0.4"/>
    </IconWrapper>
  ),
  dermoid: (
    <IconWrapper>
      <circle cx="30" cy="30" r="16" fill="url(#grad)" opacity="0.4"/>
      <circle cx="24" cy="26" r="3" fill="white" opacity="0.8"/>
      <path d="M32,22 L36,18 L38,24" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M26,36 Q30,40 34,36" stroke="white" strokeWidth="1.5" fill="none"/>
    </IconWrapper>
  ),
  cystadenoma: (
    <IconWrapper>
      <ellipse cx="30" cy="30" rx="16" ry="12" fill="url(#grad)" opacity="0.3"/>
      <path d="M18,26 Q24,22 30,26 Q36,30 42,26" stroke="url(#grad)" strokeWidth="2" fill="none"/>
      <path d="M18,34 Q24,30 30,34 Q36,38 42,34" stroke="url(#grad)" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  "endometrioma-ovary": (
    <IconWrapper>
      <circle cx="30" cy="30" r="16" fill="url(#grad)" opacity="0.3"/>
      <circle cx="30" cy="30" r="12" fill="#5c3d4a" opacity="0.5"/>
      <circle cx="26" cy="26" r="3" fill="#8b6b5e" opacity="0.6"/>
    </IconWrapper>
  ),
  adenomyosis: (
    <IconWrapper>
      <path d="M30,10 C18,10 12,20 12,30 C12,42 20,50 30,50 C40,50 48,42 48,30 C48,20 42,10 30,10Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M22,20 L38,20 M22,26 L38,26 M22,32 L38,32 M22,38 L38,38" stroke="url(#grad)" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="30" cy="30" r="5" fill="url(#grad)" opacity="0.7"/>
    </IconWrapper>
  ),
  "bowel-endo": (
    <IconWrapper>
      <path d="M15,30 C15,20 25,15 30,20 C35,25 25,35 30,40 C35,45 45,40 45,30" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <circle cx="30" cy="30" r="3" fill="#e88d9e" opacity="0.7"/>
    </IconWrapper>
  ),
  "bladder-endo": (
    <IconWrapper>
      <path d="M20,20 C20,15 40,15 40,20 L40,35 C40,45 20,45 20,35Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M25,30 L35,30" stroke="url(#grad)" strokeWidth="2"/>
      <circle cx="30" cy="25" r="3" fill="#e88d9e" opacity="0.6"/>
    </IconWrapper>
  ),
  ectropion: (
    <IconWrapper>
      <ellipse cx="30" cy="30" rx="16" ry="14" fill="url(#grad)" opacity="0.4"/>
      <ellipse cx="30" cy="30" rx="8" ry="7" fill="#ff9a9e" opacity="0.6"/>
      <circle cx="30" cy="30" r="3" fill="white"/>
    </IconWrapper>
  ),
  dysplasia: (
    <IconWrapper>
      <rect x="18" y="18" width="24" height="24" rx="4" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,24 L30,30 M30,24 L24,30" stroke="white" strokeWidth="2"/>
      <circle cx="36" cy="24" r="2" fill="#e88d9e"/>
      <circle cx="36" cy="30" r="2" fill="#e88d9e"/>
      <circle cx="36" cy="36" r="2" fill="#e88d9e"/>
    </IconWrapper>
  ),
  synechiae: (
    <IconWrapper>
      <path d="M22,15 L22,45" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M38,15 L38,45" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M22,25 L38,28 M22,32 L38,30 M22,38 L38,36" stroke="url(#grad)" strokeWidth="1.5" opacity="0.6"/>
    </IconWrapper>
  ),
  atrophy: (
    <IconWrapper>
      <rect x="22" y="22" width="16" height="16" rx="2" fill="url(#grad)" opacity="0.25"/>
      <path d="M26,30 L34,30" stroke="url(#grad)" strokeWidth="1" strokeDasharray="2 2"/>
    </IconWrapper>
  ),
  apoplexy: (
    <IconWrapper>
      <circle cx="30" cy="30" r="14" fill="url(#grad)" opacity="0.5"/>
      <path d="M22,22 L38,38" stroke="white" strokeWidth="3"/>
      <path d="M30,16 L30,22 M30,38 L30,44 M16,30 L22,30 M38,30 L44,30" stroke="#e88d9e" strokeWidth="2"/>
    </IconWrapper>
  ),
  torsion: (
    <IconWrapper>
      <path d="M20,15 C30,15 35,25 30,30 C25,35 30,45 40,45" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <circle cx="30" cy="30" r="5" fill="url(#grad)" opacity="0.6"/>
      <path d="M25,25 L35,35 M35,25 L25,35" stroke="white" strokeWidth="1.5"/>
    </IconWrapper>
  ),
  hydrosalpinx: (
    <IconWrapper>
      <path d="M15,30 C15,20 25,18 30,25 C35,32 30,40 40,38" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <path d="M18,28 C18,22 26,20 30,26 C34,32 30,38 38,36" fill="url(#grad)" opacity="0.2"/>
    </IconWrapper>
  ),
  "vulvar-cancer": (
    <IconWrapper>
      <path d="M22,20 C22,14 38,14 38,20 L38,30 C38,40 22,40 22,30Z" fill="url(#grad)" opacity="0.6"/>
      <path d="M26,26 L34,34 M34,26 L26,34" stroke="white" strokeWidth="2"/>
      <circle cx="30" cy="30" r="3" fill="white" opacity="0.5"/>
    </IconWrapper>
  ),
  "vaginal-cancer": (
    <IconWrapper>
      <path d="M25,15 L25,45 C25,48 35,48 35,45 L35,15" fill="url(#grad)" opacity="0.5"/>
      <circle cx="30" cy="25" r="4" fill="white" opacity="0.6"/>
      <circle cx="30" cy="35" r="3" fill="white" opacity="0.4"/>
    </IconWrapper>
  ),
  "endometrial-cancer": (
    <IconWrapper>
      <path d="M22,15 L22,45 L38,45 L38,15Z" fill="url(#grad)" opacity="0.5"/>
      <path d="M26,22 L34,22 M26,28 L34,28 M26,34 L34,34" stroke="white" strokeWidth="2"/>
      <path d="M24,40 L36,40" stroke="#e88d9e" strokeWidth="2"/>
    </IconWrapper>
  ),
  "ovarian-cancer": (
    <IconWrapper>
      <circle cx="30" cy="30" r="16" fill="url(#grad)" opacity="0.5"/>
      <circle cx="24" cy="24" r="4" fill="white" opacity="0.5"/>
      <circle cx="36" cy="28" r="3" fill="white" opacity="0.5"/>
      <circle cx="28" cy="38" r="5" fill="white" opacity="0.4"/>
      <path d="M20,20 L40,40" stroke="white" strokeWidth="1.5" opacity="0.3"/>
    </IconWrapper>
  ),
  "uterine-sarcoma": (
    <IconWrapper>
      <path d="M22,15 L22,45 L38,45 L38,15Z" fill="url(#grad)" opacity="0.6"/>
      <circle cx="30" cy="30" r="8" fill="none" stroke="white" strokeWidth="2"/>
      <path d="M26,26 L34,34 M34,26 L26,34" stroke="white" strokeWidth="2"/>
    </IconWrapper>
  ),
  amenorrhea: (
    <IconWrapper>
      <path d="M18,30 L42,30" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M25,22 L25,38 M30,24 L30,36 M35,22 L35,38" stroke="url(#grad)" strokeWidth="1" opacity="0.3"/>
      <circle cx="30" cy="30" r="16" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeDasharray="3 3"/>
    </IconWrapper>
  ),
  dysmenorrhea: (
    <IconWrapper>
      <path d="M30,15 C30,15 18,28 18,35 C18,42 24,48 30,48 C36,48 42,42 42,35 C42,28 30,15 30,15Z" fill="url(#grad)" opacity="0.5"/>
      <path d="M24,32 Q30,28 36,32" stroke="white" strokeWidth="2.5" fill="none"/>
      <circle cx="27" cy="28" r="1.5" fill="white"/>
      <circle cx="33" cy="28" r="1.5" fill="white"/>
    </IconWrapper>
  ),
  "pms-pmdr": (
    <IconWrapper>
      <circle cx="30" cy="24" r="10" fill="url(#grad)" opacity="0.5"/>
      <path d="M25,22 Q27,20 30,22 Q33,24 35,22" stroke="white" strokeWidth="1.5" fill="none"/>
      <path d="M22,38 Q26,34 30,38 Q34,42 38,38" stroke="url(#grad)" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  "uterine-prolapse": (
    <IconWrapper>
      <ellipse cx="30" cy="22" rx="10" ry="12" fill="url(#grad)" opacity="0.5"/>
      <path d="M25,34 L25,42 C25,46 35,46 35,42 L35,34" stroke="url(#grad)" strokeWidth="2" fill="none"/>
      <path d="M20,44 L40,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  cystocele: (
    <IconWrapper>
      <path d="M20,20 C20,14 40,14 40,20 L40,30 C40,40 20,40 20,30Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,28 C24,34 36,34 36,28" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M18,40 L42,40" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  rectocele: (
    <IconWrapper>
      <path d="M20,20 C20,14 40,14 40,20 L40,35 C40,40 20,40 20,35Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M32,25 C36,28 36,35 32,38" stroke="url(#grad)" strokeWidth="2" fill="none"/>
      <path d="M18,42 L42,42" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "stress-incontinence": (
    <IconWrapper>
      <path d="M22,18 L22,35 C22,42 38,42 38,35 L38,18" fill="url(#grad)" opacity="0.4"/>
      <path d="M26,28 L34,28" stroke="url(#grad)" strokeWidth="2"/>
      <circle cx="30" cy="38" r="2" fill="url(#grad)" opacity="0.6"/>
      <circle cx="30" cy="44" r="1.5" fill="url(#grad)" opacity="0.4"/>
    </IconWrapper>
  ),
  syphilis: (
    <IconWrapper>
      <circle cx="30" cy="30" r="14" fill="url(#grad)" opacity="0.4"/>
      <path d="M22,22 C26,18 34,18 38,22" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="30" cy="30" r="5" fill="url(#grad)" opacity="0.7"/>
      <path d="M30,25 L30,35 M25,30 L35,30" stroke="white" strokeWidth="1.5"/>
    </IconWrapper>
  ),
  gonorrhea: (
    <IconWrapper>
      <circle cx="30" cy="30" r="14" fill="url(#grad)" opacity="0.4"/>
      <circle cx="24" cy="24" r="2.5" fill="#e88d9e"/>
      <circle cx="36" cy="24" r="2.5" fill="#e88d9e"/>
      <circle cx="24" cy="36" r="2.5" fill="#e88d9e"/>
      <circle cx="36" cy="36" r="2.5" fill="#e88d9e"/>
      <circle cx="30" cy="30" r="2" fill="white"/>
    </IconWrapper>
  ),
  "genital-herpes": (
    <IconWrapper>
      <circle cx="24" cy="26" r="4" fill="url(#grad)" opacity="0.6"/>
      <circle cx="36" cy="26" r="4" fill="url(#grad)" opacity="0.6"/>
      <circle cx="30" cy="34" r="4" fill="url(#grad)" opacity="0.6"/>
      <circle cx="24" cy="26" r="1.5" fill="white"/>
      <circle cx="36" cy="26" r="1.5" fill="white"/>
      <circle cx="30" cy="34" r="1.5" fill="white"/>
    </IconWrapper>
  ),
  "genital-warts": (
    <IconWrapper>
      <path d="M22,40 L22,28 C22,24 26,22 28,26 L30,30 L32,26 C34,22 38,24 38,28 L38,40" fill="url(#grad)" opacity="0.6"/>
      <path d="M26,40 L26,34 C26,32 34,32 34,34 L34,40" fill="url(#grad)" opacity="0.4"/>
    </IconWrapper>
  ),
  "female-infertility": (
    <IconWrapper>
      <path d="M24,20 C24,15 36,15 36,20 L36,30 C36,38 24,38 24,30Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M30,30 L30,42 M26,42 L34,42" stroke="url(#grad)" strokeWidth="2"/>
      <circle cx="30" cy="25" r="3" fill="url(#grad)" opacity="0.7"/>
    </IconWrapper>
  ),
  "recurrent-pregnancy-loss": (
    <IconWrapper>
      <path d="M24,18 C24,14 36,14 36,18 L36,28 C36,34 24,34 24,28Z" fill="url(#grad)" opacity="0.3"/>
      <path d="M26,22 L34,22" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M22,38 L38,38" stroke="url(#grad)" strokeWidth="2" strokeDasharray="3 3"/>
      <circle cx="30" cy="30" r="3" fill="none" stroke="url(#grad)" strokeWidth="1.5"/>
    </IconWrapper>
  ),
  "menopausal-syndrome": (
    <IconWrapper>
      <path d="M30,15 L30,45" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M20,20 Q25,25 30,20 Q35,15 40,20" stroke="url(#grad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M20,30 Q25,35 30,30 Q35,25 40,30" stroke="url(#grad)" strokeWidth="1.5" fill="none" opacity="0.3"/>
      <path d="M20,40 Q25,45 30,40 Q35,35 40,40" stroke="url(#grad)" strokeWidth="1.5" fill="none" opacity="0.15"/>
    </IconWrapper>
  ),
  "postmenopausal-bleeding": (
    <IconWrapper>
      <path d="M25,18 L25,42 L35,42 L35,18Z" fill="url(#grad)" opacity="0.3"/>
      <path d="M28,28 L32,28 M28,32 L32,32 M28,36 L32,36" stroke="#e88d9e" strokeWidth="2"/>
      <circle cx="30" cy="22" r="2" fill="#e88d9e" opacity="0.6"/>
    </IconWrapper>
  ),
  "postmenopausal-osteoporosis": (
    <IconWrapper>
      <path d="M22,15 L22,45" stroke="url(#grad)" strokeWidth="3"/>
      <path d="M38,15 L38,45" stroke="url(#grad)" strokeWidth="3"/>
      <path d="M22,22 L38,22 M22,30 L38,30 M22,38 L38,38" stroke="url(#grad)" strokeWidth="2" strokeDasharray="4 3"/>
      <circle cx="30" cy="30" r="3" fill="url(#grad)" opacity="0.3"/>
    </IconWrapper>
  )
};

export const obsIcons = {
  preeclampsia: (
    <IconWrapper color="#c5a298">
      <path d="M30,15 C15,15 10,25 10,35 C10,45 20,50 30,50 C40,50 50,45 50,35 C50,25 45,15 30,15 Z" fill="url(#grad)" opacity="0.7"/>
      <path d="M30,25 L30,35 M25,30 L35,30" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="2" fill="white"/>
      <circle cx="40" cy="20" r="2" fill="white"/>
    </IconWrapper>
  ),
  "gestational-diabetes": (
    <IconWrapper color="#cfb296">
      <path d="M30,15 C15,15 10,25 10,35 C10,45 20,50 30,50 C40,50 50,45 50,35 C50,25 45,15 30,15 Z" fill="url(#grad)" opacity="0.7"/>
      <path d="M20,30 L40,30" stroke="white" strokeWidth="2"/>
      <path d="M30,20 L30,40" stroke="white" strokeWidth="2"/>
    </IconWrapper>
  ),
  "placenta-previa": (
    <IconWrapper color="#c5a298">
      <path d="M15,20 Q30,10 45,20 Q50,30 45,40 Q30,50 15,40 Q10,30 15,20 Z" fill="url(#grad)" opacity="0.8"/>
      <path d="M15,20 Q30,30 45,20" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M15,40 Q30,30 45,40" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="30" cy="30" r="5" fill="white"/>
    </IconWrapper>
  ),
  "preterm-labor": (
    <IconWrapper color="#cfb296">
      <path d="M30,15 C15,15 10,25 10,35 C10,45 20,50 30,50 C40,50 50,45 50,35 C50,25 45,15 30,15 Z" fill="url(#grad)" opacity="0.7"/>
      <path d="M25,25 L35,25 M25,30 L35,30 M25,35 L35,35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </IconWrapper>
  ),
  "postpartum-hemorrhage": (
    <IconWrapper color="#a96f7c">
      <path d="M30,15 C15,15 10,25 10,35 C10,45 20,50 30,50 C40,50 50,45 50,35 C50,25 45,15 30,15 Z" fill="url(#grad)" opacity="0.7"/>
      <path d="M30,25 L30,35 M25,30 L35,30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </IconWrapper>
  ),
  "chronic-hypertension": (
    <IconWrapper color="#c5a298">
      <path d="M15,35 L22,25 L30,30 L38,18 L45,28" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <circle cx="15" cy="35" r="3" fill="url(#grad)"/>
      <circle cx="45" cy="28" r="3" fill="url(#grad)"/>
    </IconWrapper>
  ),
  eclampsia: (
    <IconWrapper color="#8f5d6c">
      <path d="M30,15 L25,28 L32,28 L27,45 L40,25 L33,25 L38,15Z" fill="url(#grad)" opacity="0.8"/>
    </IconWrapper>
  ),
  "hellp-syndrome": (
    <IconWrapper color="#8f5d6c">
      <path d="M18,20 L18,40 L42,40 L42,20Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,25 L36,25 M24,30 L36,30 M24,35 L36,35" stroke="white" strokeWidth="2"/>
      <path d="M20,20 L20,15 C20,10 40,10 40,15 L40,20" stroke="url(#grad)" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  "superimposed-preeclampsia": (
    <IconWrapper color="#b4878f">
      <path d="M30,15 C15,15 10,25 10,35 C10,45 20,50 30,50 C40,50 50,45 50,35 C50,25 45,15 30,15Z" fill="url(#grad)" opacity="0.5"/>
      <path d="M30,25 L30,35 M25,30 L35,30" stroke="white" strokeWidth="2"/>
      <path d="M18,22 L42,38" stroke="#c2185b" strokeWidth="2"/>
    </IconWrapper>
  ),
  "type1-diabetes": (
    <IconWrapper color="#cfb296">
      <path d="M30,15 L30,40" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M22,22 L30,15 L38,22" stroke="url(#grad)" strokeWidth="2.5" fill="none"/>
      <path d="M22,32 L30,40 L38,32" stroke="url(#grad)" strokeWidth="2.5" fill="none"/>
      <circle cx="30" cy="46" r="2" fill="url(#grad)"/>
    </IconWrapper>
  ),
  "type2-diabetes": (
    <IconWrapper color="#cfb296">
      <path d="M22,20 L38,20 L38,40 L22,40Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M30,20 L30,40" stroke="url(#grad)" strokeWidth="2.5"/>
      <path d="M22,30 L38,30" stroke="url(#grad)" strokeWidth="2.5"/>
    </IconWrapper>
  ),
  "threatened-miscarriage": (
    <IconWrapper color="#c5a298">
      <path d="M24,20 C24,14 36,14 36,20 L36,32 C36,40 24,40 24,32Z" fill="url(#grad)" opacity="0.4"/>
      <circle cx="30" cy="26" r="4" fill="url(#grad)" opacity="0.6"/>
      <path d="M28,38 L30,44 L32,38" stroke="#e88d9e" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  "missed-abortion": (
    <IconWrapper color="#b4878f">
      <path d="M24,18 C24,14 36,14 36,18 L36,30 C36,38 24,38 24,30Z" fill="url(#grad)" opacity="0.3"/>
      <circle cx="30" cy="24" r="3" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeDasharray="2 2"/>
      <path d="M22,42 L38,42" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "spontaneous-abortion": (
    <IconWrapper color="#a96f7c">
      <path d="M24,18 C24,14 36,14 36,18 L36,28 C36,36 24,36 24,28Z" fill="url(#grad)" opacity="0.3"/>
      <path d="M26,38 L28,44 M30,38 L30,44 M34,38 L32,44" stroke="#e88d9e" strokeWidth="2"/>
    </IconWrapper>
  ),
  "recurrent-miscarriage": (
    <IconWrapper color="#b4878f">
      <path d="M20,18 C20,14 28,14 28,18 L28,26 C28,32 20,32 20,26Z" fill="url(#grad)" opacity="0.3"/>
      <path d="M32,18 C32,14 40,14 40,18 L40,26 C40,32 32,32 32,26Z" fill="url(#grad)" opacity="0.3"/>
      <path d="M24,36 L26,42 M36,36 L34,42" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "ectopic-pregnancy": (
    <IconWrapper color="#8f5d6c">
      <path d="M15,25 C15,18 25,15 30,20 C35,25 30,35 40,32" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <circle cx="22" cy="22" r="5" fill="url(#grad)" opacity="0.5"/>
      <path d="M38,32 L42,38" stroke="#e88d9e" strokeWidth="2"/>
    </IconWrapper>
  ),
  "hydatidiform-mole": (
    <IconWrapper color="#cfb296">
      <circle cx="30" cy="30" r="14" fill="url(#grad)" opacity="0.3"/>
      <circle cx="24" cy="24" r="4" fill="url(#grad)" opacity="0.5"/>
      <circle cx="36" cy="26" r="3" fill="url(#grad)" opacity="0.4"/>
      <circle cx="28" cy="36" r="3.5" fill="url(#grad)" opacity="0.5"/>
      <circle cx="36" cy="36" r="2.5" fill="url(#grad)" opacity="0.4"/>
    </IconWrapper>
  ),
  "placental-abruption": (
    <IconWrapper color="#a96f7c">
      <path d="M15,25 Q30,12 45,25 Q48,35 45,38 Q30,30 15,38 Q12,35 15,25Z" fill="url(#grad)" opacity="0.6"/>
      <path d="M22,30 L38,32" stroke="#c2185b" strokeWidth="3"/>
      <path d="M25,35 L35,36" stroke="#e88d9e" strokeWidth="2"/>
    </IconWrapper>
  ),
  "placenta-accreta": (
    <IconWrapper color="#8f5d6c">
      <path d="M15,22 Q30,12 45,22" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <path d="M20,22 L20,32 M26,22 L26,34 M32,22 L32,36 M38,22 L38,32" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M15,35 Q30,28 45,35" stroke="url(#grad)" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  "premature-placental-aging": (
    <IconWrapper color="#b4878f">
      <path d="M15,25 Q30,15 45,25 Q48,32 45,35 Q30,28 15,35 Q12,32 15,25Z" fill="url(#grad)" opacity="0.4"/>
      <circle cx="24" cy="28" r="2" fill="white" opacity="0.5"/>
      <circle cx="30" cy="26" r="2" fill="white" opacity="0.5"/>
      <circle cx="36" cy="30" r="2" fill="white" opacity="0.5"/>
    </IconWrapper>
  ),
  "twin-pregnancy": (
    <IconWrapper color="#c5a298">
      <circle cx="24" cy="28" r="10" fill="url(#grad)" opacity="0.3"/>
      <circle cx="36" cy="28" r="10" fill="url(#grad)" opacity="0.3"/>
      <circle cx="24" cy="25" r="3" fill="url(#grad)" opacity="0.5"/>
      <circle cx="36" cy="25" r="3" fill="url(#grad)" opacity="0.5"/>
      <path d="M24,38 L24,44 M36,38 L36,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  ttts: (
    <IconWrapper color="#c5a298">
      <circle cx="22" cy="28" r="10" fill="url(#grad)" opacity="0.3"/>
      <circle cx="38" cy="28" r="10" fill="url(#grad)" opacity="0.4"/>
      <path d="M28,28 L32,28" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M22,38 L24,44 M38,38 L36,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "selective-fgr": (
    <IconWrapper color="#cfb296">
      <circle cx="22" cy="28" r="10" fill="url(#grad)" opacity="0.4"/>
      <circle cx="38" cy="28" r="7" fill="url(#grad)" opacity="0.3"/>
      <circle cx="22" cy="25" r="3" fill="url(#grad)" opacity="0.5"/>
      <circle cx="38" cy="26" r="2" fill="url(#grad)" opacity="0.4"/>
    </IconWrapper>
  ),
  pprom: (
    <IconWrapper color="#c5a298">
      <path d="M22,18 C22,14 38,14 38,18 L38,30 C38,38 22,38 22,30Z" fill="url(#grad)" opacity="0.3"/>
      <circle cx="30" cy="30" r="3" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeDasharray="2 1"/>
      <path d="M28,34 L30,42 L32,34" stroke="url(#grad)" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  "preterm-birth": (
    <IconWrapper color="#cfb296">
      <path d="M24,20 C24,14 36,14 36,20 L36,32 C36,40 24,40 24,32Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M20,36 L40,36" stroke="url(#grad)" strokeWidth="2" strokeDasharray="3 2"/>
      <path d="M30,36 L30,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "postterm-pregnancy": (
    <IconWrapper color="#b4878f">
      <path d="M24,20 C24,14 36,14 36,20 L36,32 C36,40 24,40 24,32Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M18,42 L42,42" stroke="url(#grad)" strokeWidth="2"/>
      <circle cx="30" cy="26" r="4" fill="url(#grad)" opacity="0.5"/>
    </IconWrapper>
  ),
  "labor-dystocia": (
    <IconWrapper color="#cfb296">
      <path d="M24,18 C24,14 36,14 36,18 L36,32 C36,40 24,40 24,32Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M26,24 L34,24 M26,28 L34,28 M26,32 L34,32" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      <path d="M30,36 L30,44 M26,44 L34,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  polyhydramnios: (
    <IconWrapper color="#c5a298">
      <path d="M20,18 C20,12 40,12 40,18 L40,36 C40,44 20,44 20,36Z" fill="url(#grad)" opacity="0.3"/>
      <path d="M24,24 Q30,22 36,24" stroke="url(#grad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M24,30 Q30,28 36,30" stroke="url(#grad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M24,36 Q30,34 36,36" stroke="url(#grad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
    </IconWrapper>
  ),
  oligohydramnios: (
    <IconWrapper color="#cfb296">
      <path d="M20,18 C20,12 40,12 40,18 L40,40 C40,46 20,46 20,40Z" fill="url(#grad)" opacity="0.2"/>
      <circle cx="30" cy="30" r="6" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,40 L36,40" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  fgr: (
    <IconWrapper color="#cfb296">
      <circle cx="30" cy="28" r="12" fill="url(#grad)" opacity="0.3"/>
      <circle cx="30" cy="24" r="4" fill="url(#grad)" opacity="0.5"/>
      <path d="M26,34 L28,42 M32,34 L34,42" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M18,46 L42,46" stroke="url(#grad)" strokeWidth="1.5" strokeDasharray="3 2"/>
    </IconWrapper>
  ),
  "hemolytic-disease": (
    <IconWrapper color="#a96f7c">
      <circle cx="30" cy="28" r="12" fill="url(#grad)" opacity="0.4"/>
      <circle cx="30" cy="24" r="4" fill="url(#grad)" opacity="0.6"/>
      <path d="M24,34 L36,34" stroke="white" strokeWidth="2"/>
      <path d="M24,38 L36,38" stroke="url(#grad)" strokeWidth="1.5"/>
    </IconWrapper>
  ),
  "fetal-distress": (
    <IconWrapper color="#8f5d6c">
      <circle cx="30" cy="28" r="12" fill="url(#grad)" opacity="0.3"/>
      <path d="M22,28 Q26,24 30,28 Q34,32 38,28" stroke="url(#grad)" strokeWidth="2.5" fill="none"/>
      <path d="M22,34 Q30,30 38,34" stroke="url(#grad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
    </IconWrapper>
  ),
  breech: (
    <IconWrapper color="#c5a298">
      <path d="M24,38 C24,32 36,32 36,38" stroke="url(#grad)" strokeWidth="3" fill="none"/>
      <path d="M26,38 L26,22 C26,18 34,18 34,22 L34,38" fill="url(#grad)" opacity="0.4"/>
      <circle cx="30" cy="16" r="4" fill="url(#grad)" opacity="0.5"/>
      <path d="M22,44 L38,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  macrosomia: (
    <IconWrapper color="#cfb296">
      <path d="M20,20 C20,14 40,14 40,20 L40,36 C40,44 20,44 20,36Z" fill="url(#grad)" opacity="0.4"/>
      <circle cx="30" cy="26" r="5" fill="url(#grad)" opacity="0.6"/>
      <path d="M24,36 L24,44 M36,36 L36,44" stroke="url(#grad)" strokeWidth="2.5"/>
    </IconWrapper>
  ),
  "iu-fetal-death": (
    <IconWrapper color="#b4878f">
      <circle cx="30" cy="28" r="12" fill="url(#grad)" opacity="0.2"/>
      <circle cx="30" cy="24" r="4" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeDasharray="2 2"/>
      <path d="M24,36 L36,36" stroke="url(#grad)" strokeWidth="1.5" opacity="0.4"/>
      <path d="M24,40 L36,40" stroke="url(#grad)" strokeWidth="1" strokeDasharray="3 2" opacity="0.3"/>
    </IconWrapper>
  ),
  "uti-pregnancy": (
    <IconWrapper color="#c5a298">
      <path d="M24,18 L24,36 C24,40 36,40 36,36 L36,18" fill="url(#grad)" opacity="0.3"/>
      <path d="M28,24 L32,24 M28,28 L32,28" stroke="url(#grad)" strokeWidth="1.5"/>
      <circle cx="30" cy="34" r="2" fill="url(#grad)" opacity="0.5"/>
    </IconWrapper>
  ),
  "pyelonephritis-pregnancy": (
    <IconWrapper color="#b4878f">
      <path d="M20,20 L20,36 C20,40 28,40 28,36 L28,20" fill="url(#grad)" opacity="0.4"/>
      <path d="M32,20 L32,36 C32,40 40,40 40,36 L40,20" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,28 L24,32 M24,32 L26,30" stroke="white" strokeWidth="1.5"/>
    </IconWrapper>
  ),
  chorioamnionitis: (
    <IconWrapper color="#8f5d6c">
      <path d="M22,20 C22,14 38,14 38,20 L38,34 C38,40 22,40 22,34Z" fill="url(#grad)" opacity="0.3"/>
      <circle cx="30" cy="28" r="4" fill="url(#grad)" opacity="0.6"/>
      <path d="M26,24 L34,32 M34,24 L26,32" stroke="white" strokeWidth="1.5"/>
    </IconWrapper>
  ),
  "torch-infections": (
    <IconWrapper color="#b4878f">
      <circle cx="22" cy="22" r="5" fill="url(#grad)" opacity="0.5"/>
      <circle cx="38" cy="22" r="5" fill="url(#grad)" opacity="0.5"/>
      <circle cx="30" cy="36" r="5" fill="url(#grad)" opacity="0.5"/>
      <path d="M25,26 L28,32 M35,26 L32,32" stroke="url(#grad)" strokeWidth="1.5"/>
    </IconWrapper>
  ),
  "hepatitis-pregnancy": (
    <IconWrapper color="#cfb296">
      <path d="M22,20 C22,16 38,16 38,20 L38,32 C38,38 22,38 22,32Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M26,26 L34,26 M26,30 L34,30" stroke="white" strokeWidth="2"/>
      <path d="M30,36 L30,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "hiv-pregnancy": (
    <IconWrapper color="#b4878f">
      <circle cx="30" cy="28" r="12" fill="url(#grad)" opacity="0.3"/>
      <path d="M26,24 L34,24 M30,24 L30,32" stroke="white" strokeWidth="2.5"/>
      <path d="M24,38 L36,38" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  gbs: (
    <IconWrapper color="#c5a298">
      <circle cx="30" cy="28" r="10" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,28 C26,24 34,24 36,28" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M24,30 C26,34 34,34 36,30" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M30,38 L30,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  listeriosis: (
    <IconWrapper color="#b4878f">
      <circle cx="30" cy="28" r="10" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,24 L36,32" stroke="white" strokeWidth="2"/>
      <path d="M24,32 L36,24" stroke="white" strokeWidth="2"/>
      <path d="M30,38 L30,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "uterine-subinvolution": (
    <IconWrapper color="#c5a298">
      <path d="M22,18 C22,14 38,14 38,18 L38,32 C38,38 22,38 22,32Z" fill="url(#grad)" opacity="0.3"/>
      <path d="M26,22 L34,22 M26,26 L34,26 M26,30 L34,30" stroke="url(#grad)" strokeWidth="1.5" opacity="0.5"/>
      <path d="M30,36 L30,44" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "postpartum-endometritis": (
    <IconWrapper color="#8f5d6c">
      <path d="M24,18 L24,38 L36,38 L36,18Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M28,24 L32,24 M28,28 L32,28 M28,32 L32,32" stroke="white" strokeWidth="2"/>
      <path d="M22,42 L38,42" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  mastitis: (
    <IconWrapper color="#cfb296">
      <circle cx="30" cy="30" r="14" fill="url(#grad)" opacity="0.4"/>
      <circle cx="30" cy="26" r="4" fill="url(#grad)" opacity="0.6"/>
      <path d="M24,36 Q30,40 36,36" stroke="url(#grad)" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  "postpartum-dvt": (
    <IconWrapper color="#b4878f">
      <path d="M26,16 L26,44" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="26" cy="24" r="3" fill="#c2185b" opacity="0.6"/>
      <circle cx="26" cy="34" r="2" fill="#c2185b" opacity="0.4"/>
    </IconWrapper>
  ),
  "postpartum-depression": (
    <IconWrapper color="#b4878f">
      <circle cx="30" cy="28" r="12" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,30 Q30,26 36,30" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="27" cy="25" r="1.5" fill="white"/>
      <circle cx="33" cy="25" r="1.5" fill="white"/>
      <path d="M24,42 L36,42" stroke="url(#grad)" strokeWidth="2"/>
    </IconWrapper>
  ),
  "postpartum-sepsis": (
    <IconWrapper color="#8f5d6c">
      <circle cx="30" cy="28" r="12" fill="url(#grad)" opacity="0.4"/>
      <path d="M24,22 L36,34 M36,22 L24,34" stroke="white" strokeWidth="2"/>
      <circle cx="30" cy="28" r="4" fill="none" stroke="white" strokeWidth="1.5"/>
    </IconWrapper>
  ),
  "pulmonary-embolism": (
    <IconWrapper color="#8f5d6c">
      <path d="M20,25 C20,18 40,18 40,25 L40,35 C40,42 20,42 20,35Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M28,22 L32,38" stroke="white" strokeWidth="3"/>
      <path d="M24,28 L36,32" stroke="white" strokeWidth="2"/>
    </IconWrapper>
  ),
  thrombophilia: (
    <IconWrapper color="#b4878f">
      <path d="M26,16 L26,44" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M34,16 L34,44" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M26,24 L34,26 M26,34 L34,36" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    </IconWrapper>
  ),
  "obstetric-cholestasis": (
    <IconWrapper color="#cfb296">
      <path d="M20,22 C20,16 40,16 40,22 L40,34 C40,40 20,40 20,34Z" fill="url(#grad)" opacity="0.4"/>
      <path d="M26,28 Q30,24 34,28" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M26,32 Q30,36 34,32" stroke="white" strokeWidth="2" fill="none"/>
    </IconWrapper>
  ),
  "iron-deficiency-anemia": (
    <IconWrapper color="#a96f7c">
      <circle cx="30" cy="28" r="12" fill="url(#grad)" opacity="0.3"/>
      <circle cx="30" cy="24" r="4" fill="url(#grad)" opacity="0.5"/>
      <path d="M24,34 L36,34" stroke="url(#grad)" strokeWidth="2"/>
      <path d="M26,38 L34,38" stroke="url(#grad)" strokeWidth="1.5" opacity="0.5"/>
    </IconWrapper>
  )
};

const extraClinicalIcons = {
  "breast-cancer": (
    <IconWrapper>
      <path d="M21,17 C19,23 20,34 25,41 C28,45 32,45 35,41 C40,34 41,23 39,17" fill="url(#grad)" opacity="0.42" />
      <circle cx="30" cy="28" r="9" fill="none" stroke="white" strokeWidth="2" />
      <path d="M24,22 L36,34 M36,22 L24,34" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="30" cy="28" r="2.2" fill="#f2d9d3" />
    </IconWrapper>
  ),
  "breast-screening": (
    <IconWrapper>
      <path d="M21,18 C20,24 21,33 25,39 C28,43 32,43 35,39 C39,33 40,24 39,18" fill="url(#grad)" opacity="0.38" />
      <circle cx="28" cy="27" r="8" fill="none" stroke="white" strokeWidth="2" />
      <path d="M34,33 L41,40" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="28" cy="27" r="2.4" fill="#f3e4de" />
    </IconWrapper>
  ),
  mastopathy: (
    <IconWrapper>
      <path d="M21,18 C20,24 21,33 25,39 C28,43 32,43 35,39 C39,33 40,24 39,18" fill="url(#grad)" opacity="0.36" />
      <circle cx="25" cy="28" r="3" fill="white" opacity="0.82" />
      <circle cx="31" cy="24" r="2.6" fill="white" opacity="0.76" />
      <circle cx="34" cy="31" r="3.4" fill="white" opacity="0.72" />
    </IconWrapper>
  ),
  fibroadenoma: (
    <IconWrapper>
      <path d="M21,18 C20,24 21,33 25,39 C28,43 32,43 35,39 C39,33 40,24 39,18" fill="url(#grad)" opacity="0.36" />
      <circle cx="30" cy="28" r="7" fill="white" opacity="0.84" />
      <circle cx="30" cy="28" r="3" fill="url(#grad)" opacity="0.72" />
    </IconWrapper>
  ),
  "ductal-ectasia": (
    <IconWrapper>
      <path d="M21,18 C20,24 21,33 25,39 C28,43 32,43 35,39 C39,33 40,24 39,18" fill="url(#grad)" opacity="0.3" />
      <path d="M24,24 C28,23 32,23 36,24" stroke="white" strokeWidth="2" fill="none" />
      <path d="M23,29 C28,27 32,27 37,29" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
      <path d="M24,34 C28,33 32,33 36,34" stroke="white" strokeWidth="2" fill="none" opacity="0.8" />
    </IconWrapper>
  ),
  thyroid: (
    <IconWrapper>
      <path d="M24,18 C20,19 18,23 18,27 C18,32 21,36 25,38 C27,39 29,38 30,35 C31,38 33,39 35,38 C39,36 42,32 42,27 C42,23 40,19 36,18 C33,17 31,19 30,22 C29,19 27,17 24,18 Z" fill="url(#grad)" opacity="0.58" />
      <path d="M30,22 L30,39" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.92" />
    </IconWrapper>
  ),
  menopause: (
    <IconWrapper>
      <circle cx="30" cy="22" r="8" fill="none" stroke="url(#grad)" strokeWidth="2.6" />
      <path d="M30,30 L30,45" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M20,34 Q30,29 40,34" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
      <path d="M22,40 Q30,36 38,40" stroke="white" strokeWidth="1.8" fill="none" opacity="0.65" />
    </IconWrapper>
  ),
  hrt: (
    <IconWrapper>
      <rect x="18" y="19" width="24" height="12" rx="6" fill="url(#grad)" opacity="0.72" />
      <rect x="18" y="31" width="24" height="12" rx="6" fill="white" opacity="0.86" />
      <path d="M30,19 L30,43" stroke="#c48f7d" strokeWidth="2" opacity="0.8" />
    </IconWrapper>
  ),
  osteoporosis: (
    <IconWrapper>
      <path d="M24,17 C21,17 19,19 19,22 C19,24 20.5,26 22.5,26 L37.5,26 C39.5,26 41,24 41,22 C41,19 39,17 36,17 Z" fill="url(#grad)" opacity="0.36" />
      <path d="M22.5,34 C20.5,34 19,36 19,38 C19,41 21,43 24,43 L36,43 C39,43 41,41 41,38 C41,36 39.5,34 37.5,34 Z" fill="url(#grad)" opacity="0.36" />
      <path d="M24,26 L24,34 M30,26 L30,34 M36,26 L36,34" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
    </IconWrapper>
  ),
  ivf: (
    <IconWrapper>
      <path d="M22,18 L38,18 L35,42 C34.5,45 25.5,45 25,42 Z" fill="url(#grad)" opacity="0.46" />
      <circle cx="30" cy="28" r="5.5" fill="white" opacity="0.9" />
      <circle cx="30" cy="28" r="2.1" fill="url(#grad)" opacity="0.7" />
    </IconWrapper>
  ),
  iui: (
    <IconWrapper>
      <path d="M23,18 C23,14 37,14 37,18 L37,28 C37,35 23,35 23,28 Z" fill="url(#grad)" opacity="0.42" />
      <path d="M30,18 L30,43" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16,22 L28,26" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </IconWrapper>
  ),
  icsi: (
    <IconWrapper>
      <circle cx="28" cy="29" r="8" fill="white" opacity="0.9" />
      <circle cx="28" cy="29" r="3" fill="url(#grad)" opacity="0.75" />
      <path d="M36,22 L45,17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M34,24 L42,20" stroke="url(#grad)" strokeWidth="2.2" strokeLinecap="round" />
    </IconWrapper>
  ),
  pgd: (
    <IconWrapper>
      <circle cx="25" cy="26" r="7" fill="url(#grad)" opacity="0.5" />
      <rect x="31" y="23" width="11" height="11" rx="2.5" fill="white" opacity="0.88" />
      <path d="M34,29 L36.5,31.5 L40,26.5" stroke="#9e6e67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconWrapper>
  ),
  donor: (
    <IconWrapper>
      <path d="M30,15 C24,15 20,20 20,26 C20,35 30,44 30,44 C30,44 40,35 40,26 C40,20 36,15 30,15 Z" fill="url(#grad)" opacity="0.54" />
      <path d="M24,27 C26,24 29,23 30,20 C31,23 34,24 36,27" stroke="white" strokeWidth="2" fill="none" />
    </IconWrapper>
  ),
  contraception: (
    <IconWrapper>
      <circle cx="30" cy="29" r="12" fill="none" stroke="url(#grad)" strokeWidth="2.8" />
      <path d="M30,17 L30,41" stroke="white" strokeWidth="2" />
      <path d="M22,25 L38,25" stroke="white" strokeWidth="2" />
      <path d="M23,37 L37,21" stroke="url(#grad)" strokeWidth="2.4" strokeLinecap="round" />
    </IconWrapper>
  ),
  bladder: (
    <IconWrapper>
      <path d="M21,18 C21,14 39,14 39,18 L39,31 C39,40 21,40 21,31 Z" fill="url(#grad)" opacity="0.44" />
      <path d="M25,26 C27,29 33,29 35,26" stroke="white" strokeWidth="2" fill="none" />
      <path d="M30,18 L30,13" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </IconWrapper>
  ),
  uterus: (
    <IconWrapper>
      <path d="M18,19 C21,19 24,23 24,27 C24,31 21,34 18,36" stroke="url(#grad)" strokeWidth="3" fill="none" />
      <path d="M42,19 C39,19 36,23 36,27 C36,31 39,34 42,36" stroke="url(#grad)" strokeWidth="3" fill="none" />
      <path d="M24,27 C24,20 36,20 36,27 L36,33 C36,40 24,40 24,33 Z" fill="url(#grad)" opacity="0.38" />
      <path d="M30,33 L30,45" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </IconWrapper>
  ),
  vulvodynia: (
    <IconWrapper>
      <path d="M30,16 C24,16 20,22 20,28 C20,36 30,44 30,44 C30,44 40,36 40,28 C40,22 36,16 30,16 Z" fill="url(#grad)" opacity="0.44" />
      <path d="M23,30 L27,26 L30,31 L34,24 L38,29" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </IconWrapper>
  ),
  lichen: (
    <IconWrapper>
      <ellipse cx="30" cy="30" rx="15" ry="12" fill="url(#grad)" opacity="0.26" />
      <path d="M20,24 Q26,20 32,24 T44,24" stroke="white" strokeWidth="1.8" fill="none" opacity="0.82" />
      <path d="M18,30 Q25,26 32,30 T42,30" stroke="white" strokeWidth="1.8" fill="none" opacity="0.7" />
      <path d="M20,36 Q26,33 32,36 T42,36" stroke="white" strokeWidth="1.8" fill="none" opacity="0.58" />
    </IconWrapper>
  ),
  vin: (
    <IconWrapper>
      <ellipse cx="30" cy="30" rx="15" ry="12" fill="url(#grad)" opacity="0.28" />
      <circle cx="24" cy="26" r="2" fill="white" opacity="0.9" />
      <circle cx="31" cy="30" r="2" fill="white" opacity="0.9" />
      <circle cx="36" cy="25" r="2" fill="white" opacity="0.9" />
      <path d="M22,38 L38,22" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" />
    </IconWrapper>
  ),
  vain: (
    <IconWrapper>
      <path d="M24,16 L24,43 C24,46 36,46 36,43 L36,16" fill="url(#grad)" opacity="0.34" />
      <circle cx="30" cy="23" r="2" fill="white" opacity="0.9" />
      <circle cx="30" cy="30" r="2.4" fill="white" opacity="0.9" />
      <circle cx="30" cy="37" r="2" fill="white" opacity="0.9" />
      <path d="M26,18 L34,42" stroke="url(#grad)" strokeWidth="2" opacity="0.75" />
    </IconWrapper>
  ),
  asherman: (
    <IconWrapper>
      <path d="M22,16 L22,44" stroke="url(#grad)" strokeWidth="2.6" />
      <path d="M38,16 L38,44" stroke="url(#grad)" strokeWidth="2.6" />
      <path d="M22,23 L38,27 M22,30 L38,31 M22,37 L38,35" stroke="white" strokeWidth="1.8" opacity="0.84" />
    </IconWrapper>
  ),
  fistula: (
    <IconWrapper>
      <path d="M20,20 C20,15 28,15 28,20 L28,34 C28,39 20,39 20,34 Z" fill="url(#grad)" opacity="0.34" />
      <path d="M32,20 C32,15 40,15 40,20 L40,34 C40,39 32,39 32,34 Z" fill="url(#grad)" opacity="0.34" />
      <path d="M28,27 C30,25 30,25 32,27" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </IconWrapper>
  ),
  circumcision: (
    <IconWrapper>
      <circle cx="30" cy="30" r="12" fill="none" stroke="url(#grad)" strokeWidth="2.6" />
      <path d="M22,38 L38,22" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M36,20 L40,24" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </IconWrapper>
  ),
  anomaly: (
    <IconWrapper>
      <path d="M18,18 C21,18 24,22 24,27 C24,31 21,34 18,36" stroke="url(#grad)" strokeWidth="3" fill="none" />
      <path d="M42,18 C39,18 36,22 36,27 C36,31 39,34 42,36" stroke="url(#grad)" strokeWidth="3" fill="none" />
      <path d="M24,27 C24,21 28,20 30,24 C32,20 36,21 36,27 L36,33 C36,40 24,40 24,33 Z" fill="url(#grad)" opacity="0.32" />
      <path d="M30,24 L30,45" stroke="white" strokeWidth="2" />
    </IconWrapper>
  ),
  stenosis: (
    <IconWrapper>
      <path d="M24,15 L24,45 C24,48 36,48 36,45 L36,15" fill="url(#grad)" opacity="0.3" />
      <path d="M22,28 L38,28" stroke="white" strokeWidth="2" />
      <path d="M26,31 L34,31" stroke="white" strokeWidth="2" />
    </IconWrapper>
  ),
  tb: (
    <IconWrapper>
      <path d="M19,24 C21,20 25,20 27,24 C29,28 33,28 35,24 C37,20 41,20 43,24" stroke="url(#grad)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M17,34 C19,30 23,30 25,34 C27,38 31,38 33,34 C35,30 39,30 41,34" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.84" />
    </IconWrapper>
  ),
  ohss: (
    <IconWrapper>
      <circle cx="22" cy="30" r="8" fill="url(#grad)" opacity="0.34" />
      <circle cx="38" cy="30" r="8" fill="url(#grad)" opacity="0.34" />
      <circle cx="20" cy="27" r="2.4" fill="white" opacity="0.88" />
      <circle cx="24" cy="31" r="2.4" fill="white" opacity="0.88" />
      <circle cx="36" cy="28" r="2.4" fill="white" opacity="0.88" />
      <circle cx="40" cy="32" r="2.4" fill="white" opacity="0.88" />
    </IconWrapper>
  ),
  "cervical-screening": (
    <IconWrapper>
      <path d="M22,15 C18,18 16,23 16,29 C16,38 22,44 30,44 C38,44 44,38 44,29 C44,23 42,18 38,15" fill="url(#grad)" opacity="0.3" />
      <circle cx="27" cy="28" r="6" fill="none" stroke="white" strokeWidth="2" />
      <path d="M31,32 L38,39" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="27" cy="28" r="1.8" fill="#f2ddd6" />
    </IconWrapper>
  ),
  "candidiasis": (
    <IconWrapper>
      <circle cx="30" cy="28" r="10" fill="url(#grad)" opacity="0.34" />
      <circle cx="26" cy="24" r="3" fill="white" opacity="0.88" />
      <circle cx="34" cy="24" r="3" fill="white" opacity="0.88" />
      <circle cx="30" cy="33" r="3.4" fill="white" opacity="0.88" />
    </IconWrapper>
  ),
  bv: (
    <IconWrapper>
      <path d="M18,24 Q24,20 30,24 T42,24" stroke="url(#grad)" strokeWidth="2.8" fill="none" />
      <path d="M18,30 Q24,26 30,30 T42,30" stroke="white" strokeWidth="2" fill="none" opacity="0.86" />
      <path d="M18,36 Q24,32 30,36 T42,36" stroke="url(#grad)" strokeWidth="2.4" fill="none" opacity="0.78" />
    </IconWrapper>
  )
};

Object.assign(gynIcons, extraClinicalIcons);

Object.assign(gynIcons, {
  bartholin: gynIcons.bartholinitis,
  menorrhagia: gynIcons.aub,
  hypermenorrhea: gynIcons.aub,
  hypomenorrhea: gynIcons.amenorrhea,
  metrorrhagia: gynIcons.aub,
  oligomenorrhea: gynIcons.amenorrhea,
  infertility: gynIcons["female-infertility"],
  anovulation: gynIcons.pcos,
  polyps: gynIcons.polyp,
  ectopic: obsIcons["ectopic-pregnancy"],
  pof: gynIcons.poi,
  dor: gynIcons.poi,
  miscarriage: gynIcons["recurrent-pregnancy-loss"],
  erosion: gynIcons.ectropion,
  dystrophy: gynIcons.lichen,
  prolapse: gynIcons["uterine-prolapse"],
  block: gynIcons.hydrosalpinx,
  adhesion: gynIcons.synechiae,
  sarcoma: gynIcons["uterine-sarcoma"],
  blood: gynIcons.aub,
  pain: gynIcons["chronic-pain"],
  bladder: extraClinicalIcons.bladder,
  uterus: extraClinicalIcons.uterus,
  incontinence: gynIcons["stress-incontinence"],
  uti: extraClinicalIcons.bladder
});

Object.assign(obsIcons, {
  abruptio: obsIcons["placental-abruption"],
  abruption: obsIcons["placental-abruption"],
  afe: obsIcons["pulmonary-embolism"],
  anemia: obsIcons["iron-deficiency-anemia"],
  bacteria: extraClinicalIcons.bv,
  blood: obsIcons["postpartum-hemorrhage"],
  cesarean: extraClinicalIcons.circumcision,
  cord: obsIcons["twin-pregnancy"],
  depression: obsIcons["postpartum-depression"],
  diabetes: obsIcons["gestational-diabetes"],
  disproportion: obsIcons["labor-dystocia"],
  distress: obsIcons["fetal-distress"],
  edema: obsIcons.preeclampsia,
  episiotomy: extraClinicalIcons.circumcision,
  fast: obsIcons["fetal-distress"],
  forceps: obsIcons["labor-dystocia"],
  fpi: obsIcons["fetal-distress"],
  hemorrhage: obsIcons["postpartum-hemorrhage"],
  infection: obsIcons.chorioamnionitis,
  inertia: obsIcons["labor-dystocia"],
  inversion: obsIcons["uterine-subinvolution"],
  iugr: obsIcons.fgr,
  kidney: obsIcons["pyelonephritis-pregnancy"],
  labor: obsIcons["preterm-labor"],
  placenta: obsIcons["placenta-previa"],
  postterm: obsIcons["postterm-pregnancy"],
  preterm: obsIcons["preterm-labor"],
  rh: obsIcons["hemolytic-disease"],
  rupture: obsIcons["placental-abruption"],
  scar: extraClinicalIcons.circumcision,
  screening: extraClinicalIcons["breast-screening"],
  sepsis: obsIcons["postpartum-sepsis"],
  shoulder: obsIcons["labor-dystocia"],
  thromboembolism: obsIcons["pulmonary-embolism"],
  thrombosis: obsIcons["postpartum-dvt"],
  torch: obsIcons["torch-infections"],
  uti: obsIcons["uti-pregnancy"],
  vacuum: obsIcons["labor-dystocia"]
});

export default { ...gynIcons, ...obsIcons };

export const navIcons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gynecology: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 16C14.2091 16 16 14.2091 16 12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  obstetrics: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6C12 6 8 10 8 14C8 17.3137 10.134 20 12 20C13.866 20 16 17.3137 16 14C16 10 12 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  questionnaires: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  pharmacology: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2H14L18 6V22H6V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V6H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  favorites: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61C20.3292 4.09924 19.7228 3.69397 19.0554 3.41708C18.3879 3.14019 17.6725 2.99725 16.95 2.99725C16.2275 2.99725 15.5121 3.14019 14.8446 3.41708C14.1772 3.69397 13.5708 4.09924 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.53003 2.99824 7.05 2.99824C5.56997 2.99824 4.1917 3.57831 3.16 4.61C2.1283 5.64169 1.54824 7.01997 1.54824 8.5C1.54824 9.98003 2.1283 11.3583 3.16 12.39L12 21.24L20.84 12.39C21.3508 11.8789 21.756 11.2726 22.0329 10.6052C22.3098 9.93775 22.4527 9.22231 22.4527 8.5C22.4527 7.77769 22.3098 7.06225 22.0329 6.39481C21.756 5.72737 21.3508 5.12108 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M3.51 4.47C3.31186 4.6731 3.16922 4.92982 3.09815 5.21082C3.02709 5.49181 3.02988 5.78809 3.10626 6.06951C3.18264 6.35093 3.32979 6.60813 3.53167 6.81514C3.73355 7.02215 3.9834 7.17231 4.25739 7.25026C4.53138 7.32821 4.82023 7.33138 5.09998 7.25999L5.09998 4.75999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61C20.3292 4.09924 19.7228 3.69397 19.0554 3.41708C18.3879 3.14019 17.6725 2.99725 16.95 2.99725C16.2275 2.99725 15.5121 3.14019 14.8446 3.41708C14.1772 3.69397 13.5708 4.09924 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.53003 2.99824 7.05 2.99824C5.56997 2.99824 4.1917 3.57831 3.16 4.61C2.1283 5.64169 1.54824 7.01997 1.54824 8.5C1.54824 9.98003 2.1283 11.3583 3.16 12.39L12 21.24L20.84 12.39C21.3508 11.8789 21.756 11.2726 22.0329 10.6052C22.3098 9.93775 22.4527 9.22231 22.4527 8.5C22.4527 7.77769 22.3098 7.06225 22.0329 6.39481C21.756 5.72737 21.3508 5.12108 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};
