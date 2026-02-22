import pb from './pocketbase'

export async function login(email: string, password: string) {
  return await pb.collection('users').authWithPassword(email, password)
}

export function logout() {
  pb.authStore.clear()
}

export function isAuthenticated() {
  return pb.authStore.isValid
}

export function getCurrentUser() {
  return pb.authStore.model
}
