import AuthForm from '../components/AuthForm'

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const next = typeof params?.next === 'string' ? params.next : '/catalogo'

  return <AuthForm mode="login" next={next} />
}
