export const FITCONNECT_UNAUTH_EVENT = 'fitconnect:unauthenticated';
export const FITCONNECT_TOAST_EVENT = 'fitconnect:toast';

export function emitUnauthenticated(message) {
  window.dispatchEvent(
    new CustomEvent(FITCONNECT_UNAUTH_EVENT, {
      detail: { message },
    })
  );
}

export function emitToast(message, type = 'info') {
  window.dispatchEvent(
    new CustomEvent(FITCONNECT_TOAST_EVENT, {
      detail: { message, type },
    })
  );
}

export function emitSuccess(message) {
  emitToast(message, 'success');
}
