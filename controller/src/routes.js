import Remote from '@/components/Remote'
import Records from '@/components/Records'

export default [
	{
		path: '/',
		redirect: '/remote'
	},
	{
		path: '/remote',
		component: Remote
	},
	{
		path: '/records',
		component: Records
	}
]