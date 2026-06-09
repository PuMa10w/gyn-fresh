export type ModalStackName = 'disease' | 'questionnaire' | 'pharmacology';

export type ModalStackState = Record<ModalStackName, boolean>;

const modalPriority: ModalStackName[] = ['disease', 'questionnaire', 'pharmacology'];

export function getActiveModalCount(stack: ModalStackState) {
  return modalPriority.reduce((count, key) => count + (stack[key] ? 1 : 0), 0);
}

export function getActiveModalName(stack: ModalStackState): ModalStackName | null {
  return modalPriority.find((key) => stack[key]) ?? null;
}

export function isSingleModalActive(stack: ModalStackState) {
  return getActiveModalCount(stack) <= 1;
}
