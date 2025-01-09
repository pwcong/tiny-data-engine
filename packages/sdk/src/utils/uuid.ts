export function generateUuid() {
  return Math.random().toString(16).split('.')[1];
}
