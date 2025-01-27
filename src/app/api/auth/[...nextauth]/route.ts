import { authOptions } from "@/app/api/auth/[...nextauth]/auth"
import NextAuth from "next-auth"

import { connectDB } from "@/lib/mongoose";


// Ensure DB connection
await connectDB();



const handler = NextAuth(authOptions as any)


export { handler as GET, handler as POST }