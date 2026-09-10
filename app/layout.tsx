import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'目标智能 · 理论练习',description:'第三届目标智能检测技术应用实践赛初赛公开题库，294 道单选、多选和判断题，附原题解析。'};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
 return <html lang="zh-CN"><body>{children}</body></html>;
}
