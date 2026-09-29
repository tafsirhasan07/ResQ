import './globals.css';import Navbar from '@/components/Navbar';import {AuthProvider} from '@/components/AuthProvider';
export const metadata={title:'ResQ — Emergency & Public Support Platform',description:'Integrated crisis response, infrastructure reporting, donations and shelter discovery.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AuthProvider><Navbar/><main>{children}</main></AuthProvider></body></html>}
